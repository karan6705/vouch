import clsx from "clsx";

export function Badge({ value }: { value: string }) {
  const tone =
    value === "Safe"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "Malicious"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : value === "Suspicious"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-700";
  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", tone)}>{value}</span>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className}`}>{children}</section>;
}

export function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-500 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function PageHeader({ title, eyebrow, action }: { title: string; eyebrow: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
        <h1 className="text-3xl font-semibold text-slate-950 sm:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{kicker}</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
      {copy && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy}</p>}
    </div>
  );
}
