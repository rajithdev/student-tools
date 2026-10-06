"use client";

import { useId } from "react";

/* Compact per-row inputs for list-style calculators (subjects, semesters, courses).
   Each input keeps a screen-reader label; the visible column header is decorative. */

const base = "tnum h-12 w-full rounded-xl border bg-bg-elev px-3 text-base text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";
const border = (invalid?: boolean) => (invalid ? "border-danger" : "border-line-strong hover:border-fg-faint");

export function RowNumber({ label, value, onChange, invalid, placeholder, min, max, step = "any", inputMode = "decimal" }: { label: string; value: string; onChange: (v: string) => void; invalid?: boolean; placeholder?: string; min?: number; max?: number; step?: number | "any"; inputMode?: "numeric" | "decimal" }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input id={id} type="number" inputMode={inputMode} value={value} min={min} max={max} step={step} placeholder={placeholder} aria-invalid={invalid ? true : undefined} onChange={(e) => onChange(e.target.value)} className={`${base} ${border(invalid)}`} />
    </div>
  );
}

export function RowText({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input id={id} type="text" value={value} placeholder={placeholder} maxLength={40} onChange={(e) => onChange(e.target.value)} className={`${base} ${border()}`} />
    </div>
  );
}

export function RowSelect({ label, value, onChange, options, invalid }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; invalid?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} aria-invalid={invalid ? true : undefined} onChange={(e) => onChange(e.target.value)} className={`${base} ${border(invalid)}`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function RemoveRowButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} disabled={disabled} className="inline-flex h-12 w-11 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-bg-elev text-lg text-fg-muted hover:border-fg-faint hover:text-danger disabled:cursor-not-allowed disabled:opacity-40">
      ×
    </button>
  );
}

export function RowError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-medium text-danger">
      {message}
    </p>
  );
}

/* ---- URL encoding for row lists: "a:b:c|a:b:c". Robust to garbage. ---- */

const NUMERIC = /^\d*\.?\d*$/;

/** Encode rows as "col:col|col:col". Separator characters inside cells are stripped; trailing empty cells dropped. */
export function encodeRows(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => c.replace(/[|:]/g, ""))
        .join(":")
        .replace(/:+$/, ""),
    )
    .join("|");
}

/** Parse an encoded row string into exactly `cols` columns per row, padding to at least `minRows` rows. */
export function parseRows(raw: string | undefined, cols: number, minRows: number): string[][] {
  const rows = (raw ?? "")
    .split("|")
    .slice(0, 60)
    .map((r) => {
      const parts = r.split(":");
      return Array.from({ length: cols }, (_, i) => (parts[i] ?? "").slice(0, 40));
    });
  while (rows.length < minRows) rows.push(Array.from({ length: cols }, () => ""));
  return rows;
}

/** Keep only values that look like a non-negative number. */
export function cleanNum(v: string): string {
  return NUMERIC.test(v) ? v : "";
}

/** Keep only values from an allow-list. */
export function cleanOneOf(v: string, allowed: readonly string[]): string {
  return allowed.includes(v) ? v : "";
}

/** Read a free-form string param, limited in length. */
export function str(params: URLSearchParams, key: string, maxLen = 2000): string | undefined {
  const v = params.get(key);
  return v === null ? undefined : v.slice(0, maxLen);
}
