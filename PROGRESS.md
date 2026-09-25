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
- Submission source files are present.
- `submission/deck.md` exports successfully to `submission/deck.pptx` and `submission/deck.pdf`.
- Submission scan has no placeholder markers or em dashes.

Stubbed:

- Public testnet deployment and Foundry execution are not run locally because Foundry is not installed in this environment.
- Real LLM recording is replaced by a deterministic mock provider for offline reliability.
- Verdaccio and Besu containers are represented by the compose/demo structure, but the default reliable path uses local fixtures and a JSON attestation ledger.

## M9. Submission Materials

Status: complete for the current offline MVP submission packet.

What works:

- `submission/abstract.md` uses the required six headings and is under 500 words.
- `submission/deck.md` has 12 Marp slides and includes problem, incidents, solution, architecture, agent reasoning, Besu design, novelty, judge mapping, revenue model and roadmap.
- `submission/deck.pptx` and `submission/deck.pdf` are generated.
- `submission/demo-video-script.md`, `submission/judge-qa.md` and `submission/team.md` exist.

Remaining gap:

- The deck is a Marp export, not a hand-designed editable artifact-tool deck.
