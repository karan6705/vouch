# Progress

## M0. Scaffold and Abstract

Status: complete.

What works:

- Repo layout is present.
- Makefile, environment example, docs, action, fixtures, API, CLI and dashboard skeletons exist.
- Round 1 abstract is written and checked to stay under 500 words.
- Offline-first local ledger decision is documented.

Commands:

- `make setup`
- `make test`
- `make abstract-check`
- `make demo-offline`

## M1 to M7. Demo MVP

Status: complete for offline MVP.

What works:

- Static fixture auditing, deterministic detectors, mock agent verdicts, canonical reports, local attestations, CLI checks, API routes and dashboard pages are implemented for the demo path.
- `make test` passes.
- `make abstract-check` passes with 374 words.
- `make demo-offline` seeds demo data and prints the dashboard URL.
- `make e2e` proves the clean lockfile passes and the compromised lockfile blocks.
- `make build` builds the Next.js dashboard.

Stubbed:

- Public testnet deployment and Foundry execution are not run locally because Foundry is not installed in this environment.
- Real LLM recording is replaced by a deterministic mock provider for offline reliability.
- Verdaccio and Besu containers are represented by the compose/demo structure, but the default reliable path uses local fixtures and a JSON attestation ledger.
