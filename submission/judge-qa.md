# Judge Q&A

## Why blockchain and not a database?

Multiple auditors and consumers need a shared record that no single company can quietly rewrite. Reports stay off-chain. Only hashes, verdicts and pointers go on-chain.

## What does it cost per attestation?

The local demo uses Besu-style development accounts and no real tokens. On a public testnet or L2, each attestation stores small fixed-size fields plus a URI, so costs are low compared with putting reports on-chain.

## What about false positives?

Suspicious but uncertain cases go to the review queue. The human decision and note become part of the report.

## What if the LLM is fooled?

Package contents are treated as untrusted data. Prompt injection is detected as a finding. Agent evidence must cite real files and line ranges.

## Who is the arbiter?

The MVP uses one demo arbiter for challenges. The roadmap moves this to DAO arbitration with multiple reviewers.

## How do auditors get paid?

Auditors can earn from bounties and team plan review requests. Stake and reputation decide priority and trust.

## How does this scale to npm?

Vouch reviews diffs first and skips LLM calls when deterministic detectors find no meaningful risk. Popular packages can be watched continuously.

## What stops colluding auditors?

Consumers can require multiple distinct auditors. Challenges and slashing make public mistakes costly.

## How is this different from Socket, Snyk or Sigstore?

Vouch combines exact-byte attestations, cited agent evidence, public challengeable verdicts, and an open-source CLI.

