from enum import Enum
from typing import List, Dict, Set

class ApplicationStage(str, Enum):
    APPLIED = "APPLIED"
    REJECT = "REJECT"
    R1 = "R1"
    R1_REJECT = "R1_REJECT"
    R2 = "R2"
    R2_REJECT = "R2_REJECT"
    R3 = "R3"
    R3_REJECT = "R3_REJECT"
    APPROVED = "APPROVED"

# Human-readable labels for UI and reporting
STAGE_LABELS: Dict[ApplicationStage, str] = {
    ApplicationStage.APPLIED: "Applied (Initial)",
    ApplicationStage.REJECT: "Reject",
    ApplicationStage.R1: "R1",
    ApplicationStage.R1_REJECT: "R1 Reject",
    ApplicationStage.R2: "R2",
    ApplicationStage.R2_REJECT: "R2 Reject",
    ApplicationStage.R3: "R3",
    ApplicationStage.R3_REJECT: "R3 Reject",
    ApplicationStage.APPROVED: "Approved"
}

# UI Color Badge Mappings
STAGE_COLORS: Dict[ApplicationStage, Dict[str, str]] = {
    ApplicationStage.APPLIED: {"bg": "bg-slate-100", "text": "text-slate-800", "border": "border-slate-300"},
    ApplicationStage.REJECT: {"bg": "bg-rose-100", "text": "text-rose-800", "border": "border-rose-300"},
    ApplicationStage.R1: {"bg": "bg-blue-100", "text": "text-blue-800", "border": "border-blue-300"},
    ApplicationStage.R1_REJECT: {"bg": "bg-orange-100", "text": "text-orange-800", "border": "border-orange-300"},
    ApplicationStage.R2: {"bg": "bg-indigo-100", "text": "text-indigo-800", "border": "border-indigo-300"},
    ApplicationStage.R2_REJECT: {"bg": "bg-amber-100", "text": "text-amber-800", "border": "border-amber-300"},
    ApplicationStage.R3: {"bg": "bg-purple-100", "text": "text-purple-800", "border": "border-purple-300"},
    ApplicationStage.R3_REJECT: {"bg": "bg-red-100", "text": "text-red-800", "border": "border-red-300"},
    ApplicationStage.APPROVED: {"bg": "bg-emerald-100", "text": "text-emerald-800", "border": "border-emerald-300"}
}

# Valid FSM Transitions
VALID_STAGE_TRANSITIONS: Dict[ApplicationStage, Set[ApplicationStage]] = {
    ApplicationStage.APPLIED: {
        ApplicationStage.R1,
        ApplicationStage.REJECT,
        ApplicationStage.APPROVED
    },
    ApplicationStage.R1: {
        ApplicationStage.R2,
        ApplicationStage.R1_REJECT,
        ApplicationStage.REJECT,
        ApplicationStage.APPROVED
    },
    ApplicationStage.R2: {
        ApplicationStage.R3,
        ApplicationStage.R2_REJECT,
        ApplicationStage.REJECT,
        ApplicationStage.APPROVED
    },
    ApplicationStage.R3: {
        ApplicationStage.APPROVED,
        ApplicationStage.R3_REJECT,
        ApplicationStage.REJECT
    },
    ApplicationStage.REJECT: {ApplicationStage.APPLIED, ApplicationStage.R1}, # Allow re-evaluation if needed
    ApplicationStage.R1_REJECT: {ApplicationStage.R1, ApplicationStage.R2},
    ApplicationStage.R2_REJECT: {ApplicationStage.R2, ApplicationStage.R3},
    ApplicationStage.R3_REJECT: {ApplicationStage.R3, ApplicationStage.APPROVED},
    ApplicationStage.APPROVED: set() # Terminal state
}

def is_valid_stage_transition(current_stage: str, target_stage: str) -> bool:
    """
    Validates if moving from current_stage to target_stage is allowed.
    """
    try:
        curr = ApplicationStage(current_stage)
        target = ApplicationStage(target_stage)
    except ValueError:
        return False
    
    if curr == target:
        return True
    
    allowed = VALID_STAGE_TRANSITIONS.get(curr, set())
    return target in allowed
