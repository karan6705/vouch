# Threat Model

## In Scope

- Malicious npm package updates.
- Lifecycle scripts that run during install.
- Obfuscated code and encoded strings.
- Credential access patterns.
- Prompt injection aimed at AI reviewers.
- Incorrect auditor attestations and challenge flow.

## Out of Scope

- Runtime-only behavior that does not appear in package contents.
- Native binary backdoors that require reverse engineering.
- Mainnet economics and full DAO governance.

## Controls

- Package contents are treated as untrusted data.
- Audits are static only. Vouch never runs package code.
- Evidence must point to real files and line numbers.
- Reports are hashed before attestation.
- Challenges can overturn bad attestations and reduce auditor reputation.

