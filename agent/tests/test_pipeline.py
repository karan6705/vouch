from pathlib import Path

from vouch_agent.check import check_lockfile
from vouch_agent.demo import seed_demo
from vouch_agent.report import audit_package


def test_fixture_verdicts() -> None:
    safe, _ = audit_package("left-padder", "1.0.1")
    bad, _ = audit_package("color-tones", "2.3.1")
    borderline, _ = audit_package("date-fmt-lite", "0.5.0")
    assert safe.verdict.value == "Safe"
    assert bad.verdict.value == "Malicious"
    assert bad.risk_score >= 85
    assert borderline.verdict.value == "Suspicious"


def test_lockfile_check_blocks_compromised() -> None:
    seed_demo(Path("."))
    clean_rows, clean_failed = check_lockfile(Path("fixtures/demo-app/package-lock.clean.json"))
    bad_rows, bad_failed = check_lockfile(Path("fixtures/demo-app/package-lock.compromised.json"))
    assert clean_rows
    assert not clean_failed
    assert bad_failed

