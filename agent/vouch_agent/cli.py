from __future__ import annotations

import json
from pathlib import Path

import typer
from rich.console import Console
from rich.table import Table

from .check import check_lockfile
from .config import REPO_ROOT
from .demo import seed_demo
from .fetch import parse_spec
from .ledger import attest, attestations_for_integrity, auditors, challenge, resolve_challenge
from .report import audit_package, get_report, hash_report

app = typer.Typer(no_args_is_help=True)
console = Console()


@app.command()
def audit(spec: str) -> None:
    """Run a static audit and write an attestation."""
    name, version = parse_spec(spec)
    report, digest = audit_package(name, version)
    att = attest(report.integrity, name, version, report.verdict, report.risk_score, digest, f"/reports/{digest}")
    console.print(f"[bold]{name}@{version}[/bold] -> {report.verdict.value} ({report.risk_score}/100)")
    console.print(report.summary)
    console.print(f"Report: {digest}")
    console.print(f"Tx: {att['tx_hash']} block {att['block_number']}")


@app.command()
def check(lockfile: Path, policy: Path | None = None) -> None:
    """Check a package-lock.json file against Vouch attestations."""
    rows, failed = check_lockfile(lockfile)
    table = Table(title=f"Vouch check: {lockfile}")
    for column in ["Package", "Version", "Verdict", "Score", "Auditors", "Status"]:
        table.add_column(column)
    for row in rows:
        table.add_row(row["package"], row["version"], row["verdict"], "" if row["score"] is None else str(row["score"]), str(row["auditors"]), row["status"])
    console.print(table)
    raise typer.Exit(1 if failed else 0)


@app.command()
def verify(integrity: str) -> None:
    """Show attestations for an exact npm integrity hash."""
    rows = attestations_for_integrity(integrity)
    if not rows:
        console.print("No attestations found.")
        raise typer.Exit(1)
    for row in rows:
        status = "unknown"
        try:
            report = get_report(row["report_hash"])
            status = "match" if hash_report(__import__("vouch_agent.models", fromlist=["AuditReport"]).AuditReport(**report)) == row["report_hash"] else "mismatch"
        except Exception:
            status = "report unavailable"
        console.print(f"#{row['id']} {row['package']}@{row['version']} {row['verdict']} score={row['risk_score']} auditor={row['auditor']} report={status}")


@app.command()
def watch() -> None:
    """Start a minimal watcher placeholder for the demo."""
    console.print("Watcher ready. For the demo, run `vouch audit color-tones@2.3.1` after publishing a new fixture.")


@app.command()
def seed() -> None:
    """Seed fixture reports, attestations and lockfiles."""
    seed_demo(REPO_ROOT)
    console.print("Seeded demo data.")


@app.command("auditors")
def show_auditors() -> None:
    table = Table(title="Auditors")
    for column in ["Name", "Stake", "Reputation", "Attestations"]:
        table.add_column(column)
    for row in auditors():
        table.add_row(row["name"], row["stake"], str(row["reputation"]), str(row["attestations"]))
    console.print(table)


@app.command("challenge")
def create_challenge(attestation_id: int, evidence_uri: str = "demo://wrong-safe-verdict") -> None:
    item = challenge(attestation_id, evidence_uri)
    console.print(json.dumps(item, indent=2))


@app.command("resolve")
def resolve(challenge_id: int, upheld: bool = True) -> None:
    item = resolve_challenge(challenge_id, upheld)
    console.print(json.dumps(item, indent=2))

