from __future__ import annotations

import json
from pathlib import Path

from .fetch import load_package
from .ledger import attest, load_ledger, save_ledger
from .report import audit_package


FIXTURES = [
    ("left-padder", "1.0.1"),
    ("color-tones", "2.3.0"),
    ("date-fmt-lite", "0.4.0"),
    ("color-tones", "2.3.1"),
    ("date-fmt-lite", "0.5.0"),
]


def seed_demo(repo_root: Path) -> None:
    for name, version in FIXTURES:
        report, digest = audit_package(name, version)
        attest(report.integrity, name, version, report.verdict, report.risk_score, digest, f"/reports/{digest}")
    bad = load_package("color-tones", "2.3.1")
    ledger = load_ledger()
    existing = [a for a in ledger["attestations"] if a["auditor"] == "careless-auditor" and a["integrity"] == bad.integrity]
    if not existing:
        attest(bad.integrity, "color-tones", "2.3.1", __import__("vouch_agent.models", fromlist=["Verdict"]).Verdict.safe, 5, "careless-demo-report", "/reports/careless-demo-report", auditor="careless-auditor")
    write_lockfiles(repo_root)


def write_lockfiles(repo_root: Path) -> None:
    demo = repo_root / "fixtures" / "demo-app"
    demo.mkdir(parents=True, exist_ok=True)
    clean = {
        "left-padder": "1.0.1",
        "color-tones": "2.3.0",
        "date-fmt-lite": "0.4.0",
    }
    compromised = {**clean, "color-tones": "2.3.1"}
    (demo / "package-lock.clean.json").write_text(json.dumps(_lockfile(clean), indent=2), encoding="utf-8")
    (demo / "package-lock.compromised.json").write_text(json.dumps(_lockfile(compromised), indent=2), encoding="utf-8")


def _lockfile(deps: dict[str, str]) -> dict:
    packages = {"": {"name": "vouch-demo-app", "version": "1.0.0", "dependencies": deps}}
    dependencies = {}
    for name, version in deps.items():
        source = load_package(name, version)
        packages[f"node_modules/{name}"] = {
            "version": version,
            "resolved": f"fixture:{name}-{version}.tgz",
            "integrity": source.integrity,
        }
        dependencies[name] = {"version": version, "resolved": f"fixture:{name}-{version}.tgz", "integrity": source.integrity}
    return {"name": "vouch-demo-app", "version": "1.0.0", "lockfileVersion": 3, "requires": True, "packages": packages, "dependencies": dependencies}

