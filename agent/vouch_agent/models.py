from __future__ import annotations

from enum import Enum
from pydantic import BaseModel, Field


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Verdict(str, Enum):
    safe = "Safe"
    suspicious = "Suspicious"
    malicious = "Malicious"


class Finding(BaseModel):
    id: str
    rule: str
    severity: Severity
    file: str
    line: int
    snippet: str
    detail: str


class Evidence(BaseModel):
    file: str
    line_start: int
    line_end: int
    reason: str
    finding_id: str | None = None


class AgentVerdict(BaseModel):
    verdict: Verdict
    risk_score: int = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    summary: str
    evidence: list[Evidence]


class AuditReport(BaseModel):
    schema_version: str = "vouch.report.v1"
    package: str
    version: str
    integrity: str
    previous_version: str | None
    verdict: Verdict
    risk_score: int
    confidence: str
    summary: str
    findings: list[Finding]
    evidence: list[Evidence]
    reviewer_decision: str | None = None
    reviewer_note: str | None = None
    provider: str = "mock"
    model: str = "mock-vouch-2026"
    tool_version: str = "0.1.0"
    elapsed_ms: int
    llm_cost_usd: str = "0.0000"
    timestamp: str

