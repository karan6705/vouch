"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { Badge, Card, PageHeader, SectionTitle } from "@/components/ui";
import { AlertTriangle, CheckCircle2, FileJson, Loader2, ShieldX } from "lucide-react";

type CheckRow = {
  package: string;
  version: string;
  verdict: string;
  score: number | null;
  status: string;
  auditors: number;
  report?: string | null;
};

export default function CheckPage() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [failed, setFailed] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"clean" | "compromised" | "pasted" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function runCheck(kind: "clean" | "compromised" | "pasted") {
    setBusy(true);
    setError("");
    setMode(kind);
    try {
      const lockfile =
        kind === "pasted"
          ? JSON.parse(text)
          : await fetch(`${API_URL}/demo-lockfile/${kind}`, { cache: "no-store" }).then((response) => {
              if (!response.ok) throw new Error("Demo lockfile could not be loaded.");
              return response.json();
            });
      const response = await fetch(`${API_URL}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockfile }),
      });
      if (!response.ok) throw new Error("Vouch API returned an error.");
      const data = await response.json();
      setRows(data.rows || []);
      setFailed(Boolean(data.failed));
    } catch (err) {
      setRows([]);
      setFailed(null);
      setError(err instanceof Error ? err.message : "Could not check this lockfile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Check a lockfile" eyebrow="CI policy before install" />
      <div className="grid gap-5 xl:grid-cols-[27rem_1fr]">
        <div className="grid gap-5">
          <Card className="p-5">
            <SectionTitle kicker="Fast demo" title="Run a known scenario" copy="Use these first when pitching. They show the pass and block paths without requiring pasted JSON." />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <button onClick={() => runCheck("clean")} disabled={busy} className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
                Clean app passes
                <CheckCircle2 size={18} />
              </button>
              <button onClick={() => runCheck("compromised")} disabled={busy} className="flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-left text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60">
                Compromised app blocks
                <ShieldX size={18} />
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle kicker="Custom check" title="Paste package-lock.json" />
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste package-lock.json here."
              className="h-72 w-full resize-none rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-950 outline-none focus:border-blue-400"
            />
            <button
              onClick={() => runCheck("pasted")}
              disabled={busy || !text.trim()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {busy && mode === "pasted" ? <Loader2 size={18} className="animate-spin" /> : <FileJson size={18} />}
              Check pasted lockfile
            </button>
            {error && (
              <div className="mt-4 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Policy result</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {busy ? "Checking..." : failed === null ? "Awaiting scan" : failed ? "Blocked before install" : "Safe to continue"}
              </h2>
            </div>
            {failed !== null && <Badge value={failed ? "Malicious" : "Safe"} />}
          </div>

          {!rows.length && !busy ? (
            <div className="p-8 text-sm leading-6 text-slate-600">
              Run one of the demo checks to see the dependency table, auditor count and policy decision.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="p-4">Package</th>
                    <th className="p-4">Version</th>
                    <th className="p-4">Verdict</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Auditors</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={`${row.package}-${row.version}`}>
                      <td className="p-4 font-semibold text-slate-950">{row.package}</td>
                      <td className="p-4 text-slate-600">{row.version}</td>
                      <td className="p-4"><Badge value={row.verdict} /></td>
                      <td className="p-4 text-slate-600">{row.score ?? ""}</td>
                      <td className="p-4 text-slate-600">{row.auditors}</td>
                      <td className={row.status === "Blocked" ? "p-4 font-semibold text-rose-700" : "p-4 font-semibold text-emerald-700"}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
