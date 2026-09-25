import { Badge, Card, PageHeader } from "@/components/ui";
import { getDemo } from "@/lib/api";

export default async function ReviewPage() {
  const demo = await getDemo();
  const queue = demo.reports.filter((item) => item.report.verdict === "Suspicious");

  return (
    <>
      <PageHeader title="Review queue" eyebrow="Human review for borderline updates" />
      <div className="grid gap-5">
        {queue.map(({ hash, report }) => (
          <Card key={hash} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{report.package}@{report.version}</h2>
                <p className="mt-2 text-slate-400">{report.summary}</p>
              </div>
              <Badge value={report.verdict} />
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {report.findings.map((finding) => (
                <div key={finding.id} className="rounded-md border border-slate-800 bg-slate-950 p-4">
                  <p className="font-semibold">{finding.rule}</p>
                  <p className="mt-2 text-sm text-slate-400">{finding.file}:{finding.line}</p>
                  <p className="mt-2 text-sm text-slate-300">{finding.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Approve Safe</button>
              <button className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">Keep Suspicious</button>
            </div>
          </Card>
        ))}
        {!queue.length && <Card className="p-8 text-slate-300">No borderline audits are waiting right now.</Card>}
      </div>
    </>
  );
}

