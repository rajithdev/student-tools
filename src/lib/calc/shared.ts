export const EPS = 1e-9;

export function isNum(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function round(n: number, decimals = 2): number {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

export function fmt(n: number, decimals = 2): string {
  if (!Number.isFinite(n)) return "—";
  return round(n, decimals).toFixed(decimals).replace(/\.?0+$/, (m) => (m.startsWith(".") ? "" : m));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Parse a user-typed number field. Empty → undefined, garbage → NaN. */
export function parseNum(raw: string | number | null | undefined): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "number") return raw;
  const s = raw.trim().replace(/,/g, "");
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
