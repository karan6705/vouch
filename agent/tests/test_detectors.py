from pathlib import Path

from vouch_agent.detectors import run_detectors
from vouch_agent.fetch import extract_tarball_safely
import io
import tarfile
import pytest


def test_detector_finds_postinstall_and_prompt_injection() -> None:
    root = Path("fixtures/packages/color-tones/2.3.1")
    findings = run_detectors(root, Path("fixtures/packages/color-tones/2.3.0"))
    rules = {finding.rule for finding in findings}
    assert "lifecycle-script" in rules
    assert "prompt-injection" in rules
    assert "encoded-string" in rules


def test_clean_fixture_has_no_medium_risk_findings() -> None:
    root = Path("fixtures/packages/left-padder/1.0.1")
    findings = run_detectors(root, Path("fixtures/packages/left-padder/1.0.0"))
    assert not [finding for finding in findings if finding.severity in {"medium", "high", "critical"}]


def test_safe_extract_rejects_path_traversal(tmp_path) -> None:
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        info = tarfile.TarInfo("../evil.txt")
        data = b"nope"
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    with pytest.raises(ValueError):
        extract_tarball_safely(buffer.getvalue(), tmp_path)

