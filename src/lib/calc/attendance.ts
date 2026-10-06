/**
 * Attendance mathematics.
 *
 * All comparisons are done on exact values (never on rounded display values),
 * with a tiny epsilon to absorb floating-point noise from fractional targets
 * such as 66.67%. Every integer answer is verified by direct re-checking so
 * boundary cases (exactly 75%, 74.999%, etc.) are always correct.
 */

export const EPS = 1e-9;

export interface AttendanceInput {
  attended: number;
  total: number;
  /** Minimum attendance the institution requires, in percent (0–100). */
  required: number;
  /** Personal goal in percent (0–100). Defaults to `required`. */
  target?: number;
  /** Optional: classes still scheduled this term. Enables feasibility analysis. */
  remaining?: number;
}

export type AttendanceStatus = "safe" | "exact" | "below" | "empty";

export interface Projection {
  k: number;
  percent: number;
}

export interface AttendanceResult {
  valid: true;
  attended: number;
  total: number;
  required: number;
  target: number;
  /** Current percentage (exact, not rounded). NaN when total is 0. */
  percent: number;
  status: AttendanceStatus;
  /** Percentage-point gap to requirement (positive = above). */
  marginToRequired: number;
  /** Consecutive classes that can be missed while staying >= required. Infinity when required is 0. */
  canMiss: number;
  /** Consecutive classes to attend to reach required. 0 if already there. Infinity if impossible (target 100 and below). */
  needForRequired: number;
  /** Consecutive classes to attend to reach target. */
  needForTarget: number;
  /** Projections after missing the next k classes. */
  afterMissing: Projection[];
  /** Projections after attending the next k classes. */
  afterAttending: Projection[];
  /** Feasibility within the remaining classes (only when `remaining` was given). */
  remaining?: {
    remaining: number;
    /** Max attendance if every remaining class is attended. */
    maxPossible: number;
    /** Min attendance if every remaining class is missed. */
    minPossible: number;
    /** Classes out of `remaining` that must be attended to end >= required. Infinity if impossible. */
    mustAttendForRequired: number;
    /** Classes out of `remaining` that may be skipped and still end >= required. */
    canSkipForRequired: number;
    mustAttendForTarget: number;
    canSkipForTarget: number;
  };
}

export interface AttendanceError {
  valid: false;
  errors: Partial<Record<keyof AttendanceInput, string>>;
}

export const PROJECTION_STEPS = [1, 2, 3, 5, 10] as const;

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/** Percentage attended = attended / total × 100 (exact). */
export function attendancePercent(attended: number, total: number): number {
  if (total <= 0) return NaN;
  return (attended / total) * 100;
}

/** True when attended/total is at or above `pct` percent (exact, epsilon-tolerant). */
export function meets(attended: number, total: number, pct: number): boolean {
  if (total <= 0) return pct <= 0;
  return attended * 100 >= pct * total - EPS;
}

/**
 * Largest m >= 0 such that attended / (total + m) >= pct%.
 * Returns Infinity when pct <= 0 (any number of misses is fine),
 * 0 when already below the threshold.
 */
export function classesCanMiss(attended: number, total: number, pct: number): number {
  if (pct <= 0) return Infinity;
  if (!meets(attended, total, pct)) return 0;
  // attended*100 >= pct*(total+m)  =>  m <= (attended*100 - pct*total)/pct
  let m = Math.floor((attended * 100 - pct * total) / pct + EPS);
  if (m < 0) m = 0;
  // Verify and correct for floating-point drift.
  while (meets(attended, total + m + 1, pct)) m++;
  while (m > 0 && !meets(attended, total + m, pct)) m--;
  return m;
}

/**
 * Smallest n >= 0 such that (attended + n) / (total + n) >= pct%.
 * Returns 0 if already satisfied; Infinity if pct >= 100 and attendance is not already perfect.
 */
export function classesNeeded(attended: number, total: number, pct: number): number {
  if (meets(attended, total, pct)) return 0;
  if (pct >= 100) return total <= 0 ? 1 : Infinity;
  // (attended+n)*100 >= pct*(total+n) => n*(100-pct) >= pct*total - 100*attended
  let n = Math.ceil((pct * total - 100 * attended) / (100 - pct) - EPS);
  if (n < 0) n = 0;
  while (!meets(attended + n, total + n, pct)) n++;
  while (n > 0 && meets(attended + n - 1, total + n - 1, pct)) n--;
  return n;
}

/**
 * Out of `remaining` scheduled classes, the minimum number to attend so the
 * final attendance is >= pct%. Infinity if even attending all is not enough.
 */
export function mustAttendOfRemaining(attended: number, total: number, remaining: number, pct: number): number {
  const finalTotal = total + remaining;
  if (!meets(attended + remaining, finalTotal, pct)) return Infinity;
  // (attended + x)*100 >= pct*finalTotal  => x >= pct*finalTotal/100 - attended
  let x = Math.ceil((pct * finalTotal) / 100 - attended - EPS);
  if (x < 0) x = 0;
  if (x > remaining) x = remaining;
  while (x > 0 && meets(attended + x - 1, finalTotal, pct)) x--;
  while (x < remaining && !meets(attended + x, finalTotal, pct)) x++;
  return x;
}

export function validateAttendance(input: AttendanceInput): AttendanceError | null {
  const errors: AttendanceError["errors"] = {};
  const { attended, total, required, target, remaining } = input;
  if (!isFiniteNonNegative(attended)) errors.attended = "Enter 0 or more classes attended.";
  if (!isFiniteNonNegative(total)) errors.total = "Enter the total number of classes held.";
  if (isFiniteNonNegative(attended) && isFiniteNonNegative(total) && attended > total + EPS) {
    errors.attended = "Classes attended cannot be more than classes held.";
  }
  if (!(typeof required === "number" && Number.isFinite(required)) || required < 0 || required > 100) {
    errors.required = "Required attendance must be between 0 and 100.";
  }
  if (target !== undefined && (!Number.isFinite(target) || target < 0 || target > 100)) {
    errors.target = "Target attendance must be between 0 and 100.";
  }
  if (remaining !== undefined && !isFiniteNonNegative(remaining)) {
    errors.remaining = "Remaining classes must be 0 or more.";
  }
  return Object.keys(errors).length ? { valid: false, errors } : null;
}

export function calculateAttendance(input: AttendanceInput): AttendanceResult | AttendanceError {
  const invalid = validateAttendance(input);
  if (invalid) return invalid;

  const { attended, total, required, remaining } = input;
  const target = input.target ?? required;
  const percent = attendancePercent(attended, total);

  let status: AttendanceStatus;
  if (total === 0) status = "empty";
  else if (Math.abs(percent - required) < 1e-7) status = "exact";
  else if (meets(attended, total, required)) status = "safe";
  else status = "below";

  const result: AttendanceResult = {
    valid: true,
    attended,
    total,
    required,
    target,
    percent,
    status,
    marginToRequired: Number.isNaN(percent) ? NaN : percent - required,
    canMiss: total === 0 ? (required <= 0 ? Infinity : 0) : classesCanMiss(attended, total, required),
    needForRequired: classesNeeded(attended, total, required),
    needForTarget: classesNeeded(attended, total, target),
    afterMissing: PROJECTION_STEPS.map((k) => ({ k, percent: attendancePercent(attended, total + k) })),
    afterAttending: PROJECTION_STEPS.map((k) => ({ k, percent: attendancePercent(attended + k, total + k) })),
  };

  if (remaining !== undefined) {
    const finalTotal = total + remaining;
    const mustReq = mustAttendOfRemaining(attended, total, remaining, required);
    const mustTgt = mustAttendOfRemaining(attended, total, remaining, target);
    result.remaining = {
      remaining,
      maxPossible: attendancePercent(attended + remaining, finalTotal),
      minPossible: attendancePercent(attended, finalTotal),
      mustAttendForRequired: mustReq,
      canSkipForRequired: Number.isFinite(mustReq) ? remaining - mustReq : 0,
      mustAttendForTarget: mustTgt,
      canSkipForTarget: Number.isFinite(mustTgt) ? remaining - mustTgt : 0,
    };
  }

  return result;
}

/**
 * Format a percentage for display. Uses 2 decimals, but never lets rounding
 * lie across a threshold: 74.996% at a 75% threshold renders as "74.99%" rather
 * than "75.00%", so the number shown always agrees with the status shown.
 */
export function formatPercent(value: number, threshold?: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  const factor = 10 ** decimals;
  let rounded = Math.round(value * factor) / factor;
  if (threshold !== undefined && Number.isFinite(threshold)) {
    const below = value < threshold - EPS;
    const above = value > threshold + EPS;
    if (below && rounded >= threshold) rounded = Math.floor(value * factor) / factor;
    if (above && rounded <= threshold) rounded = Math.ceil(value * factor) / factor;
  }
  return rounded.toFixed(decimals);
}
