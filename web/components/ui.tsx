import clsx from "clsx";

export function Badge({ value }: { value: string }) {
  const tone =
    value === "Safe"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : value === "Malicious"
        ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
        : value === "Suspicious"
          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
          : "border-slate-500/30 bg-slate-500/10 text-slate-300";
  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tone)}>{value}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-700/70 bg-slate-950/60 shadow-2xl shadow-black/10 ${className}`}>{children}</section>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 hover:bg-blue-400 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, eyebrow, action }: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{eyebrow}</p>
        <h1 className="text-3xl font-semibold text-white sm:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      {copy && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{copy}</p>}
    </div>
  );
}
