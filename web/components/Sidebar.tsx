import { Activity, Boxes, CheckSquare, Gavel, ShieldCheck, Sparkles, Trophy, Workflow } from "lucide-react";
import Link from "next/link";

const nav = [
  ["Live feed", "/", Activity],
  ["Package", "/packages", Boxes],
  ["Review queue", "/review", Workflow],
  ["Auditors", "/auditors", Trophy],
  ["Check lockfile", "/check", CheckSquare],
  ["Challenge", "/challenge", Gavel],
] as const;

export function Sidebar() {
  return (
    <aside className="border-b border-slate-800 bg-slate-950/90 px-4 py-4 backdrop-blur lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-5">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500 text-white">
          <ShieldCheck size={24} />
        </span>
        <span>
          <span className="block text-2xl font-bold">Vouch</span>
          <span className="text-xs text-slate-400">Exact-byte package trust</span>
        </span>
      </Link>
      <nav className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {nav.map(([label, href, Icon]) => (
          <Link key={href} href={href} className="group flex items-center gap-3 rounded-md border border-transparent px-3 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white">
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-6 rounded-lg border border-blue-400/25 bg-blue-400/10 p-4 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Sparkles size={16} className="text-blue-300" />
          Ready demo
        </div>
        <p className="mt-2 leading-6">Mock agent, local ledger, inert fixtures. The malicious case is safe to inspect.</p>
        <Link href="/check" className="mt-4 inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-400">
          Run lockfile check
        </Link>
      </div>
    </aside>
  );
}
