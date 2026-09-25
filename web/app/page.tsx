import Link from "next/link";
import { getDemo } from "@/lib/api";
import { Badge, Card, SectionTitle } from "@/components/ui";
import { ArrowRight, CheckCircle2, Clock, FileSearch, GitPullRequestArrow, Radio, ShieldAlert, Terminal, Zap } from "lucide-react";

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
      <section className="mb-6 overflow-hidden rounded-lg border border-slate-700/70 bg-[radial-gradient(circle_at_top_right,rgba(118,169,255,0.22),transparent_32rem),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.96))] p-6 shadow-2xl shadow-black/20 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_25rem] xl:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              Agentic package auditing
            </p>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Stop malicious npm updates before they enter your app.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Vouch scans exact package bytes, cites risky files and lines, then records the verdict so CI, reviewers and auditors can verify the same evidence.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/check" className="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 hover:bg-blue-400">
                Check a lockfile
                <ArrowRight size={16} />
              </Link>
              <Link href="/packages" className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-100 hover:border-slate-400 hover:bg-slate-900">
                Inspect evidence
                <FileSearch size={16} />
              </Link>
            </div>
          </div>
          <Card className="bg-slate-950/75 p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-300" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Demo attack</p>
                <h2 className="text-2xl font-semibold text-white">color-tones@2.3.1</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The fixture adds a postinstall hook, encoded suspicious text and a prompt-injection comment. Vouch marks it Malicious without executing it.
            </p>
            {latestMalicious && (
              <div className="mt-5 rounded-md border border-rose-400/25 bg-rose-400/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge value={latestMalicious.verdict} />
                  <span className="text-sm font-semibold text-rose-200">Score {latestMalicious.risk_score}</span>
                </div>
                <p className="mono mt-3 truncate text-xs text-rose-100/70">{latestMalicious.tx_hash}</p>
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
          <pre className="mono overflow-x-auto rounded-md bg-black/35 p-4 text-xs leading-6 text-slate-300">vouch check fixtures/demo-app/package-lock.clean.json{"\n"}vouch audit color-tones@2.3.1{"\n"}vouch check fixtures/demo-app/package-lock.compromised.json</pre>
          <div className="mt-4 flex items-start gap-3 rounded-md border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            Clean passes. Compromised blocks. The fixture package is never executed.
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Card>
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <Radio className="text-blue-300" />
              <h2 className="text-2xl font-semibold">Recent attestations</h2>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            {attestations.slice(0, 7).map((item) => (
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
      </div>
    </>
  );
}

function Metric({ label, value, tone = "blue" }: { label: string; value: string; tone?: "blue" | "red" | "amber" | "green" }) {
  const color = tone === "red" ? "text-rose-300" : tone === "amber" ? "text-amber-300" : tone === "green" ? "text-emerald-300" : "text-blue-300";
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-4xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}

function DemoStep({ href, icon, title, copy }: { href: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Link href={href} className="group rounded-md border border-slate-800 bg-slate-950/70 p-4 transition hover:border-blue-400/60 hover:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-400/10 text-blue-200">{icon}</span>
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
    </Link>
  );
}

