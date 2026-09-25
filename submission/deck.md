---
marp: true
theme: default
paginate: true
---

# Vouch

Agentic auditing for open-source packages, with verdicts anchored on Hyperledger Besu.

---

# The Problem

Your app trusts code written by strangers and updated automatically.

Supply-chain attacks can arrive as normal package updates.

---

# Why Existing Checks Miss It

Hashes prove bytes stayed the same.

Signatures prove who published them.

Neither proves the bytes are safe.

---

# What Vouch Does

1. Audits package updates.
2. Explains risky code with file and line evidence.
3. Anchors verdicts to exact package bytes.

---

# Live Demo

1. Check a clean app.
2. Publish a compromised package.
3. Watch the agent audit it.
4. Block the app in CI.
5. Verify the report hash.
6. Challenge a wrong verdict.

---

# Architecture

Package registry to audit agent to report store to Besu attestation registry.

CLI, GitHub Action and dashboard read the shared record.

---

# Agent Reasoning

Diff first.

Run deterministic detectors.

Investigate flagged files.

Reject evidence that does not point to real lines.

Treat prompt injection as hostile package content.

---

# On-Chain Design

Verdicts are keyed by npm integrity hash.

Auditors stake before attesting.

Bad attestations can be challenged and slashed.

---

# Novelty

Exact-byte verdicts.

Machine-checkable evidence.

Prompt-injection-aware agent.

Public accountability for auditors.

---

# Users and Impact

Developers.

Startups.

Maintainers.

Security teams that need SBOM evidence and supply-chain controls.

---

# Revenue Model

Open core.

Team dashboards and alerts.

Compliance evidence packs.

Auditor marketplace.

Security vendor data API.

---

# Roadmap

Public testnet deployment.

IPFS reports.

PyPI support.

DAO arbitration.

Team: Karan Raval.

