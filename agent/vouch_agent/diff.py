from __future__ import annotations

import difflib
from pathlib import Path


TEXT_SUFFIXES = {
    ".js",
    ".mjs",
    ".cjs",
    ".json",
    ".ts",
    ".tsx",
    ".jsx",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
}


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""


def list_files(root: Path) -> list[Path]:
    return sorted([p for p in root.rglob("*") if p.is_file()])


def relative_files(root: Path) -> dict[str, Path]:
    return {str(p.relative_to(root)): p for p in list_files(root)}


def unified_diff(previous: Path | None, current: Path) -> dict[str, str]:
    current_files = relative_files(current)
    previous_files = relative_files(previous) if previous and previous.exists() else {}
    output: dict[str, str] = {}
    for name in sorted(set(current_files) | set(previous_files)):
        old = read_text(previous_files[name]).splitlines(keepends=True) if name in previous_files else []
        new = read_text(current_files[name]).splitlines(keepends=True) if name in current_files else []
        if old == new:
            continue
        output[name] = "".join(
            difflib.unified_diff(old, new, fromfile=f"previous/{name}", tofile=f"current/{name}")
        )
    return output

