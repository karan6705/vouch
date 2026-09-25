"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_URL, fallbackDemo } from "@/lib/api";
import { Badge, Card, SectionTitle } from "@/components/ui";
import {
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Code2,
  FileCode2,
  FileSearch,
  Gavel,
  GitBranch,
  Loader2,
  LockKeyhole,
  Play,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Video,
} from "lucide-react";

type DemoData = typeof fallbackDemo;

type AutopilotResult = {
  summary: string;
  risk: string;
  blocked: boolean;
  steps: { name: string; detail: string }[];
  actions: { title: string; detail: string }[];
  rows: { package: string; version: string; verdict: string; score: number | null; status: string; auditors: number }[];
};

const judgeCriteria = [
  ["Problem", "Trusted package updates can silently carry malicious code."],
  ["Impact", "Every modern Node app depends on code it did not write."],
  ["Feasibility", "Working CLI, API, dashboard, reports and contract source."],
  ["Novelty", "Verdicts bind to exact bytes and cite file-line evidence."],
  ["Architecture", "Agent, report store, attestation ledger, CLI and dashboard."],
  ["Revenue", "Open core, team cloud, compliance packs, auditor marketplace."],
];

const architecture = [
  ["Registry", "npm package or safe fixture"],
  ["Agent", "diff, detectors, evidence validation"],
  ["Report", "canonical JSON and hash"],
  ["Attestation", "exact integrity verdict"],
  ["CI", "block risky lockfiles"],
];

export default function Home() {
  const [demo, setDemo] = useState<DemoData>(fallbackDemo);
  const [result, setResult] = useState<AutopilotResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/demo`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : fallbackDemo))
      .then(setDemo)
      .catch(() => setDemo(fallbackDemo));
  }, []);

  const stats = useMemo(() => {
    const attestations = demo.ledger.attestations;
    return {
      attestations: attestations.length,
      safe: attestations.filter((item) => item.verdict === "Safe").length,
      malicious: attestations.filter((item) => item.verdict === "Malicious").length,
      suspicious: attestations.filter((item) => item.verdict === "Suspicious").length,
    };
  }, [demo]);

  async function runDemo() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "lockfile", target: "fixtures/demo-app/package-lock.compromised.json" }),
      });
      if (!response.ok) throw new Error("Autopilot API failed.");
      setResult(await response.json());
      const freshDemo = await fetch(`${API_URL}/demo`, { cache: "no-store" }).then((item) => item.json());
      setDemo(freshDemo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo could not run.");
    } finally {
      setBusy(false);
    }
  }

  const latestReports = demo.reports.slice().reverse().slice(0, 3);

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-xl border border-blue-100 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_34rem),linear-gradient(135deg,#ffffff,#eef6ff)] p-6 shadow-2xl shadow-blue-100/70 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_27rem] xl:items-end">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              <Trophy size={15} />
              DecentraHack 2.0 ready
            </p>
            <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Autonomous supply-chain security for open-source packages.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Vouch audits dependency updates, explains risky code with evidence, and records exact-byte verdicts so teams can block attacks before install.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={runDemo} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 disabled:opacity-70">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                Run 20 second demo
              </button>
              <Link href="/packages" className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50">
                View evidence
                <ArrowRight size={16} />
              </Link>
            </div>
            {error && <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p>}
          </div>

          <Card className="p-5">
            <SectionTitle kicker="Live demo result" title={result ? result.summary : "One click runs the release gate"} />
            <div className="grid gap-3">
              <MiniStatus label="Autonomy" value="Agent handles triage" icon={<Bot size={18} />} />
              <MiniStatus label="Theme fit" value="AI + Web3 + Open Source" icon={<Sparkles size={18} />} />
              <MiniStatus label="Human effort" value="Only reviews edge cases" icon={<Users size={18} />} />
            </div>
            {result && (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center justify-between">
                  <Badge value={result.risk} />
                  <span className="text-sm font-semibold text-rose-700">{result.blocked ? "Release blocked" : "Release allowed"}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Safe versions" value={String(stats.safe)} tone="green" />
        <Metric label="Blocked" value={String(stats.malicious)} tone="red" />
        <Metric label="Needs review" value={String(stats.suspicious)} tone="amber" />
        <Metric label="Attestations" value={String(stats.attestations)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <Card className="p-5">
          <SectionTitle kicker="Autonomous workflow" title="What Vouch does for the user" copy="The pitch is simple: developers should not manually inspect every dependency diff. Vouch turns that work into a repeatable release gate." />
          <div className="grid gap-3 md:grid-cols-5">
            {architecture.map(([title, copy], index) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</span>
                <h3 className="mt-4 font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle kicker="Demo script" title="Show this live" />
          <div className="grid gap-3">
            <QuickLink href="/autopilot" icon={<Bot size={18} />} title="Autopilot" copy="Run the whole flow." />
            <QuickLink href="/check" icon={<ClipboardCheck size={18} />} title="CI gate" copy="Clean passes, bad blocks." />
            <QuickLink href="/packages" icon={<FileSearch size={18} />} title="Evidence" copy="Show files, lines, hash." />
            <QuickLink href="/challenge" icon={<Gavel size={18} />} title="Challenge" copy="Slash wrong verdicts." />
          </div>
        </Card>
      </div>

      {result && (
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Autopilot trace</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">The system did the review work</h2>
              </div>
              <Badge value={result.risk} />
            </div>
          </div>
          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_22rem]">
            <div className="grid gap-3">
              {result.steps.map((step, index) => (
                <div key={step.name} className="rounded-md border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">{index + 1}</span>
                    <h3 className="font-semibold text-slate-950">{step.name}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Recommended actions</h3>
              <div className="mt-3 grid gap-3">
                {result.actions.map((action) => (
                  <div key={action.title} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                    <p className="font-semibold text-blue-950">{action.title}</p>
                    <p className="mt-2 text-sm leading-6 text-blue-800">{action.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <Card className="p-5">
          <SectionTitle kicker="Hackathon fit" title="Every judging requirement is visible" copy="This section is here on purpose. A judge can map the project to DecentraHack criteria in under a minute." />
          <div className="grid gap-3 md:grid-cols-2">
            {judgeCriteria.map(([title, copy]) => (
              <div key={title} className="rounded-md border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle kicker="Business" title="Why it can exist" />
          <div className="grid gap-3">
            <BusinessLine icon={<Code2 size={18} />} title="Free open core" copy="CLI, GitHub Action, public lookups." />
            <BusinessLine icon={<LockKeyhole size={18} />} title="Team cloud" copy="Private registry scanning and policies." />
            <BusinessLine icon={<Boxes size={18} />} title="Compliance packs" copy="SBOM plus attestation evidence." />
            <BusinessLine icon={<CircleDollarSign size={18} />} title="Auditor marketplace" copy="Bounties for critical packages." />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
        <Card className="p-5">
          <SectionTitle kicker="Recent reports" title="Evidence the system produced" />
          <div className="grid gap-3 md:grid-cols-3">
            {latestReports.map(({ hash, report }) => (
              <div key={hash} className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950">{report.package}</h3>
                    <p className="text-sm text-slate-500">{report.version}</p>
                  </div>
                  <Badge value={report.verdict} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
                <p className="mono mt-3 truncate text-xs text-slate-400">{hash}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle kicker="Round 2 assets" title="Submission ready" />
          <div className="grid gap-3">
            <AssetLine icon={<Video size={18} />} title="Demo video script" copy="Shot list is in submission folder." />
            <AssetLine icon={<FileCode2 size={18} />} title="PPT + PDF" copy="Deck exports are generated." />
            <AssetLine icon={<GitBranch size={18} />} title="Clean checkpoint" copy="Every major milestone is committed." />
            <AssetLine icon={<ShieldCheck size={18} />} title="Offline mode" copy="Demo works without public npm." />
          </div>
        </Card>
      </div>
    </div>
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

function MiniStatus({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-blue-700">{icon}<span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span></div>
      <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function QuickLink({ href, icon, title, copy }: { href: string; icon: React.ReactNode; title: string; copy: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 hover:border-blue-200 hover:bg-blue-50">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">{icon}</span>
      <span>
        <span className="block font-semibold text-slate-950">{title}</span>
        <span className="text-sm text-slate-500">{copy}</span>
      </span>
    </Link>
  );
}

function BusinessLine({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-slate-200 bg-white p-3">
      <span className="mt-0.5 text-blue-700">{icon}</span>
      <span>
        <span className="block font-semibold text-slate-950">{title}</span>
        <span className="text-sm leading-6 text-slate-600">{copy}</span>
      </span>
    </div>
  );
}

function AssetLine({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3">
      <span className="mt-0.5 text-emerald-700">{icon}</span>
      <span>
        <span className="block font-semibold text-emerald-950">{title}</span>
        <span className="text-sm leading-6 text-emerald-800">{copy}</span>
      </span>
    </div>
  );
}

