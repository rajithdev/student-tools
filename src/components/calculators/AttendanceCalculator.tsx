"use client";

import { useEffect, useMemo } from "react";
import { calculateAttendance, formatPercent, type AttendanceResult } from "@/lib/calc/attendance";
import { parseNum } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { NumberField, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, Meter, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";

const PRESETS = [75, 80, 85, 90];

const defaults = { a: "", t: "", r: "75", g: "", rem: "" };

function classes(n: number) {
  return n === 1 ? "1 class" : `${n} classes`;
}

export function AttendanceCalculator({ variant = "full", initialRequired = "75" }: { variant?: "full" | "planner"; initialRequired?: string }) {
  const d = useMemo(() => ({ ...defaults, r: initialRequired }), [initialRequired]);
  const { state, update, reset } = useUrlState(d, (p) => ({
    a: num(p, "a") ?? num(p, "attended"),
    t: num(p, "t") ?? num(p, "total"),
    r: num(p, "r") ?? num(p, "required"),
    g: num(p, "g") ?? num(p, "target"),
    rem: num(p, "rem") ?? num(p, "remaining"),
  }));

  const attended = parseNum(state.a);
  const total = parseNum(state.t);
  const required = parseNum(state.r);
  const target = parseNum(state.g);
  const remaining = parseNum(state.rem);
  const touched = attended !== undefined || total !== undefined;

  const result = useMemo(() => {
    if (!touched) return null;
    return calculateAttendance({
      attended: attended ?? 0,
      total: total ?? 0,
      required: required ?? NaN,
      target: target,
      remaining: variant === "planner" || remaining !== undefined ? remaining : undefined,
    });
  }, [touched, attended, total, required, target, remaining, variant]);

  useEffect(() => {
    if (result?.valid && result.total > 0) trackCalculatorUse(variant === "planner" ? "classes_can_miss" : "attendance", { status: result.status });
  }, [result, variant]);

  const errors = result && !result.valid ? result.errors : {};
  const ok = result && result.valid ? result : null;
  const req = ok?.required ?? required ?? 75;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Classes attended" value={state.a} onChange={(v) => update({ a: v })} min={0} step={1} inputMode="numeric" placeholder="e.g. 42" error={errors.attended} autoFocus />
          <NumberField label="Classes held" value={state.t} onChange={(v) => update({ t: v })} min={0} step={1} inputMode="numeric" placeholder="e.g. 56" error={errors.total} hint="Total conducted so far" />
        </div>
        <div className="mt-5">
          <p className="text-sm font-medium text-fg" id="required-label">
            Required attendance
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2" role="group" aria-labelledby="required-label">
            {PRESETS.map((p) => {
              const active = Number(state.r) === p;
              return (
                <button
                  key={p}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ r: String(p) })}
                  className={`tnum min-h-11 rounded-xl border px-4 text-sm font-semibold ${active ? "border-fg bg-fg text-bg" : "border-line-strong bg-bg-elev text-fg hover:border-fg-faint"}`}
                >
                  {p}%
                </button>
              );
            })}
            <div className="relative">
              <label htmlFor="req-custom" className="sr-only">
                Custom required percentage
              </label>
              <input
                id="req-custom"
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="any"
                value={state.r}
                onChange={(e) => update({ r: e.target.value })}
                aria-invalid={errors.required ? true : undefined}
                className={`tnum h-11 w-24 rounded-xl border bg-bg-elev pl-3 pr-7 text-sm font-semibold text-fg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 ${errors.required ? "border-danger" : "border-line-strong"}`}
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-fg-faint">
                %
              </span>
            </div>
          </div>
          {errors.required ? (
            <p role="alert" className="mt-1 text-xs font-medium text-danger">
              {errors.required}
            </p>
          ) : null}
        </div>
        <details className="mt-5 group" open={variant === "planner" || state.g !== "" || state.rem !== ""}>
          <summary className="cursor-pointer select-none text-sm font-medium text-accent">More options</summary>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <NumberField
              size="md"
              label="Classes remaining"
              value={state.rem}
              onChange={(v) => update({ rem: v })}
              min={0}
              step={1}
              inputMode="numeric"
              placeholder="optional"
              hint="Still to be held this term"
              error={errors.remaining}
            />
            <NumberField size="md" label="Personal target" value={state.g} onChange={(v) => update({ g: v })} min={0} max={100} suffix="%" placeholder={String(req)} hint="Aim higher than required" error={errors.target} />
          </div>
        </details>
        {touched ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {ok ? <Results r={ok} variant={variant} onReset={reset} /> : <Placeholder required={req} />}
      </div>
    </div>
  );
}

function Placeholder({ required }: { required: number }) {
  return (
    <HeroResult
      tone="neutral"
      badge="Waiting for numbers"
      value="—"
      unit="%"
      verdict={`Enter classes attended and held to see how many you can miss or must attend for ${formatPercent(required, undefined, required % 1 ? 2 : 0)}%.`}
      sub="Nothing you type leaves your device."
    />
  );
}

function Results({ r, variant, onReset }: { r: AttendanceResult; variant: "full" | "planner"; onReset: () => void }) {
  const reqStr = formatPercent(r.required, undefined, r.required % 1 ? 2 : 0);
  const tgtStr = formatPercent(r.target, undefined, r.target % 1 ? 2 : 0);
  const pctStr = formatPercent(r.percent, r.required);
  const targetDiffers = Math.abs(r.target - r.required) > 1e-9;

  let tone: Tone = "neutral";
  let badge = "";
  let verdict = "";
  let sub: string | undefined;

  if (r.status === "empty") {
    tone = "neutral";
    badge = "No classes yet";
    verdict = `Attend the first ${classes(r.needForRequired)} and you start at 100%.`;
  } else if (r.status === "below") {
    tone = "danger";
    badge = `Below ${reqStr}%`;
    verdict = Number.isFinite(r.needForRequired)
      ? `Attend the next ${classes(r.needForRequired)} in a row to reach ${reqStr}%.`
      : `You cannot reach ${reqStr}% because every missed class counts against you.`;
    sub = `You are ${formatPercent(Math.abs(r.marginToRequired))} percentage points short. Every class you miss now pushes the goal further away.`;
  } else if (r.status === "exact") {
    tone = "warn";
    badge = `Exactly ${reqStr}%`;
    verdict = `You are right on the line. Miss one class and you drop to ${formatPercent(r.afterMissing[0].percent, r.required)}%.`;
    sub = `Attend the next class to build a buffer (${formatPercent(r.afterAttending[0].percent, r.required)}%).`;
  } else {
    tone = r.canMiss === 0 ? "warn" : "safe";
    badge = r.canMiss === 0 ? "Safe, no buffer" : "Safe to miss";
    verdict =
      r.canMiss === Infinity
        ? "No minimum is set, so there is nothing to lose by missing classes."
        : r.canMiss === 0
          ? `You are above ${reqStr}%, but missing even one class drops you to ${formatPercent(r.afterMissing[0].percent, r.required)}%.`
          : `You can miss the next ${classes(r.canMiss)} and stay at or above ${reqStr}%.`;
    sub = r.canMiss > 0 && r.canMiss !== Infinity ? `Miss ${r.canMiss + 1} and you fall to ${formatPercent(r.attended / (r.total + r.canMiss + 1) * 100, r.required)}%.` : undefined;
  }

  const summary = `Attendance ${pctStr}% (${r.attended}/${r.total}). ${verdict}`;

  return (
    <>
      <HeroResult tone={tone} badge={badge} value={pctStr} unit="%" verdict={verdict} sub={sub} />
      <div className="px-1">
        <Meter value={r.percent} threshold={r.required} label={`Attendance ${pctStr}% against a ${reqStr}% requirement`} />
        <div className="tnum mt-1 flex justify-between text-xs text-fg-faint">
          <span>0%</span>
          <span>Required {reqStr}%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Can miss" value={r.canMiss === Infinity ? "∞" : r.canMiss} hint={`and stay ≥ ${reqStr}%`} tone={r.canMiss > 0 ? "safe" : "neutral"} />
        <Stat
          label={r.status === "below" ? "Must attend" : "Buffer"}
          value={r.status === "below" ? (Number.isFinite(r.needForRequired) ? r.needForRequired : "—") : r.status === "empty" ? "—" : `${r.marginToRequired >= 0 ? "+" : ""}${formatPercent(r.marginToRequired)}`}
          hint={r.status === "below" ? `in a row to reach ${reqStr}%` : "percentage points above required"}
          tone={r.status === "below" ? "danger" : "neutral"}
        />
        {targetDiffers ? (
          <Stat label={`For ${tgtStr}% target`} value={r.needForTarget === 0 ? "Reached" : Number.isFinite(r.needForTarget) ? `${r.needForTarget} more` : "Not reachable"} hint={r.needForTarget > 0 && Number.isFinite(r.needForTarget) ? "consecutive classes to attend" : undefined} tone={r.needForTarget === 0 ? "safe" : "warn"} />
        ) : null}
      </div>

      {r.remaining ? <RemainingCard r={r} reqStr={reqStr} tgtStr={tgtStr} targetDiffers={targetDiffers} /> : null}

      <Card title="What happens next">
        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectionTable caption="If you miss the next…" rows={r.afterMissing} threshold={r.required} />
          <ProjectionTable caption="If you attend the next…" rows={r.afterAttending} threshold={r.required} />
        </div>
      </Card>

      {variant === "full" && r.total > 0 ? <Ladder r={r} /> : null}

      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}

function ProjectionTable({ caption, rows, threshold }: { caption: string; rows: { k: number; percent: number }[]; threshold: number }) {
  return (
    <table className="tnum w-full text-sm">
      <caption className="mb-1.5 text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Classes</th>
          <th scope="col">Attendance</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const below = row.percent < threshold - 1e-9;
          return (
            <tr key={row.k} className="border-t border-line">
              <td className="py-2 text-fg-muted">{classes(row.k)}</td>
              <td className={`py-2 text-right font-semibold ${below ? "text-danger" : "text-safe"}`}>{formatPercent(row.percent, threshold)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function RemainingCard({ r, reqStr, tgtStr, targetDiffers }: { r: AttendanceResult; reqStr: string; tgtStr: string; targetDiffers: boolean }) {
  const rem = r.remaining!;
  const impossible = !Number.isFinite(rem.mustAttendForRequired);
  return (
    <Card title={`Over the remaining ${classes(rem.remaining)}`}>
      {impossible ? (
        <p className="rounded-xl bg-danger-bg p-3 text-sm font-medium text-danger">
          Even if you attend every remaining class you finish at {formatPercent(rem.maxPossible, r.required)}%, below {reqStr}%. Talk to your department about condonation or make-up options now.
        </p>
      ) : (
        <p className="text-sm text-fg">
          Attend at least <strong className="tnum">{rem.mustAttendForRequired}</strong> of the remaining {rem.remaining} to finish at or above {reqStr}%. You can skip up to <strong className="tnum">{rem.canSkipForRequired}</strong>.
        </p>
      )}
      {targetDiffers ? (
        <p className="mt-2 text-sm text-fg-muted">
          For your {tgtStr}% target: {Number.isFinite(rem.mustAttendForTarget) ? `attend ${rem.mustAttendForTarget}, skip up to ${rem.canSkipForTarget}.` : `not reachable this term (max ${formatPercent(rem.maxPossible, r.target)}%).`}
        </p>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat label="Best case" value={`${formatPercent(rem.maxPossible, r.required)}%`} hint="attend everything" tone={rem.maxPossible >= r.required - 1e-9 ? "safe" : "danger"} />
        <Stat label="Worst case" value={`${formatPercent(rem.minPossible, r.required)}%`} hint="miss everything" tone={rem.minPossible >= r.required - 1e-9 ? "safe" : "danger"} />
      </div>
    </Card>
  );
}

function Ladder({ r }: { r: AttendanceResult }) {
  const rows = PRESETS.map((p) => {
    const res = calculateAttendance({ attended: r.attended, total: r.total, required: p });
    if (!res.valid) return null;
    return { p, canMiss: res.canMiss, need: res.needForRequired, ok: res.status === "safe" || res.status === "exact" };
  }).filter(Boolean) as { p: number; canMiss: number; need: number; ok: boolean }[];
  return (
    <Card title="Where you stand at every common threshold">
      <table className="tnum w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
            <th scope="col" className="pb-2">
              Threshold
            </th>
            <th scope="col" className="pb-2">
              Status
            </th>
            <th scope="col" className="pb-2 text-right">
              Can miss
            </th>
            <th scope="col" className="pb-2 text-right">
              Need to attend
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.p} className="border-t border-line">
              <td className="py-2 font-semibold text-fg">{row.p}%</td>
              <td className={`py-2 font-medium ${row.ok ? "text-safe" : "text-danger"}`}>{row.ok ? "Above" : "Below"}</td>
              <td className="py-2 text-right text-fg">{row.canMiss === Infinity ? "∞" : row.canMiss}</td>
              <td className="py-2 text-right text-fg">{row.need === 0 ? "—" : Number.isFinite(row.need) ? row.need : "n/a"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
