"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";

export default function CheckPage() {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [failed, setFailed] = useState<boolean | null>(null);

  async function runCheck() {
    const lockfile = text.trim() ? JSON.parse(text) : await fetch(`${API_URL}/demo-lockfile/clean`).then((r) => r.json());
    const response = await fetch(`${API_URL}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockfile }),
    });
    const data = await response.json();
    setRows(data.rows);
    setFailed(data.failed);
  }

  return (
    <>
      <PageHeader title="Check a lockfile" eyebrow="CI policy before install" />
      <div className="grid gap-5 xl:grid-cols-[26rem_1fr]">
        <Card className="p-5">
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste package-lock.json, or leave empty to use the seeded clean demo lockfile." className="h-80 w-full resize-none rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-blue-400" />
          <button onClick={runCheck} className="mt-4 w-full rounded-md bg-blue-500 px-4 py-3 font-semibold text-white">Run Vouch check</button>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-2xl font-semibold">{failed === null ? "Results" : failed ? "Policy blocked" : "Policy passed"}</h2>
          </div>
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr><th className="p-4">Package</th><th className="p-4">Version</th><th className="p-4">Verdict</th><th className="p-4">Score</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <tr key={`${row.package}-${row.version}`}>
                  <td className="p-4 font-semibold">{row.package}</td>
                  <td className="p-4 text-slate-300">{row.version}</td>
                  <td className="p-4"><Badge value={row.verdict} /></td>
                  <td className="p-4 text-slate-300">{row.score ?? ""}</td>
                  <td className="p-4 text-slate-300">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
