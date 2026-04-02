"""
Integration tests for FastAPI endpoints.

Models are patched with lightweight mocks so the test suite can run
without the .pt / .pkl artefacts on disk.
"""

import sys
import types
import numpy as np
import pytest
from unittest.mock import MagicMock, patch


# ── Stubs for heavy optional deps ─────────────────────────────────────────────

def _make_stub(name: str):
    mod = types.ModuleType(name)
    sys.modules[name] = mod
    return mod

for _pkg in ('torch', 'torch.nn', 'torch.nn.functional',
             'torch_geometric', 'torch_geometric.nn'):
    if _pkg not in sys.modules:
        _make_stub(_pkg)

torch_stub = sys.modules['torch']
torch_stub.device = lambda *a, **kw: 'cpu'
torch_stub.cuda = MagicMock()
torch_stub.cuda.is_available = lambda: False
torch_stub.nn = sys.modules['torch.nn']
torch_stub.nn.Module = object
torch_stub.nn.Linear = MagicMock
torch_stub.nn.BatchNorm1d = MagicMock
torch_stub.nn.ELU = MagicMock
torch_stub.nn.Dropout = MagicMock
torch_stub.nn.Sequential = MagicMock
sys.modules['torch.nn.functional'].elu = MagicMock()
sys.modules['torch.nn.functional'].dropout = MagicMock()
sys.modules['torch_geometric.nn'].GATv2Conv = MagicMock

import main  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402


# ── Shared fakes ──────────────────────────────────────────────────────────────

FAKE_NORMS = {
    "digit_symbol_coding":  {"mean": 52.51, "std": 10.30, "lower_better": False},
    "trail_making_A":       {"mean": 19.80, "std": 6.39,  "lower_better": True},
    "trail_making_B":       {"mean": 33.45, "std": 12.96, "lower_better": True},
    "forward_memory_span":  {"mean": 10.55, "std": 2.49,  "lower_better": False},
    "reverse_memory_span":  {"mean":  9.05, "std": 2.49,  "lower_better": False},
    "progressive_matrices": {"mean": 10.95, "std": 3.27,  "lower_better": False},
}

FAKE_FEATURES = [
    "digit_symbol_coding", "trail_making_A", "trail_making_B",
    "forward_memory_span", "reverse_memory_span", "progressive_matrices",
    "gender",
]


def _lgbm_mock():
    probs = np.array([[0.2, 0.7, 0.07, 0.03]])
    m = MagicMock()
    m.predict.return_value = probs
    return m


def _noop_load():
    """Patch for load_models — sets globals directly without touching disk."""
    main.NCPT_NORMS = FAKE_NORMS
    main.NCPT_FEATURES = FAKE_FEATURES
    main.lgbm_model = _lgbm_mock()
    main.gat_model = MagicMock()
    main.meta_learner = MagicMock()
    main.imputer = MagicMock(transform=lambda x: x)


def _noop_load_clear():
    """Patch for load_models — explicitly clears all model globals to None."""
    main.lgbm_model = None
    main.gat_model = None
    main.meta_learner = None
    main.imputer = None
    main.NCPT_NORMS = None
    main.NCPT_FEATURES = None


@pytest.fixture()
def client_with_models():
    """TestClient with all model globals pre-set via patched load_models."""
    with patch.object(main, 'load_models', _noop_load):
        with TestClient(main.app) as client:
            yield client


@pytest.fixture()
def client_no_models():
    """TestClient where startup runs but models remain None."""
    with patch.object(main, 'load_models', _noop_load_clear):
        with TestClient(main.app) as client:
            yield client


# ── /api/health ───────────────────────────────────────────────────────────────

class TestHealth:
    def test_health_models_loaded(self, client_with_models):
        resp = client_with_models.get('/api/health')
        assert resp.status_code == 200
        body = resp.json()
        assert body['status'] == 'ok'
        assert body['models_loaded'] is True

    def test_health_models_not_loaded(self, client_no_models):
        resp = client_no_models.get('/api/health')
        assert resp.status_code == 200
        body = resp.json()
        assert body['status'] == 'ok'
        assert body['models_loaded'] is False


# ── /api/predict/frontend ─────────────────────────────────────────────────────

FRONTEND_PAYLOAD = {
    "player_id": "test-player",
    "player_age": 25,
    "player_gender": "female",
    "is_child": False,
    "cloudport_totalTime": 30,
    "cloudport_avgReactionTime": 350,
    "cloudport_catches": 8,
    "cloudport_misses": 2,
    "starBridge_totalTime": 45,
    "starBridge_errors": 1,
    "starBridge_completed": True,
    "hiddenReef_totalMoves": 20,
    "hiddenReef_totalPairs": 8,
    "hiddenReef_efficiency": 0.6,
    "hiddenReef_roundsCompleted": 2,
    "echoBay_maxSequence": 5,
    "echoBay_totalRounds": 4,
    "echoBay_perfectRounds": 2,
}

CHILD_PAYLOAD = {
    **FRONTEND_PAYLOAD,
    "is_child": True,
    "cloudport_catches": 6,
    "starbridge_time": 60.0,
    "echobay_span": 4,
    "card_patterns": 3,
}


class TestPredictFrontend:
    def test_503_when_models_not_loaded(self, client_no_models):
        resp = client_no_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        assert resp.status_code == 503

    def test_200_with_models_loaded(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        assert resp.status_code == 200

    def test_response_contains_required_fields(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        body = resp.json()
        for field in ('predicted_class', 'performance_label', 'risk_band',
                      'confidence', 'mean_z_score', 'probabilities',
                      'input_mapping', 'is_child'):
            assert field in body, f"Missing field: {field}"

    def test_is_child_false_in_response(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        assert resp.json()['is_child'] is False

    def test_is_child_true_in_response(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=CHILD_PAYLOAD)
        assert resp.json()['is_child'] is True

    def test_child_input_mapping_has_pediatric_keys(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=CHILD_PAYLOAD)
        mapping = resp.json()['input_mapping']
        assert 'cloudport_catches' in mapping
        assert 'starbridge_time' in mapping
        assert 'echobay_span' in mapping
        assert 'card_patterns' in mapping

    def test_adult_input_mapping_has_adult_keys(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        mapping = resp.json()['input_mapping']
        assert 'cloudport_items_per_sec' in mapping
        assert 'starbridge_A_time' in mapping

    def test_predicted_class_in_valid_range(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        assert resp.json()['predicted_class'] in (0, 1, 2, 3)

    def test_female_gender_mapped_correctly(self, client_with_models):
        resp = client_with_models.post('/api/predict/frontend', json=FRONTEND_PAYLOAD)
        mapping = resp.json()['input_mapping']
        assert mapping['gender'] == 1

    def test_male_gender_mapped_correctly(self, client_with_models):
        payload = {**FRONTEND_PAYLOAD, 'player_gender': 'male'}
        resp = client_with_models.post('/api/predict/frontend', json=payload)
        assert resp.json()['input_mapping']['gender'] == 0


# ── /api/predict (GameScores endpoint) ───────────────────────────────────────

GAME_SCORES_PAYLOAD = {
    "cloudport_items_per_sec": 0.5,
    "starbridge_A_time": 20.0,
    "starbridge_B_time": 40.0,
    "echobay_max_span": 6,
    "card_efficiency": 0.5,
    "heartisle_correct": 6,
    "gender": 0,
}


class TestPredictGameScores:
    def test_503_when_models_not_loaded(self, client_no_models):
        resp = client_no_models.post('/api/predict', json=GAME_SCORES_PAYLOAD)
        assert resp.status_code == 503

    def test_200_with_models_loaded(self, client_with_models):
        resp = client_with_models.post('/api/predict', json=GAME_SCORES_PAYLOAD)
        assert resp.status_code == 200

    def test_response_shape(self, client_with_models):
        resp = client_with_models.post('/api/predict', json=GAME_SCORES_PAYLOAD)
        body = resp.json()
        assert 'predicted_class' in body
        assert 'probabilities' in body

    def test_card_efficiency_validation(self, client_with_models):
        # card_efficiency must be 0–1 per schema
        bad_payload = {**GAME_SCORES_PAYLOAD, 'card_efficiency': 1.5}
        resp = client_with_models.post('/api/predict', json=bad_payload)
        assert resp.status_code == 422  # Pydantic validation error
