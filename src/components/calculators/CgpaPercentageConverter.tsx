"use client";

import { useEffect, useMemo } from "react";
import { CONVERSION_FORMULAS, getFormula, customFormula, cgpaToPercent, percentToCgpa, type ConversionFormula, type Confidence } from "@/lib/calc/gpa";
import { parseNum, fmt } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { Segmented, SelectField, NumberField, Button } from "@/components/ui/Field";
import { HeroResult, Card, StatusBadge, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { cleanOneOf, str } from "./RowFields";

const DIRS = ["c2p", "p2c"] as const;
type Dir = (typeof DIRS)[number];
const CUSTOM = "custom";
const FORMULA_IDS = [...CONVERSION_FORMULAS.map((f) => f.id), CUSTOM];

const CONFIDENCE: Record<Confidence, { label: string; tone: Tone }> = {
  official: { label: "Official document", tone: "safe" },
  reported: { label: "Reported by multiple sources", tone: "warn" },
  convention: { label: "Convention only", tone: "neutral" },
};

const defaults = { v: "", f: "cbse-9.5", dir: "c2p" as Dir, m: "9.5", o: "0" };

/** Convert in the chosen direction; returns the (cgpa, percent) pair or an error message. */
function convert(value: number, formula: ConversionFormula, dir: Dir): { cgpa: number; percent: number } | { error: string } {
  const r = dir === "c2p" ? cgpaToPercent(value, formula) : percentToCgpa(value, formula);
  if (typeof r !== "number") return r;
  return dir === "c2p" ? { cgpa: value, percent: r } : { cgpa: r, percent: value };
}

/** "Percentage = CGPA × 9.5" with the user's numbers substituted → "8.2 × 9.5 = 77.9%". */
function worked(formula: ConversionFormula, cgpa: number, percent: number, dir: Dir): string {
  let rhs = formula.display.replace(/^Percentage\s*=\s*/, "");
  if (rhs.includes(" or ")) {
    const parts = rhs.split(" or ");
    rhs = (cgpa < 7 ? parts[0] : parts[1]).replace(/\s*\([^)]*\)\s*$/, "");
  }
  rhs = rhs.replace(/CGPA|CGPI|GPA/g, fmt(cgpa));
  return dir === "c2p" ? `${rhs} = ${fmt(percent)}%` : `${fmt(percent)}% = ${rhs}`;
}

export function CgpaPercentageConverter() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    v: num(p, "v"),
    f: cleanOneOf(str(p, "f") ?? "", FORMULA_IDS) || undefined,
    dir: cleanOneOf(str(p, "dir") ?? "", DIRS) as Dir | undefined,
    m: num(p, "m"),
    o: num(p, "o"),
  }));

  const dir = state.dir;
  const isCustom = state.f === CUSTOM;
  const multiplier = parseNum(state.m);
  const offset = parseNum(state.o) ?? 0;
  const customError = isCustom && (multiplier === undefined || !Number.isFinite(multiplier) || multiplier <= 0) ? "Multiplier must be greater than 0." : undefined;
  const offsetError = isCustom && !Number.isFinite(offset) ? "Enter a number (0 for none)." : undefined;

  const formula = useMemo(() => (isCustom ? customFormula(customError ? 1 : (multiplier as number), offsetError ? 0 : offset) : getFormula(state.f)), [isCustom, multiplier, offset, customError, offsetError, state.f]);

  const value = parseNum(state.v);
  const outcome = useMemo(() => (value === undefined || customError || offsetError ? undefined : convert(value, formula, dir)), [value, formula, dir, customError, offsetError]);
  const ok = outcome && !("error" in outcome) ? outcome : undefined;
  const inputError = outcome && "error" in outcome ? outcome.error : undefined;

  useEffect(() => {
    if (ok) trackCalculatorUse("cgpa_to_percentage", { dir, formula: formula.id });
  }, [ok, dir, formula.id]);

  const conf = CONFIDENCE[formula.confidence];
  const resultValue = ok ? (dir === "c2p" ? fmt(ok.percent) : ok.cgpa.toFixed(2)) : "—";
  const resultUnit = dir === "c2p" ? "%" : `/ ${formula.max}`;
  const summary = ok ? `${worked(formula, ok.cgpa, ok.percent, dir)} (${formula.name}).` : "";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented
          label="Direction"
          value={dir}
          onChange={(v) => update({ dir: v })}
          options={[
            { value: "c2p", label: "CGPA → Percentage" },
            { value: "p2c", label: "Percentage → CGPA" },
          ]}
        />
        <div className="mt-5">
          <NumberField label={dir === "c2p" ? `Your CGPA (out of ${formula.max})` : "Your percentage"} value={state.v} onChange={(v) => update({ v })} min={0} max={dir === "c2p" ? formula.max : 100} suffix={dir === "p2c" ? "%" : undefined} placeholder={dir === "c2p" ? "e.g. 8.2" : "e.g. 78"} error={inputError} autoFocus />
        </div>
        <div className="mt-5">
          <SelectField label="Conversion formula" value={state.f} onChange={(v) => update({ f: v })} options={[...CONVERSION_FORMULAS.map((f) => ({ value: f.id, label: f.name })), { value: CUSTOM, label: "Custom multiplier / offset…" }]} hint="Pick the formula printed on your marks card or in your university regulations." />
        </div>
        {isCustom ? (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberField size="md" label="Multiplier" value={state.m} onChange={(v) => update({ m: v })} min={0} placeholder="9.5" error={customError} hint="Percentage = (CGPA − offset) × multiplier" />
            <NumberField size="md" label="Offset" value={state.o} onChange={(v) => update({ o: v })} placeholder="0" error={offsetError} hint="Subtracted from CGPA first (0 if none)" />
          </div>
        ) : null}
        <p className="mt-4 text-xs text-fg-muted">{formula.note}</p>
        {state.v !== "" ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {ok ? (
          <HeroResult tone={conf.tone} badge={conf.label} value={resultValue} unit={resultUnit} verdict={worked(formula, ok.cgpa, ok.percent, dir)} sub={formula.note} />
        ) : (
          <HeroResult tone="neutral" badge="Waiting for a number" value="—" unit={resultUnit} verdict={dir === "c2p" ? "Enter your CGPA to see the percentage under the selected formula." : "Enter your percentage to see the equivalent CGPA."} sub="Nothing you type leaves your device." />
        )}

        {ok ? (
          <Card title="The same number under every formula">
            <p className="mb-3 text-sm text-fg-muted">Universities disagree. Here is how much the answer moves for {dir === "c2p" ? `a CGPA of ${fmt(ok.cgpa)}` : `${fmt(ok.percent)}%`}.</p>
            <table className="tnum w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
                  <th scope="col" className="pb-2">
                    Formula
                  </th>
                  <th scope="col" className="pb-2 text-right">
                    {dir === "c2p" ? "Percentage" : "CGPA"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...CONVERSION_FORMULAS, ...(isCustom ? [formula] : [])].map((f) => {
                  const r = convert(value as number, f, dir);
                  const selected = f.id === formula.id;
                  const c = CONFIDENCE[f.confidence];
                  return (
                    <tr key={f.id} className={`border-t border-line align-top ${selected ? "bg-bg-sunken" : ""}`}>
                      <td className="py-2.5 pr-3">
                        <span className={`block ${selected ? "font-semibold text-fg" : "text-fg"}`}>{f.name}</span>
                        <span className="mt-1 inline-block">
                          <StatusBadge tone={c.tone}>{c.label}</StatusBadge>
                        </span>
                      </td>
                      <td className={`py-2.5 text-right font-semibold ${selected ? "text-fg" : "text-fg-muted"}`}>{"error" in r ? <span className="text-xs font-normal text-fg-faint">n/a (max {f.max})</span> : dir === "c2p" ? `${fmt(r.percent)}%` : r.cgpa.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : null}

        {ok ? (
          <Card title="How this was calculated">
            <p className="tnum break-words text-sm text-fg">
              {formula.display} → <strong>{worked(formula, ok.cgpa, ok.percent, dir)}</strong>
            </p>
            {dir === "p2c" ? <p className="mt-2 text-xs text-fg-muted">The formula is solved backwards for CGPA and the result is clamped to the scale maximum of {formula.max}.</p> : null}
          </Card>
        ) : null}

        {ok ? <ShareBar text={summary} onReset={reset} /> : null}
      </div>
    </div>
  );
}
