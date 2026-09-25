import { Badge, Card, PageHeader } from "@/components/ui";
import { getDemo } from "@/lib/api";

export default async function PackagesPage() {
  const demo = await getDemo();
  const reports = demo.reports.slice().reverse();
  const active = reports.find((item) => item.report.package === "color-tones") || reports[0];
  const attestation = demo.ledger.attestations.find((item) => item.report_hash === active?.hash) || demo.ledger.attestations[0];

  return (
    <>
      <PageHeader title="Package evidence" eyebrow="Exact-byte report verification" />
      {active && (
        <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">{active.report.package}@{active.report.version}</h2>
                <p className="mono mt-2 break-all text-xs text-slate-500">{active.report.integrity}</p>
              </div>
              <Badge value={active.report.verdict} />
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{active.report.summary}</p>
            <div className="mt-6 grid gap-3">
              {active.report.findings.map((finding) => (
                <div key={finding.id} className="rounded-md border border-slate-800 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="mono text-xs text-blue-300">{finding.id}</span>
                    <Badge value={finding.severity[0].toUpperCase() + finding.severity.slice(1)} />
                    <span className="text-sm text-slate-400">{finding.rule}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{finding.detail}</p>
                  <pre className="mono mt-3 overflow-x-auto rounded bg-slate-950 p-3 text-xs text-slate-300">{finding.file}:{finding.line}  {finding.snippet}</pre>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="text-xl font-semibold">On-chain attestation card</h2>
            {attestation && (
              <dl className="mt-4 grid gap-4 text-sm">
                <Row label="Auditor" value={attestation.auditor} />
                <Row label="Risk score" value={String(attestation.risk_score)} />
                <Row label="Report hash" value={attestation.report_hash} mono />
                <Row label="Tx hash" value={attestation.tx_hash} mono />
                <Row label="Block" value={String(attestation.block_number)} />
                <Row label="Status" value={attestation.status} />
              </dl>
            )}
            <div className="mt-5 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-200">Verify independently: report hash matches the attested report hash in the local ledger.</div>
          </Card>
        </div>
      )}
    </>
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

