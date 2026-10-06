"use client";

import { useEffect, useMemo } from "react";
import { gpa } from "@/lib/calc/gpa";
import { getScale } from "@/lib/calc/grades";
import { parseNum, fmt, EPS } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { Segmented, Toggle, Button, NumberField } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { RowNumber, RowSelect, RowText, RemoveRowButton, RowError, encodeRows, parseRows, cleanNum, cleanOneOf, str } from "./RowFields";

const SCALE = getScale("us-plus-minus");
const LETTERS = SCALE.bands.map((b) => b.letter);
const LEVELS = [
  { value: "", label: "Regular" },
  { value: "h", label: "Honors (+0.5)" },
  { value: "a", label: "AP / IB (+1.0)" },
];
const BONUS: Record<string, number> = { h: 0.5, a: 1 };
const AP_MODES = ["4", "43"] as const;
type ApMode = (typeof AP_MODES)[number];

// Course row = name:credits:letter:level
const defaults = { r: "|||", ap: "4" as ApMode, w: "", pg: "", pc: "", tg: "", tn: "" };

/** Grade points for a letter, with the A+ = 4.3 option and optional honors/AP bonus (passing grades only, capped). */
function pointsFor(letter: string, level: string, ap43: boolean, weighted: boolean, maxPoints: number): number | undefined {
  if (!letter) return undefined;
  let pts = letter === "A+" && ap43 ? 4.3 : (SCALE.bands.find((b) => b.letter === letter)?.points ?? 0);
  if (weighted && pts > 0) pts = Math.min(maxPoints, pts + (BONUS[level] ?? 0));
  return pts;
}

export function GpaCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    r: str(p, "r"),
    ap: cleanOneOf(str(p, "ap") ?? "", AP_MODES) as ApMode | undefined,
    w: str(p, "w") === "1" ? "1" : undefined,
    pg: num(p, "pg"),
    pc: num(p, "pc"),
    tg: num(p, "tg"),
    tn: num(p, "tn"),
  }));

  const ap43 = state.ap === "43";
  const weighted = state.w === "1";
  const maxPoints = weighted ? 5 : ap43 ? 4.3 : 4;

  const rows = useMemo(() => parseRows(state.r, 4, 4).map(([n, c, l, lv]) => [n, cleanNum(c), cleanOneOf(l, LETTERS) ?? "", cleanOneOf(lv, ["", "h", "a"]) ?? ""]), [state.r]);

  const result = useMemo(() => gpa(rows.map(([, c, l, lv]) => ({ credits: parseNum(c), points: pointsFor(l, lv, ap43, weighted, maxPoints) })), maxPoints), [rows, maxPoints, ap43, weighted]);

  const prevGpa = parseNum(state.pg);
  const prevCredits = parseNum(state.pc);
  const prevErrors: { pg?: string; pc?: string } = {};
  if (prevGpa !== undefined && (!Number.isFinite(prevGpa) || prevGpa < 0 || prevGpa > maxPoints + EPS)) prevErrors.pg = `Enter a GPA between 0 and ${maxPoints}.`;
  if (prevCredits !== undefined && (!Number.isFinite(prevCredits) || prevCredits < 0)) prevErrors.pc = "Credits must be 0 or more.";
  const hasPrev = prevGpa !== undefined && prevCredits !== undefined && !prevErrors.pg && !prevErrors.pc && prevCredits > 0;

  const ok = result.valid && Number.isFinite(result.gpa) ? result : null;
  useEffect(() => {
    if (ok) trackCalculatorUse("gpa", { weighted });
  }, [ok, weighted]);

  const errors = result.valid ? {} : result.errors;
  const setRows = (next: string[][]) => update({ r: encodeRows(next) });
  const setCell = (i: number, col: number, v: string) => setRows(rows.map((row, j) => (j === i ? row.map((cell, k) => (k === col ? v : cell)) : row)));

  const cols = weighted ? "grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,3fr)_2.75rem]" : "grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,3fr)_2.75rem]";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Segmented
            label="A+ counts as"
            value={state.ap}
            onChange={(v) => update({ ap: v })}
            options={[
              { value: "4", label: "A+ = 4.0" },
              { value: "43", label: "A+ = 4.3" },
            ]}
          />
          <div className="sm:pt-7">
            <Toggle label="Weighted (honors / AP)" hint="Adds +0.5 for Honors and +1.0 for AP/IB, capped at 5.0." checked={weighted} onChange={(v) => update({ w: v ? "1" : "" })} />
          </div>
        </div>

        <div aria-hidden="true" className={`mt-5 grid gap-2 text-xs font-semibold uppercase tracking-wider text-fg-faint ${cols}`}>
          <span>Course</span>
          <span>Credits</span>
          {weighted ? <span>Level</span> : null}
          <span>Grade</span>
          <span />
        </div>
        <ul className="mt-1.5 space-y-2">
          {rows.map(([n, c, l, lv], i) => (
            <li key={i}>
              <div className={`grid gap-2 ${cols}`}>
                <RowText label={`Course ${i + 1} name (optional)`} value={n} onChange={(v) => setCell(i, 0, v)} placeholder={`Course ${i + 1}`} />
                <RowNumber label={`Course ${i + 1} credits`} value={c} onChange={(v) => setCell(i, 1, v)} min={0} step={0.5} placeholder="3" invalid={!!errors[i]} />
                {weighted ? <RowSelect label={`Course ${i + 1} level`} value={lv} onChange={(v) => setCell(i, 3, v)} options={LEVELS} /> : null}
                <RowSelect label={`Course ${i + 1} grade`} value={l} onChange={(v) => setCell(i, 2, v)} invalid={!!errors[i]} options={[{ value: "", label: "Grade" }, ...SCALE.bands.map((b) => ({ value: b.letter, label: `${b.letter} (${fmt(b.letter === "A+" && ap43 ? 4.3 : b.points, 1)})` }))]} />
                <RemoveRowButton label={`Remove course ${i + 1}`} onClick={() => setRows(rows.filter((_, j) => j !== i))} disabled={rows.length <= 1} />
              </div>
              <RowError message={errors[i]} />
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setRows([...rows, ["", "", "", ""]])}>+ Add course</Button>
          <Button variant="ghost" onClick={reset}>
            Clear
          </Button>
        </div>

        <details className="mt-5" open={state.pg !== "" || state.pc !== "" || state.tg !== "" || state.tn !== ""}>
          <summary className="cursor-pointer select-none text-sm font-medium text-accent">Cumulative GPA and target planner</summary>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <NumberField size="md" label="Previous cumulative GPA" value={state.pg} onChange={(v) => update({ pg: v })} min={0} max={maxPoints} placeholder="e.g. 3.4" error={prevErrors.pg} />
            <NumberField size="md" label="Previous credits" value={state.pc} onChange={(v) => update({ pc: v })} min={0} step={0.5} placeholder="e.g. 60" error={prevErrors.pc} hint="Credits already completed" />
            <NumberField size="md" label="Target cumulative GPA" value={state.tg} onChange={(v) => update({ tg: v })} min={0} max={maxPoints} placeholder="e.g. 3.5" />
            <NumberField size="md" label="Over the next N credits" value={state.tn} onChange={(v) => update({ tn: v })} min={0} step={0.5} placeholder="e.g. 15" />
          </div>
        </details>
      </Card>

      <div className="space-y-4">
        {ok ? (
          <Results semGpa={ok.gpa} semCredits={ok.totalCredits} semPoints={ok.totalPoints} rows={ok.rows} maxPoints={maxPoints} weighted={weighted} ap43={ap43} prev={hasPrev ? { gpa: prevGpa, credits: prevCredits } : undefined} target={parseNum(state.tg)} nextCredits={parseNum(state.tn)} onReset={reset} />
        ) : (
          <HeroResult tone="neutral" badge="Waiting for grades" value="—" verdict="Enter credits and a letter grade for each course to see your GPA." sub="Nothing you type leaves your device." />
        )}
      </div>
    </div>
  );
}

function Results({ semGpa, semCredits, semPoints, rows, maxPoints, weighted, ap43, prev, target, nextCredits, onReset }: { semGpa: number; semCredits: number; semPoints: number; rows: { credits: number; points: number }[]; maxPoints: number; weighted: boolean; ap43: boolean; prev?: { gpa: number; credits: number }; target?: number; nextCredits?: number; onReset: () => void }) {
  const value = semGpa.toFixed(2);
  const band = SCALE.bands.filter((b) => b.letter !== "A+" || ap43).find((b) => semGpa >= b.points - EPS);
  const badge = weighted && semGpa > 4 + EPS ? "Weighted above 4.0" : `≈ ${band?.letter ?? "F"} average`;
  const tone: Tone = semGpa >= 3 ? "safe" : semGpa >= 2 ? "warn" : "danger";

  const cumulativeGpa = prev ? (prev.gpa * prev.credits + semPoints) / (prev.credits + semCredits) : undefined;
  const basePoints = (prev ? prev.gpa * prev.credits : 0) + semPoints;
  const baseCredits = (prev?.credits ?? 0) + semCredits;

  let planner: { needed: number; label: string; tone: Tone } | undefined;
  if (target !== undefined && nextCredits !== undefined && Number.isFinite(target) && Number.isFinite(nextCredits) && nextCredits > 0) {
    const needed = (target * (baseCredits + nextCredits) - basePoints) / nextCredits;
    planner = needed > maxPoints + EPS ? { needed, label: `Not reachable: you would need ${fmt(needed)} but the maximum is ${fmt(maxPoints, 1)}.`, tone: "danger" } : needed <= EPS ? { needed, label: "Already secured. Any passing GPA keeps you at or above target.", tone: "safe" } : { needed, label: `Average at least ${fmt(needed)} over the next ${fmt(nextCredits)} credits.`, tone: needed > maxPoints - 0.3 ? "warn" : "safe" };
  }

  const steps = rows.filter((r) => r.credits > 0).map((r) => `${fmt(r.credits)}×${fmt(r.points)}`);
  const summary = `Semester GPA ${value} on a ${fmt(maxPoints, 1)} scale${cumulativeGpa !== undefined ? `, cumulative ${cumulativeGpa.toFixed(2)}` : ""}.`;

  return (
    <>
      <HeroResult tone={tone} badge={badge} value={value} unit={`/ ${fmt(maxPoints, 1)}`} verdict={`Semester GPA from ${fmt(semPoints)} grade points over ${fmt(semCredits)} credits.`} sub={cumulativeGpa !== undefined ? `New cumulative GPA: ${cumulativeGpa.toFixed(2)} over ${fmt(baseCredits)} credits.` : undefined} />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Credits this term" value={fmt(semCredits)} />
        <Stat label="Grade points" value={fmt(semPoints)} hint="Σ credits × points" />
        {cumulativeGpa !== undefined && prev ? <Stat label="Cumulative GPA" value={cumulativeGpa.toFixed(2)} hint={`was ${fmt(prev.gpa)} over ${fmt(prev.credits)} credits`} tone={cumulativeGpa >= prev.gpa - EPS ? "safe" : "warn"} /> : null}
        {planner ? <Stat label="GPA needed" value={planner.needed > maxPoints + EPS ? "—" : fmt(Math.max(0, planner.needed))} hint={planner.label} tone={planner.tone} /> : null}
      </div>
      <Card title="How this was calculated">
        <p className="tnum break-words text-sm text-fg">
          ({steps.join(" + ")}) ÷ {fmt(semCredits)} = <strong>{value}</strong>
        </p>
        {cumulativeGpa !== undefined && prev ? (
          <p className="tnum mt-2 break-words text-sm text-fg">
            Cumulative: ({fmt(prev.gpa)}×{fmt(prev.credits)} + {fmt(semPoints)}) ÷ ({fmt(prev.credits)} + {fmt(semCredits)}) = <strong>{cumulativeGpa.toFixed(2)}</strong>
          </p>
        ) : null}
        {planner && nextCredits ? (
          <p className="tnum mt-2 break-words text-sm text-fg">
            Needed: ({fmt(target ?? 0)}×({fmt(baseCredits)} + {fmt(nextCredits)}) − {fmt(basePoints)}) ÷ {fmt(nextCredits)} = <strong>{fmt(planner.needed)}</strong>
          </p>
        ) : null}
        <p className="mt-2 text-xs text-fg-muted">GPA = Σ(credits × grade points) ÷ Σ credits.{weighted ? " Honors adds 0.5 and AP/IB adds 1.0 to each passing grade, capped at 5.0." : ""}</p>
      </Card>
      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}
