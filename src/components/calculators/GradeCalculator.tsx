"use client";

import { useEffect, useId, useMemo } from "react";
import { weightedGrade, GRADE_SCALES, getScale, letterFor, type GradeScale, type GradeBand, type WeightedGradeResult } from "@/lib/calc/grades";
import { parseNum, fmt, EPS } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { NumberField, SelectField, Segmented, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";

type Mode = "w" | "s";
const NUM_RE = /^-?\d*\.?\d*$/;
const MAX_ROWS = 30;
const SCALE_SHORT: Record<string, string> = { "us-plus-minus": "US scale", "us-simple": "US scale", "india-10": "Indian 10-point scale", "uk-honours": "UK honours scale" };

interface Row {
  name: string;
  score: string;
  outOf: string;
  weight: string;
}

/** Rows travel in the URL as "name:score/outOf/weight|score/outOf/weight". Names are stripped of the separators. */
const cleanName = (s: string) => s.replace(/[:/|]/g, " ").slice(0, 40);
const encodeRows = (rows: Row[]) => rows.map((r) => `${r.name ? `${r.name}:` : ""}${r.score}/${r.outOf}/${r.weight}`).join("|");
function decodeRows(s: string): Row[] {
  return s
    .split("|")
    .slice(0, MAX_ROWS)
    .map((part) => {
      const i = part.indexOf(":");
      const [score = "", outOf = "", weight = ""] = part.slice(i + 1).split("/");
      const n = (v: string) => (NUM_RE.test(v) ? v : "");
      return { name: cleanName(i >= 0 ? part.slice(0, i) : ""), score: n(score), outOf: n(outOf), weight: n(weight) };
    });
}
const blankRow = (): Row => ({ name: "", score: "", outOf: "100", weight: "" });
const DEFAULT_ROWS = encodeRows(Array.from({ length: 4 }, blankRow));

/** Human range for a band, e.g. "87–89%", "97% and above", "below 60%". */
function bandRange(scale: GradeScale, band: GradeBand): string {
  const i = scale.bands.indexOf(band);
  const upper = i > 0 ? scale.bands[i - 1].min : undefined;
  if (upper === undefined) return `${fmt(band.min)}% and above`;
  if (band.min <= 0) return `below ${fmt(upper)}%`;
  return `${fmt(band.min)}–${fmt(upper - 1)}%`;
}
const nextBand = (scale: GradeScale, band: GradeBand): GradeBand | undefined => scale.bands[scale.bands.indexOf(band) - 1];
/** Fail band → danger; upper half of passing bands → safe; lower half → warn. */
function toneFor(band: GradeBand | undefined, scale: GradeScale): Tone {
  if (!band) return "neutral";
  if (band.min <= 0) return "danger";
  const passing = scale.bands.filter((b) => b.min > 0);
  return passing.indexOf(band) < Math.ceil(passing.length / 2) ? "safe" : "warn";
}

const defaults = { m: "w", r: DEFAULT_ROWS, sc: "us-plus-minus", s: "", o: "100" };

export function GradeCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    m: (["w", "s"] as Mode[]).find((v) => v === p.get("m")),
    r: p.get("r") ? encodeRows(decodeRows(p.get("r")!)) : undefined,
    sc: GRADE_SCALES.find((s) => s.id === p.get("sc"))?.id,
    s: num(p, "s"),
    o: num(p, "o"),
  }));
  const mode = state.m as Mode;
  const scale = getScale(state.sc);
  const rows = useMemo(() => decodeRows(state.r), [state.r]);
  const setRows = (next: Row[]) => update({ r: encodeRows(next) });
  const setRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const single = { score: parseNum(state.s), outOf: parseNum(state.o) };
  const result = useMemo(() => {
    if (mode === "s") {
      if (single.score === undefined) return null;
      return weightedGrade([{ score: single.score, outOf: single.outOf ?? NaN, weight: 1 }]);
    }
    if (!rows.some((r) => r.score !== "" || r.weight !== "")) return null;
    return weightedGrade(rows.map((r) => (r.score === "" && r.weight === "" ? {} : { score: parseNum(r.score), outOf: parseNum(r.outOf), weight: parseNum(r.weight) })));
  }, [mode, single.score, single.outOf, rows]);

  const ok = result && result.valid && Number.isFinite(result.percent) ? result : null;
  const rowErrors: Record<number, string> = result && !result.valid ? result.errors : {};
  // Single-test mode: the lib reports one message per row; put it under the field that is actually wrong.
  const outOfBad = single.outOf === undefined || !Number.isFinite(single.outOf) || single.outOf <= 0;
  const scoreBad = single.score !== undefined && (!Number.isFinite(single.score) || single.score < 0);
  const singleErr = { s: !scoreBad && outOfBad ? undefined : rowErrors[0], o: !scoreBad && outOfBad ? rowErrors[0] : undefined };

  useEffect(() => {
    if (ok) trackCalculatorUse("grade", { mode });
  }, [ok, mode]);

  const scaleField = <SelectField label="Grading scale" value={state.sc} onChange={(v) => update({ sc: v })} options={GRADE_SCALES.map((s) => ({ value: s.id, label: s.name }))} />;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented<Mode>
          label="What are you grading?"
          value={mode}
          onChange={(m) => update({ m })}
          options={[
            { value: "w", label: "Weighted grade" },
            { value: "s", label: "Single test score" },
          ]}
        />
        {mode === "s" ? (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <NumberField label="Score" value={state.s} onChange={(v) => update({ s: v })} min={0} placeholder="e.g. 87" error={singleErr.s} autoFocus />
            <NumberField label="Out of" value={state.o} onChange={(v) => update({ o: v })} min={0} placeholder="100" error={singleErr.o} />
            <div className="col-span-2">{scaleField}</div>
          </div>
        ) : (
          <div className="mt-5">
            <GradeRows rows={rows} errors={rowErrors} onChange={setRow} onRemove={(i) => setRows(rows.filter((_, j) => j !== i))} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {rows.length < MAX_ROWS ? <Button onClick={() => setRows([...rows, blankRow()])}>+ Add row</Button> : <span />}
              {result && result.valid ? (
                <p className={`tnum text-sm font-medium ${Math.abs(result.totalWeight - 100) > EPS ? "text-warn" : "text-fg-muted"}`}>
                  Total weight {fmt(result.totalWeight)}%{Math.abs(result.totalWeight - 100) > EPS ? " (not 100%, average is normalised)" : ""}
                </p>
              ) : null}
            </div>
            <div className="mt-5">{scaleField}</div>
          </div>
        )}
        {result ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {ok ? (
          <Results r={ok} names={rows.map((r) => r.name)} scale={scale} mode={mode} single={{ score: single.score ?? 0, outOf: single.outOf ?? 100 }} onReset={reset} />
        ) : (
          <HeroResult tone="neutral" badge="Waiting for numbers" value="—" unit="%" verdict={mode === "s" ? "Enter a score and what it was out of to see the percentage and letter grade." : "Enter a score and weight for each item to see your weighted grade."} sub={result && result.valid ? "Add weights greater than 0 to compute an average." : "Nothing you type leaves your device."} />
        )}
      </div>
    </div>
  );
}

const cellClass = (error?: string) =>
  `tnum h-12 w-full rounded-xl border bg-bg-elev px-3 text-base text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 ${error ? "border-danger" : "border-line-strong hover:border-fg-faint"}`;

function Cell({ label, value, onChange, text, error, placeholder }: { label: string; value: string; onChange: (v: string) => void; text?: boolean; error?: string; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {text ? (
        <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cellClass()} />
      ) : (
        <input id={id} type="number" inputMode="decimal" min={0} step="any" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} className={cellClass(error)} />
      )}
    </div>
  );
}

const rowGrid = "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2";

function GradeRows({ rows, errors, onChange, onRemove }: { rows: Row[]; errors: Record<number, string>; onChange: (i: number, patch: Partial<Row>) => void; onRemove: (i: number) => void }) {
  return (
    <div className="space-y-2">
      <div aria-hidden="true" className={`${rowGrid} text-xs font-semibold uppercase tracking-wider text-fg-faint`}>
        <span>Item</span>
        <span>Score</span>
        <span>Out of</span>
        <span>Weight %</span>
        <span />
      </div>
      {rows.map((row, i) => (
        <div key={i}>
          <div className={rowGrid}>
            <Cell text label={`Item ${i + 1} name`} value={row.name} onChange={(v) => onChange(i, { name: cleanName(v) })} placeholder={`Item ${i + 1}`} />
            <Cell label={`Item ${i + 1} score`} value={row.score} onChange={(v) => onChange(i, { score: v })} placeholder="e.g. 85" error={errors[i]} />
            <Cell label={`Item ${i + 1} out of`} value={row.outOf} onChange={(v) => onChange(i, { outOf: v })} placeholder="100" />
            <Cell label={`Item ${i + 1} weight percent`} value={row.weight} onChange={(v) => onChange(i, { weight: v })} placeholder="e.g. 25" />
            <button type="button" aria-label={`Remove item ${i + 1}`} disabled={rows.length <= 1} onClick={() => onRemove(i)} className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-fg-muted hover:bg-bg-sunken hover:text-fg disabled:opacity-40">
              ×
            </button>
          </div>
          {errors[i] ? (
            <p role="alert" className="mt-1 text-xs font-medium text-danger">
              {errors[i]}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Results({ r, names, scale, mode, single, onReset }: { r: WeightedGradeResult; names: string[]; scale: GradeScale; mode: Mode; single: { score: number; outOf: number }; onReset: () => void }) {
  const band = letterFor(r.percent, scale);
  const next = band ? nextBand(scale, band) : undefined;
  const pct = fmt(r.percent, 2);
  const letter = band?.letter ?? "—";
  const verdict = band ? `${letter} on the ${SCALE_SHORT[scale.id] ?? scale.name} (${bandRange(scale, band)}).` : "No matching grade band.";
  const weightShort = r.totalWeight < 100 - EPS;
  const remaining = 100 - r.totalWeight;
  const needNext = next && weightShort ? (next.min * 100 - r.percent * r.totalWeight) / remaining : undefined;
  const explain =
    mode === "s"
      ? `${fmt(single.score)} ÷ ${fmt(single.outOf)} × 100 = ${pct}%`
      : `(${r.rows.map((x) => `${fmt(x.percent)} × ${fmt(x.weight)}`).join(" + ")}) ÷ ${fmt(r.totalWeight)} = ${pct}%`;
  const summary = `Grade ${pct}% = ${letter} (${SCALE_SHORT[scale.id] ?? scale.name}).`;

  return (
    <>
      <HeroResult tone={toneFor(band, scale)} badge={letter} value={pct} unit="%" verdict={verdict} sub={<span className="tnum break-words">{explain}</span>} />
      <div className="grid grid-cols-2 gap-3">
        {scale.maxPoints > 0 && band ? <Stat label="Grade points" value={fmt(band.points, 2)} hint={`out of ${scale.maxPoints} on this scale`} /> : null}
        {mode === "s" ? (
          next ? (
            <Stat label={`To reach ${next.letter}`} value={`+${fmt(next.min - r.percent, 2)} pts`} hint={`${fmt(((next.min - r.percent) / 100) * single.outOf, 2)} more marks out of ${fmt(single.outOf)}`} tone="warn" />
          ) : (
            <Stat label="Next letter" value="Top grade" hint="nothing above this band" tone="safe" />
          )
        ) : weightShort && next ? (
          <Stat
            label={`What if: to reach ${next.letter}`}
            value={needNext! <= EPS ? "Already there" : needNext! > 100 + EPS ? "Not reachable" : `${fmt(needNext!, 1)}%`}
            hint={needNext! > 100 + EPS ? `even 100% on the remaining ${fmt(remaining)}% gives ${fmt((r.percent * r.totalWeight + 100 * remaining) / 100, 2)}%` : `average needed on the remaining ${fmt(remaining)}% of the course`}
            tone={needNext! <= EPS ? "safe" : needNext! > 100 + EPS ? "danger" : "warn"}
          />
        ) : mode === "w" && !weightShort ? (
          <Stat label="Course weight" value={`${fmt(r.totalWeight)}%`} hint={next ? `${fmt(next.min - r.percent, 2)} pts below ${next.letter}` : "all items counted"} />
        ) : null}
      </div>
      {mode === "w" ? (
        <Card title="What each item contributes">
          <table className="tnum w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
                <th scope="col" className="pb-2">Item</th>
                <th scope="col" className="pb-2 text-right">Score</th>
                <th scope="col" className="pb-2 text-right">Weight</th>
                <th scope="col" className="pb-2 text-right">Adds</th>
              </tr>
            </thead>
            <tbody>
              {r.rows.map((x) => (
                <tr key={x.index} className="border-t border-line">
                  <td className="py-2 font-medium text-fg">{names[x.index] || `Item ${x.index + 1}`}</td>
                  <td className="py-2 text-right text-fg">{fmt(x.percent)}%</td>
                  <td className="py-2 text-right text-fg-muted">{fmt(x.weight)}%</td>
                  <td className="py-2 text-right font-semibold text-fg">{fmt(x.contribution, 2)}</td>
                </tr>
              ))}
              <tr className="border-t border-line-strong font-semibold">
                <td className="py-2 text-fg">Total</td>
                <td />
                <td className={`py-2 text-right ${weightShort || r.totalWeight > 100 + EPS ? "text-warn" : "text-fg"}`}>{fmt(r.totalWeight)}%</td>
                <td className="py-2 text-right text-fg">{pct}</td>
              </tr>
            </tbody>
          </table>
          {Math.abs(r.totalWeight - 100) > EPS ? <p className="mt-3 text-xs font-medium text-warn">Weights add up to {fmt(r.totalWeight)}%, not 100%. The average is normalised to the weights you entered.</p> : null}
        </Card>
      ) : null}
      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}
