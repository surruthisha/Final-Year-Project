# Testing Guide

This document covers the full test suite for MindScape — what is tested, how to run the tests, and how the test infrastructure is set up.

---

## Table of Contents

- [Overview](#overview)
- [Frontend Tests](#frontend-tests)
  - [Setup](#frontend-setup)
  - [Running](#running-frontend-tests)
  - [Test Files](#frontend-test-files)
  - [GameContext Tests](#gamecontext-tests)
  - [SettingsModal Tests](#settingsmodal-tests)
  - [API Client Tests](#api-client-tests)
- [Backend Tests](#backend-tests)
  - [Setup](#backend-setup)
  - [Running](#running-backend-tests)
  - [Test Files](#backend-test-files)
  - [Calibration Tests](#calibration-formula-tests)
  - [Prediction Tests](#prediction-function-tests)
  - [API Endpoint Tests](#api-endpoint-tests)
- [Coverage Summary](#coverage-summary)
- [Mocking Strategy](#mocking-strategy)

---

## Overview

| Layer | Framework | Test Files | Total Tests |
|-------|-----------|------------|-------------|
| Frontend | Vitest + @testing-library/react | 3 test files | 36 tests |
| Backend | pytest + FastAPI TestClient | 3 test files | 70 tests |
| **Total** | | **6 files** | **106 tests** |

All 106 tests pass without requiring ML model files on disk, a running backend server, or any network connection.

---

## Frontend Tests

### Frontend Setup

The frontend test environment uses:

- **[Vitest](https://vitest.dev/)** — test runner and assertion library
- **[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)** — component rendering and user-event simulation
- **jsdom** — headless browser DOM simulation

**Configuration:** `frontend/vitest.config.ts`

```ts
{
  environment: "jsdom",
  globals: true,
  setupFiles: ["./src/test/setup.ts"],
  include: ["src/**/*.{test,spec}.{ts,tsx}"]
}
```

**Global mocks** (`frontend/src/test/setup.ts`):

| Mock | What it replaces | Why |
|------|-----------------|-----|
| `window.matchMedia` | Browser media query API | jsdom doesn't implement it |
| `window.AudioContext` / `webkitAudioContext` | Web Audio API | `useSoundEffects` and `useBackgroundMusic` use it; jsdom has no audio engine |
| `URL.createObjectURL` | Blob URL creation | `CognitiveReport` download button calls it |
| `URL.revokeObjectURL` | Blob URL cleanup | Companion to `createObjectURL` |

### Running Frontend Tests

```bash
cd frontend

# Run all tests once (CI mode)
npx vitest run

# Watch mode (re-runs on file save)
npx vitest

# With verbose output per test
npx vitest run --reporter=verbose
```

Expected output:

```
 Test Files  4 passed (4)
      Tests  36 passed (36)
   Duration  ~3s
```

> Note: The `stderr` block printed by the `useGame throws outside GameProvider` test is expected.
> React logs the error to the console before the test framework catches it. The test itself passes.

---

### Frontend Test Files

```
frontend/src/
├── contexts/
│   └── GameContext.test.tsx        (18 tests)
├── components/game/
│   └── SettingsModal.test.tsx      (8 tests)
└── lib/
    └── api.test.ts                 (10 tests)
```

---

### GameContext Tests

**File:** `src/contexts/GameContext.test.tsx`
**Tests:** 18

These are pure reducer unit tests. Each test renders the hook inside a `GameProvider` wrapper, dispatches an action, and asserts the resulting state.

| Test | What it verifies |
|------|-----------------|
| initialises with the correct default state | `initialGameState` shape is intact on first render |
| SET_SCREEN updates the screen | `state.screen` changes to the dispatched value |
| SELECT_MINDLING sets the selected mindling | `state.selectedMindling` stores the full Mindling object |
| SET_MINDLING_NAME sets the mindling name | `state.mindlingName` updates |
| COLLECT_SEED (spark) marks spark true and unlocks star-bridge | Seed flag set; `star-bridge` added to `unlockedIslands` |
| COLLECT_SEED (logic) marks logic true and unlocks hidden-reef | Seed flag set; `hidden-reef` added |
| COLLECT_SEED (harmony) marks harmony true and unlocks heart-isle | Seed flag set; `heart-isle` added |
| seedCount reflects all three collected seeds | Derived `seedCount` returns 3 after all seeds collected |
| UNLOCK_ISLAND does not duplicate islands | Island appears once even if dispatched twice |
| UNLOCK_ISLAND adds a new island | Island is added to `unlockedIslands` array |
| SET_CURRENT_ISLAND sets currentIsland | `state.currentIsland` updates |
| UPDATE_STATS stores cloudport stats | `state.stats.cloudport` stores the dispatched stats object |
| EVOLVE_MINDLING sets isEvolved to true | `state.isEvolved` becomes `true` |
| RESET_GAME restores initial state | Full state returns to `initialGameState` after modifications |
| TOGGLE_MUSIC flips musicEnabled | `false → true → false` across two dispatches |
| TOGGLE_SFX flips sfxEnabled | `false → true → false` across two dispatches |
| TOGGLE_MUSIC does not affect sfxEnabled | `sfxEnabled` remains `true` when music is toggled |
| useGame throws outside GameProvider | Hook throws the expected error when rendered without a provider |

---

### SettingsModal Tests

**File:** `src/components/game/SettingsModal.test.tsx`
**Tests:** 8

These tests render the `SettingsModal` component inside a `GameProvider` and simulate user interactions.

| Test | What it verifies |
|------|-----------------|
| renders nothing when closed | Modal content is absent from DOM when `open={false}` |
| renders the modal when open | `Settings` heading is present when `open={true}` |
| shows Background Music and Sound Effects rows | Both toggle rows are rendered |
| Done button calls onClose | `onClose` mock is called once on Done click |
| X button calls onClose | `onClose` mock is called when the close icon button is clicked |
| Home Page button dispatches RESET_GAME and calls onClose | Game is reset and modal closes |
| Music toggle button is present and clickable | At least 4 buttons rendered (X, music, sfx, home, done) |
| clicking the backdrop calls onClose | Clicking the semi-transparent overlay closes the modal |

---

### API Client Tests

**File:** `src/lib/api.test.ts`
**Tests:** 10

These tests mock the global `fetch` function using `vi.stubGlobal` and verify the API client's behaviour without a real network.

#### `predictFromFrontendStats`

| Test | What it verifies |
|------|-----------------|
| POSTs to the correct endpoint with JSON body | URL is `http://localhost:8001/api/predict/frontend`, method is `POST`, `Content-Type` is `application/json`, body contains correct game stats |
| returns the parsed prediction result | Response JSON is returned correctly |
| throws when response is not ok | Rejects with `"Prediction failed: 503 Service Unavailable"` |
| throws on network failure | Propagates `fetch` rejection |

#### `checkHealth`

| Test | What it verifies |
|------|-----------------|
| returns true when status=ok and models_loaded=true | Happy path returns `true` |
| returns false when models_loaded=false | Returns `false` even when HTTP is 200 |
| returns false when status is not ok | Returns `false` for error status string |
| returns false on network failure | Does not throw; returns `false` |
| calls the correct health endpoint | URL is `http://localhost:8001/api/health` |

---

## Backend Tests

### Backend Setup

The backend test environment uses:

- **[pytest](https://docs.pytest.org/)** — test runner
- **[FastAPI TestClient](https://fastapi.tiangolo.com/tutorial/testing/)** (backed by **httpx**) — HTTP endpoint testing
- **`unittest.mock`** — model patching (no actual `.pt` / `.pkl` files required)

**Install test dependencies:**

```bash
cd backend
pip install pytest httpx
```

Both `pytest` and `httpx` are listed in `requirements.txt`.

### Running Backend Tests

```bash
cd backend

# Run all tests
python -m pytest tests/ -v

# Run a single file
python -m pytest tests/test_calibration.py -v

# Run by keyword
python -m pytest tests/ -k "child" -v
```

Expected output:

```
70 passed in 0.6s
```

---

### Backend Test Files

```
backend/tests/
├── __init__.py
├── test_calibration.py     (24 tests) — pure formula unit tests
├── test_predict.py         (30 tests) — predict_from_game + mapping
└── test_api.py             (16 tests) — FastAPI endpoint integration
```

---

### Calibration Formula Tests

**File:** `tests/test_calibration.py`
**Tests:** 24

These are **pure arithmetic unit tests** — no models, no mocks, no imports from `main.py`. They verify that each pediatric calibration formula produces the correct numerical output.

The formulas are duplicated inline in the test file so they can be exercised in complete isolation from the rest of the codebase.

#### Processing Speed — Van der Elst (2012)

`DSC = clip(20 + (catches / 10) × 1.35 × 44.4, 20, 80)`

| Test | Scenario |
|------|----------|
| zero catches gives lower bound | 0 catches → 20.0 |
| ten catches gives expected value | 10 catches → 79.94 |
| five catches midpoint | 5 catches → 49.97 |
| result clipped below 20 | Negative catches → 20.0 |
| result clipped above 80 | Very large catches → 80.0 |
| monotonically increasing | Each additional catch produces a higher DSC |

#### Trail Making — Tombaugh (2004)

`TM-B = clip(raw_time × 0.49, 15, 150)` | `TM-A = TM-B × 0.5`

| Test | Scenario |
|------|----------|
| typical child time | 65 s → TM-B ≈ 31.85 s, TM-A ≈ 15.93 s |
| TM-B lower clip | 10 s raw → TM-B = 15.0 (minimum) |
| TM-B upper clip | 500 s raw → TM-B = 150.0 (maximum) |
| TM-A always half of TM-B | Verified across 4 different raw times |
| zero time clips to lower bound | 0 s → TM-B = 15.0, TM-A = 7.5 |

#### Forward Memory Span — Gathercole (2004)

`FMS = clip(4 + (span / 5) × 10, 4, 14)`

| Test | Scenario |
|------|----------|
| zero span gives lower bound | 0 → 4.0 |
| five span gives upper expected | 5 → 14.0 |
| two-and-a-half span midpoint | 2.5 → 9.0 |
| clipped below 4 | Negative span → 4.0 |
| clipped above 14 | Large span → 14.0 |
| monotonically increasing | Verified across 0–5 |

#### Reverse / Visual Memory Span — Logie & Pearson (1997)

`RMS = clip(5 + (patterns / 5) × 11, 5, 16)`

| Test | Scenario |
|------|----------|
| zero patterns gives lower bound | 0 → 5.0 |
| five patterns gives upper expected | 5 → 16.0 |
| two-and-a-half patterns midpoint | 2.5 → 10.5 |
| clipped below 5 | Negative patterns → 5.0 |
| clipped above 16 | Large patterns → 16.0 |
| monotonically increasing | Verified across 0–5 |

#### Fluid Reasoning

| Test | What it verifies |
|------|-----------------|
| child mode pm is neutral median | Heart Isle is not tracked for children; PM is fixed at 8.0 |

---

### Prediction Function Tests

**File:** `tests/test_predict.py`
**Tests:** 30

These tests call `predict_from_game()` and `frontend_stats_to_game_scores()` directly with the ML models replaced by lightweight `MagicMock` objects.

**Mocking approach** — a `pytest` autouse fixture patches five module-level globals before every test:

```python
patch.object(main, 'NCPT_NORMS', FAKE_NORMS)
patch.object(main, 'NCPT_FEATURES', FAKE_FEATURES)
patch.object(main, 'lgbm_model', mock_lgbm)   # returns fixed probability array
patch.object(main, 'imputer', MagicMock(transform=lambda x: x))
```

#### Adult Mode — `predict_from_game(scores, is_child=False)`

| Test | What it verifies |
|------|-----------------|
| returns expected keys | All 9 output keys present in result dict |
| predicted class is int | Value is an integer in `{0, 1, 2, 3}` |
| DSC mapping | `0.5 items/s × 60 = 30.0` digit-symbol score |
| DSC clipped at minimum | 0 items/s → DSC = 10.0 |
| DSC clipped at maximum | 2.0 items/s → DSC = 80.0 |
| trail making passthrough | Starbridge times passed directly to raw features |
| trail making z-score inverted | Fast time → higher z-score (lower is better) |
| RMS formula | `5 + 0.5 × 11 = 10.5` for 50% efficiency |
| gender not in zscores | `gender` key excluded from z-score dict |
| confidence between 0 and 1 | `0.0 ≤ confidence ≤ 1.0` |
| probabilities sum to one | Sum of four class probabilities ≈ 1.0 |

#### Child Mode — `predict_from_game(scores, is_child=True)`

| Test | What it verifies |
|------|-----------------|
| DSC midpoint | 5 catches → DSC ≈ 49.97 |
| DSC zero catches | 0 catches → DSC = 20.0 |
| DSC ten catches near 80 | 10 catches → DSC ≈ 79.94 |
| TM-B calibration | 65 s raw → TM-B ≈ 31.85 s |
| TM-A is half TM-B | `TM-A = TM-B × 0.5` |
| FMS formula | span=3 → FMS = 10.0 |
| RMS formula | patterns=3 → RMS = 11.6 |
| fluid reasoning neutral | `progressive_matrices = 8.0` fixed |
| returns expected keys | `predicted_class` and `mean_z_score` present |

#### Frontend Stats Mapping — `frontend_stats_to_game_scores()`

| Test | What it verifies |
|------|-----------------|
| adult mode returns `is_child=False` | Tuple second element is `False` |
| child mode returns `is_child=True` | Tuple second element is `True` |
| adult gender male | `"male"` → `gender = 0` |
| adult gender female | `"female"` → `gender = 1` |
| items per second calculation | `catches / time_s` computed correctly |
| efficiency passthrough | `hiddenReef_efficiency` forwarded without modification |
| child catches passthrough | `cloudport_catches` forwarded directly |
| explicit starbridge time | `starbridge_time > 0` used over derived value |
| falls back to total time | `starbridge_time = 0` → falls back to `starBridge_totalTime` |
| milliseconds converted | `totalTime > 100` treated as ms and divided by 1000 |

---

### API Endpoint Tests

**File:** `tests/test_api.py`
**Tests:** 16

These tests use FastAPI's `TestClient` which makes real HTTP calls through the full middleware stack but does not open a network socket. The `@app.on_event("startup")` hook normally calls `load_models()` — this is patched to inject mock globals instead of loading files from disk.

**Two fixtures:**

```python
client_with_models   # startup runs _noop_load() → sets mock lgbm, norms, features
client_no_models     # startup runs _noop_load_clear() → explicitly sets all globals to None
```

#### `GET /api/health`

| Test | Fixture | Assertion |
|------|---------|-----------|
| health models loaded | `client_with_models` | `status=ok`, `models_loaded=true` |
| health models not loaded | `client_no_models` | `status=ok`, `models_loaded=false` |

#### `POST /api/predict/frontend`

| Test | Fixture | Assertion |
|------|---------|-----------|
| 503 when models not loaded | `client_no_models` | HTTP 503 |
| 200 with models loaded | `client_with_models` | HTTP 200 |
| response contains required fields | `client_with_models` | All 8 keys present |
| is_child false in response | `client_with_models` | `is_child=false` echoed |
| is_child true in response | `client_with_models` | `is_child=true` echoed for child payload |
| child input mapping has pediatric keys | `client_with_models` | `cloudport_catches`, `starbridge_time`, etc. in mapping |
| adult input mapping has adult keys | `client_with_models` | `cloudport_items_per_sec`, `starbridge_A_time` in mapping |
| predicted class in valid range | `client_with_models` | Class is 0, 1, 2, or 3 |
| female gender mapped correctly | `client_with_models` | `gender=1` in `input_mapping` |
| male gender mapped correctly | `client_with_models` | `gender=0` in `input_mapping` |

#### `POST /api/predict`

| Test | Fixture | Assertion |
|------|---------|-----------|
| 503 when models not loaded | `client_no_models` | HTTP 503 |
| 200 with models loaded | `client_with_models` | HTTP 200 |
| response shape | `client_with_models` | `predicted_class` and `probabilities` present |
| card efficiency validation | `client_with_models` | `card_efficiency=1.5` → HTTP 422 (Pydantic error) |

---

## Coverage Summary

### What is tested

| Area | Covered |
|------|---------|
| All 13 GameContext reducer actions | Yes |
| seedCount derived value | Yes |
| Provider error boundary | Yes |
| SettingsModal open/close | Yes |
| SettingsModal toggle buttons | Yes |
| SettingsModal Home Page reset | Yes |
| API POST URL and headers | Yes |
| API error handling (4xx/5xx) | Yes |
| API network failure | Yes |
| checkHealth happy and sad paths | Yes |
| All 4 pediatric calibration formulas | Yes |
| Boundary clipping (min/max) | Yes |
| Monotonicity of calibration mappings | Yes |
| Adult feature mapping (all 6 NCPT features) | Yes |
| z-score direction inversion for trail making | Yes |
| Gender encoding (male/female) | Yes |
| Millisecond detection and conversion | Yes |
| Child mode explicit vs derived fallback fields | Yes |
| FastAPI /health endpoint | Yes |
| FastAPI 503 when models not loaded | Yes |
| FastAPI gender routing in response | Yes |
| Pydantic schema validation (422) | Yes |

### What is not tested

| Area | Reason |
|------|--------|
| `useBackgroundMusic` hook internals | Web Audio API synthesis is difficult to meaningfully assert in jsdom |
| `CloudportGame` full gameplay loop | Requires timer mocking; firefly dedup logic is covered by the ref guard in source code |
| `CognitiveReport` download button | `URL.createObjectURL` is mocked; the HTML string generation is an implementation detail |
| GATv2 inference path | Model is always bypassed in tests; no test data available without the full torch runtime |
| `generate_clinical_report()` | Requires realistic score data; covered implicitly by `/api/report` integration if needed |

---

## Mocking Strategy

### Frontend — audio mocks

`useSoundEffects` and `useBackgroundMusic` both use the Web Audio API. jsdom provides no audio implementation, so the `AudioContext` constructor is replaced with a lightweight stub class in `setup.ts`. The stub returns no-op objects for every method call (`createOscillator`, `createGain`, etc.), allowing hooks that use audio to be imported without error.

### Frontend — fetch mocks

The `api.test.ts` file uses `vi.stubGlobal('fetch', vi.fn())` per test. Each test configures exactly what the mock should return for that specific scenario. Globals are restored via `vi.unstubAllGlobals()` in `afterEach`.

### Backend — torch stubs

`torch`, `torch.nn`, and `torch_geometric` are stubbed as bare `types.ModuleType` objects before `import main` runs in each test file. This allows `main.py` to be imported on any machine without PyTorch installed, and ensures the `NCPTGATv2` class definition doesn't raise `ImportError`.

### Backend — model globals

The five module-level globals (`lgbm_model`, `gat_model`, `meta_learner`, `imputer`, `NCPT_NORMS`, `NCPT_FEATURES`) are patched using `unittest.mock.patch.object(main, ...)`. For `test_predict.py` this is done via an autouse fixture that wraps every test. For `test_api.py` the `load_models` function itself is replaced with a no-op that sets the same globals directly, preventing the startup event from trying to load files from disk.
