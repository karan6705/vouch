import { Activity, Bot, Boxes, CheckSquare, Gavel, ShieldCheck, Sparkles, Trophy, Workflow } from "lucide-react";
import Link from "next/link";

const nav = [
  ["Autopilot", "/autopilot", Bot],
  ["Live feed", "/", Activity],
  ["Package", "/packages", Boxes],
  ["Review queue", "/review", Workflow],
  ["Auditors", "/auditors", Trophy],
  ["Check lockfile", "/check", CheckSquare],
  ["Challenge", "/challenge", Gavel],
] as const;

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-200">
          <ShieldCheck size={24} />
        </span>
        <span>
          <span className="block text-2xl font-bold text-slate-950">Vouch</span>
          <span className="text-xs text-slate-500">Exact-byte package trust</span>
        </span>
      </Link>
      <nav className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {nav.map(([label, href, Icon]) => (
          <Link key={href} href={href} className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-3 text-sm font-semibold text-slate-600 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-950">
          <Sparkles size={16} className="text-blue-600" />
          Ready demo
        </div>
        <p className="mt-2 leading-6">Mock agent, local ledger, inert fixtures. The malicious case is safe to inspect.</p>
        <Link href="/autopilot" className="mt-4 inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          Start Autopilot
        </Link>
      </div>
    </aside>
  );
}
