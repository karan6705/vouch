# The Idea

Vouch is an agentic auditing system for open-source packages. It checks npm package updates before developers install them, explains the risky code it found, and anchors the verdict on Hyperledger Besu so the record cannot quietly change.

# Problem and Real-World Impact

Modern apps depend on hundreds of open-source packages. Attackers now target that supply chain because one trusted package update can reach thousands of projects. Lockfile hashes only prove that developers received the same bytes the registry served. Signatures prove who published the bytes, but a hijacked maintainer account can still publish malicious code. Closed scanners ask teams to trust a private verdict. Human review does not scale.

Vouch helps developers, startups, maintainers and security teams answer a practical question: can this exact package version be trusted today?

# Feasibility

The MVP focuses on npm. It statically fetches package tarballs, compares a version with the previous version, runs deterministic detectors, and sends suspicious cases to an audit agent. The demo includes a CLI, GitHub Action, FastAPI backend, dashboard, fixture registry flow, reports, attestations, challenges and an offline mode with recorded mock agent responses.

# Novelty

Vouch binds verdicts to exact tarball integrity hashes, not package names. A safe verdict can never silently carry over to different bytes. Every verdict includes file and line evidence. The agent reviews diffs first because supply-chain attacks usually hide in updates. It also treats package text as adversarial, so prompt injection aimed at the AI reviewer becomes a high-risk signal.

# Architecture

The audit agent fetches and verifies a package, creates a diff, runs detectors, investigates flagged code with tools, validates evidence, and writes a canonical JSON report. The report hash, verdict, risk score and URI are attested by an auditor on Hyperledger Besu. The CLI and GitHub Action check a project lockfile against those attestations. The dashboard shows the live audit feed, package evidence, review queue, auditor leaderboard, lockfile checks and challenge flow.

# Revenue Model

Vouch is open core. The CLI, GitHub Action and public lookups are free. Vouch Cloud sells private registry scanning, organization policies, dashboards and alerts per repository per month. A compliance tier exports SBOM and attestation evidence packs. An auditor marketplace lets companies post bounties for critical dependency reviews, with Vouch taking a platform fee.

