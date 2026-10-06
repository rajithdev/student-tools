import { describe, it, expect } from "vitest";
import { weightedGrade, finalGradeNeeded, marksPercentage, marksForPercent, letterFor, getScale, minPercentFor } from "@/lib/calc/grades";

describe("weightedGrade", () => {
  it("computes a weighted average with mixed out-of values", () => {
    const r = weightedGrade([
      { score: 90, weight: 30 },
      { score: 18, outOf: 20, weight: 20 }, // 90%
      { score: 70, weight: 50 },
    ]);
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.percent).toBeCloseTo((90 * 30 + 90 * 20 + 70 * 50) / 100, 9);
      expect(r.totalWeight).toBe(100);
    }
  });
  it("ignores blank rows and handles zero total weight", () => {
    const r = weightedGrade([{}, {}]);
    expect(r.valid && Number.isNaN(r.percent)).toBe(true);
    const r2 = weightedGrade([{ score: 50, weight: 0 }]);
    expect(r2.valid && Number.isNaN(r2.percent)).toBe(true);
  });
  it("flags score > outOf and negative weights", () => {
    const r = weightedGrade([{ score: 25, outOf: 20, weight: 10 }, { score: 10, weight: -1 }]);
    expect(r.valid).toBe(false);
    if (!r.valid) {
      expect(r.errors[0]).toMatch(/exceed/);
      expect(r.errors[1]).toMatch(/weight/);
    }
  });
});

describe("finalGradeNeeded", () => {
  it("classic: 85% now, final worth 30%, want 90% → 101.67% (not achievable)", () => {
    const r = finalGradeNeeded({ current: 85, finalWeight: 30, target: 90 });
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.needed).toBeCloseTo((90 - 85 * 0.7) / 0.3, 6);
      expect(r.achievable).toBe(false);
      expect(r.alreadySecured).toBe(false);
      expect(r.overallIfZero).toBeCloseTo(59.5, 9);
      expect(r.overallIfPerfect).toBeCloseTo(89.5, 9);
    }
  });
  it("88% now, final 40%, want 85% → 80.5%", () => {
    const r = finalGradeNeeded({ current: 88, finalWeight: 40, target: 85 });
    if (r.valid) expect(r.needed).toBeCloseTo(80.5, 9);
  });
  it("target already secured yields needed <= 0", () => {
    const r = finalGradeNeeded({ current: 95, finalWeight: 10, target: 85 });
    if (r.valid) {
      expect(r.needed).toBeLessThanOrEqual(0);
      expect(r.alreadySecured).toBe(true);
    }
  });
  it("final worth 100% → needed equals target", () => {
    const r = finalGradeNeeded({ current: 0, finalWeight: 100, target: 70 });
    if (r.valid) expect(r.needed).toBeCloseTo(70, 9);
  });
  it("rejects weight 0 and >100", () => {
    expect(finalGradeNeeded({ current: 80, finalWeight: 0, target: 90 }).valid).toBe(false);
    expect(finalGradeNeeded({ current: 80, finalWeight: 120, target: 90 }).valid).toBe(false);
  });
});

describe("marksPercentage", () => {
  it("450/500 = 90%", () => {
    const r = marksPercentage([{ obtained: 450, max: 500 }]);
    if (r.valid) expect(r.percent).toBe(90);
  });
  it("sums subjects with different maxima", () => {
    const r = marksPercentage([
      { obtained: 80, max: 100 },
      { obtained: 40, max: 50 },
      { obtained: 60, max: 100 },
    ]);
    if (r.valid) {
      expect(r.obtained).toBe(180);
      expect(r.max).toBe(250);
      expect(r.percent).toBe(72);
    }
  });
  it("best of 5 drops the lowest subject", () => {
    const r = marksPercentage(
      [95, 90, 85, 80, 75, 40].map((m) => ({ obtained: m, max: 100 })),
      { bestOf: 5 },
    );
    if (r.valid) {
      expect(r.counted).toBe(5);
      expect(r.percent).toBe(85);
      expect(r.rows[5].counted).toBe(false);
    }
  });
  it("rejects obtained > max", () => {
    const r = marksPercentage([{ obtained: 101, max: 100 }]);
    expect(r.valid).toBe(false);
  });
  it("marksForPercent", () => {
    expect(marksForPercent(75, 600)).toBe(450);
  });
});

describe("letter grades", () => {
  const us = getScale("us-plus-minus");
  it("boundaries", () => {
    expect(letterFor(90, us)?.letter).toBe("A-");
    expect(letterFor(89.999, us)?.letter).toBe("B+");
    expect(letterFor(100, us)?.letter).toBe("A+");
    expect(letterFor(0, us)?.letter).toBe("F");
    expect(letterFor(59.9, us)?.letter).toBe("F");
    expect(letterFor(60, us)?.letter).toBe("D-");
  });
  it("india 10-point", () => {
    const ind = getScale("india-10");
    expect(letterFor(90, ind)?.points).toBe(10);
    expect(letterFor(39.9, ind)?.letter).toBe("F");
    expect(minPercentFor("A", ind)).toBe(70);
  });
});
