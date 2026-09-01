import pytest
from backend.models.stages import (
    ApplicationStage,
    STAGE_LABELS,
    STAGE_COLORS,
    VALID_STAGE_TRANSITIONS,
    is_valid_stage_transition
)

def test_all_specification_stages_exist():
    expected_stages = [
        "APPLIED",
        "REJECT",
        "R1",
        "R1_REJECT",
        "R2",
        "R2_REJECT",
        "R3",
        "R3_REJECT",
        "APPROVED"
    ]
    for stage_key in expected_stages:
        assert hasattr(ApplicationStage, stage_key)
        assert ApplicationStage[stage_key].value == stage_key

def test_stage_labels_completeness():
    for stage in ApplicationStage:
        assert stage in STAGE_LABELS
        assert len(STAGE_LABELS[stage]) > 0

    assert STAGE_LABELS[ApplicationStage.APPLIED] == "Applied (Initial)"
    assert STAGE_LABELS[ApplicationStage.REJECT] == "Reject"
    assert STAGE_LABELS[ApplicationStage.R1] == "R1"
    assert STAGE_LABELS[ApplicationStage.R1_REJECT] == "R1 Reject"
    assert STAGE_LABELS[ApplicationStage.R2] == "R2"
    assert STAGE_LABELS[ApplicationStage.R2_REJECT] == "R2 Reject"
    assert STAGE_LABELS[ApplicationStage.R3] == "R3"
    assert STAGE_LABELS[ApplicationStage.R3_REJECT] == "R3 Reject"
    assert STAGE_LABELS[ApplicationStage.APPROVED] == "Approved"

def test_stage_colors_defined():
    for stage in ApplicationStage:
        assert stage in STAGE_COLORS
        assert "bg" in STAGE_COLORS[stage]
        assert "text" in STAGE_COLORS[stage]
        assert "border" in STAGE_COLORS[stage]

def test_valid_stage_transitions():
    # Applied can move to R1, Reject, or Approved
    assert is_valid_stage_transition("APPLIED", "R1") is True
    assert is_valid_stage_transition("APPLIED", "REJECT") is True
    assert is_valid_stage_transition("APPLIED", "APPROVED") is True

    # R1 can move to R2, R1_REJECT, REJECT, or APPROVED
    assert is_valid_stage_transition("R1", "R2") is True
    assert is_valid_stage_transition("R1", "R1_REJECT") is True
    assert is_valid_stage_transition("R1", "REJECT") is True

    # R2 can move to R3, R2_REJECT, REJECT, or APPROVED
    assert is_valid_stage_transition("R2", "R3") is True
    assert is_valid_stage_transition("R2", "R2_REJECT") is True

    # R3 can move to APPROVED, R3_REJECT, or REJECT
    assert is_valid_stage_transition("R3", "APPROVED") is True
    assert is_valid_stage_transition("R3", "R3_REJECT") is True

    # Same state is always allowed (no-op update)
    assert is_valid_stage_transition("APPLIED", "APPLIED") is True
    assert is_valid_stage_transition("R1", "R1") is True

def test_invalid_stage_transition_handling():
    # Invalid string values
    assert is_valid_stage_transition("NON_EXISTENT_STAGE", "R1") is False
    assert is_valid_stage_transition("APPLIED", "INVALID_TARGET") is False
