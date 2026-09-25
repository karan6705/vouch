from __future__ import annotations

import base64
import hashlib
import io
import json
import os
import shutil
import tarfile
import tempfile
from dataclasses import dataclass
from pathlib import Path
from urllib.request import urlopen

import httpx

from .config import fixture_root


@dataclass
class PackageSource:
    name: str
    version: str
    integrity: str
    previous_version: str | None
    root: Path
    temp_dir: tempfile.TemporaryDirectory[str] | None = None


def package_slug(name: str) -> str:
    return name.replace("/", "__")


def sri_sha512(data: bytes) -> str:
    return "sha512-" + base64.b64encode(hashlib.sha512(data).digest()).decode("ascii")


def parse_spec(spec: str) -> tuple[str, str]:
    if "@" not in spec.strip("@"):
        raise ValueError("Use name@version, for example color-tones@2.3.1")
    if spec.startswith("@"):
        left, version = spec.rsplit("@", 1)
        return left, version
    name, version = spec.rsplit("@", 1)
    return name, version


def local_fixture_versions(name: str) -> list[str]:
    base = fixture_root() / name
    if not base.exists():
        return []
    return sorted([p.name for p in base.iterdir() if p.is_dir()], key=_version_key)


def _version_key(value: str) -> tuple[int, ...]:
    parts = []
    for chunk in value.replace("-", ".").split("."):
        try:
            parts.append(int(chunk))
        except ValueError:
            parts.append(0)
    return tuple(parts)


def previous_fixture_version(name: str, version: str) -> str | None:
    versions = local_fixture_versions(name)
    if version not in versions:
        return None
    index = versions.index(version)
    return versions[index - 1] if index > 0 else None


def fixture_archive_bytes(path: Path) -> bytes:
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w:gz") as tar:
        for file_path in sorted(path.rglob("*")):
            if not file_path.is_file():
                continue
            arcname = str(Path("package") / file_path.relative_to(path))
            info = tar.gettarinfo(str(file_path), arcname)
            info.uid = info.gid = 0
            info.uname = info.gname = ""
            info.mtime = 0
            with file_path.open("rb") as handle:
                tar.addfile(info, handle)
    return buffer.getvalue()


def load_package(name: str, version: str) -> PackageSource:
    local = fixture_root() / name / version
    if local.exists():
        integrity = sri_sha512(fixture_archive_bytes(local))
        return PackageSource(
            name=name,
            version=version,
            integrity=integrity,
            previous_version=previous_fixture_version(name, version),
            root=local,
        )
    return fetch_npm_package(name, version)


def fetch_npm_package(name: str, version: str) -> PackageSource:
    registry = os.getenv("REGISTRY_URL", "https://registry.npmjs.org").rstrip("/")
    encoded = name.replace("/", "%2f")
    meta_url = f"{registry}/{encoded}"
    with httpx.Client(timeout=20, follow_redirects=True) as client:
        meta = client.get(meta_url)
        meta.raise_for_status()
        package_meta = meta.json()
        versions = package_meta.get("versions", {})
        if version not in versions:
            raise ValueError(f"{name}@{version} was not found in {registry}")
        info = versions[version]
        dist = info["dist"]
        tarball_url = dist["tarball"]
        tarball = client.get(tarball_url)
        tarball.raise_for_status()
        data = tarball.content
    integrity = dist.get("integrity") or sri_sha512(data)
    verify_integrity(data, integrity)
    temp = tempfile.TemporaryDirectory(prefix="vouch-npm-")
    extract_tarball_safely(data, Path(temp.name))
    root = Path(temp.name) / "package"
    previous = previous_npm_version(package_meta, version)
    return PackageSource(name, version, integrity, previous, root, temp)


def previous_npm_version(meta: dict, version: str) -> str | None:
    versions = sorted(meta.get("versions", {}).keys(), key=_version_key)
    if version not in versions:
        return None
    index = versions.index(version)
    return versions[index - 1] if index > 0 else None


def verify_integrity(data: bytes, integrity: str) -> None:
    algo, encoded = integrity.split("-", 1)
    digest = hashlib.new(algo, data).digest()
    actual = base64.b64encode(digest).decode("ascii")
    if actual != encoded:
        raise ValueError("Tarball integrity verification failed")


def extract_tarball_safely(data: bytes, destination: Path, max_bytes: int = 20_000_000) -> None:
    total = 0
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:*") as tar:
        for member in tar.getmembers():
            target = destination / member.name
            resolved = target.resolve()
            if not str(resolved).startswith(str(destination.resolve())):
                raise ValueError(f"Unsafe tar path rejected: {member.name}")
            if member.isfile():
                total += member.size
                if total > max_bytes:
                    raise ValueError("Package exceeds extraction size limit")
            tar.extract(member, destination)


def copy_tree_to_temp(path: Path) -> tempfile.TemporaryDirectory[str]:
    temp = tempfile.TemporaryDirectory(prefix="vouch-copy-")
    shutil.copytree(path, Path(temp.name) / "package")
    return temp

