import { isNum } from "./shared";

/* ---------------- Exam countdown ---------------- */

export interface CountdownResult {
  /** Milliseconds remaining (negative if past). */
  ms: number;
  past: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Whole calendar days from today (local) to the exam date. */
  calendarDays: number;
  /** Weeks and leftover days. */
  weeks: number;
  weekDays: number;
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function countdown(target: Date, now: Date = new Date()): CountdownResult {
  const ms = target.getTime() - now.getTime();
  const abs = Math.abs(ms);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  const calendarDays = Math.round((startOfDay(target).getTime() - startOfDay(now).getTime()) / 86_400_000);
  return {
    ms,
    past: ms < 0,
    days,
    hours,
    minutes,
    seconds,
    calendarDays,
    weeks: Math.floor(Math.max(0, calendarDays) / 7),
    weekDays: Math.max(0, calendarDays) % 7,
  };
}

/**
 * Count study days between today (inclusive) and the exam date (exclusive),
 * skipping the given weekdays (0 = Sunday … 6 = Saturday).
 */
export function studyDays(target: Date, now: Date, restDays: number[] = []): number {
  const rest = new Set(restDays);
  const start = startOfDay(now);
  const end = startOfDay(target);
  let count = 0;
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (!rest.has(d.getDay())) count++;
  }
  return count;
}

/* ---------------- Study time planner ---------------- */

export interface StudyPlanInput {
  /** Days available for study (after removing rest days). */
  studyDays: number;
  /** Total hours of material to cover. */
  totalHours?: number;
  /** Hours per day the student can realistically study. */
  hoursPerDay?: number;
  /** Pomodoro length in minutes (default 25) and break (default 5). */
  pomodoroMinutes?: number;
  breakMinutes?: number;
}

export interface StudyPlanResult {
  valid: true;
  studyDays: number;
  /** Hours/day needed to finish totalHours (if given). */
  hoursPerDayNeeded?: number;
  /** Total hours available at hoursPerDay (if given). */
  totalHoursAvailable?: number;
  /** When both given: hours short (positive) or spare (negative). */
  hoursGap?: number;
  feasible?: boolean;
  /** Pomodoro sessions per day for the needed/planned hours. */
  pomodorosPerDay?: number;
  /** Wall-clock minutes per day including breaks. */
  wallMinutesPerDay?: number;
}

export function studyPlan(input: StudyPlanInput): StudyPlanResult | { valid: false; errors: Partial<Record<keyof StudyPlanInput, string>> } {
  const errors: Partial<Record<keyof StudyPlanInput, string>> = {};
  const { studyDays, totalHours, hoursPerDay } = input;
  const pomo = input.pomodoroMinutes ?? 25;
  const brk = input.breakMinutes ?? 5;
  if (!isNum(studyDays) || studyDays < 0) errors.studyDays = "Study days must be 0 or more.";
  if (totalHours !== undefined && (!isNum(totalHours) || totalHours < 0)) errors.totalHours = "Enter total hours of 0 or more.";
  if (hoursPerDay !== undefined && (!isNum(hoursPerDay) || hoursPerDay < 0 || hoursPerDay > 24)) errors.hoursPerDay = "Hours per day must be between 0 and 24.";
  if (!isNum(pomo) || pomo <= 0) errors.pomodoroMinutes = "Session length must be greater than 0.";
  if (!isNum(brk) || brk < 0) errors.breakMinutes = "Break length must be 0 or more.";
  if (Object.keys(errors).length) return { valid: false, errors };

  const res: StudyPlanResult = { valid: true, studyDays };
  if (totalHours !== undefined) {
    res.hoursPerDayNeeded = studyDays > 0 ? totalHours / studyDays : totalHours > 0 ? Infinity : 0;
  }
  if (hoursPerDay !== undefined) {
    res.totalHoursAvailable = hoursPerDay * studyDays;
  }
  if (totalHours !== undefined && hoursPerDay !== undefined) {
    res.hoursGap = totalHours - res.totalHoursAvailable!;
    res.feasible = res.hoursGap <= 1e-9;
  }
  const dailyHours = res.hoursPerDayNeeded !== undefined && Number.isFinite(res.hoursPerDayNeeded) ? res.hoursPerDayNeeded : hoursPerDay;
  if (dailyHours !== undefined && Number.isFinite(dailyHours)) {
    const sessions = Math.ceil((dailyHours * 60) / pomo - 1e-9);
    res.pomodorosPerDay = sessions;
    res.wallMinutesPerDay = sessions > 0 ? sessions * pomo + (sessions - 1) * brk : 0;
  }
  return res;
}
