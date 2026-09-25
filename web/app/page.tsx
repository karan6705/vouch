import { getDemo } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";
import { Clock, Radio, ShieldAlert, Terminal } from "lucide-react";

export default async function Home() {
  const demo = await getDemo();
  const attestations = demo.ledger.attestations.slice().reverse();
  const reports = demo.reports.slice().reverse();
  const malicious = attestations.filter((item) => item.verdict === "Malicious").length;
  const suspicious = attestations.filter((item) => item.verdict === "Suspicious").length;

  return (
    <>
      <PageHeader title="Live audit feed" eyebrow="Agentic supply-chain auditing" />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Attestations" value={String(attestations.length)} />
        <Metric label="Blocked versions" value={String(malicious)} tone="red" />
        <Metric label="Review queue" value={String(suspicious)} tone="amber" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Card>
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <Radio className="text-blue-300" />
              <h2 className="text-2xl font-semibold">Recent agent activity</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {attestations.map((item) => (
              <div key={`${item.id}-${item.tx_hash}`} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold">{item.package}@{item.version}</h3>
                    <Badge value={item.verdict} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Auditor {item.auditor} wrote block {item.block_number} with score {item.risk_score}.</p>
                  <p className="mono mt-2 truncate text-xs text-slate-500">{item.tx_hash}</p>
                </div>
                <div className="text-right text-sm text-slate-400">{item.status}</div>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid gap-5">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-300" />
              <h2 className="text-xl font-semibold">Demo threat</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">`color-tones@2.3.1` adds a postinstall script, encoded exfiltration-looking text and a prompt-injection comment. Vouch blocks it without running package code.</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Terminal className="text-emerald-300" />
              <h2 className="text-xl font-semibold">Commands</h2>
            </div>
            <pre className="mono mt-4 overflow-x-auto rounded-md bg-black/35 p-4 text-xs text-slate-300">vouch check fixtures/demo-app/package-lock.clean.json{"\n"}vouch audit color-tones@2.3.1{"\n"}vouch check fixtures/demo-app/package-lock.compromised.json</pre>
          </Card>
        </div>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {reports.slice(0, 2).map(({ hash, report }) => (
          <Card key={hash} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold">{report.package}@{report.version}</h3>
                <p className="mt-2 text-sm text-slate-400">{report.summary}</p>
              </div>
              <Badge value={report.verdict} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />
              {report.elapsed_ms} ms, ${report.llm_cost_usd}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value, tone = "blue" }: { label: string; value: string; tone?: "blue" | "red" | "amber" }) {
  const color = tone === "red" ? "text-rose-300" : tone === "amber" ? "text-amber-300" : "text-blue-300";
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

