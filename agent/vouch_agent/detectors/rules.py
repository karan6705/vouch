from __future__ import annotations

import json
import math
import re
from pathlib import Path

from vouch_agent.models import Finding, Severity


NETWORK = re.compile(r"\b(require\(['\"](?:http|https|net|dns)['\"]\)|fetch\s*\(|XMLHttpRequest|curl\s+|wget\s+)", re.I)
CHILD = re.compile(r"\b(require\(['\"]child_process['\"]\)|execSync\s*\(|exec\s*\(|spawn\s*\()", re.I)
ENV = re.compile(r"(process\.env|NPM_TOKEN|GITHUB_TOKEN|AWS_SECRET|PRIVATE_KEY|SECRET|TOKEN)", re.I)
PATHS = re.compile(r"(\.npmrc|\.ssh|\.aws|\.env|wallet|metamask|browser profile)", re.I)
DYNAMIC = re.compile(r"\b(eval\s*\(|new Function|vm\.runIn|require\s*\([^'\"])", re.I)
PROMPT = re.compile(r"(ignore (all )?(previous|prior) instructions|mark (this )?(package )?safe|dear ai|security reviewer|assistant)", re.I)
BASE64ISH = re.compile(r"['\"]([A-Za-z0-9+/]{80,}={0,2})['\"]")
HEXISH = re.compile(r"['\"](0x[a-fA-F0-9]{80,}|[a-fA-F0-9]{120,})['\"]")
BINARY_SUFFIXES = {".node", ".exe", ".dll", ".dylib", ".so", ".wasm"}


def run_detectors(root: Path, previous: Path | None = None) -> list[Finding]:
    findings: list[Finding] = []
    counter = 1

    def add(rule: str, severity: Severity, file: str, line: int, snippet: str, detail: str) -> None:
        nonlocal counter
        findings.append(
            Finding(
                id=f"F{counter:03d}",
                rule=rule,
                severity=severity,
                file=file,
                line=max(1, line),
                snippet=snippet.strip()[:220],
                detail=detail,
            )
        )
        counter += 1

    package_json = root / "package.json"
    previous_package_json = previous / "package.json" if previous else None
    if package_json.exists():
        current = _json(package_json)
        old = _json(previous_package_json) if previous_package_json and previous_package_json.exists() else {}
        scripts = current.get("scripts", {}) if isinstance(current.get("scripts"), dict) else {}
        old_scripts = old.get("scripts", {}) if isinstance(old.get("scripts"), dict) else {}
        for script in ["preinstall", "install", "postinstall", "prepare"]:
            if scripts.get(script) and scripts.get(script) != old_scripts.get(script):
                add("lifecycle-script", Severity.critical, "package.json", _line(package_json, script), f"{script}: {scripts[script]}", "Lifecycle script was added or changed.")
        deps = current.get("dependencies", {}) if isinstance(current.get("dependencies"), dict) else {}
        old_deps = old.get("dependencies", {}) if isinstance(old.get("dependencies"), dict) else {}
        for dep in sorted(set(deps) - set(old_deps)):
            add("new-dependency", Severity.medium, "package.json", _line(package_json, dep), dep, "New runtime dependency was added.")
        if current.get("maintainer") and old.get("maintainer") and current.get("maintainer") != old.get("maintainer"):
            add("maintainer-change", Severity.medium, "package.json", _line(package_json, "maintainer"), str(current.get("maintainer")), "Maintainer changed since the previous version.")

    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        rel = str(path.relative_to(root))
        if path.suffix.lower() in BINARY_SUFFIXES:
            add("unexpected-binary", Severity.high, rel, 1, path.name, "Binary or unexpected compiled artifact is present.")
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for line_no, line in enumerate(text.splitlines(), start=1):
            _match(add, "network-access", NETWORK, Severity.high, rel, line_no, line, "Network access pattern found.")
            _match(add, "child-process", CHILD, Severity.high, rel, line_no, line, "Child process usage found.")
            _match(add, "env-access", ENV, Severity.high, rel, line_no, line, "Sensitive environment access pattern found.")
            _match(add, "sensitive-path", PATHS, Severity.high, rel, line_no, line, "Sensitive local path reference found.")
            _match(add, "dynamic-code", DYNAMIC, Severity.high, rel, line_no, line, "Dynamic code execution pattern found.")
            _match(add, "prompt-injection", PROMPT, Severity.high, rel, line_no, line, "Prompt injection aimed at AI or human reviewers found.")
            if len(line) > 500:
                add("long-line", Severity.medium, rel, line_no, line[:220], "Very long line may indicate packed or obfuscated code.")
            for literal in BASE64ISH.findall(line) + HEXISH.findall(line):
                if _entropy(literal) > 4.2:
                    add("encoded-string", Severity.high, rel, line_no, literal[:220], "High-entropy encoded string found.")
    return findings


def _match(add, rule: str, regex: re.Pattern[str], severity: Severity, file: str, line_no: int, line: str, detail: str) -> None:
    if regex.search(line):
        add(rule, severity, file, line_no, line, detail)


def _json(path: Path | None) -> dict:
    if not path:
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _line(path: Path, needle: str) -> int:
    for index, line in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), start=1):
        if needle in line:
            return index
    return 1


def _entropy(value: str) -> float:
    if not value:
        return 0
    counts = {char: value.count(char) for char in set(value)}
    return -sum((count / len(value)) * math.log2(count / len(value)) for count in counts.values())

