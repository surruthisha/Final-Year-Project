"""
Unit tests for predict_from_game() and frontend_stats_to_game_scores().

Models are mocked so these tests run without the .pt / .pkl artefacts.
"""

import sys
import types
import numpy as np
import pytest
from unittest.mock import MagicMock, patch


# ── Minimal stubs so `import main` works without torch / torch_geometric ──────

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

import main  # noqa: E402  (imported after stubs)


# ── Shared NCPT globals ───────────────────────────────────────────────────────

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


def _make_lgbm_mock(pred_class: int = 1):
    probs = np.array([[0.1, 0.7, 0.15, 0.05]])
    probs[0, pred_class] = max(probs[0, pred_class], 0.5)
    lgbm = MagicMock()
    lgbm.predict.return_value = probs
    return lgbm


@pytest.fixture(autouse=True)
def patch_globals():
    with (
        patch.object(main, 'NCPT_NORMS', FAKE_NORMS),
        patch.object(main, 'NCPT_FEATURES', FAKE_FEATURES),
        patch.object(main, 'lgbm_model', _make_lgbm_mock()),
        patch.object(main, 'imputer', MagicMock(transform=lambda x: x)),
    ):
        yield


# ── predict_from_game — adult mode ────────────────────────────────────────────

class TestPredictAdultMode:
    def _scores(self, **overrides):
        base = {
            "cloudport_items_per_sec": 0.5,
            "starbridge_A_time": 20.0,
            "starbridge_B_time": 40.0,
            "echobay_max_span": 6,
            "card_efficiency": 0.5,
            "heartisle_correct": 6,
            "gender": 0,
        }
        base.update(overrides)
        return base

    def test_returns_expected_keys(self):
        result = main.predict_from_game(self._scores())
        for key in ('predicted_class', 'performance_label', 'risk_band',
                    'recommendation', 'confidence', 'mean_z_score',
                    'probabilities', 'zscores', 'raw_features'):
            assert key in result

    def test_predicted_class_is_int(self):
        result = main.predict_from_game(self._scores())
        assert isinstance(result['predicted_class'], int)
        assert 0 <= result['predicted_class'] <= 3

    def test_dsc_mapping(self):
        # 0.5 items/sec * 60 = 30, clipped to [10, 80]
        result = main.predict_from_game(self._scores(cloudport_items_per_sec=0.5))
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(30.0)

    def test_dsc_clipped_at_minimum(self):
        result = main.predict_from_game(self._scores(cloudport_items_per_sec=0.0))
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(10.0)

    def test_dsc_clipped_at_maximum(self):
        result = main.predict_from_game(self._scores(cloudport_items_per_sec=2.0))
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(80.0)

    def test_trail_making_passthrough(self):
        result = main.predict_from_game(self._scores(
            starbridge_A_time=25.0, starbridge_B_time=50.0
        ))
        assert result['raw_features']['trail_making_A'] == pytest.approx(25.0)
        assert result['raw_features']['trail_making_B'] == pytest.approx(50.0)

    def test_trail_making_z_inverted(self):
        # lower trail time is better → z-score should be positive for fast times
        fast = main.predict_from_game(self._scores(
            starbridge_A_time=5.0, starbridge_B_time=10.0
        ))
        slow = main.predict_from_game(self._scores(
            starbridge_A_time=50.0, starbridge_B_time=100.0
        ))
        assert fast['zscores']['trail_making_A'] > slow['zscores']['trail_making_A']

    def test_rms_formula(self):
        # 5 + 0.5 * 11 = 10.5
        result = main.predict_from_game(self._scores(card_efficiency=0.5))
        assert result['raw_features']['reverse_memory_span'] == pytest.approx(10.5)

    def test_gender_not_in_zscores(self):
        result = main.predict_from_game(self._scores(gender=1))
        assert 'gender' not in result['zscores']

    def test_confidence_between_0_and_1(self):
        result = main.predict_from_game(self._scores())
        assert 0.0 <= result['confidence'] <= 1.0

    def test_probabilities_sum_to_one(self):
        result = main.predict_from_game(self._scores())
        total = sum(result['probabilities'].values())
        assert total == pytest.approx(1.0, abs=1e-5)


# ── predict_from_game — child mode (Pediatric Calibration Layer) ──────────────

class TestPredictChildMode:
    def _scores(self, **overrides):
        base = {
            "cloudport_catches": 5,
            "starbridge_time": 65.0,
            "echobay_span": 3,
            "card_patterns": 3,
            "gender": 0,
        }
        base.update(overrides)
        return base

    def test_child_dsc_midpoint(self):
        # catches=5 → 20 + (5/10)*1.35*44.4 = 49.97
        result = main.predict_from_game(self._scores(cloudport_catches=5), is_child=True)
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(49.97, abs=0.01)

    def test_child_dsc_zero_catches(self):
        result = main.predict_from_game(self._scores(cloudport_catches=0), is_child=True)
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(20.0)

    def test_child_dsc_ten_catches_near_80(self):
        # 20 + (10/10) * 1.35 * 44.4 = 79.94 — close to 80 but not exactly
        result = main.predict_from_game(self._scores(cloudport_catches=10), is_child=True)
        assert result['raw_features']['digit_symbol_coding'] == pytest.approx(79.94, abs=0.01)

    def test_child_tm_b_calibration(self):
        # raw_time=65 → 65 * 0.49 = 31.85
        result = main.predict_from_game(self._scores(starbridge_time=65.0), is_child=True)
        assert result['raw_features']['trail_making_B'] == pytest.approx(31.85, abs=0.01)

    def test_child_tm_a_is_half_tm_b(self):
        result = main.predict_from_game(self._scores(), is_child=True)
        assert result['raw_features']['trail_making_A'] == pytest.approx(
            result['raw_features']['trail_making_B'] * 0.5, rel=1e-5
        )

    def test_child_fms_formula(self):
        # span=3 → 4 + (3/5)*10 = 10.0
        result = main.predict_from_game(self._scores(echobay_span=3), is_child=True)
        assert result['raw_features']['forward_memory_span'] == pytest.approx(10.0)

    def test_child_rms_formula(self):
        # patterns=3 → 5 + (3/5)*11 = 11.6
        result = main.predict_from_game(self._scores(card_patterns=3), is_child=True)
        assert result['raw_features']['reverse_memory_span'] == pytest.approx(11.6, abs=0.01)

    def test_child_fluid_reasoning_neutral(self):
        # Heart Isle not tracked for children → fixed pm = 8.0
        result = main.predict_from_game(self._scores(), is_child=True)
        assert result['raw_features']['progressive_matrices'] == pytest.approx(8.0)

    def test_child_returns_expected_keys(self):
        result = main.predict_from_game(self._scores(), is_child=True)
        assert 'predicted_class' in result
        assert 'mean_z_score' in result


# ── frontend_stats_to_game_scores ─────────────────────────────────────────────

class TestFrontendStatsMapping:
    def _make_stats(self, **overrides):
        defaults = dict(
            player_id="test",
            player_age=30,
            player_gender="male",
            is_child=False,
            cloudport_totalTime=30,
            cloudport_avgReactionTime=350,
            cloudport_catches=8,
            cloudport_misses=2,
            starBridge_totalTime=45,
            starBridge_errors=1,
            starBridge_completed=True,
            hiddenReef_totalMoves=20,
            hiddenReef_totalPairs=8,
            hiddenReef_efficiency=0.6,
            hiddenReef_roundsCompleted=2,
            echoBay_maxSequence=5,
            echoBay_totalRounds=4,
            echoBay_perfectRounds=2,
            starbridge_time=0.0,
            echobay_span=0,
            card_patterns=0,
        )
        defaults.update(overrides)
        return main.FrontendGameStats(**defaults)

    def test_adult_mode_returns_false_is_child(self):
        stats = self._make_stats()
        _, is_child = main.frontend_stats_to_game_scores(stats)
        assert is_child is False

    def test_child_mode_returns_true_is_child(self):
        stats = self._make_stats(is_child=True)
        _, is_child = main.frontend_stats_to_game_scores(stats)
        assert is_child is True

    def test_adult_gender_male(self):
        stats = self._make_stats(player_gender='male')
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['gender'] == 0

    def test_adult_gender_female(self):
        stats = self._make_stats(player_gender='female')
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['gender'] == 1

    def test_adult_items_per_sec_calculation(self):
        # 8 catches in 30 s → 8/30 ≈ 0.267
        stats = self._make_stats(cloudport_catches=8, cloudport_totalTime=30)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['cloudport_items_per_sec'] == pytest.approx(8 / 30, rel=1e-4)

    def test_adult_efficiency_passthrough(self):
        stats = self._make_stats(hiddenReef_efficiency=0.75)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['card_efficiency'] == pytest.approx(0.75)

    def test_child_catches_passthrough(self):
        stats = self._make_stats(is_child=True, cloudport_catches=7)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['cloudport_catches'] == 7

    def test_child_explicit_starbridge_time(self):
        stats = self._make_stats(is_child=True, starbridge_time=55.0)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['starbridge_time'] == pytest.approx(55.0)

    def test_child_falls_back_to_total_time_when_explicit_zero(self):
        stats = self._make_stats(is_child=True, starbridge_time=0.0,
                                  starBridge_totalTime=60.0)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['starbridge_time'] == pytest.approx(60.0)

    def test_adult_totalTime_millis_converted(self):
        # Values > 100 treated as milliseconds → divide by 1000
        stats = self._make_stats(cloudport_totalTime=30000, cloudport_catches=10)
        scores, _ = main.frontend_stats_to_game_scores(stats)
        assert scores['cloudport_items_per_sec'] == pytest.approx(10 / 30, rel=1e-4)
