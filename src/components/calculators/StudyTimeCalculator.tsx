"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { studyDays as countStudyDays, studyPlan, startOfDay, type StudyPlanResult } from "@/lib/calc/study";
import { parseNum, fmt } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { NumberField, Segmented, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { RestDayPicker, parseRestDays, restParam, parseLocalDate, dateParam, formatLongDate, toDateKey, inputClass } from "./RestDayPicker";

type Mode = "date" | "days";
type Source = "h" | "t";

const defaults = { m: "date" as Mode, src: "h" as Source, d: "", days: "", rest: "", rw: "0", h: "", tp: "", hpt: "", hpd: "", pm: "25", bm: "5" };

const MAX_ROWS = 21;
const VISIBLE_ROWS = 7;

interface ScheduleRow {
  key: string;
  label: string;
  minutes: number;
}

function hm(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  if (r === 0) return `${h}h`;
  return `${h}h ${r}m`;
}

function hours(n: number): string {
  return `${fmt(n, 1)} ${Math.abs(n - 1) < 1e-9 ? "hour" : "hours"}`;
}

interface Computed {
  plan: StudyPlanResult;
  studyDays: number;
  totalHours?: number;
  hoursPerDay?: number;
  target: Date | null;
  schedule: ScheduleRow[];
  /** Study days beyond MAX_ROWS not shown in the schedule. */
  hiddenDays: number;
}

interface Derived {
  errors: Partial<Record<"d" | "days" | "rw" | "h" | "tp" | "hpt" | "hpd" | "pm" | "bm", string>>;
  rest: number[];
  restPerWeek: number;
  computed: Computed | null;
}

/** Pure: parse the string state, validate, and build the plan + schedule. `today` is null until mounted. */
function derive(state: typeof defaults, today: Date | null): Derived {
  const mode = state.m;
  const source = state.src;
  const rest = parseRestDays(state.rest);
  const target = mode === "date" && state.d ? parseLocalDate(state.d) : null;

  const daysAvail = parseNum(state.days);
  const restPerWeek = parseNum(state.rw) ?? 0;
  const totalHoursRaw = parseNum(state.h);
  const topics = parseNum(state.tp);
  const hoursPerTopic = parseNum(state.hpt);
  const hoursPerDay = parseNum(state.hpd);
  const pomodoro = parseNum(state.pm);
  const brk = parseNum(state.bm);

  const errors: Derived["errors"] = {};
  if (mode === "date") {
    if (state.d && !target) errors.d = "Enter a valid date.";
    else if (target && today && startOfDay(target).getTime() <= today.getTime()) errors.d = "The exam date must be after today.";
  } else {
    if (daysAvail !== undefined && (!Number.isInteger(daysAvail) || daysAvail < 1)) errors.days = "Enter a whole number of days, 1 or more.";
    if (!Number.isInteger(restPerWeek) || restPerWeek < 0 || restPerWeek > 6) errors.rw = "Rest days per week must be between 0 and 6.";
  }
  if (source === "h") {
    if (totalHoursRaw !== undefined && !(totalHoursRaw >= 0)) errors.h = "Enter total hours of 0 or more.";
  } else {
    if (topics !== undefined && (!Number.isInteger(topics) || topics < 1)) errors.tp = "Enter a whole number of topics, 1 or more.";
    if (hoursPerTopic !== undefined && !(hoursPerTopic > 0)) errors.hpt = "Hours per topic must be greater than 0.";
  }
  if (hoursPerDay !== undefined && !(hoursPerDay >= 0 && hoursPerDay <= 24)) errors.hpd = "Hours per day must be between 0 and 24.";
  if (pomodoro !== undefined && !(pomodoro > 0)) errors.pm = "Session length must be greater than 0.";
  if (brk !== undefined && !(brk >= 0)) errors.bm = "Break length must be 0 or more.";
  const hasErrors = Object.values(errors).some(Boolean);

  const totalHours = source === "h" ? totalHoursRaw : topics !== undefined && hoursPerTopic !== undefined ? topics * hoursPerTopic : undefined;
  const touched = mode === "date" ? state.d !== "" : state.days !== "";
  const base: Derived = { errors, rest, restPerWeek, computed: null };

  if (hasErrors || !touched) return base;
  let studyDays: number;
  if (mode === "date") {
    if (!target || !today) return base;
    studyDays = countStudyDays(target, today, rest);
  } else {
    if (daysAvail === undefined) return base;
    studyDays = Math.floor((daysAvail * (7 - restPerWeek)) / 7);
  }
  if (totalHours === undefined && hoursPerDay === undefined) return base;
  const plan = studyPlan({ studyDays, totalHours, hoursPerDay, pomodoroMinutes: pomodoro ?? 25, breakMinutes: brk ?? 5 });
  if (!plan.valid) return base;

  // Day-by-day schedule: total minutes split evenly, remainder (whole minutes) on the earliest days.
  const schedule: ScheduleRow[] = [];
  const rows = Math.min(studyDays, MAX_ROWS);
  const totalMinutes = Math.round((totalHours !== undefined ? totalHours : hoursPerDay! * studyDays) * 60);
  const perDay = studyDays > 0 ? Math.floor(totalMinutes / studyDays) : 0;
  const remainder = studyDays > 0 ? totalMinutes - perDay * studyDays : 0;
  if (mode === "date" && target && today) {
    const restSet = new Set(rest);
    let i = 0;
    for (const d = new Date(today); d < target && i < rows; d.setDate(d.getDate() + 1)) {
      if (restSet.has(d.getDay())) continue;
      schedule.push({ key: toDateKey(d), label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }), minutes: perDay + (i < remainder ? 1 : 0) });
      i++;
    }
  } else {
    for (let i = 0; i < rows; i++) schedule.push({ key: String(i), label: `Day ${i + 1}`, minutes: perDay + (i < remainder ? 1 : 0) });
  }
  return { ...base, computed: { plan, studyDays, totalHours, hoursPerDay, target, schedule, hiddenDays: Math.max(0, studyDays - rows) } };
}

export function StudyTimeCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => {
    const days = num(p, "days");
    const d = dateParam(p, "d");
    const m = p.get("m");
    const src = p.get("src");
    return {
      m: m === "days" || m === "date" ? m : days && !d ? "days" : undefined,
      src: src === "t" || src === "h" ? src : p.get("tp") && !p.get("h") ? "t" : undefined,
      d,
      days,
      rest: restParam(p, "rest"),
      rw: num(p, "rw"),
      h: num(p, "h"),
      tp: num(p, "tp"),
      hpt: num(p, "hpt"),
      hpd: num(p, "hpd"),
      pm: num(p, "pm"),
      bm: num(p, "bm"),
    };
  });
  const dateId = useId();

  // "Today" is only known on the client; the server render shows the placeholder.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setToday(startOfDay(new Date())), 0);
    return () => window.clearTimeout(id);
  }, []);

  const mode = state.m;
  const source = state.src;

  const derived = useMemo(() => derive(state, today), [state, today]);
  const { errors, rest, restPerWeek, computed } = derived;

  useEffect(() => {
    if (computed) trackCalculatorUse("study_time", { mode, feasible: computed.plan.feasible });
  }, [computed, mode]);

  const anyInput = Object.keys(defaults).some((k) => state[k as keyof typeof defaults] !== defaults[k as keyof typeof defaults]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented<Mode>
          label="How much time do you have?"
          value={mode}
          onChange={(v) => update({ m: v })}
          options={[
            { value: "date", label: "Exam date" },
            { value: "days", label: "Number of days" },
          ]}
        />
        {mode === "date" ? (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor={dateId} className="block text-sm font-medium text-fg">
                Exam date
              </label>
              <input id={dateId} type="date" value={state.d} onChange={(e) => update({ d: e.target.value })} aria-invalid={errors.d ? true : undefined} aria-describedby={errors.d ? `${dateId}-err` : undefined} className={`tnum mt-1.5 ${inputClass(errors.d)}`} autoFocus />
              {errors.d ? (
                <p id={`${dateId}-err`} role="alert" className="mt-1 text-xs font-medium text-danger">
                  {errors.d}
                </p>
              ) : null}
            </div>
            <RestDayPicker label="Rest days (no study)" value={state.rest} onChange={(v) => update({ rest: v })} hint="Skipped when counting study days. The exam day itself is never counted." />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <NumberField label="Days available" value={state.days} onChange={(v) => update({ days: v })} min={1} step={1} inputMode="numeric" placeholder="e.g. 30" error={errors.days} autoFocus />
            <NumberField label="Rest days per week" value={state.rw} onChange={(v) => update({ rw: v })} min={0} max={6} step={1} inputMode="numeric" error={errors.rw} hint="Study days ≈ days × (7 − rest) ÷ 7" />
          </div>
        )}

        <div className="mt-6">
          <Segmented<Source>
            label="How much is there to study?"
            value={source}
            onChange={(v) => update({ src: v })}
            options={[
              { value: "h", label: "I know my total hours" },
              { value: "t", label: "Estimate from topics" },
            ]}
          />
          {source === "h" ? (
            <div className="mt-4">
              <NumberField label="Total hours to cover" value={state.h} onChange={(v) => update({ h: v })} min={0} suffix="h" placeholder="e.g. 45" error={errors.h} hint="Everything you still need to study" />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <NumberField label="Topics or chapters" value={state.tp} onChange={(v) => update({ tp: v })} min={1} step={1} inputMode="numeric" placeholder="e.g. 15" error={errors.tp} />
              <NumberField label="Hours per topic" value={state.hpt} onChange={(v) => update({ hpt: v })} min={0} suffix="h" placeholder="e.g. 3" error={errors.hpt} />
            </div>
          )}
        </div>

        <div className="mt-6">
          <NumberField size="md" label="Hours per day I can study" value={state.hpd} onChange={(v) => update({ hpd: v })} min={0} max={24} suffix="h" placeholder="optional" error={errors.hpd} hint="Checks whether the plan is realistic" />
        </div>

        <details className="mt-5" open={state.pm !== defaults.pm || state.bm !== defaults.bm}>
          <summary className="cursor-pointer select-none text-sm font-medium text-accent">Pomodoro settings</summary>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <NumberField size="md" label="Session length" value={state.pm} onChange={(v) => update({ pm: v })} min={1} step={1} inputMode="numeric" suffix="min" error={errors.pm} />
            <NumberField size="md" label="Break length" value={state.bm} onChange={(v) => update({ bm: v })} min={0} step={1} inputMode="numeric" suffix="min" error={errors.bm} />
          </div>
        </details>

        {anyInput ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">{computed ? <Results c={computed} mode={mode} restCount={rest.length} restPerWeek={restPerWeek} onReset={reset} /> : <Placeholder mode={mode} />}</div>
    </div>
  );
}

function Placeholder({ mode }: { mode: Mode }) {
  return <HeroResult tone="neutral" badge="Waiting for numbers" value="—" unit="h/day" verdict={`Enter your ${mode === "date" ? "exam date" : "days available"} and how much you need to cover to see the hours per day you need.`} sub="Nothing you type leaves your device." />;
}

function Results({ c, mode, restCount, restPerWeek, onReset }: { c: Computed; mode: Mode; restCount: number; restPerWeek: number; onReset: () => void }) {
  const { plan, studyDays, totalHours, hoursPerDay, target } = c;
  const need = plan.hoursPerDayNeeded;
  const dateStr = target ? formatLongDate(target) : null;

  let tone: Tone = "neutral";
  let badge = "Plan";
  let verdict: string;
  let sub: string | undefined;
  let value: string;

  if (studyDays === 0) {
    tone = "danger";
    badge = "No study days";
    value = "—";
    verdict = mode === "date" ? "Every day before the exam is a rest day. Free up at least one day to study." : "Your rest days leave no days to study. Lower rest days or add days.";
  } else if (need !== undefined && totalHours !== undefined) {
    value = fmt(need, 1);
    if (plan.feasible === false && hoursPerDay !== undefined) {
      tone = "danger";
      badge = "Not enough time";
      verdict = `You need ${fmt(need, 1)} h/day but can only do ${fmt(hoursPerDay, 1)} h/day — you are ${hours(plan.hoursGap ?? 0)} short. Cut topics or add days.`;
      sub = `${fmt(hoursPerDay, 1)} h/day × ${studyDays} study days = ${fmt(plan.totalHoursAvailable ?? 0)} hours available against ${fmt(totalHours)} needed.`;
    } else {
      if (hoursPerDay !== undefined) {
        tone = "safe";
        badge = "On track";
        const spare = -(plan.hoursGap ?? 0);
        sub = spare > 1e-9 ? `At ${fmt(hoursPerDay, 1)} h/day you finish with ${hours(spare)} to spare for revision.` : `That is exactly what you said you can manage. No buffer for off days.`;
      }
      verdict = `Study ${fmt(need, 1)} hours a day across ${studyDays} study ${studyDays === 1 ? "day" : "days"} to cover ${fmt(totalHours)} hours.`;
    }
  } else {
    // Only hours per day known: show capacity.
    value = fmt(hoursPerDay ?? 0, 1);
    badge = "Capacity";
    verdict = `At ${fmt(hoursPerDay ?? 0, 1)} h/day you can cover ${fmt(plan.totalHoursAvailable ?? 0)} hours across ${studyDays} study ${studyDays === 1 ? "day" : "days"}.`;
    sub = "Add your total hours or topics to check whether that is enough.";
  }
  if (dateStr) sub = sub ? `${sub} Exam on ${dateStr}.` : `Exam on ${dateStr}.`;

  const restHint = mode === "date" ? (restCount ? `${restCount} rest ${restCount === 1 ? "day" : "days"} a week skipped, exam day excluded` : "exam day excluded") : restPerWeek ? `after ${restPerWeek} rest ${restPerWeek === 1 ? "day" : "days"} a week` : "no rest days";

  const sessions = plan.pomodorosPerDay;
  const wall = plan.wallMinutesPerDay;

  const summary = `Study plan: ${value === "—" ? "no study days" : `${value} h/day`} × ${studyDays} study days${totalHours !== undefined ? ` to cover ${fmt(totalHours)} hours` : ""}${dateStr ? ` before ${dateStr}` : ""}. ${badge}.`;

  return (
    <>
      <HeroResult tone={tone} badge={badge} value={value} unit="h/day" verdict={verdict} sub={sub} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Study days" value={studyDays} hint={restHint} tone={studyDays > 0 ? "neutral" : "danger"} />
        <Stat label="Total hours" value={totalHours !== undefined ? fmt(totalHours) : fmt(plan.totalHoursAvailable ?? 0)} hint={totalHours !== undefined ? "to cover" : "available at your pace"} />
        <Stat label="Pomodoro" value={sessions !== undefined ? `${sessions} ${sessions === 1 ? "session" : "sessions"}` : "—"} hint={sessions !== undefined && wall !== undefined ? `per day · ${hm(wall)} with breaks` : undefined} />
      </div>

      {c.schedule.length > 0 ? <Schedule c={c} /> : null}

      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}

function Schedule({ c }: { c: Computed }) {
  const head = c.schedule.slice(0, VISIBLE_ROWS);
  const tail = c.schedule.slice(VISIBLE_ROWS);
  return (
    <Card title="Day-by-day schedule">
      <ScheduleTable rows={head} caption="Your first study days" />
      {tail.length ? (
        <details className="mt-2">
          <summary className="cursor-pointer select-none py-2 text-sm font-medium text-accent">
            Show {tail.length} more {tail.length === 1 ? "day" : "days"}
          </summary>
          <ScheduleTable rows={tail} caption="Remaining study days" hideCaption />
        </details>
      ) : null}
      {c.hiddenDays > 0 ? (
        <p className="mt-3 text-xs text-fg-muted">
          Showing the first {MAX_ROWS} days. The remaining {c.hiddenDays} study {c.hiddenDays === 1 ? "day" : "days"} follow the same pace.
        </p>
      ) : null}
    </Card>
  );
}

function ScheduleTable({ rows, caption, hideCaption }: { rows: ScheduleRow[]; caption: string; hideCaption?: boolean }) {
  return (
    <table className="tnum w-full text-sm">
      <caption className={hideCaption ? "sr-only" : "mb-1.5 text-left text-xs font-semibold uppercase tracking-wider text-fg-faint"}>{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">Day</th>
          <th scope="col">Hours</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-t border-line">
            <td className="py-2 text-fg-muted">{r.label}</td>
            <td className="py-2 text-right font-semibold text-fg">{hm(r.minutes)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
