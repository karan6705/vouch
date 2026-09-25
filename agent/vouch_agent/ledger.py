from __future__ import annotations

import hashlib
import json
from pathlib import Path

from .config import data_dir, now_iso
from .models import Verdict


def package_key(integrity: str) -> str:
    return "0x" + hashlib.sha3_256(integrity.encode("utf-8")).hexdigest()


def ledger_path() -> Path:
    return data_dir() / "ledger.json"


def load_ledger() -> dict:
    path = ledger_path()
    if not path.exists():
        return {
            "auditors": {
                "vouch-agent": {"stake": "1.0 ETH", "reputation": 42, "active": True, "attestations": 0, "challenges_won": 1, "challenges_lost": 0},
                "community-auditor": {"stake": "0.5 ETH", "reputation": 18, "active": True, "attestations": 0, "challenges_won": 0, "challenges_lost": 0},
                "careless-auditor": {"stake": "0.1 ETH", "reputation": 3, "active": True, "attestations": 0, "challenges_won": 0, "challenges_lost": 1},
            },
            "attestations": [],
            "challenges": [],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def save_ledger(ledger: dict) -> None:
    ledger_path().write_text(json.dumps(ledger, indent=2, sort_keys=True), encoding="utf-8")


def attest(
    integrity: str,
    package: str,
    version: str,
    verdict: Verdict,
    risk_score: int,
    report_hash: str,
    report_uri: str,
    auditor: str = "vouch-agent",
) -> dict:
    ledger = load_ledger()
    key = package_key(integrity)
    for existing in ledger["attestations"]:
        if existing["auditor"] == auditor and existing["package_key"] == key:
            return existing
    item = {
        "id": len(ledger["attestations"]) + 1,
        "auditor": auditor,
        "package": package,
        "version": version,
        "integrity": integrity,
        "package_key": key,
        "verdict": verdict.value,
        "risk_score": risk_score,
        "report_hash": report_hash,
        "report_uri": report_uri,
        "tx_hash": "0x" + hashlib.sha256(f"{key}:{report_hash}:{auditor}".encode()).hexdigest(),
        "block_number": 10_000 + len(ledger["attestations"]) + 1,
        "status": "Active",
        "timestamp": now_iso(),
    }
    ledger["attestations"].append(item)
    ledger["auditors"].setdefault(auditor, {"stake": "0.1 ETH", "reputation": 0, "active": True, "attestations": 0, "challenges_won": 0, "challenges_lost": 0})
    ledger["auditors"][auditor]["attestations"] += 1
    ledger["auditors"][auditor]["reputation"] += 1
    save_ledger(ledger)
    return item


def attestations_for_integrity(integrity: str) -> list[dict]:
    key = package_key(integrity)
    return [item for item in load_ledger()["attestations"] if item["package_key"] == key]


def attestations_for_package(name: str) -> list[dict]:
    return [item for item in load_ledger()["attestations"] if item["package"] == name]


def auditors() -> list[dict]:
    ledger = load_ledger()
    return [{"name": name, **values} for name, values in ledger["auditors"].items()]


def challenge(attestation_id: int, evidence_uri: str) -> dict:
    ledger = load_ledger()
    att = next(item for item in ledger["attestations"] if item["id"] == attestation_id)
    att["status"] = "Challenged"
    item = {
        "id": len(ledger["challenges"]) + 1,
        "attestation_id": attestation_id,
        "challenger": "demo-arbiter",
        "bond": "0.01 ETH",
        "evidence_uri": evidence_uri,
        "resolved": False,
        "created_at": now_iso(),
    }
    ledger["challenges"].append(item)
    save_ledger(ledger)
    return item


def resolve_challenge(challenge_id: int, upheld: bool) -> dict:
    ledger = load_ledger()
    challenge_item = next(item for item in ledger["challenges"] if item["id"] == challenge_id)
    att = next(item for item in ledger["attestations"] if item["id"] == challenge_item["attestation_id"])
    challenge_item["resolved"] = True
    challenge_item["upheld"] = upheld
    att["status"] = "Upheld" if upheld else "Overturned"
    auditor = ledger["auditors"][att["auditor"]]
    if upheld:
        auditor["reputation"] = max(0, auditor["reputation"] - 10)
        auditor["challenges_lost"] += 1
    else:
        auditor["reputation"] += 2
        auditor["challenges_won"] += 1
    save_ledger(ledger)
    return challenge_item

