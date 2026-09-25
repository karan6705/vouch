"use client";

import { useEffect, useState } from "react";
import { getDemo, postChallenge, resolveChallenge } from "@/lib/api";
import { Badge, Card, PageHeader } from "@/components/ui";

export default function ChallengePage() {
  const [attestations, setAttestations] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    getDemo().then((data) => setAttestations(data.ledger.attestations));
  }, []);

  async function challengeCareless() {
    const target = attestations.find((item) => item.auditor === "careless-auditor") || attestations[0];
    if (!target) return;
    const created = await postChallenge(target.id);
    const resolved = await resolveChallenge(created.id);
    setResult({ created, resolved });
  }

  return (
    <>
      <PageHeader title="Challenge verdicts" eyebrow="Economic accountability" />
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <Card className="overflow-hidden">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr><th className="p-4">ID</th><th className="p-4">Package</th><th className="p-4">Auditor</th><th className="p-4">Verdict</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attestations.map((item) => (
                <tr key={item.id}>
                  <td className="p-4">{item.id}</td>
                  <td className="p-4 font-semibold">{item.package}@{item.version}</td>
                  <td className="p-4 text-slate-600">{item.auditor}</td>
                  <td className="p-4"><Badge value={item.verdict} /></td>
                  <td className="p-4 text-slate-600">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-slate-950">Demo resolution</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Challenge the careless auditor's wrong Safe verdict for the compromised fixture. Resolve it as upheld to reduce reputation.</p>
          <button onClick={challengeCareless} className="mt-5 w-full rounded-md bg-rose-600 px-4 py-3 font-semibold text-white hover:bg-rose-500">Challenge and resolve</button>
          {result && <pre className="mono mt-5 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">{JSON.stringify(result, null, 2)}</pre>}
        </Card>
      </div>
    </>
  );
}
