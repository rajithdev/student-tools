import { describe, it, expect } from "vitest";
import {
  calculateAttendance,
  classesCanMiss,
  classesNeeded,
  mustAttendOfRemaining,
  formatPercent,
  meets,
  type AttendanceResult,
} from "@/lib/calc/attendance";

function ok(input: Parameters<typeof calculateAttendance>[0]): AttendanceResult {
  const r = calculateAttendance(input);
  if (!r.valid) throw new Error("expected valid: " + JSON.stringify(r.errors));
  return r;
}

describe("attendance boundaries at 75%", () => {
  it("74/100 is below; needs 4 classes to reach 75", () => {
    const r = ok({ attended: 74, total: 100, required: 75 });
    expect(r.status).toBe("below");
    expect(r.canMiss).toBe(0);
    // (74+n)/(100+n) >= .75 => n >= 4
    expect(r.needForRequired).toBe(4);
    expect(meets(78, 104, 75)).toBe(true);
    expect(meets(77, 103, 75)).toBe(false);
  });
  it("75/100 is exactly on the line; can miss 0", () => {
    const r = ok({ attended: 75, total: 100, required: 75 });
    expect(r.status).toBe("exact");
    expect(r.percent).toBe(75);
    expect(r.canMiss).toBe(0);
    expect(r.needForRequired).toBe(0);
  });
  it("76/100 is safe; can miss 1", () => {
    const r = ok({ attended: 76, total: 100, required: 75 });
    expect(r.status).toBe("safe");
    expect(r.canMiss).toBe(1); // 76/101 = 75.25% ok, 76/102 = 74.5% no
    expect(r.needForRequired).toBe(0);
  });
  it("30/40 can miss exactly 0 at 75", () => {
    expect(classesCanMiss(30, 40, 75)).toBe(0);
  });
  it("60/70 can miss 10 at 75 (60/80 = 75% exactly)", () => {
    expect(classesCanMiss(60, 70, 75)).toBe(10);
    expect(meets(60, 80, 75)).toBe(true);
    expect(meets(60, 81, 75)).toBe(false);
  });
});

describe("empty and zero cases", () => {
  it("0/0 is empty and valid", () => {
    const r = ok({ attended: 0, total: 0, required: 75 });
    expect(r.status).toBe("empty");
    expect(Number.isNaN(r.percent)).toBe(true);
    expect(r.canMiss).toBe(0);
    expect(r.needForRequired).toBe(1); // 1/1 = 100% >= 75
    expect(r.afterAttending[0].percent).toBe(100);
  });
  it("0/10 needs 30 classes for 75%", () => {
    const r = ok({ attended: 0, total: 10, required: 75 });
    expect(r.percent).toBe(0);
    expect(r.status).toBe("below");
    expect(r.needForRequired).toBe(30); // 30/40 = 75%
    expect(r.canMiss).toBe(0);
  });
  it("100/100 at 75 can miss 33", () => {
    const r = ok({ attended: 100, total: 100, required: 75 });
    expect(r.percent).toBe(100);
    expect(r.canMiss).toBe(33); // 100/133 = 75.19%, 100/134 = 74.6%
  });
  it("required 0% means unlimited misses", () => {
    const r = ok({ attended: 5, total: 10, required: 0 });
    expect(r.canMiss).toBe(Infinity);
    expect(r.needForRequired).toBe(0);
  });
  it("target 100% is impossible unless already perfect", () => {
    expect(classesNeeded(9, 10, 100)).toBe(Infinity);
    expect(classesNeeded(10, 10, 100)).toBe(0);
    expect(classesNeeded(0, 0, 100)).toBe(1);
  });
});

describe("fractional targets", () => {
  it("66.67% target (2/3 rule) with 20/30", () => {
    // 20/30 = 66.666..% < 66.67
    const r = ok({ attended: 20, total: 30, required: 66.67 });
    expect(r.status).toBe("below");
    expect(r.needForRequired).toBe(1); // 21/31 = 67.74%
  });
  it("66.6% target with 20/30 is safe and can miss 0", () => {
    const r = ok({ attended: 20, total: 30, required: 66.6 });
    expect(r.status).toBe("safe");
    expect(r.canMiss).toBe(0); // 20/31 = 64.5%
  });
  it("72.5% with 29/40 is exactly on the line", () => {
    const r = ok({ attended: 29, total: 40, required: 72.5 });
    expect(r.status).toBe("exact");
    expect(r.canMiss).toBe(0);
  });
  it("float-noisy threshold 0.1*3 vs 30", () => {
    expect(meets(3, 10, 0.1 * 3 * 100)).toBe(true);
  });
});

describe("very large numbers", () => {
  it("handles millions without drift", () => {
    const r = ok({ attended: 7_500_000, total: 10_000_000, required: 75 });
    expect(r.status).toBe("exact");
    expect(r.canMiss).toBe(0);
    const r2 = ok({ attended: 7_500_001, total: 10_000_000, required: 75 });
    expect(r2.canMiss).toBe(1); // 7500001/10000001 >= .75 ; /10000002 < .75
  });
});

describe("validation", () => {
  it("rejects attended > total", () => {
    const r = calculateAttendance({ attended: 11, total: 10, required: 75 });
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors.attended).toMatch(/cannot be more/);
  });
  it("rejects negatives, NaN, and out-of-range percentages", () => {
    expect(calculateAttendance({ attended: -1, total: 10, required: 75 }).valid).toBe(false);
    expect(calculateAttendance({ attended: NaN, total: 10, required: 75 }).valid).toBe(false);
    expect(calculateAttendance({ attended: 1, total: Infinity, required: 75 }).valid).toBe(false);
    expect(calculateAttendance({ attended: 1, total: 10, required: 101 }).valid).toBe(false);
    expect(calculateAttendance({ attended: 1, total: 10, required: -5 }).valid).toBe(false);
    expect(calculateAttendance({ attended: 1, total: 10, required: 75, target: 120 }).valid).toBe(false);
    expect(calculateAttendance({ attended: 1, total: 10, required: 75, remaining: -2 }).valid).toBe(false);
  });
});

describe("projections", () => {
  it("after missing / attending next k classes", () => {
    const r = ok({ attended: 40, total: 50, required: 75 });
    expect(r.afterMissing.map((p) => p.k)).toEqual([1, 2, 3, 5, 10]);
    expect(r.afterMissing[0].percent).toBeCloseTo((40 / 51) * 100, 9);
    expect(r.afterMissing[4].percent).toBeCloseTo((40 / 60) * 100, 9);
    expect(r.afterAttending[0].percent).toBeCloseTo((41 / 51) * 100, 9);
    expect(r.afterAttending[4].percent).toBeCloseTo((50 / 60) * 100, 9);
  });
  it("target differs from required", () => {
    const r = ok({ attended: 76, total: 100, required: 75, target: 80 });
    expect(r.canMiss).toBe(1);
    expect(r.needForRequired).toBe(0);
    expect(r.needForTarget).toBe(20); // (76+n)/(100+n) >= .8 => n >= 20
  });
});

describe("remaining classes feasibility", () => {
  it("can still recover: 30/50 with 30 remaining at 75", () => {
    const r = ok({ attended: 30, total: 50, required: 75, remaining: 30 });
    const rem = r.remaining!;
    expect(rem.maxPossible).toBe(75); // 60/80
    expect(rem.minPossible).toBe(37.5);
    expect(rem.mustAttendForRequired).toBe(30);
    expect(rem.canSkipForRequired).toBe(0);
  });
  it("cannot recover: 30/50 with 20 remaining at 75", () => {
    const r = ok({ attended: 30, total: 50, required: 75, remaining: 20 });
    expect(r.remaining!.mustAttendForRequired).toBe(Infinity);
    expect(r.remaining!.maxPossible).toBeCloseTo((50 / 70) * 100, 9);
  });
  it("comfortable: 45/50 with 50 remaining at 75 can skip 20", () => {
    expect(mustAttendOfRemaining(45, 50, 50, 75)).toBe(30); // 75/100
    const r = ok({ attended: 45, total: 50, required: 75, remaining: 50 });
    expect(r.remaining!.canSkipForRequired).toBe(20);
  });
  it("zero remaining", () => {
    const r = ok({ attended: 40, total: 50, required: 75, remaining: 0 });
    expect(r.remaining!.mustAttendForRequired).toBe(0);
    expect(r.remaining!.maxPossible).toBe(80);
  });
});

describe("formatPercent never lies across a threshold", () => {
  it("74.996 at 75 shows 74.99 not 75.00", () => {
    expect(formatPercent(74.996, 75)).toBe("74.99");
    expect(formatPercent(74.996)).toBe("75.00");
  });
  it("75.004 at 75 shows 75.01", () => {
    expect(formatPercent(75.004, 75)).toBe("75.01");
  });
  it("exact 75 shows 75.00", () => {
    expect(formatPercent(75, 75)).toBe("75.00");
  });
  it("NaN shows em dash", () => {
    expect(formatPercent(NaN)).toBe("—");
  });
});
