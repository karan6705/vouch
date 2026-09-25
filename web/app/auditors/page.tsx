import { Card, PageHeader } from "@/components/ui";
import { getDemo } from "@/lib/api";

export default async function AuditorsPage() {
  const demo = await getDemo();
  const rows = Object.entries(demo.ledger.auditors).map(([name, value]) => ({ name, ...value }));

  return (
    <>
      <PageHeader title="Auditor leaderboard" eyebrow="Stake, reputation and accountability" />
      <Card className="overflow-hidden">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Auditor</th>
              <th className="p-4">Stake</th>
              <th className="p-4">Reputation</th>
              <th className="p-4">Attestations</th>
              <th className="p-4">Challenges won</th>
              <th className="p-4">Challenges lost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row: any) => (
              <tr key={row.name}>
                <td className="p-4 font-semibold text-slate-950">{row.name}</td>
                <td className="p-4 text-slate-600">{row.stake}</td>
                <td className="p-4 text-blue-700">{row.reputation}</td>
                <td className="p-4 text-slate-600">{row.attestations}</td>
                <td className="p-4 text-emerald-700">{row.challenges_won}</td>
                <td className="p-4 text-rose-700">{row.challenges_lost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
