# Vouch

Vouch audits npm package updates before developers install them. It explains risky code with file and line evidence, writes canonical reports, and records verdicts by exact npm integrity hash.

The hackathon demo is offline-first. It uses safe local fixtures, a deterministic mock agent, and a local attestation ledger. The Solidity contract for the Besu path is included in `contracts/src/VouchRegistry.sol`.

## Quickstart

```bash
make setup
make demo-offline
```

Start the API and dashboard:

```bash
make api
make web
```

Open `http://127.0.0.1:3000`.

## CLI Demo

```bash
vouch seed
vouch check fixtures/demo-app/package-lock.clean.json
vouch audit color-tones@2.3.1
vouch check fixtures/demo-app/package-lock.compromised.json
```

The compromised check exits non-zero because `color-tones@2.3.1` is attested as Malicious.

## What Vouch Detects

- Changed lifecycle scripts.
- Network access patterns.
- Child process usage.
- Sensitive environment and path access.
- Dynamic code execution.
- Encoded or high-entropy strings.
- Prompt injection aimed at AI reviewers.
- Maintainer and dependency changes.

## Real Package Support

`vouch audit express@4.21.2` fetches metadata and tarballs from the public npm registry when internet is available. Offline tests and demos use fixture packages only.

## Limits

Vouch does not execute package code. It does not catch runtime-only behavior or attacks hidden in native binaries without readable source. Those are roadmap items for sandboxing and binary analysis.

## Project Structure

- `agent/vouch_agent`: audit engine, detectors, reports, CLI and local ledger.
- `api`: FastAPI backend.
- `web`: Next.js dashboard.
- `contracts`: Solidity attestation registry.
- `fixtures`: safe demo packages and lockfiles.
- `submission`: abstract, deck source, demo script and judge Q&A.

## Verification

```bash
make test
make e2e
make abstract-check
make build
```

