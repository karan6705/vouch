import Link from "next/link";
import { getDemo } from "@/lib/api";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { ArrowRight, Bot, CheckCircle2, Clock, FileSearch, GitPullRequestArrow, Radio, ShieldAlert, Terminal, Zap } from "lucide-react";

export default async function Home() {
  const demo = await getDemo();
  const attestations = demo.ledger.attestations.slice().reverse();
  const reports = demo.reports.slice().reverse();
  const malicious = attestations.filter((item) => item.verdict === "Malicious").length;
  const suspicious = attestations.filter((item) => item.verdict === "Suspicious").length;
  const safe = attestations.filter((item) => item.verdict === "Safe").length;
  const latestMalicious = attestations.find((item) => item.verdict === "Malicious");

  return (
    <>
      <section className="mb-6 overflow-hidden rounded-lg border border-blue-100 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_32rem),linear-gradient(135deg,#ffffff,#eff6ff)] p-6 shadow-2xl shadow-blue-100/60 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_25rem] xl:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Autonomous package auditing
            </p>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Stop malicious npm updates before they enter your app.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Vouch scans exact package bytes, cites risky files and lines, then records the verdict so CI, reviewers and auditors can verify the same evidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/autopilot" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500">
                Start Autopilot
                <Bot size={16} />
              </Link>
              <Link href="/check" className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50">
                Check lockfile
                <ArrowRight size={16} />
              </Link>
              <Link href="/packages" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                Inspect evidence
                <FileSearch size={16} />
              </Link>
            </div>
          </div>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-600" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Demo attack</p>
                <h2 className="text-2xl font-semibold text-slate-950">color-tones@2.3.1</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The fixture adds a postinstall hook, encoded suspicious text and a prompt-injection comment. Vouch marks it Malicious without executing it.
            </p>
            {latestMalicious && (
              <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge value={latestMalicious.verdict} />
                  <span className="text-sm font-semibold text-rose-700">Score {latestMalicious.risk_score}</span>
                </div>
                <p className="mono mt-3 truncate text-xs text-rose-700/70">{latestMalicious.tx_hash}</p>
              </div>
            )}
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Safe" value={String(safe)} tone="green" />
        <Metric label="Blocked" value={String(malicious)} tone="red" />
        <Metric label="Review" value={String(suspicious)} tone="amber" />
        <Metric label="Attestations" value={String(attestations.length)} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Card className="p-5">
          <SectionTitle kicker="Demo path" title="Four screens tell the whole story" copy="Start with the lockfile check, inspect the evidence, review the borderline package, then challenge a bad auditor verdict." />
          <div className="grid gap-3 md:grid-cols-2">
            <DemoStep href="/check" icon={<Terminal size={18} />} title="1. CI gate" copy="Run clean and compromised lockfiles." />
            <DemoStep href="/packages" icon={<FileSearch size={18} />} title="2. Evidence" copy="See files, lines, report hash and attestation." />
            <DemoStep href="/review" icon={<GitPullRequestArrow size={18} />} title="3. Human review" copy="Borderline findings sit in a clear queue." />
            <DemoStep href="/challenge" icon={<Zap size={18} />} title="4. Challenge" copy="Resolve a wrong Safe verdict and update reputation." />
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle kicker="Runbook" title="Terminal demo" />
          <pre className="mono overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-100">vouch check fixtures/demo-app/package-lock.clean.json{"\n"}vouch audit color-tones@2.3.1{"\n"}vouch check fixtures/demo-app/package-lock.compromised.json</pre>
          <div className="mt-4 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            Clean passes. Compromised blocks. The fixture package is never executed.
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Card>
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <Radio className="text-blue-600" />
              <h2 className="text-2xl font-semibold text-slate-950">Recent attestations</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {attestations.slice(0, 7).map((item) => (
              <div key={`${item.id}-${item.tx_hash}`} className="grid gap-3 p-5 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold">{item.package}@{item.version}</h3>
                    <Badge value={item.verdict} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Auditor {item.auditor} wrote block {item.block_number} with score {item.risk_score}.</p>
                  <p className="mono mt-2 truncate text-xs text-slate-500">{item.tx_hash}</p>
                </div>
                <div className="text-right text-sm text-slate-500">{item.status}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-5">
          {reports.slice(0, 2).map(({ hash, report }) => (
            <Card key={hash} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{report.package}@{report.version}</h3>
                  <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
                </div>
                <Badge value={report.verdict} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Clock size={16} />
                {report.elapsed_ms} ms, ${report.llm_cost_usd}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function Metric({ label, value, tone = "blue" }: { label: string; value: string; tone?: "blue" | "red" | "amber" | "green" }) {
  const color = tone === "red" ? "text-rose-600" : tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : "text-blue-600";
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

function DemoStep({ href, icon, title, copy }: { href: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Link href={href} className="group rounded-md border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">{icon}</span>
        <h3 className="font-semibold text-slate-950">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
    </Link>
  );
}
