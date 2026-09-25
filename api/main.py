from __future__ import annotations

import json
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from vouch_agent.check import check_lockfile
from vouch_agent.config import REPO_ROOT, data_dir
from vouch_agent.demo import seed_demo
from vouch_agent.fetch import parse_spec
from vouch_agent.ledger import attest, attestations_for_integrity, attestations_for_package, auditors, challenge, load_ledger, resolve_challenge
from vouch_agent.report import audit_package, get_report


app = FastAPI(title="Vouch API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuditRequest(BaseModel):
    package: str
    version: str | None = None


class ReviewRequest(BaseModel):
    decision: str
    note: str = ""


class ChallengeRequest(BaseModel):
    attestation_id: int
    evidence_uri: str = "demo://wrong-safe-verdict"


class ResolveRequest(BaseModel):
    upheld: bool = True


class CheckRequest(BaseModel):
    lockfile: dict


@app.on_event("startup")
def startup() -> None:
    seed_demo(REPO_ROOT)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "vouch-api"}


@app.post("/audits")
def start_audit(request: AuditRequest) -> dict:
    if request.version:
        name, version = request.package, request.version
    else:
        name, version = parse_spec(request.package)
    report, digest = audit_package(name, version)
    att = attest(report.integrity, name, version, report.verdict, report.risk_score, digest, f"/reports/{digest}")
    return {"id": digest, "status": "complete", "report": report.model_dump(mode="json"), "report_hash": digest, "attestation": att}


@app.get("/audits/{audit_id}")
def audit_status(audit_id: str) -> dict:
    try:
        return {"id": audit_id, "status": "complete", "report": get_report(audit_id)}
    except FileNotFoundError as exc:
        raise HTTPException(404, "Audit not found") from exc


@app.get("/events")
def events() -> StreamingResponse:
    def stream():
        ledger = load_ledger()
        for item in ledger["attestations"][-8:]:
            yield f"data: {json.dumps({'type': 'attestation', 'data': item})}\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")


@app.get("/packages/{name}")
def package(name: str) -> dict:
    rows = attestations_for_package(name)
    return {"name": name, "versions": rows}


@app.get("/reports/{digest}")
def report(digest: str) -> JSONResponse:
    try:
        return JSONResponse(get_report(digest))
    except FileNotFoundError as exc:
        raise HTTPException(404, "Report not found") from exc


@app.get("/attestations/{integrity:path}")
def attestations(integrity: str) -> dict:
    return {"integrity": integrity, "attestations": attestations_for_integrity(integrity)}


@app.get("/review-queue")
def review_queue() -> dict:
    queue = []
    for report_file in sorted((data_dir() / "reports").glob("*.json")):
        report = json.loads(report_file.read_text(encoding="utf-8"))
        if report["verdict"] == "Suspicious":
            queue.append({"audit_id": report_file.stem, "report": report})
    return {"items": queue}


@app.post("/review/{audit_id}")
def review(audit_id: str, request: ReviewRequest) -> dict:
    path = data_dir() / "reports" / f"{audit_id}.json"
    if not path.exists():
        raise HTTPException(404, "Audit not found")
    report = json.loads(path.read_text(encoding="utf-8"))
    report["reviewer_decision"] = request.decision
    report["reviewer_note"] = request.note
    path.write_text(json.dumps(report, sort_keys=True, separators=(",", ":")), encoding="utf-8")
    return {"ok": True, "audit_id": audit_id, "decision": request.decision}


@app.post("/check")
def check(request: CheckRequest) -> dict:
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as handle:
        json.dump(request.lockfile, handle)
        temp = Path(handle.name)
    rows, failed = check_lockfile(temp)
    temp.unlink(missing_ok=True)
    return {"failed": failed, "rows": rows}


@app.post("/check-upload")
async def check_upload(file: UploadFile = File(...)) -> dict:
    content = await file.read()
    with tempfile.NamedTemporaryFile("wb", suffix=".json", delete=False) as handle:
        handle.write(content)
        temp = Path(handle.name)
    rows, failed = check_lockfile(temp)
    temp.unlink(missing_ok=True)
    return {"failed": failed, "rows": rows}


@app.get("/auditors")
def auditor_leaderboard() -> dict:
    return {"items": auditors()}


@app.post("/challenges")
def create_challenge(request: ChallengeRequest) -> dict:
    return challenge(request.attestation_id, request.evidence_uri)


@app.post("/challenges/{challenge_id}/resolve")
def resolve(challenge_id: int, request: ResolveRequest) -> dict:
    return resolve_challenge(challenge_id, request.upheld)


@app.get("/demo")
def demo() -> dict:
    ledger = load_ledger()
    reports = []
    for report_file in sorted((data_dir() / "reports").glob("*.json"))[-12:]:
        reports.append({"hash": report_file.stem, "report": json.loads(report_file.read_text(encoding="utf-8"))})
    return {"ledger": ledger, "reports": reports}


@app.get("/demo-lockfile/{kind}")
def demo_lockfile(kind: str) -> dict:
    name = "package-lock.compromised.json" if kind == "compromised" else "package-lock.clean.json"
    path = REPO_ROOT / "fixtures" / "demo-app" / name
    if not path.exists():
        seed_demo(REPO_ROOT)
    return json.loads(path.read_text(encoding="utf-8"))
