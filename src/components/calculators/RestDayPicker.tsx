"use client";

import { useId } from "react";

/** Weekday checkboxes (Mon…Sun) backed by a comma-separated list of 0–6 (0 = Sunday), as stored in the URL. */
export const WEEKDAYS: { value: number; label: string; full: string }[] = [
  { value: 1, label: "Mon", full: "Monday" },
  { value: 2, label: "Tue", full: "Tuesday" },
  { value: 3, label: "Wed", full: "Wednesday" },
  { value: 4, label: "Thu", full: "Thursday" },
  { value: 5, label: "Fri", full: "Friday" },
  { value: 6, label: "Sat", full: "Saturday" },
  { value: 0, label: "Sun", full: "Sunday" },
];

/** Parse "0,6" → [0, 6]. Ignores anything that is not a weekday number. */
export function parseRestDays(raw: string): number[] {
  if (!raw) return [];
  const out = new Set<number>();
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n >= 0 && n <= 6) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

export function serializeRestDays(days: number[]): string {
  return [...new Set(days)].sort((a, b) => a - b).join(",");
}

/** URL parser: accepts only a well-formed comma list of 0–6. */
export function restParam(params: URLSearchParams, key = "rest"): string | undefined {
  const v = params.get(key);
  if (v === null) return undefined;
  return /^[0-6](,[0-6])*$/.test(v) ? serializeRestDays(parseRestDays(v)) : undefined;
}

export function RestDayPicker({ label = "Rest days", value, onChange, hint }: { label?: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  const selected = parseRestDays(value);
  function toggle(day: number) {
    const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day];
    onChange(serializeRestDays(next));
  }
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-fg">{label}</legend>
      <div className="mt-1.5 grid grid-cols-7 gap-1.5" aria-describedby={hint ? `${id}-hint` : undefined}>
        {WEEKDAYS.map((d) => {
          const checked = selected.includes(d.value);
          return (
            <label
              key={d.value}
              className={`flex min-h-11 cursor-pointer select-none items-center justify-center rounded-xl border text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${
                checked ? "border-fg bg-fg text-bg" : "border-line-strong bg-bg-elev text-fg hover:border-fg-faint"
              }`}
            >
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(d.value)} aria-label={d.full} />
              <span aria-hidden="true">{d.label}</span>
            </label>
          );
        })}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-fg-faint">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Shared date/time parsing helpers for the exam tools. Dates are interpreted in local time. */
export function parseLocalDate(d: string, t?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return null;
  let hh = 0;
  let mm = 0;
  if (t) {
    const tm = /^(\d{2}):(\d{2})$/.exec(t);
    if (!tm) return null;
    hh = Number(tm[1]);
    mm = Number(tm[2]);
    if (hh > 23 || mm > 59) return null;
  }
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hh, mm, 0, 0);
  // Reject roll-overs such as 2026-02-31.
  if (date.getFullYear() !== Number(m[1]) || date.getMonth() !== Number(m[2]) - 1 || date.getDate() !== Number(m[3])) return null;
  return date;
}

export function dateParam(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key);
  if (v === null) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
}

export function timeParam(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key);
  if (v === null) return undefined;
  return /^\d{2}:\d{2}$/.test(v) || v === "" ? v : undefined;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Shared input styling for native date/time/text inputs, matching NumberField's large variant. */
export const inputClass = (error?: string) =>
  `w-full rounded-xl border bg-bg-elev text-fg placeholder:text-fg-faint h-14 px-4 text-xl font-semibold ${error ? "border-danger" : "border-line-strong hover:border-fg-faint"} focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40`;
