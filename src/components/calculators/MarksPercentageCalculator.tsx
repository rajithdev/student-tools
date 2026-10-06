"use client";

import { useEffect, useId, useMemo } from "react";
import { marksPercentage, marksForPercent, type MarksResult } from "@/lib/calc/grades";
import { parseNum, fmt, EPS } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { NumberField, Segmented, Toggle, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, StatusBadge, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";

type Mode = "t" | "s" | "r";
const MODES: Mode[] = ["t", "s", "r"];
const TOTAL_PRESETS = [100, 500, 600, 700, 1000];
const NUM_RE = /^-?\d*\.?\d*$/;
const MAX_ROWS = 30;

interface Row {
  name: string;
  obtained: string;
  max: string;
}

/** Rows travel in the URL as "name:obtained/max|obtained/max". Names are stripped of the separators. */
const cleanName = (s: string) => s.replace(/[:/|]/g, " ").slice(0, 40);
const encodeRows = (rows: Row[]) => rows.map((r) => `${r.name ? `${r.name}:` : ""}${r.obtained}/${r.max}`).join("|");
function decodeRows(s: string): Row[] {
  return s
    .split("|")
    .slice(0, MAX_ROWS)
    .map((part) => {
      const i = part.indexOf(":");
      const [obtained = "", max = ""] = part.slice(i + 1).split("/");
      return { name: cleanName(i >= 0 ? part.slice(0, i) : ""), obtained: NUM_RE.test(obtained) ? obtained : "", max: NUM_RE.test(max) ? max : "" };
    });
}
const blankRow = (): Row => ({ name: "", obtained: "", max: "100" });
const DEFAULT_ROWS = encodeRows(Array.from({ length: 5 }, blankRow));

/** Typical Indian board bands; boards differ, which the UI says. */
function band(pct: number): { label: string; tone: Tone } {
  if (pct >= 90 - EPS) return { label: "Outstanding", tone: "safe" };
  if (pct >= 75 - EPS) return { label: "Distinction", tone: "safe" };
  if (pct >= 60 - EPS) return { label: "First division", tone: "safe" };
  if (pct >= 45 - EPS) return { label: "Second division", tone: "warn" };
  if (pct >= 33 - EPS) return { label: "Pass", tone: "warn" };
  return { label: "Below pass mark", tone: "danger" };
}

type View =
  | { kind: "empty" }
  | { kind: "error"; fields: Record<string, string>; rows: Record<number, string> }
  | { kind: "pct"; percent: number; obtained: number; max: number; res: MarksResult; explain: string }
  | { kind: "rev"; needed: number; target: number; total: number; sf?: number };

const defaults = { m: "t", o: "", t: "", r: DEFAULT_ROWS, b5: "", p: "", sf: "" };

export function MarksPercentageCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    m: MODES.find((v) => v === p.get("m")),
    o: num(p, "o"),
    t: num(p, "t"),
    p: num(p, "p"),
    sf: num(p, "sf"),
    r: p.get("r") ? encodeRows(decodeRows(p.get("r")!)) : undefined,
    b5: p.get("b5") === "1" ? "1" : undefined,
  }));
  const mode = state.m as Mode;
  const rows = useMemo(() => decodeRows(state.r), [state.r]);
  const bestOf5 = state.b5 === "1";
  const setRows = (next: Row[]) => update({ r: encodeRows(next) });
  const setRow = (i: number, patch: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const view = useMemo<View>(() => {
    if (mode === "t") {
      const obtained = parseNum(state.o);
      const total = parseNum(state.t);
      if (obtained === undefined) return { kind: "empty" };
      const res = marksPercentage([{ obtained, max: total ?? NaN }]);
      if (!res.valid) {
        const totalBad = total === undefined || !Number.isFinite(total) || total <= 0;
        const obtainedBad = !Number.isFinite(obtained) || obtained < 0;
        return { kind: "error", fields: obtainedBad || !totalBad ? { o: res.errors[0] } : { t: res.errors[0] }, rows: {} };
      }
      return { kind: "pct", percent: res.percent, obtained: res.obtained, max: res.max, res, explain: `${fmt(res.obtained)} ÷ ${fmt(res.max)} × 100 = ${fmt(res.percent)}%` };
    }
    if (mode === "s") {
      if (!rows.some((r) => r.obtained !== "")) return { kind: "empty" };
      const items = rows.map((r) => (r.obtained === "" ? {} : { obtained: parseNum(r.obtained), max: parseNum(r.max) }));
      const res = marksPercentage(items, { bestOf: bestOf5 ? 5 : undefined });
      if (!res.valid) return { kind: "error", fields: {}, rows: res.errors };
      return { kind: "pct", percent: res.percent, obtained: res.obtained, max: res.max, res, explain: `${fmt(res.obtained)} ÷ ${fmt(res.max)} × 100 = ${fmt(res.percent)}%` };
    }
    const target = parseNum(state.p);
    const total = parseNum(state.t);
    const sf = parseNum(state.sf);
    if (target === undefined) return { kind: "empty" };
    const fields: Record<string, string> = {};
    if (!Number.isFinite(target) || target < 0 || target > 100) fields.p = "Target must be between 0 and 100.";
    if (total === undefined || !Number.isFinite(total) || total <= 0) fields.t = "Enter the total marks (greater than 0).";
    if (sf !== undefined && (!Number.isFinite(sf) || sf < 0)) fields.sf = "Marks so far must be 0 or more.";
    else if (sf !== undefined && total !== undefined && sf > total + EPS) fields.sf = "Marks so far cannot exceed the total.";
    if (Object.keys(fields).length) return { kind: "error", fields, rows: {} };
    return { kind: "rev", needed: marksForPercent(target, total!), target, total: total!, sf };
  }, [mode, state.o, state.t, state.p, state.sf, rows, bestOf5]);

  useEffect(() => {
    if (view.kind === "pct" || view.kind === "rev") trackCalculatorUse("marks_percentage", { mode });
  }, [view, mode]);

  const fieldErrors = view.kind === "error" ? view.fields : {};
  const rowErrors = view.kind === "error" ? view.rows : {};
  const touched = view.kind !== "empty";

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented<Mode>
          label="How do you want to calculate?"
          value={mode}
          onChange={(m) => update({ m })}
          options={[
            { value: "t", label: "Total marks" },
            { value: "s", label: "Subject-wise" },
            { value: "r", label: "Reverse: marks needed" },
          ]}
        />

        {mode === "t" ? (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <NumberField label="Marks obtained" value={state.o} onChange={(v) => update({ o: v })} min={0} placeholder="e.g. 432" error={fieldErrors.o} autoFocus />
            <NumberField label="Total marks" value={state.t} onChange={(v) => update({ t: v })} min={0} placeholder="e.g. 500" error={fieldErrors.t} />
          </div>
        ) : null}

        {mode === "r" ? (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <NumberField label="Target percentage" value={state.p} onChange={(v) => update({ p: v })} min={0} max={100} suffix="%" placeholder="e.g. 90" error={fieldErrors.p} autoFocus />
            <NumberField label="Total marks" value={state.t} onChange={(v) => update({ t: v })} min={0} placeholder="e.g. 500" error={fieldErrors.t} />
            <NumberField size="md" className="col-span-2" label="Marks so far (optional)" value={state.sf} onChange={(v) => update({ sf: v })} min={0} placeholder="optional" hint="Marks already in hand, to see how many more you need" error={fieldErrors.sf} />
          </div>
        ) : null}

        {mode !== "s" ? <TotalPresets value={state.t} onPick={(t) => update({ t })} /> : null}

        {mode === "s" ? (
          <div className="mt-5">
            <SubjectRows rows={rows} errors={rowErrors} onChange={setRow} onRemove={(i) => setRows(rows.filter((_, j) => j !== i))} />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <Button onClick={() => setRows([...rows, blankRow()])} className={rows.length >= MAX_ROWS ? "invisible" : ""}>
                + Add subject
              </Button>
              <Toggle label="Best of 5" checked={bestOf5} onChange={(v) => update({ b5: v ? "1" : "" })} hint={bestOf5 && rows.filter((r) => r.obtained !== "").length <= 5 ? "Enter more than five subjects to drop the lowest" : "Count only your 5 highest subjects"} />
            </div>
          </div>
        ) : null}

        {touched ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {view.kind === "pct" ? <PercentResults v={view} mode={mode} names={rows.map((r) => r.name)} onReset={reset} /> : view.kind === "rev" ? <ReverseResults v={view} onReset={reset} /> : <Placeholder mode={mode} />}
      </div>
    </div>
  );
}

function TotalPresets({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const id = useId();
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-fg" id={id}>
        Common totals
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2" role="group" aria-labelledby={id}>
        {TOTAL_PRESETS.map((p) => {
          const active = Number(value) === p;
          return (
            <button key={p} type="button" aria-pressed={active} onClick={() => onPick(String(p))} className={`tnum min-h-11 rounded-xl border px-4 text-sm font-semibold ${active ? "border-fg bg-fg text-bg" : "border-line-strong bg-bg-elev text-fg hover:border-fg-faint"}`}>
              {p}
            </button>
          );
        })}
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

const rowGrid = "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_2.75rem] items-center gap-2";

function SubjectRows({ rows, errors, onChange, onRemove }: { rows: Row[]; errors: Record<number, string>; onChange: (i: number, patch: Partial<Row>) => void; onRemove: (i: number) => void }) {
  return (
    <div className="space-y-2">
      <div aria-hidden="true" className={`${rowGrid} text-xs font-semibold uppercase tracking-wider text-fg-faint`}>
        <span>Subject</span>
        <span>Obtained</span>
        <span>Max</span>
        <span />
      </div>
      {rows.map((row, i) => (
        <div key={i}>
          <div className={rowGrid}>
            <Cell text label={`Subject ${i + 1} name`} value={row.name} onChange={(v) => onChange(i, { name: cleanName(v) })} placeholder={`Subject ${i + 1}`} />
            <Cell label={`Subject ${i + 1} marks obtained`} value={row.obtained} onChange={(v) => onChange(i, { obtained: v })} placeholder="e.g. 72" error={errors[i]} />
            <Cell label={`Subject ${i + 1} maximum marks`} value={row.max} onChange={(v) => onChange(i, { max: v })} placeholder="100" />
            <button type="button" aria-label={`Remove subject ${i + 1}`} disabled={rows.length <= 1} onClick={() => onRemove(i)} className="flex h-11 w-11 items-center justify-center rounded-xl text-xl text-fg-muted hover:bg-bg-sunken hover:text-fg disabled:opacity-40">
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

function Placeholder({ mode }: { mode: Mode }) {
  const verdict = mode === "r" ? "Enter a target percentage and the total marks to see how many marks you need." : mode === "s" ? "Fill in the marks for each subject to see your overall percentage." : "Enter marks obtained and total marks to see your percentage.";
  return <HeroResult tone="neutral" badge="Waiting for numbers" value="—" unit={mode === "r" ? "marks" : "%"} verdict={verdict} sub="Nothing you type leaves your device." />;
}

function PercentResults({ v, mode, names, onReset }: { v: Extract<View, { kind: "pct" }>; mode: Mode; names: string[]; onReset: () => void }) {
  const b = band(v.percent);
  const pct = fmt(v.percent, 2);
  const dropped = v.res.rows.filter((r) => !r.counted);
  const verdict = `You scored ${fmt(v.obtained)} out of ${fmt(v.max)}${dropped.length ? `, counting your best ${v.res.counted} of ${v.res.rows.length} subjects` : ""}.`;
  const summary = `Marks percentage ${pct}% (${fmt(v.obtained)}/${fmt(v.max)}) — ${b.label}.`;
  return (
    <>
      <HeroResult tone={b.tone} badge={b.label} value={pct} unit="%" verdict={verdict} sub={<span className="tnum">{v.explain}</span>} />
      <p className="px-1 text-xs text-fg-faint">Bands are typical Indian board bands (90 Outstanding, 75 Distinction, 60 First division, 45 Second division, 33 Pass); your board may differ.</p>
      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="CGPA equivalent"
          value={fmt(v.percent / 9.5, 2)}
          hint={
            <>
              Percentage ÷ 9.5 (CBSE formula).{" "}
              <a href="/cgpa-to-percentage/" className="font-medium text-accent underline-offset-2 hover:underline">
                Convert CGPA ↔ percentage
              </a>
            </>
          }
        />
        <Stat label="Marks lost" value={fmt(v.max - v.obtained)} hint={`out of ${fmt(v.max)} counted`} tone={v.max - v.obtained > 0 ? "neutral" : "safe"} />
      </div>
      {mode === "s" ? (
        <Card title="Subject breakdown">
          <table className="tnum w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
                <th scope="col" className="pb-2">Subject</th>
                <th scope="col" className="pb-2 text-right">Marks</th>
                <th scope="col" className="pb-2 text-right">%</th>
                <th scope="col" className="pb-2 text-right">Counted</th>
              </tr>
            </thead>
            <tbody>
              {v.res.rows.map((r) => (
                <tr key={r.index} className={`border-t border-line ${r.counted ? "" : "text-fg-faint line-through decoration-fg-faint/60"}`}>
                  <td className="py-2 font-medium">{names[r.index] || `Subject ${r.index + 1}`}</td>
                  <td className="py-2 text-right">{fmt(r.obtained)}/{fmt(r.max)}</td>
                  <td className="py-2 text-right font-semibold">{fmt(r.percent)}%</td>
                  <td className="py-2 text-right">{r.counted ? <span className="text-safe">Yes</span> : <StatusBadge tone="warn">Dropped</StatusBadge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}

function ReverseResults({ v, onReset }: { v: Extract<View, { kind: "rev" }>; onReset: () => void }) {
  const b = band(v.target);
  const more = v.sf !== undefined ? v.needed - v.sf : undefined;
  const verdict = `Score at least ${fmt(v.needed, 2)} out of ${fmt(v.total)} to reach ${fmt(v.target)}%.`;
  const summary = `Need ${fmt(v.needed, 2)}/${fmt(v.total)} marks for ${fmt(v.target)}%.`;
  return (
    <>
      <HeroResult tone={b.tone} badge={`${b.label} target`} value={fmt(v.needed, 2)} unit="marks" verdict={verdict} sub={<span className="tnum">{`${fmt(v.target)} ÷ 100 × ${fmt(v.total)} = ${fmt(v.needed, 2)}`}</span>} />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Can lose" value={fmt(v.total - v.needed, 2)} hint="marks and still hit the target" />
        {more !== undefined ? (
          <Stat label="Still needed" value={more <= EPS ? "Done" : fmt(more, 2)} hint={more <= EPS ? `your ${fmt(v.sf!)} already meets ${fmt(v.target)}%` : `on top of your ${fmt(v.sf!)} so far (${fmt((v.sf! / v.total) * 100)}% now)`} tone={more <= EPS ? "safe" : "warn"} />
        ) : (
          <Stat label="Target band" value={b.label} hint="typical Indian board bands; yours may differ" tone={b.tone} />
        )}
      </div>
      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}
