"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui";
import { Bot, CheckCircle2, ClipboardCheck, FileWarning, Loader2, PackageSearch, Play, ShieldX, Sparkles } from "lucide-react";

type AutopilotResult = {
  target: string;
  mode: string;
  summary: string;
  risk: string;
  blocked: boolean;
  steps: { name: string; status: string; detail: string }[];
  actions: { title: string; detail: string }[];
  rows: { package: string; version: string; verdict: string; score: number | null; status: string; auditors: number }[];
};

export default function AutopilotPage() {
  const [mode, setMode] = useState<"lockfile" | "package">("lockfile");
  const [target, setTarget] = useState("fixtures/demo-app/package-lock.compromised.json");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AutopilotResult | null>(null);

  async function runAutopilot(nextMode = mode, nextTarget = target) {
    setBusy(true);
    setError("");
    setMode(nextMode);
    setTarget(nextTarget);
    try {
      const response = await fetch(`${API_URL}/autopilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode, target: nextTarget }),
      });
      if (!response.ok) throw new Error(await response.text());
      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autopilot could not finish this run.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Autopilot"
        eyebrow="Reduce human dependency review"
        action={
          <button onClick={() => runAutopilot()} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 disabled:opacity-60">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
            Run Autopilot
          </button>
        }
      />

      <section className="motion-rise mb-6 rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-xl shadow-blue-100/50">
        <div className="grid gap-6 xl:grid-cols-[1fr_26rem] xl:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-sm font-semibold text-blue-700">
              <Bot size={16} />
              Autonomous triage agent
            </div>
            <h2 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950">
              Paste a target once. Vouch handles scan, audit lookup, policy and next actions.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              The goal is fewer manual dependency reviews. Autopilot turns a package or lockfile into a release decision with evidence, auditor state and recommended follow-up.
            </p>
          </div>
          <Card className="motion-float p-5">
            <SectionTitle kicker="Try these" title="One-click scenarios" />
            <div className="grid gap-3">
              <ScenarioButton icon={<ShieldX size={18} />} title="Block compromised lockfile" onClick={() => runAutopilot("lockfile", "fixtures/demo-app/package-lock.compromised.json")} />
              <ScenarioButton icon={<CheckCircle2 size={18} />} title="Approve clean lockfile" onClick={() => runAutopilot("lockfile", "fixtures/demo-app/package-lock.clean.json")} />
              <ScenarioButton icon={<PackageSearch size={18} />} title="Audit package version" onClick={() => runAutopilot("package", "color-tones@2.3.1")} />
            </div>
          </Card>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[26rem_1fr]">
        <Card className="p-5">
          <SectionTitle kicker="Input" title="Target" copy="Use a package spec or one of the demo lockfile paths. Public repo scanning is a documented roadmap item, not part of this local MVP." />
          <div className="grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1 text-sm font-semibold">
            {(["lockfile", "package"] as const).map((item) => (
              <button key={item} onClick={() => setMode(item)} className={item === mode ? "rounded bg-white px-3 py-2 text-blue-700 shadow" : "rounded px-3 py-2 text-slate-600"}>
                {item}
              </button>
            ))}
          </div>
          <input value={target} onChange={(event) => setTarget(event.target.value)} className="mt-4 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-blue-400" />
          {error && (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Autonomous result</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{result ? result.summary : "Run Autopilot to generate a decision"}</h2>
            </div>
            {result && <Badge value={result.risk} />}
          </div>

          {!result ? (
            <div className="grid gap-4 p-6 md:grid-cols-3">
              <EmptyFeature icon={<Sparkles size={20} />} title="Find risk" copy="Detects malicious lifecycle and static signals." />
              <EmptyFeature icon={<ClipboardCheck size={20} />} title="Apply policy" copy="Turns findings into pass, review or block." />
              <EmptyFeature icon={<FileWarning size={20} />} title="Explain next step" copy="Shows what to do without security guesswork." />
            </div>
          ) : (
            <div className="grid gap-6 p-5 xl:grid-cols-[1fr_20rem]">
              <div>
                <SectionTitle kicker="Execution trace" title="Autopilot steps" />
                <div className="grid gap-3">
                  {result.steps.map((step, index) => (
                    <div key={`${step.name}-${index}`} className={`motion-rise rounded-md border border-slate-200 bg-white p-4 motion-delay-${Math.min(index + 1, 5)}`}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">{index + 1}</span>
                        <h3 className="font-semibold text-slate-950">{step.name}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr><th className="p-4">Package</th><th className="p-4">Version</th><th className="p-4">Verdict</th><th className="p-4">Score</th><th className="p-4">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.rows.map((row) => (
                        <tr key={`${row.package}-${row.version}`}>
                          <td className="p-4 font-semibold text-slate-950">{row.package}</td>
                          <td className="p-4 text-slate-600">{row.version}</td>
                          <td className="p-4"><Badge value={row.verdict} /></td>
                          <td className="p-4 text-slate-600">{row.score ?? ""}</td>
                          <td className={row.status === "Blocked" ? "p-4 font-semibold text-rose-700" : "p-4 font-semibold text-emerald-700"}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <SectionTitle kicker="Next actions" title="Do this now" />
                <div className="grid gap-3">
                  {result.actions.map((action) => (
                    <div key={action.title} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                      <h3 className="font-semibold text-blue-950">{action.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-blue-800">{action.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

function ScenarioButton({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
      <span className="flex items-center gap-3">{icon}{title}</span>
      <Play size={16} />
    </button>
  );
}

function EmptyFeature({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3 text-blue-700">{icon}<h3 className="font-semibold text-slate-950">{title}</h3></div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
    </div>
  );
}
