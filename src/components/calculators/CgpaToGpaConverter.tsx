"use client";

import { useEffect, useMemo } from "react";
import { CGPA_TO_GPA_BANDS, cgpaToGpaBand, cgpaToGpaLinear } from "@/lib/calc/gpa";
import { parseNum, fmt, EPS } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { Segmented, NumberField, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { cleanOneOf, str } from "./RowFields";

const TYPES = ["c", "p"] as const;
type InputType = (typeof TYPES)[number];
const PCT_DIVISOR = 9.5;

const defaults = { v: "", t: "c" as InputType };

/** Human-readable CGPA range for a band, e.g. "8 – <9" or "9 – 10". */
function bandRange(min: number): string {
  const i = CGPA_TO_GPA_BANDS.findIndex((b) => b.min === min);
  return i <= 0 ? `${min} – 10` : `${min} – <${CGPA_TO_GPA_BANDS[i - 1].min}`;
}

export function CgpaToGpaConverter() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    v: num(p, "v"),
    t: cleanOneOf(str(p, "t") ?? "", TYPES) as InputType | undefined,
  }));

  const isPercent = state.t === "p";
  const raw = parseNum(state.v);

  const result = useMemo(() => {
    if (raw === undefined) return undefined;
    if (!Number.isFinite(raw) || raw < 0) return { error: isPercent ? "Enter a percentage of 0 or more." : "Enter a CGPA of 0 or more." };
    if (isPercent && raw > 100 + EPS) return { error: "Percentage cannot exceed 100." };
    if (!isPercent && raw > 10 + EPS) return { error: "CGPA cannot exceed 10 on this scale." };
    const cgpa = isPercent ? Math.min(10, raw / PCT_DIVISOR) : raw;
    const band = cgpaToGpaBand(cgpa);
    return { cgpa, linear: cgpaToGpaLinear(cgpa), band, capped: isPercent && raw / PCT_DIVISOR > 10 + EPS };
  }, [raw, isPercent]);

  const ok = result && !("error" in result) ? result : undefined;
  const inputError = result && "error" in result ? result.error : undefined;

  useEffect(() => {
    if (ok) trackCalculatorUse("cgpa_to_gpa", { input: isPercent ? "percent" : "cgpa" });
  }, [ok, isPercent]);

  const linearStr = ok ? ok.linear.toFixed(2) : "—";
  const bandStr = ok?.band ? `${ok.band.gpa.toFixed(1)} (${ok.band.letter})` : "—";
  const summary = ok ? `CGPA ${fmt(ok.cgpa)} ≈ ${linearStr} GPA (linear) or ${bandStr} by band table. Estimate only.` : "";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented
          label="I have a"
          value={state.t}
          onChange={(v) => update({ t: v })}
          options={[
            { value: "c", label: "CGPA (10-point)" },
            { value: "p", label: "Percentage" },
          ]}
        />
        <div className="mt-5">
          <NumberField label={isPercent ? "Your percentage" : "Your CGPA (out of 10)"} value={state.v} onChange={(v) => update({ v })} min={0} max={isPercent ? 100 : 10} suffix={isPercent ? "%" : undefined} placeholder={isPercent ? "e.g. 78" : "e.g. 8.2"} error={inputError} hint={isPercent ? `Converted to CGPA first using ÷ ${PCT_DIVISOR} (CBSE convention).` : undefined} autoFocus />
        </div>
        <p className="mt-4 text-xs text-fg-muted">A 10-point CGPA has no official 4.0 equivalent. Credential evaluators such as WES grade each course individually, so treat anything below as a rough estimate for shortlisting, not for applications.</p>
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
          <HeroResult tone="warn" badge="Estimate only" value={linearStr} unit="/ 4.0" verdict={`Band table: ${fmt(ok.cgpa)} → ${bandStr}`} sub="Evaluators such as WES convert course by course; there is no official single formula." />
        ) : (
          <HeroResult tone="neutral" badge="Waiting for a number" value="—" unit="/ 4.0" verdict={isPercent ? "Enter your percentage to estimate a 4.0-scale GPA." : "Enter your 10-point CGPA to estimate a 4.0-scale GPA."} sub="Nothing you type leaves your device." />
        )}

        {ok ? (
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Linear estimate" value={linearStr} hint="CGPA ÷ 10 × 4" tone="warn" />
            <Stat label="Band estimate" value={bandStr} hint="from the table below" tone="warn" />
          </div>
        ) : null}

        {ok ? (
          <Card title="How this was calculated">
            {isPercent ? (
              <p className="tnum break-words text-sm text-fg">
                {fmt(raw as number)}% ÷ {PCT_DIVISOR} = <strong>{fmt(ok.cgpa)} CGPA</strong>
                {ok.capped ? " (capped at 10)" : ""}
              </p>
            ) : null}
            <p className={`tnum break-words text-sm text-fg ${isPercent ? "mt-2" : ""}`}>
              {fmt(ok.cgpa)} ÷ 10 × 4 = <strong>{linearStr}</strong>
            </p>
            {ok.band ? (
              <p className="mt-2 text-xs text-fg-muted">
                Band table: {fmt(ok.cgpa)} falls in the {bandRange(ok.band.min)} row, which maps to {ok.band.gpa.toFixed(1)} ({ok.band.letter}).
              </p>
            ) : null}
          </Card>
        ) : null}

        <Card title="10-point CGPA to 4.0 GPA: band table vs linear">
          <table className="tnum w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
                <th scope="col" className="pb-2">
                  CGPA
                </th>
                <th scope="col" className="pb-2 text-right">
                  Band GPA
                </th>
                <th scope="col" className="pb-2 text-right">
                  Linear GPA
                </th>
              </tr>
            </thead>
            <tbody>
              {CGPA_TO_GPA_BANDS.map((b, i) => {
                const upper = i === 0 ? 10 : CGPA_TO_GPA_BANDS[i - 1].min;
                const active = ok?.band?.min === b.min;
                return (
                  <tr key={b.min} className={`border-t border-line ${active ? "bg-bg-sunken font-semibold text-fg" : "text-fg-muted"}`}>
                    <td className="py-2 pl-1">{bandRange(b.min)}</td>
                    <td className="py-2 text-right">
                      {b.gpa.toFixed(1)} <span className="text-xs font-normal text-fg-faint">({b.letter})</span>
                    </td>
                    <td className="py-2 pr-1 text-right">
                      {cgpaToGpaLinear(b.min).toFixed(2)} – {cgpaToGpaLinear(upper).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-fg-muted">The band table is the mapping most Indian students see quoted online; the linear column simply rescales 10 to 4. Neither is an official WES conversion.</p>
        </Card>

        {ok ? <ShareBar text={summary} onReset={reset} /> : null}
      </div>
    </div>
  );
}
