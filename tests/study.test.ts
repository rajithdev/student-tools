import { describe, it, expect } from "vitest";
import { countdown, studyDays, studyPlan } from "@/lib/calc/study";

describe("countdown", () => {
  const now = new Date(2026, 9, 7, 9, 0, 0); // 7 Oct 2026 09:00 local
  it("days/hours/minutes to a future exam", () => {
    const target = new Date(2026, 9, 20, 10, 30, 0);
    const r = countdown(target, now);
    expect(r.past).toBe(false);
    expect(r.days).toBe(13);
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(30);
    expect(r.calendarDays).toBe(13);
    expect(r.weeks).toBe(1);
    expect(r.weekDays).toBe(6);
  });
  it("same-day exam later today → 0 calendar days", () => {
    const r = countdown(new Date(2026, 9, 7, 14, 0, 0), now);
    expect(r.calendarDays).toBe(0);
    expect(r.hours).toBe(5);
  });
  it("past exam", () => {
    const r = countdown(new Date(2026, 9, 1), now);
    expect(r.past).toBe(true);
    expect(r.calendarDays).toBe(-6);
    expect(r.weeks).toBe(0);
  });
});

describe("studyDays", () => {
  const now = new Date(2026, 9, 7); // Wednesday
  it("counts days excluding exam day", () => {
    expect(studyDays(new Date(2026, 9, 14), now)).toBe(7);
  });
  it("skips rest days (Sunday=0)", () => {
    // 7..13 Oct 2026: Wed Thu Fri Sat Sun Mon Tue → 1 Sunday
    expect(studyDays(new Date(2026, 9, 14), now, [0])).toBe(6);
    expect(studyDays(new Date(2026, 9, 14), now, [0, 6])).toBe(5);
  });
  it("zero when exam is today or past", () => {
    expect(studyDays(now, now)).toBe(0);
    expect(studyDays(new Date(2026, 9, 1), now)).toBe(0);
  });
});

describe("studyPlan", () => {
  it("hours per day needed", () => {
    const r = studyPlan({ studyDays: 10, totalHours: 40 });
    if (r.valid) {
      expect(r.hoursPerDayNeeded).toBe(4);
      expect(r.pomodorosPerDay).toBe(10); // 240/25 = 9.6 → 10
      expect(r.wallMinutesPerDay).toBe(10 * 25 + 9 * 5);
    }
  });
  it("feasibility with both inputs", () => {
    const r = studyPlan({ studyDays: 10, totalHours: 40, hoursPerDay: 3 });
    if (r.valid) {
      expect(r.totalHoursAvailable).toBe(30);
      expect(r.hoursGap).toBe(10);
      expect(r.feasible).toBe(false);
    }
    const r2 = studyPlan({ studyDays: 10, totalHours: 40, hoursPerDay: 4 });
    if (r2.valid) expect(r2.feasible).toBe(true);
  });
  it("zero study days", () => {
    const r = studyPlan({ studyDays: 0, totalHours: 10 });
    if (r.valid) expect(r.hoursPerDayNeeded).toBe(Infinity);
    const r2 = studyPlan({ studyDays: 0, totalHours: 0 });
    if (r2.valid) expect(r2.hoursPerDayNeeded).toBe(0);
  });
  it("validation", () => {
    expect(studyPlan({ studyDays: -1 }).valid).toBe(false);
    expect(studyPlan({ studyDays: 5, hoursPerDay: 25 }).valid).toBe(false);
    expect(studyPlan({ studyDays: 5, pomodoroMinutes: 0 }).valid).toBe(false);
  });
});
