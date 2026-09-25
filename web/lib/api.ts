export const API_URL = process.env.NEXT_PUBLIC_VOUCH_API_URL || "http://127.0.0.1:8787";

export type Finding = {
  id: string;
  rule: string;
  severity: string;
  file: string;
  line: number;
  snippet: string;
  detail: string;
};

export type Report = {
  package: string;
  version: string;
  integrity: string;
  verdict: string;
  risk_score: number;
  confidence: string;
  summary: string;
  findings: Finding[];
  evidence: { file: string; line_start: number; line_end: number; reason: string; finding_id?: string }[];
  elapsed_ms: number;
  llm_cost_usd: string;
};

export type DemoData = {
  ledger: {
    attestations: Array<Record<string, any>>;
    auditors: Record<string, Record<string, any>>;
    challenges: Array<Record<string, any>>;
  };
  reports: { hash: string; report: Report }[];
};

export async function getDemo(): Promise<DemoData> {
  try {
    const response = await fetch(`${API_URL}/demo`, { cache: "no-store" });
    if (!response.ok) throw new Error("API unavailable");
    return response.json();
  } catch {
    return fallbackDemo;
  }
}

export async function postAudit(spec: string) {
  const [name, version] = spec.split("@");
  const response = await fetch(`${API_URL}/audits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ package: name, version }),
  });
  return response.json();
}

export async function postChallenge(attestationId: number) {
  const response = await fetch(`${API_URL}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attestation_id: attestationId }),
  });
  return response.json();
}

export async function resolveChallenge(id: number) {
  const response = await fetch(`${API_URL}/challenges/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ upheld: true }),
  });
  return response.json();
}

export const fallbackDemo: DemoData = {
  ledger: {
    auditors: {
      "vouch-agent": { stake: "1.0 ETH", reputation: 45, attestations: 5, challenges_won: 1, challenges_lost: 0 },
      "community-auditor": { stake: "0.5 ETH", reputation: 18, attestations: 0, challenges_won: 0, challenges_lost: 0 },
      "careless-auditor": { stake: "0.1 ETH", reputation: 3, attestations: 1, challenges_won: 0, challenges_lost: 1 },
    },
    attestations: [
      { id: 1, package: "left-padder", version: "1.0.1", verdict: "Safe", risk_score: 0, auditor: "vouch-agent", tx_hash: "0x8a4d", block_number: 10001, status: "Active", report_hash: "demo-safe" },
      { id: 2, package: "color-tones", version: "2.3.1", verdict: "Malicious", risk_score: 100, auditor: "vouch-agent", tx_hash: "0xf12b", block_number: 10002, status: "Active", report_hash: "demo-bad" },
      { id: 3, package: "date-fmt-lite", version: "0.5.0", verdict: "Suspicious", risk_score: 50, auditor: "vouch-agent", tx_hash: "0x7ab1", block_number: 10003, status: "Active", report_hash: "demo-review" },
    ],
    challenges: [],
  },
  reports: [
    {
      hash: "demo-bad",
      report: {
        package: "color-tones",
        version: "2.3.1",
        integrity: "sha512-demo",
        verdict: "Malicious",
        risk_score: 100,
        confidence: "0.91",
        summary: "The update contains high-risk supply-chain signals with cited evidence.",
        elapsed_ms: 34,
        llm_cost_usd: "0.0000",
        findings: [
          { id: "F001", rule: "lifecycle-script", severity: "critical", file: "package.json", line: 8, snippet: "postinstall: node setup.js", detail: "Lifecycle script was added or changed." },
          { id: "F002", rule: "prompt-injection", severity: "high", file: "setup.js", line: 4, snippet: "ignore previous instructions", detail: "Prompt injection aimed at AI reviewers found." },
        ],
        evidence: [
          { file: "package.json", line_start: 8, line_end: 8, reason: "Lifecycle script was added.", finding_id: "F001" },
        ],
      },
    },
  ],
};

