from __future__ import annotations

import json
from pathlib import Path

from .ledger import attestations_for_integrity


def check_lockfile(path: Path, block_score: int = 60) -> tuple[list[dict], bool]:
    lock = json.loads(path.read_text(encoding="utf-8"))
    rows = []
    failed = False
    packages = lock.get("packages", {})
    for pkg_path, meta in packages.items():
        if not pkg_path.startswith("node_modules/"):
            continue
        name = pkg_path.removeprefix("node_modules/")
        integrity = meta.get("integrity")
        version = meta.get("version", "unknown")
        atts = attestations_for_integrity(integrity) if integrity else []
        best = _best_attestation(atts)
        status = "Unattested"
        verdict = "Unattested"
        score = None
        report = None
        if best:
            verdict = best["verdict"]
            score = best["risk_score"]
            report = best["report_uri"]
            status = "Pass"
            if verdict == "Malicious" or (verdict == "Suspicious" and score >= block_score):
                status = "Blocked"
                failed = True
        rows.append({"package": name, "version": version, "verdict": verdict, "score": score, "status": status, "auditors": len(atts), "report": report})
    return rows, failed


def _best_attestation(attestations: list[dict]) -> dict | None:
    active = [item for item in attestations if item.get("status") == "Active"]
    if not active:
        return None
    rank = {"Malicious": 3, "Suspicious": 2, "Safe": 1}
    return sorted(active, key=lambda item: (rank.get(item["verdict"], 0), item["risk_score"]), reverse=True)[0]

