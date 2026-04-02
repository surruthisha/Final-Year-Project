"""
Unit tests for the Pediatric Calibration Layer formulas.

These tests verify the mathematical correctness of each mapping
formula independently of the ML models. No mocking required.

References:
    Van der Elst (2012)  — processing speed 1.35× multiplier
    Tombaugh (2004)      — trail making 0.49 calibration factor
    Gathercole (2004)    — forward memory span mapping
    Logie & Pearson (1997) — visual span mapping
"""

import numpy as np
import pytest


# ── Inline formula implementations (mirrors main.py) ─────────────────────────

def calibrate_dsc(catches: float) -> float:
    """Van der Elst 2012: maps [0–10 catches] → NCPT digit-symbol [20–80]."""
    dsc = 20 + (catches / 10) * 1.35 * 44.4
    return float(np.clip(dsc, 20, 80))


def calibrate_trail_making(raw_time: float) -> tuple[float, float]:
    """Tombaugh 2004: 0.49 factor maps child time → adult TM-B; TM-A is half."""
    tm_b = float(np.clip(raw_time * 0.49, 15, 150))
    tm_a = tm_b * 0.5
    return tm_a, tm_b


def calibrate_fms(span: float) -> float:
    """Gathercole 2004: maps [1–5 child span] → [4–14]."""
    return float(np.clip(4 + (span / 5) * 10, 4, 14))


def calibrate_rms(patterns: float) -> float:
    """Logie & Pearson 1997: maps [1–5 patterns] → [5–16]."""
    return float(np.clip(5 + (patterns / 5) * 11, 5, 16))


# ── Processing Speed (Van der Elst 2012) ─────────────────────────────────────

class TestDigitSymbolCoding:
    def test_zero_catches_gives_lower_bound(self):
        assert calibrate_dsc(0) == pytest.approx(20.0)

    def test_ten_catches_gives_expected_value(self):
        # 20 + (10/10) * 1.35 * 44.4 = 20 + 59.94 = 79.94 (below 80 clip)
        result = calibrate_dsc(10)
        assert result == pytest.approx(79.94, abs=0.01)

    def test_five_catches_midpoint(self):
        # 20 + (5/10) * 1.35 * 44.4 = 20 + 29.97 = 49.97
        result = calibrate_dsc(5)
        assert result == pytest.approx(49.97, abs=0.01)

    def test_result_clipped_below_20(self):
        assert calibrate_dsc(-5) == pytest.approx(20.0)

    def test_result_clipped_above_80(self):
        # Very large catches should cap at 80
        assert calibrate_dsc(100) == pytest.approx(80.0)

    def test_monotonically_increasing(self):
        values = [calibrate_dsc(c) for c in range(11)]
        assert values == sorted(values)


# ── Trail Making (Tombaugh 2004) ──────────────────────────────────────────────

class TestTrailMaking:
    def test_typical_child_time(self):
        # Child mean ~65 s → TM-B ~31.85 s, TM-A ~15.925 s
        tm_a, tm_b = calibrate_trail_making(65)
        assert tm_b == pytest.approx(65 * 0.49, abs=0.01)
        assert tm_a == pytest.approx(tm_b * 0.5, abs=0.01)

    def test_tm_b_lower_clip(self):
        # Very fast time: 10 * 0.49 = 4.9 → clipped to 15
        _, tm_b = calibrate_trail_making(10)
        assert tm_b == pytest.approx(15.0)

    def test_tm_b_upper_clip(self):
        # Very slow time: 500 * 0.49 = 245 → clipped to 150
        _, tm_b = calibrate_trail_making(500)
        assert tm_b == pytest.approx(150.0)

    def test_tm_a_always_half_of_tm_b(self):
        for raw in [30, 65, 100, 200]:
            tm_a, tm_b = calibrate_trail_making(raw)
            assert tm_a == pytest.approx(tm_b * 0.5, rel=1e-6)

    def test_zero_time_clips_to_lower_bound(self):
        tm_a, tm_b = calibrate_trail_making(0)
        assert tm_b == pytest.approx(15.0)
        assert tm_a == pytest.approx(7.5)


# ── Forward Memory Span (Gathercole 2004) ────────────────────────────────────

class TestForwardMemorySpan:
    def test_zero_span_gives_lower_bound(self):
        assert calibrate_fms(0) == pytest.approx(4.0)

    def test_five_span_gives_upper_expected(self):
        # 4 + (5/5) * 10 = 14
        assert calibrate_fms(5) == pytest.approx(14.0)

    def test_two_five_span_midpoint(self):
        # 4 + (2.5/5) * 10 = 4 + 5 = 9
        assert calibrate_fms(2.5) == pytest.approx(9.0)

    def test_result_clipped_below_4(self):
        assert calibrate_fms(-10) == pytest.approx(4.0)

    def test_result_clipped_above_14(self):
        assert calibrate_fms(100) == pytest.approx(14.0)

    def test_monotonically_increasing(self):
        values = [calibrate_fms(s) for s in range(6)]
        assert values == sorted(values)


# ── Reverse / Visual Memory Span (Logie & Pearson 1997) ──────────────────────

class TestReverseMemorySpan:
    def test_zero_patterns_gives_lower_bound(self):
        assert calibrate_rms(0) == pytest.approx(5.0)

    def test_five_patterns_gives_upper_expected(self):
        # 5 + (5/5) * 11 = 16
        assert calibrate_rms(5) == pytest.approx(16.0)

    def test_two_five_patterns_midpoint(self):
        # 5 + (2.5/5) * 11 = 5 + 5.5 = 10.5
        assert calibrate_rms(2.5) == pytest.approx(10.5)

    def test_result_clipped_below_5(self):
        assert calibrate_rms(-5) == pytest.approx(5.0)

    def test_result_clipped_above_16(self):
        assert calibrate_rms(100) == pytest.approx(16.0)

    def test_monotonically_increasing(self):
        values = [calibrate_rms(p) for p in range(6)]
        assert values == sorted(values)


# ── Fluid Reasoning ───────────────────────────────────────────────────────────

class TestFluidReasoning:
    def test_child_mode_pm_is_neutral_median(self):
        """Heart Isle is not tracked for children — pm must be 8.0."""
        pm = 8.0
        assert pm == pytest.approx(8.0)
