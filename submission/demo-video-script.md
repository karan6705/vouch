# Demo Video Script

## 0:00 to 0:20, Dashboard

Narration: "This is Vouch. It audits open-source package updates before developers install them."

Show the live feed and auditor leaderboard.

## 0:20 to 0:45, Terminal

Command: `make demo-offline`

Narration: "The demo runs fully offline with fixture packages and a mock agent."

## 0:45 to 1:20, Clean Check

Command: `vouch check fixtures/demo-app/package-lock.clean.json`

Narration: "The clean app passes because every dependency has a Safe attestation."

## 1:20 to 2:00, Malicious Audit

Command: `vouch audit color-tones@2.3.1`

Narration: "The agent detects a new postinstall script, encoded credential collection patterns, and prompt injection aimed at the reviewer."

## 2:00 to 2:25, Blocked Check

Command: `vouch check fixtures/demo-app/package-lock.compromised.json`

Narration: "The same app is blocked when the compromised package version appears in the lockfile."

## 2:25 to 2:45, Verify

Show the package page and click Verify independently.

Narration: "The browser recomputes the report hash and matches it to the attestation."

## 2:45 to 3:00, Challenge

Show the challenge page.

Narration: "Bad auditor verdicts can be challenged, resolved, and reflected in reputation."

