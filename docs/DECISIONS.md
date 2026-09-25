# Decisions

- The demo stores attestations in a local JSON ledger that mirrors the smart contract data model. Foundry is not installed locally, so the Solidity contract is included but not executed by `make demo-offline`.
- The MVP uses a deterministic mock LLM provider by default. It keeps the demo offline and repeatable.
- Fixture packages are audited from local source folders instead of requiring Verdaccio. The package contents remain inert and are never executed.
- Real npm package audits are supported by fetching tarballs from the public npm registry when internet is available.
- The first dashboard build uses API-backed seeded demo data and graceful fallbacks instead of requiring long-running watcher infrastructure.

