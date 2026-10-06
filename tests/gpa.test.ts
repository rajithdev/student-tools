import { describe, it, expect } from "vitest";
import { gpa, cumulative, cgpaToPercent, percentToCgpa, getFormula, customFormula } from "@/lib/calc/gpa";

describe("gpa", () => {
  it("credit-weighted average", () => {
    const r = gpa([
      { credits: 3, points: 4 },
      { credits: 4, points: 3 },
      { credits: 3, points: 2 },
    ], 4);
    expect(r.valid).toBe(true);
    if (r.valid) {
      expect(r.gpa).toBeCloseTo((12 + 12 + 6) / 10, 9);
      expect(r.totalCredits).toBe(10);
    }
  });
  it("blank rows ignored; zero credits → NaN", () => {
    const r = gpa([{}, { credits: 0, points: 4 }], 4);
    expect(r.valid && Number.isNaN(r.gpa)).toBe(true);
  });
  it("rejects points above scale max", () => {
    const r = gpa([{ credits: 3, points: 11 }], 10);
    expect(r.valid).toBe(false);
  });
});

describe("cumulative SGPA → CGPA", () => {
  it("weights by credits", () => {
    const r = cumulative([{ gpa: 8, credits: 20 }, { gpa: 9, credits: 24 }], 10);
    if (r.valid) expect(r.cgpa).toBeCloseTo((160 + 216) / 44, 9);
  });
  it("simple average when credits omitted", () => {
    const r = cumulative([{ gpa: 8 }, { gpa: 9 }], 10);
    if (r.valid) expect(r.cgpa).toBe(8.5);
  });
});

describe("conversion formulas", () => {
  it("CBSE 9.5", () => {
    const f = getFormula("cbse-9.5");
    expect(cgpaToPercent(8, f)).toBe(76);
    expect(percentToCgpa(76, f)).toBeCloseTo(8, 9);
    expect(cgpaToPercent(10, f)).toBe(95);
  });
  it("VTU", () => {
    const f = getFormula("vtu-2017");
    expect(cgpaToPercent(8.5, f)).toBeCloseTo(77.5, 9);
    expect(percentToCgpa(77.5, f)).toBeCloseTo(8.5, 9);
  });
  it("Mumbai", () => {
    const f = getFormula("mumbai-7.1-11");
    expect(cgpaToPercent(8, f)).toBeCloseTo(67.8, 9);
  });
  it("clamps and validates", () => {
    const f = getFormula("x10");
    expect(cgpaToPercent(11, f)).toEqual({ error: expect.stringMatching(/exceed/) });
    expect(cgpaToPercent(-1, f)).toEqual({ error: expect.any(String) });
    expect(percentToCgpa(101, f)).toEqual({ error: expect.any(String) });
    expect(percentToCgpa(100, getFormula("cbse-9.5"))).toBe(10); // 10.52 clamped to 10
  });
  it("custom multiplier", () => {
    const f = customFormula(9.2);
    expect(cgpaToPercent(9, f)).toBeCloseTo(82.8, 9);
  });
});

describe("Mumbai 2015 piecewise and CGPA→GPA", () => {
  it("piecewise is continuous in intent and invertible", async () => {
    const { getFormula, cgpaToGpaBand, cgpaToGpaLinear } = await import("@/lib/calc/gpa");
    const f = getFormula("mumbai-2015");
    expect(f.toPercent(6.5)).toBeCloseTo(7.1 * 6.5 + 12, 9);
    expect(f.toPercent(7)).toBeCloseTo(7.4 * 7 + 12, 9);
    expect(f.toCgpa(f.toPercent(6.5))).toBeCloseTo(6.5, 9);
    expect(f.toCgpa(f.toPercent(8.2))).toBeCloseTo(8.2, 9);
    expect(cgpaToGpaBand(9)?.gpa).toBe(4);
    expect(cgpaToGpaBand(8.99)?.gpa).toBe(3.7);
    expect(cgpaToGpaBand(11)).toBeUndefined();
    expect(cgpaToGpaLinear(7.5)).toBe(3);
  });
});
