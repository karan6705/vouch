from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path

from .agent import decide
from .config import data_dir, now_iso
from .detectors import run_detectors
from .fetch import load_package
from .models import AuditReport


def canonical_bytes(report: AuditReport) -> bytes:
    payload = report.model_dump(mode="json")
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def hash_report(report: AuditReport) -> str:
    return hashlib.sha256(canonical_bytes(report)).hexdigest()


def store_report(report: AuditReport) -> tuple[str, Path]:
    digest = hash_report(report)
    path = data_dir() / "reports" / f"{digest}.json"
    path.write_bytes(canonical_bytes(report))
    return digest, path


def audit_package(name: str, version: str) -> tuple[AuditReport, str]:
    started = time.perf_counter()
    source = load_package(name, version)
    previous_source = None
    if source.previous_version:
        try:
            previous_source = load_package(name, source.previous_version)
        except Exception:
            previous_source = None
    findings = run_detectors(source.root, previous_source.root if previous_source else None)
    agent = decide(findings, source.root)
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    report = AuditReport(
        package=name,
        version=version,
        integrity=source.integrity,
        previous_version=source.previous_version,
        verdict=agent.verdict,
        risk_score=agent.risk_score,
        confidence=f"{agent.confidence:.2f}",
        summary=agent.summary,
        findings=findings,
        evidence=agent.evidence,
        elapsed_ms=elapsed_ms,
        timestamp=now_iso(),
    )
    digest, _ = store_report(report)
    return report, digest


def get_report(digest: str) -> dict:
    path = data_dir() / "reports" / f"{digest}.json"
    if not path.exists():
        raise FileNotFoundError(digest)
    return json.loads(path.read_text(encoding="utf-8"))

