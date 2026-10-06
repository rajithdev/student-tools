import type { ReactNode } from "react";

export type Tone = "safe" | "warn" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  safe: "bg-safe-bg text-safe",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-bg-sunken text-fg-muted",
};

export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${toneClass[tone]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** The hero result: big number + status + one-line verdict. Announced to screen readers politely. */
export function HeroResult({ tone, badge, value, unit, verdict, sub }: { tone: Tone; badge: ReactNode; value: string; unit?: string; verdict: ReactNode; sub?: ReactNode }) {
  const border = { safe: "border-safe/40", warn: "border-warn/40", danger: "border-danger/40", neutral: "border-line" }[tone];
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={`rounded-2xl border-2 ${border} bg-bg-elev p-5 shadow-card sm:p-6`}>
      <StatusBadge tone={tone}>{badge}</StatusBadge>
      <p className="tnum mt-3 text-[3.25rem] font-semibold leading-none tracking-tight text-fg sm:text-6xl">
        {value}
        {unit ? <span className="ml-1 text-2xl font-medium text-fg-muted">{unit}</span> : null}
      </p>
      <p className="mt-3 text-base font-medium text-fg sm:text-lg">{verdict}</p>
      {sub ? <p className="mt-1 text-sm text-fg-muted">{sub}</p> : null}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "neutral" }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone }) {
  const color = { safe: "text-safe", warn: "text-warn", danger: "text-danger", neutral: "text-fg" }[tone];
  return (
    <div className="rounded-xl border border-line bg-bg-elev p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-faint">{label}</p>
      <p className={`tnum mt-1 text-2xl font-semibold ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-fg-muted">{hint}</p> : null}
    </div>
  );
}

export function Card({ children, className = "", title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-bg-elev p-5 shadow-card sm:p-6 ${className}`}>
      {title ? <h2 className="mb-4 text-base font-semibold text-fg">{title}</h2> : null}
      {children}
    </section>
  );
}

/** Horizontal meter with a threshold marker. */
export function Meter({ value, threshold, max = 100, label }: { value: number; threshold?: number; max?: number; label: string }) {
  const pct = Number.isFinite(value) ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const t = threshold !== undefined ? Math.max(0, Math.min(100, (threshold / max) * 100)) : undefined;
  const ok = threshold === undefined || value >= threshold - 1e-9;
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-bg-sunken" role="img" aria-label={label}>
        <div className={`h-full rounded-full ${ok ? "bg-safe" : "bg-danger"}`} style={{ width: `${pct}%` }} />
        {t !== undefined ? <div aria-hidden="true" className="absolute top-0 h-full w-0.5 bg-fg" style={{ left: `calc(${t}% - 1px)` }} /> : null}
      </div>
    </div>
  );
}
