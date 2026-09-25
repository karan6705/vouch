import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui";
import { getDemo } from "@/lib/api";
import { CheckCircle2, FileCode2, Hash, ShieldCheck, Siren } from "lucide-react";

export default async function PackagesPage() {
  const demo = await getDemo();
  const reports = demo.reports.slice().reverse();
  const active = reports.find((item) => item.report.package === "color-tones" && item.report.verdict === "Malicious") || reports[0];
  const attestation = demo.ledger.attestations.find((item) => item.report_hash === active?.hash) || demo.ledger.attestations[0];
  const packageVersions = demo.ledger.attestations.filter((item) => item.package === active?.report.package).slice().reverse();

  return (
    <>
      <PageHeader title="Package evidence" eyebrow="Exact-byte report verification" />
      {active ? (
        <div className="grid gap-5 xl:grid-cols-[1fr_25rem]">
          <div className="grid gap-5">
            <Card className="overflow-hidden">
              <div className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.18),transparent_24rem)] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl font-semibold text-white">{active.report.package}@{active.report.version}</h2>
                      <Badge value={active.report.verdict} />
                    </div>
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{active.report.summary}</p>
                  </div>
                  <div className="rounded-md border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-200">Risk score</p>
                    <p className="mt-1 text-4xl font-bold text-rose-200">{active.report.risk_score}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <MiniStat icon={<FileCode2 size={18} />} label="Findings" value={String(active.report.findings.length)} />
                  <MiniStat icon={<Hash size={18} />} label="Report hash" value={active.hash.slice(0, 12)} mono />
                  <MiniStat icon={<ShieldCheck size={18} />} label="Confidence" value={active.report.confidence} />
                </div>
              </div>
              <div className="p-5">
                <SectionTitle kicker="Cited evidence" title="Every claim points to package contents" />
                <div className="grid gap-3">
                  {active.report.findings.map((finding) => (
                    <div key={finding.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="mono text-xs text-blue-300">{finding.id}</span>
                        <Badge value={finding.severity[0].toUpperCase() + finding.severity.slice(1)} />
                        <span className="text-sm font-semibold text-slate-200">{finding.rule}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{finding.detail}</p>
                      <pre className="mono mt-3 overflow-x-auto rounded bg-slate-950 p-3 text-xs leading-5 text-slate-300">{finding.file}:{finding.line}  {finding.snippet}</pre>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-5">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Siren className="text-blue-300" />
                <h2 className="text-xl font-semibold">Attestation</h2>
              </div>
              {attestation && (
                <dl className="mt-5 grid gap-4 text-sm">
                  <Row label="Auditor" value={attestation.auditor} />
                  <Row label="Status" value={attestation.status} />
                  <Row label="Block" value={String(attestation.block_number)} />
                  <Row label="Report hash" value={attestation.report_hash} mono />
                  <Row label="Tx hash" value={attestation.tx_hash} mono />
                </dl>
              )}
              <div className="mt-5 flex items-start gap-3 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                The report hash matches the ledger entry for this exact integrity string.
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle kicker="Timeline" title="Known versions" />
              <div className="grid gap-3">
                {packageVersions.map((item) => (
                  <div key={`${item.id}-${item.verdict}`} className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{item.package}@{item.version}</span>
                      <Badge value={item.verdict} />
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Score {item.risk_score}, auditor {item.auditor}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-8 text-slate-300">No package reports are available yet.</Card>
      )}
    </>
  );
}

function MiniStat({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-blue-200">{icon}<span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span></div>
      <p className={`${mono ? "mono" : ""} mt-2 text-xl font-semibold text-white`}>{value}</p>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className={`${mono ? "mono break-all text-xs" : ""} mt-1 text-slate-200`}>{value}</dd>
    </div>
  );
}

