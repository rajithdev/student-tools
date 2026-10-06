"use client";

import { useId, type ReactNode } from "react";

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
  autoFocus?: boolean;
  className?: string;
  size?: "md" | "lg";
  name?: string;
}

/** Accessible numeric input with label, hint and inline error. Large touch target (56px). */
export function NumberField({ label, value, onChange, hint, error, suffix, min, max, step = "any", placeholder, inputMode = "decimal", className = "", size = "lg", name }: NumberFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          name={name}
          type="number"
          inputMode={inputMode}
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          className={`tnum w-full rounded-xl border bg-bg-elev text-fg placeholder:text-fg-faint ${
            size === "lg" ? "h-14 px-4 text-xl font-semibold" : "h-12 px-3.5 text-base"
          } ${suffix ? "pr-12" : ""} ${error ? "border-danger" : "border-line-strong hover:border-fg-faint"} focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40`}
        />
        {suffix ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-base font-medium text-fg-faint">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-fg-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
  className?: string;
}

export function SelectField({ label, value, onChange, options, hint, className = "" }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-1.5 h-12 w-full rounded-xl border border-line-strong bg-bg-elev px-3 text-base text-fg hover:border-fg-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-fg-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

/** Radio group styled as a segmented control. */
export function Segmented<T extends string>({ label, value, onChange, options, className = "" }: SegmentedProps<T>) {
  const id = useId();
  return (
    <fieldset className={className}>
      <legend className="block text-sm font-medium text-fg">{label}</legend>
      <div role="radiogroup" className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl bg-bg-sunken p-1.5">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className={`flex min-h-11 flex-1 cursor-pointer select-none items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                checked ? "bg-bg-elev text-fg shadow-card" : "text-fg-muted hover:text-fg"
              } has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent`}
            >
              <input type="radio" name={id} value={o.value} checked={checked} onChange={() => onChange(o.value)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--accent)]" />
      <label htmlFor={id} className="text-sm text-fg">
        {label}
        {hint ? <span className="block text-xs text-fg-faint">{hint}</span> : null}
      </label>
    </div>
  );
}

export function Button({ children, onClick, variant = "secondary", type = "button", className = "", ariaLabel }: { children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; type?: "button" | "submit"; className?: string; ariaLabel?: string }) {
  const base = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors";
  const styles = {
    primary: "bg-fg text-bg hover:opacity-90",
    secondary: "border border-line-strong bg-bg-elev text-fg hover:border-fg-faint",
    ghost: "text-fg-muted hover:bg-bg-sunken hover:text-fg",
  }[variant];
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
