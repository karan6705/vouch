from __future__ import annotations

from collections import Counter
from pathlib import Path

from .models import AgentVerdict, Evidence, Finding, Severity, Verdict


WEIGHTS = {
    Severity.low: 5,
    Severity.medium: 15,
    Severity.high: 25,
    Severity.critical: 45,
}


def score_findings(findings: list[Finding]) -> int:
    total = sum(WEIGHTS[f.severity] for f in findings)
    rules = Counter(f.rule for f in findings)
    if "prompt-injection" in rules:
        total += 20
    if "lifecycle-script" in rules and ("encoded-string" in rules or "env-access" in rules):
        total += 25
    return min(100, total)


def decide(findings: list[Finding], root: Path) -> AgentVerdict:
    score = score_findings(findings)
    if score == 0:
        verdict = Verdict.safe
        confidence = 0.96
        summary = "No medium or higher risk static signals were found. Vouch did not call an LLM for this clean update."
    elif score >= 80:
        verdict = Verdict.malicious
        confidence = 0.91
        summary = "The update contains high-risk supply-chain signals with cited evidence. It should be blocked until reviewed."
    elif score >= 40:
        verdict = Verdict.suspicious
        confidence = 0.66
        summary = "The update has meaningful risk signals and is routed to human review before being trusted."
    else:
        verdict = Verdict.suspicious
        confidence = 0.78
        summary = "The update has low to medium risk signals that should be reviewed by policy."

    evidence = []
    for finding in findings[:6]:
        evidence.append(
            Evidence(
                file=finding.file,
                line_start=finding.line,
                line_end=finding.line,
                reason=finding.detail,
                finding_id=finding.id,
            )
        )
    valid, evidence = validate_evidence(root, evidence)
    if not valid and verdict == Verdict.malicious:
        verdict = Verdict.suspicious
        confidence = min(confidence, 0.6)
    return AgentVerdict(verdict=verdict, risk_score=score, confidence=confidence, summary=summary, evidence=evidence)


def validate_evidence(root: Path, evidence: list[Evidence]) -> tuple[bool, list[Evidence]]:
    valid: list[Evidence] = []
    all_ok = True
    for item in evidence:
        path = root / item.file
        if not path.exists() or not path.is_file():
            all_ok = False
            continue
        line_count = len(path.read_text(encoding="utf-8", errors="replace").splitlines())
        if item.line_start < 1 or item.line_end < item.line_start or item.line_end > max(1, line_count):
            all_ok = False
            continue
        valid.append(item)
    return all_ok, valid

