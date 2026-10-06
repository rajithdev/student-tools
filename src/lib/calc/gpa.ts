import { EPS, isNum } from "./shared";

export interface CourseRow {
  name?: string;
  credits?: number;
  /** Grade points for this course (e.g. 4.0, 9). */
  points?: number;
}

export interface GpaResult {
  valid: true;
  gpa: number; // NaN when no credits
  totalCredits: number;
  totalPoints: number; // Σ credits×points
  rows: { index: number; credits: number; points: number; weighted: number }[];
}

/** Credit-weighted grade point average: Σ(credits × points) / Σ credits. */
export function gpa(rows: CourseRow[], maxPoints: number): GpaResult | { valid: false; errors: Record<number, string> } {
  const errors: Record<number, string> = {};
  const out: GpaResult["rows"] = [];
  rows.forEach((r, index) => {
    if (r.credits === undefined && r.points === undefined) return;
    if (!isNum(r.credits) || r.credits < 0) errors[index] = "Enter credits (0 or more).";
    else if (!isNum(r.points) || r.points < 0) errors[index] = "Choose a grade.";
    else if (r.points > maxPoints + EPS) errors[index] = `Grade points cannot exceed ${maxPoints}.`;
    else out.push({ index, credits: r.credits, points: r.points, weighted: r.credits * r.points });
  });
  if (Object.keys(errors).length) return { valid: false, errors };
  const totalCredits = out.reduce((s, r) => s + r.credits, 0);
  const totalPoints = out.reduce((s, r) => s + r.weighted, 0);
  return { valid: true, gpa: totalCredits > 0 ? totalPoints / totalCredits : NaN, totalCredits, totalPoints, rows: out };
}

/** Combine semester GPAs (SGPA) into a CGPA, weighted by semester credits when given. */
export function cumulative(semesters: { gpa?: number; credits?: number }[], maxPoints: number) {
  const errors: Record<number, string> = {};
  const rows: { index: number; gpa: number; credits: number }[] = [];
  semesters.forEach((s, index) => {
    if (s.gpa === undefined && s.credits === undefined) return;
    if (!isNum(s.gpa) || s.gpa < 0 || s.gpa > maxPoints + EPS) errors[index] = `Enter a GPA between 0 and ${maxPoints}.`;
    else if (s.credits !== undefined && (!isNum(s.credits) || s.credits < 0)) errors[index] = "Credits must be 0 or more.";
    else rows.push({ index, gpa: s.gpa, credits: s.credits ?? 1 });
  });
  if (Object.keys(errors).length) return { valid: false as const, errors };
  const totalCredits = rows.reduce((s, r) => s + r.credits, 0);
  const cgpa = totalCredits > 0 ? rows.reduce((s, r) => s + r.gpa * r.credits, 0) / totalCredits : NaN;
  return { valid: true as const, cgpa, totalCredits, rows };
}

/* ---------------- CGPA ↔ percentage conversion formulas ---------------- */

export type Confidence = "official" | "reported" | "convention";

export interface ConversionFormula {
  id: string;
  name: string;
  /** Who uses it and how well it is sourced. Shown to users verbatim. */
  note: string;
  confidence: Confidence;
  display: string;
  toPercent: (cgpa: number) => number;
  toCgpa: (percent: number) => number;
  max: number;
  source?: string;
}

export const CONVERSION_FORMULAS: ConversionFormula[] = [
  {
    id: "cbse-9.5",
    name: "CGPA × 9.5 (CBSE, common convention)",
    note: "Published by CBSE on its own Class X grade certificates as an indicative equivalence. Widely used as a default elsewhere, but UGC has never prescribed it. Check your marks card first.",
    confidence: "official",
    display: "Percentage = CGPA × 9.5",
    toPercent: (c) => c * 9.5,
    toCgpa: (p) => p / 9.5,
    max: 10,
    source: "https://www.cbse.gov.in/",
  },
  {
    id: "x10",
    name: "CGPA × 10 (Anna University, VTU 2021+ and many autonomous colleges)",
    note: "Consistently reported for Anna University regulations 2013/2017/2021 and VTU's 2021-22 schemes onward, and used by many universities. We could not fetch a primary regulation document, so confirm with your institution.",
    confidence: "reported",
    display: "Percentage = CGPA × 10",
    toPercent: (c) => c * 10,
    toCgpa: (p) => p / 10,
    max: 10,
  },
  {
    id: "vtu-2017",
    name: "(CGPA − 0.75) × 10 (VTU 2015–2018 CBCS schemes)",
    note: "From VTU's B.E. 2017 CBCS regulations (clause on percentage equivalence). Applies to the 2015, 2017 and 2018 schemes; later schemes use CGPA × 10.",
    confidence: "official",
    display: "Percentage = (CGPA − 0.75) × 10",
    toPercent: (c) => (c - 0.75) * 10,
    toCgpa: (p) => p / 10 + 0.75,
    max: 10,
    source: "https://vtu.ac.in/",
  },
  {
    id: "mumbai-7.1-11",
    name: "7.1 × CGPI + 11 (Mumbai University, engineering – commonly cited)",
    note: "The formula most engineering colleges under the University of Mumbai print for CBCGS batches. Sources conflict with a 2015 circular (below), so use the equivalence shown on your own marksheet.",
    confidence: "reported",
    display: "Percentage = 7.1 × CGPI + 11",
    toPercent: (c) => 7.1 * c + 11,
    toCgpa: (p) => (p - 11) / 7.1,
    max: 10,
  },
  {
    id: "mumbai-2015",
    name: "7.1 × CGPI + 12 if CGPI < 7, else 7.4 × CGPI + 12 (Mumbai University circular 720/2015, reported)",
    note: "Reported wording of University of Mumbai circular Exam/Engg./720 of 2015 for engineering. Not independently verified against the original circular.",
    confidence: "reported",
    display: "Percentage = 7.1 × CGPI + 12 (CGPI < 7) or 7.4 × CGPI + 12 (CGPI ≥ 7)",
    toPercent: (c) => (c < 7 ? 7.1 * c + 12 : 7.4 * c + 12),
    toCgpa: (p) => {
      const low = (p - 12) / 7.1;
      return low < 7 ? low : (p - 12) / 7.4;
    },
    max: 10,
  },
  {
    id: "minus-0.5",
    name: "(CGPA − 0.5) × 10",
    note: "Used by some state and autonomous universities. Convention only; verify with your institution.",
    confidence: "convention",
    display: "Percentage = (CGPA − 0.5) × 10",
    toPercent: (c) => (c - 0.5) * 10,
    toCgpa: (p) => p / 10 + 0.5,
    max: 10,
  },
  {
    id: "x25-4",
    name: "GPA × 25 (4.0 scale, linear)",
    note: "Simple linear mapping for a 4.0 scale. US institutions do not use one official conversion.",
    confidence: "convention",
    display: "Percentage = GPA × 25",
    toPercent: (g) => g * 25,
    toCgpa: (p) => p / 25,
    max: 4,
  },
  {
    id: "x20-5",
    name: "GPA × 20 (5.0 scale, linear)",
    note: "Arithmetic convention for a 5-point scale.",
    confidence: "convention",
    display: "Percentage = GPA × 20",
    toPercent: (g) => g * 20,
    toCgpa: (p) => p / 20,
    max: 5,
  },
];

/** 10-point CGPA → 4.0 GPA. WES publishes no formula; these are explicit estimates. */
export const CGPA_TO_GPA_BANDS: { min: number; gpa: number; letter: string }[] = [
  { min: 9, gpa: 4.0, letter: "A" },
  { min: 8, gpa: 3.7, letter: "A-" },
  { min: 7, gpa: 3.3, letter: "B+" },
  { min: 6, gpa: 3.0, letter: "B" },
  { min: 5, gpa: 2.7, letter: "B-" },
  { min: 4, gpa: 2.0, letter: "C" },
  { min: 0, gpa: 0, letter: "F" },
];

export function cgpaToGpaBand(cgpa: number) {
  if (!isNum(cgpa) || cgpa < 0 || cgpa > 10 + EPS) return undefined;
  return CGPA_TO_GPA_BANDS.find((b) => cgpa >= b.min - EPS);
}

export function cgpaToGpaLinear(cgpa: number): number {
  return (cgpa / 10) * 4;
}

export function getFormula(id: string): ConversionFormula {
  return CONVERSION_FORMULAS.find((f) => f.id === id) ?? CONVERSION_FORMULAS[0];
}

export function cgpaToPercent(cgpa: number, formula: ConversionFormula): number | { error: string } {
  if (!isNum(cgpa) || cgpa < 0) return { error: "Enter a CGPA of 0 or more." };
  if (cgpa > formula.max + EPS) return { error: `CGPA cannot exceed ${formula.max} on this scale.` };
  return Math.max(0, formula.toPercent(cgpa));
}

export function percentToCgpa(percent: number, formula: ConversionFormula): number | { error: string } {
  if (!isNum(percent) || percent < 0) return { error: "Enter a percentage of 0 or more." };
  if (percent > 100 + EPS) return { error: "Percentage cannot exceed 100." };
  const c = formula.toCgpa(percent);
  return Math.min(formula.max, Math.max(0, c));
}

/** Custom multiplier conversion: percent = cgpa × k (used for "my college uses × 9.2"). */
export function customFormula(multiplier: number, offset = 0, max = 10): ConversionFormula {
  return {
    id: "custom",
    name: "Custom",
    note: "Your own multiplier/offset.",
    confidence: "convention",
    display: `Percentage = (CGPA − ${offset}) × ${multiplier}`,
    toPercent: (c) => (c - offset) * multiplier,
    toCgpa: (p) => p / multiplier + offset,
    max,
  };
}
