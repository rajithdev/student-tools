"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { countdown, studyDays, type CountdownResult } from "@/lib/calc/study";
import { useUrlState } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { RestDayPicker, parseRestDays, restParam, parseLocalDate, dateParam, timeParam, formatLongDate, inputClass } from "./RestDayPicker";

const NAME_MAX = 60;
const STORAGE_KEY = "exam-countdowns";
const MAX_SAVED = 3;

interface Saved {
  n: string;
  d: string;
  t: string;
}

const defaults = { n: "", d: "", t: "09:00", rest: "" };

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

function readSaved(): Saved[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is Saved => x && typeof x === "object" && typeof x.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.d))
      .map((x) => ({ n: String(x.n ?? "").slice(0, NAME_MAX), d: x.d, t: typeof x.t === "string" ? x.t : "" }))
      .slice(0, MAX_SAVED);
  } catch {
    return [];
  }
}

function writeSaved(list: Saved[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_SAVED)));
  } catch {
    /* storage may be unavailable (private mode, quota) */
  }
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Minimal RFC 5545 VEVENT. Timed events use floating local time; without a time the event is all-day. */
function buildIcs(name: string, target: Date, timed: boolean, now: Date): string {
  const ymd = `${target.getFullYear()}${pad(target.getMonth() + 1)}${pad(target.getDate())}`;
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const next = new Date(target);
  next.setDate(next.getDate() + 1);
  const ymdNext = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  const end = new Date(target.getTime() + 3 * 3_600_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//studentTools.in//Exam Countdown//EN",
    "BEGIN:VEVENT",
    `UID:${ymd}-${timed ? `${pad(target.getHours())}${pad(target.getMinutes())}` : "allday"}@studenttools.in`,
    `DTSTAMP:${stamp}`,
    timed ? `DTSTART:${ymd}T${pad(target.getHours())}${pad(target.getMinutes())}00` : `DTSTART;VALUE=DATE:${ymd}`,
    timed ? `DTEND:${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00` : `DTEND;VALUE=DATE:${ymdNext}`,
    `SUMMARY:${icsEscape(name)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function ExamCountdown() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    n: p.get("n")?.slice(0, NAME_MAX) ?? undefined,
    d: dateParam(p, "d"),
    t: timeParam(p, "t"),
    rest: restParam(p, "rest"),
  }));
  const nameId = useId();
  const dateId = useId();
  const timeId = useId();

  // Anything that depends on the clock lives in state and is only computed after mount.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const [saved, setSaved] = useState<Saved[] | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setSaved(readSaved()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const name = state.n.trim();
  const timed = state.t !== "";
  const target = useMemo(() => (state.d ? parseLocalDate(state.d, timed ? state.t : undefined) : null), [state.d, state.t, timed]);
  const rest = useMemo(() => parseRestDays(state.rest), [state.rest]);
  const dateError = state.d && !target ? "Enter a valid date and time." : undefined;

  const result = useMemo(() => {
    if (!target || !now) return null;
    const cd = countdown(target, now);
    return { cd, study: cd.past ? 0 : studyDays(target, now, rest), hoursLeft: cd.past ? 0 : Math.floor(cd.ms / 3_600_000) };
  }, [target, now, rest]);

  useEffect(() => {
    if (result) trackCalculatorUse("exam_countdown", { past: result.cd.past });
  }, [result]);

  const isSaved = saved?.some((s) => s.d === state.d && s.t === state.t && s.n === name) ?? false;
  const canSave = !!target && !isSaved && (saved?.length ?? 0) < MAX_SAVED;

  function save() {
    if (!target) return;
    const next = [{ n: name, d: state.d, t: state.t }, ...(saved ?? []).filter((s) => !(s.d === state.d && s.t === state.t && s.n === name))].slice(0, MAX_SAVED);
    setSaved(next);
    writeSaved(next);
  }
  function remove(i: number) {
    const next = (saved ?? []).filter((_, idx) => idx !== i);
    setSaved(next);
    writeSaved(next);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <div>
          <label htmlFor={nameId} className="block text-sm font-medium text-fg">
            Exam name <span className="font-normal text-fg-faint">(optional)</span>
          </label>
          <input id={nameId} type="text" value={state.n} maxLength={NAME_MAX} placeholder="e.g. Physics final" autoComplete="off" onChange={(e) => update({ n: e.target.value.slice(0, NAME_MAX) })} className={`mt-1.5 ${inputClass()}`} />
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
          <div>
            <label htmlFor={dateId} className="block text-sm font-medium text-fg">
              Exam date
            </label>
            <input id={dateId} type="date" value={state.d} required onChange={(e) => update({ d: e.target.value })} aria-invalid={dateError ? true : undefined} aria-describedby={dateError ? `${dateId}-err` : undefined} className={`tnum mt-1.5 ${inputClass(dateError)}`} autoFocus />
            {dateError ? (
              <p id={`${dateId}-err`} role="alert" className="mt-1 text-xs font-medium text-danger">
                {dateError}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor={timeId} className="block text-sm font-medium text-fg">
              Start time
            </label>
            <input id={timeId} type="time" value={state.t} onChange={(e) => update({ t: e.target.value })} className={`tnum mt-1.5 ${inputClass()}`} />
            <p className="mt-1 text-xs text-fg-faint">Clear it for an all-day exam.</p>
          </div>
        </div>
        <div className="mt-5">
          <RestDayPicker label="Rest days (no study)" value={state.rest} onChange={(v) => update({ rest: v })} hint="Skipped when counting study days." />
        </div>
        {state.d || state.n || state.rest ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {result && target ? (
          <Results name={name || "Exam"} target={target} timed={timed} now={now!} cd={result.cd} study={result.study} hoursLeft={result.hoursLeft} restCount={rest.length} dateKey={state.d} restKey={state.rest} onReset={reset} />
        ) : (
          <Placeholder />
        )}

        <Card title="Saved countdowns">
          {saved === null ? (
            <p className="text-sm text-fg-muted">Loading…</p>
          ) : saved.length === 0 ? (
            <p className="text-sm text-fg-muted">Save up to {MAX_SAVED} exams on this device to switch between them quickly.</p>
          ) : (
            <ul className="divide-y divide-line">
              {saved.map((s, i) => {
                const t = parseLocalDate(s.d, s.t || undefined);
                return (
                  <li key={`${s.d}-${s.t}-${s.n}`} className="flex items-center gap-2 py-1">
                    <button type="button" onClick={() => update({ n: s.n, d: s.d, t: s.t })} className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center rounded-lg px-2 text-left hover:bg-bg-sunken">
                      <span className="truncate text-sm font-semibold text-fg">{s.n || "Exam"}</span>
                      <span className="tnum text-xs text-fg-muted">
                        {t ? formatLongDate(t) : s.d}
                        {s.t ? ` · ${s.t}` : ""}
                      </span>
                    </button>
                    <Button variant="ghost" onClick={() => remove(i)} ariaLabel={`Remove ${s.n || "exam"} on ${s.d}`}>
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={canSave ? save : undefined} className={canSave ? "" : "opacity-50"} ariaLabel={isSaved ? "Already saved" : "Save this countdown"}>
              {isSaved ? "Saved" : "Save this exam"}
            </Button>
            {!target ? <span className="text-xs text-fg-faint">Pick a date first.</span> : null}
            {target && !isSaved && (saved?.length ?? 0) >= MAX_SAVED ? <span className="text-xs text-fg-faint">Remove one to save another.</span> : null}
          </div>
          <p className="mt-2 text-xs text-fg-faint">Stored only in this browser.</p>
        </Card>
      </div>
    </div>
  );
}

function Placeholder() {
  return <HeroResult tone="neutral" badge="Waiting for a date" value="—" unit="days" verdict="Pick your exam date to start the countdown." sub="Nothing you type leaves your device." />;
}

function Results({ name, target, timed, now, cd, study, hoursLeft, restCount, dateKey, restKey, onReset }: { name: string; target: Date; timed: boolean; now: Date; cd: CountdownResult; study: number; hoursLeft: number; restCount: number; dateKey: string; restKey: string; onReset: () => void }) {
  const dateStr = formatLongDate(target) + (timed ? ` at ${target.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}` : "");
  const n = Math.abs(cd.calendarDays);

  let tone: Tone = "neutral";
  let verdict: string;
  if (cd.past) {
    verdict = n === 0 ? "Your exam was today." : `Your exam was ${plural(n, "day")} ago.`;
  } else {
    tone = cd.calendarDays <= 1 ? "danger" : cd.calendarDays < 7 ? "warn" : "safe";
    verdict = `${plural(cd.days, "day")}, ${plural(cd.hours, "hour")} and ${plural(cd.minutes, "minute")} to go`;
  }

  const summary = cd.past ? `${name}: ${verdict} (${dateStr})` : `${name}: ${plural(cd.calendarDays, "day")} to go (${dateStr})`;
  const ics = buildIcs(name, target, timed, now);
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  const planHref = `/study-time-calculator/?d=${encodeURIComponent(dateKey)}${restKey ? `&rest=${encodeURIComponent(restKey)}` : ""}`;

  return (
    <>
      <HeroResult tone={tone} badge={name} value={String(n)} unit="days" verdict={verdict} sub={dateStr} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Weeks" value={cd.past ? "—" : `${cd.weeks}w ${cd.weekDays}d`} hint="calendar weeks and days" />
        <Stat label="Study days left" value={cd.past ? 0 : study} hint={restCount ? "excluding rest days and exam day" : "excluding exam day"} tone={!cd.past && study > 0 ? "safe" : "neutral"} />
        <Stat label="Hours left" value={cd.past ? 0 : hoursLeft.toLocaleString()} hint="until the exam starts" />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {!cd.past ? (
          <a href={planHref} className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4">
            Plan your study hours →
          </a>
        ) : null}
        <a href={icsHref} download="exam.ics" className="inline-flex min-h-11 items-center text-fg-muted underline underline-offset-4 hover:text-fg">
          Add to calendar (.ics)
        </a>
      </div>

      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}
