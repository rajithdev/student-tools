import { EPS, isNum } from "./shared";

/** Letter-grade scales. Each band is [minPercent, letter, gradePoints]. */
export interface GradeBand {
  min: number;
  letter: string;
  points: number;
}
export interface GradeScale {
  id: string;
  name: string;
  /** Max grade points for GPA on this scale. */
  maxPoints: number;
  bands: GradeBand[]; // sorted descending by min
}

export const GRADE_SCALES: GradeScale[] = [
  {
    id: "us-plus-minus",
    name: "US letter (A+ to F, 4.0 GPA)",
    maxPoints: 4,
    bands: [
      { min: 97, letter: "A+", points: 4.0 },
      { min: 93, letter: "A", points: 4.0 },
      { min: 90, letter: "A-", points: 3.7 },
      { min: 87, letter: "B+", points: 3.3 },
      { min: 83, letter: "B", points: 3.0 },
      { min: 80, letter: "B-", points: 2.7 },
      { min: 77, letter: "C+", points: 2.3 },
      { min: 73, letter: "C", points: 2.0 },
      { min: 70, letter: "C-", points: 1.7 },
      { min: 67, letter: "D+", points: 1.3 },
      { min: 63, letter: "D", points: 1.0 },
      { min: 60, letter: "D-", points: 0.7 },
      { min: 0, letter: "F", points: 0 },
    ],
  },
  {
    id: "us-simple",
    name: "US letter (A to F, no +/−)",
    maxPoints: 4,
    bands: [
      { min: 90, letter: "A", points: 4 },
      { min: 80, letter: "B", points: 3 },
      { min: 70, letter: "C", points: 2 },
      { min: 60, letter: "D", points: 1 },
      { min: 0, letter: "F", points: 0 },
    ],
  },
  {
    id: "india-10",
    name: "India 10-point (O, A+, A … F)",
    maxPoints: 10,
    bands: [
      { min: 90, letter: "O", points: 10 },
      { min: 80, letter: "A+", points: 9 },
      { min: 70, letter: "A", points: 8 },
      { min: 60, letter: "B+", points: 7 },
      { min: 50, letter: "B", points: 6 },
      { min: 45, letter: "C", points: 5 },
      { min: 40, letter: "P", points: 4 },
      { min: 0, letter: "F", points: 0 },
    ],
  },
  {
    id: "uk-honours",
    name: "UK honours classification",
    maxPoints: 0,
    bands: [
      { min: 70, letter: "First (1st)", points: 0 },
      { min: 60, letter: "Upper second (2:1)", points: 0 },
      { min: 50, letter: "Lower second (2:2)", points: 0 },
      { min: 40, letter: "Third (3rd)", points: 0 },
      { min: 0, letter: "Fail", points: 0 },
    ],
  },
];

export function getScale(id: string): GradeScale {
  return GRADE_SCALES.find((s) => s.id === id) ?? GRADE_SCALES[0];
}

export function letterFor(percent: number, scale: GradeScale): GradeBand | undefined {
  if (!isNum(percent)) return undefined;
  return scale.bands.find((b) => percent >= b.min - EPS);
}

/** Minimum percent needed for a given letter on a scale. */
export function minPercentFor(letter: string, scale: GradeScale): number | undefined {
  return scale.bands.find((b) => b.letter === letter)?.min;
}

/* ---------------- Weighted grade (current standing) ---------------- */

export interface GradeItem {
  name?: string;
  /** Score obtained. */
  score?: number;
  /** Maximum possible score. Defaults to 100 (score is a percent). */
  outOf?: number;
  /** Weight of this item (any units; weights are normalised). */
  weight?: number;
}

export interface WeightedGradeResult {
  valid: true;
  /** Weighted average in percent. NaN if no complete rows. */
  percent: number;
  totalWeight: number;
  rows: { index: number; percent: number; weight: number; contribution: number }[];
}

export function weightedGrade(items: GradeItem[]): WeightedGradeResult | { valid: false; errors: Record<number, string> } {
  const errors: Record<number, string> = {};
  const rows: WeightedGradeResult["rows"] = [];
  items.forEach((it, index) => {
    const blank = it.score === undefined && it.weight === undefined;
    if (blank) return;
    const outOf = it.outOf ?? 100;
    if (!isNum(it.score) || it.score < 0) errors[index] = "Enter a score of 0 or more.";
    else if (!isNum(outOf) || outOf <= 0) errors[index] = "“Out of” must be greater than 0.";
    else if (it.score > outOf + EPS) errors[index] = "Score cannot exceed the maximum.";
    else if (!isNum(it.weight) || it.weight < 0) errors[index] = "Enter a weight of 0 or more.";
    else rows.push({ index, percent: (it.score / outOf) * 100, weight: it.weight, contribution: 0 });
  });
  if (Object.keys(errors).length) return { valid: false, errors };
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const percent = totalWeight > 0 ? rows.reduce((s, r) => s + r.percent * r.weight, 0) / totalWeight : NaN;
  rows.forEach((r) => (r.contribution = totalWeight > 0 ? (r.percent * r.weight) / totalWeight : 0));
  return { valid: true, percent, totalWeight, rows };
}

/* ---------------- Final grade needed ---------------- */

export interface FinalNeededInput {
  /** Current grade in percent (all work before the final). */
  current: number;
  /** Weight of the final as a percent of the course (0 < w <= 100). */
  finalWeight: number;
  /** Desired overall grade in percent. */
  target: number;
}

export interface FinalNeededResult {
  valid: true;
  /** Score needed on the final, in percent (may be < 0 or > 100). */
  needed: number;
  /** Overall grade if the final is scored 0 / 100. */
  overallIfZero: number;
  overallIfPerfect: number;
  /** needed <= 100 */
  achievable: boolean;
  /** needed <= 0: target already secured */
  alreadySecured: boolean;
}

export function finalGradeNeeded(input: FinalNeededInput): FinalNeededResult | { valid: false; errors: Partial<Record<keyof FinalNeededInput, string>> } {
  const errors: Partial<Record<keyof FinalNeededInput, string>> = {};
  const { current, finalWeight, target } = input;
  if (!isNum(current) || current < 0) errors.current = "Enter your current grade as a percentage (0 or more).";
  if (!isNum(finalWeight) || finalWeight <= 0 || finalWeight > 100) errors.finalWeight = "Final weight must be between 0 and 100 (exclusive of 0).";
  if (!isNum(target) || target < 0) errors.target = "Enter the grade you want (0 or more).";
  if (Object.keys(errors).length) return { valid: false, errors };
  const w = finalWeight / 100;
  const needed = (target - current * (1 - w)) / w;
  return {
    valid: true,
    needed,
    overallIfZero: current * (1 - w),
    overallIfPerfect: current * (1 - w) + 100 * w,
    achievable: needed <= 100 + EPS,
    alreadySecured: needed <= EPS,
  };
}

/* ---------------- Marks → percentage ---------------- */

export interface MarksRow {
  name?: string;
  obtained?: number;
  max?: number;
}

export interface MarksResult {
  valid: true;
  obtained: number;
  max: number;
  percent: number;
  rows: { index: number; obtained: number; max: number; percent: number; counted: boolean }[];
  /** When bestOf is used: number of subjects counted. */
  counted: number;
}

export function marksPercentage(rows: MarksRow[], opts: { bestOf?: number } = {}): MarksResult | { valid: false; errors: Record<number, string> } {
  const errors: Record<number, string> = {};
  const parsed: MarksResult["rows"] = [];
  rows.forEach((r, index) => {
    if (r.obtained === undefined && r.max === undefined) return;
    const max = r.max ?? 100;
    if (!isNum(r.obtained) || r.obtained < 0) errors[index] = "Enter marks obtained (0 or more).";
    else if (!isNum(max) || max <= 0) errors[index] = "Maximum marks must be greater than 0.";
    else if (r.obtained > max + EPS) errors[index] = "Marks obtained cannot exceed maximum marks.";
    else parsed.push({ index, obtained: r.obtained, max, percent: (r.obtained / max) * 100, counted: true });
  });
  if (Object.keys(errors).length) return { valid: false, errors };
  let counted = parsed;
  if (opts.bestOf && opts.bestOf > 0 && opts.bestOf < parsed.length) {
    const sorted = [...parsed].sort((a, b) => b.percent - a.percent || b.obtained - a.obtained);
    const keep = new Set(sorted.slice(0, opts.bestOf).map((r) => r.index));
    parsed.forEach((r) => (r.counted = keep.has(r.index)));
    counted = parsed.filter((r) => r.counted);
  }
  const obtained = counted.reduce((s, r) => s + r.obtained, 0);
  const max = counted.reduce((s, r) => s + r.max, 0);
  return { valid: true, obtained, max, percent: max > 0 ? (obtained / max) * 100 : NaN, rows: parsed, counted: counted.length };
}

/** Marks required to reach a percentage of a total. */
export function marksForPercent(percent: number, total: number): number {
  return (percent / 100) * total;
}
