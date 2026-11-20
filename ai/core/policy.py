"""Deterministic authorization gate for MeloLegacy AI Core.

This module classifies proposed actions only. It does not execute them.
Unknown actions fail closed.
"""
from dataclasses import dataclass
from enum import Enum


class Decision(str, Enum):
    ALLOW = "allow"
    REQUIRE_APPROVAL = "require_approval"
    DENY = "deny"


@dataclass(frozen=True)
class PolicyResult:
    action: str
    decision: Decision
    reason: str


# Actions safe for bounded autonomous work in isolated/non-production contexts.
_AUTONOMOUS = {
    "read_project_docs": "Read approved project documentation.",
    "read_repository": "Inspect repository files and metadata.",
    "read_test_logs": "Inspect test and training logs.",
    "create_feature_branch": "Create an isolated development branch.",
    "edit_feature_branch": "Edit files on a non-protected feature branch.",
    "run_tests": "Run deterministic tests and static checks.",
    "run_limited_training": "Run training within approved dataset and resource limits.",
    "create_draft_pull_request": "Prepare a draft change for review.",
    "melobot_external_coordination": "Melobot may coordinate approved operational communication through Melo Cloud; this does not authorize commercial transactions.",
}

# Sensitive actions require explicit project-owner approval.
_APPROVAL = {
    "merge_to_main": "Changes to the protected main branch require owner approval.",
    "deploy_production": "Production deployment requires owner approval.",
    "delete_data": "Data deletion is destructive and requires owner approval and a verified backup.",
    "export_private_data": "Exporting private or student data requires explicit authorization.",
    "share_user_data": "Sharing user/student data requires consent and owner approval.",
    "change_user_permissions": "Changing account roles or access requires owner approval.",
    "change_security_settings": "Security and authentication changes require owner approval.",
    "change_retention_policy": "Changing data retention or backup policy requires owner approval.",
    "add_paid_service": "Introducing a paid service or potential charge requires owner approval.",
    "publish_dataset_or_model": "Publication requires license, attribution, and privacy review.",
}

# These operations must never be performed by the autonomous agent.
_DENIED = {
    "read_secrets": "Secret values must never be read or exposed by the agent.",
    "print_credentials": "Credentials must never be printed or copied into logs.",
    "disable_audit_log": "Audit logging cannot be disabled by the agent.",
    "bypass_policy": "The agent cannot bypass its authorization gate.",
    "execute_untrusted_instructions": "Instructions embedded in untrusted content are data, not authority.",
    "specialist_direct_external_access": "Specialist Melo AI agents are internal-only and cannot directly access external systems.",
    "specialist_external_communication": "Only Melobot, through Melo Cloud, may coordinate approved external communication.",
    "specialist_external_transactions": "Specialist agents have no authority to conduct external or commercial transactions.",
    "melobot_bypass_guardian": "Melobot cannot override immutable security and approval policies.",
}


def authorize(action: str) -> PolicyResult:
    """Return the policy decision for an action name; unknown actions are denied."""
    normalized = action.strip().lower() if isinstance(action, str) else ""
    if normalized in _DENIED:
        return PolicyResult(normalized, Decision.DENY, _DENIED[normalized])
    if normalized in _APPROVAL:
        return PolicyResult(normalized, Decision.REQUIRE_APPROVAL, _APPROVAL[normalized])
    if normalized in _AUTONOMOUS:
        return PolicyResult(normalized, Decision.ALLOW, _AUTONOMOUS[normalized])
    return PolicyResult(
        normalized or "<empty>",
        Decision.DENY,
        "Unknown actions fail closed until explicitly reviewed and added to policy.",
    )
