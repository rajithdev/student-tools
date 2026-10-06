"use client";

import { useEffect, useMemo } from "react";
import { gpa, cumulative } from "@/lib/calc/gpa";
import { getScale, type GradeScale } from "@/lib/calc/grades";
import { parseNum, fmt } from "@/lib/calc/shared";
import { useUrlState } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { Segmented, SelectField, Toggle, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";
import { RowNumber, RowSelect, RemoveRowButton, RowError, encodeRows, parseRows, cleanNum, cleanOneOf, str } from "./RowFields";

/** VTU 2017 CBCS letter grades (GRADE_SCALES has no VTU entry). */
const VTU_2017: GradeScale = {
  id: "vtu-2017",
  name: "VTU 2017 CBCS (S, A, B, C, D, E, F)",
  maxPoints: 10,
  bands: [
    { min: 90, letter: "S", points: 10 },
    { min: 80, letter: "A", points: 9 },
    { min: 70, letter: "B", points: 8 },
    { min: 60, letter: "C", points: 7 },
    { min: 50, letter: "D", points: 6 },
    { min: 40, letter: "E", points: 4 },
    { min: 0, letter: "F", points: 0 },
  ],
};
const SCALES: GradeScale[] = [getScale("india-10"), VTU_2017];
const CUSTOM = "custom";
const MODES = ["s", "c"] as const;
type Mode = (typeof MODES)[number];

// Subject row = credits:grade:points ; semester row = sgpa:credits
const defaults = { mode: "s" as Mode, sc: "india-10", r: "|||", s: "|", eq: "" };

function classify(value: number): { badge: string; tone: Tone } {
  if (value >= 7.5) return { badge: "First class with distinction (typical)", tone: "safe" };
  if (value >= 6) return { badge: "First class (typical)", tone: "safe" };
  if (value >= 5) return { badge: "Second class (typical)", tone: "warn" };
  return { badge: "Pass / below (typical)", tone: "danger" };
}

export function CgpaCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    mode: cleanOneOf(str(p, "mode") ?? "", MODES) as Mode | undefined,
    sc: cleanOneOf(str(p, "sc") ?? "", SCALES.map((s) => s.id)) || undefined,
    r: str(p, "r"),
    s: str(p, "s"),
    eq: str(p, "eq") === "1" ? "1" : undefined,
  }));

  const scale = SCALES.find((s) => s.id === state.sc) ?? SCALES[0];
  const equal = state.eq === "1";

  const subjects = useMemo(() => {
    const allowed = [...scale.bands.map((b) => b.letter), CUSTOM];
    return parseRows(state.r, 3, 4).map(([c, g, p]) => [cleanNum(c), cleanOneOf(g, allowed) ?? "", cleanNum(p)]);
  }, [state.r, scale]);
  const semesters = useMemo(() => parseRows(state.s, 2, 2).map(([g, c]) => [cleanNum(g), cleanNum(c)]), [state.s]);

  const subjectResult = useMemo(
    () =>
      gpa(
        subjects.map(([c, g, p]) => ({
          credits: parseNum(c),
          points: g === CUSTOM ? parseNum(p) : g ? scale.bands.find((b) => b.letter === g)?.points : undefined,
        })),
        10,
      ),
    [subjects, scale],
  );
  const semesterResult = useMemo(() => cumulative(semesters.map(([g, c]) => ({ gpa: parseNum(g), credits: equal ? undefined : parseNum(c) })), 10), [semesters, equal]);

  const mode = state.mode;
  const value = mode === "s" ? (subjectResult.valid ? subjectResult.gpa : NaN) : semesterResult.valid ? semesterResult.cgpa : NaN;
  const hasResult = Number.isFinite(value);

  useEffect(() => {
    if (hasResult) trackCalculatorUse("cgpa", { mode });
  }, [hasResult, mode]);

  const setSubjects = (rows: string[][]) => update({ r: encodeRows(rows) });
  const setSemesters = (rows: string[][]) => update({ s: encodeRows(rows) });
  const subjectErrors = subjectResult.valid ? {} : subjectResult.errors;
  const semesterErrors = semesterResult.valid ? {} : semesterResult.errors;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented
          label="What are you calculating?"
          value={mode}
          onChange={(v) => update({ mode: v })}
          options={[
            { value: "s", label: "Subjects → SGPA" },
            { value: "c", label: "Semesters → CGPA" },
          ]}
        />

        {mode === "s" ? (
          <div className="mt-5">
            <SelectField label="Grading scale" value={scale.id} onChange={(v) => update({ sc: v, r: encodeRows(subjects.map(([c, g, p]) => [c, g === CUSTOM ? g : "", p])) })} options={SCALES.map((s) => ({ value: s.id, label: s.name }))} hint="Letters are reset when you switch scales." />
            <div aria-hidden="true" className="mt-5 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2.75rem] gap-2 text-xs font-semibold uppercase tracking-wider text-fg-faint">
              <span>Credits</span>
              <span>Grade</span>
              <span />
            </div>
            <ul className="mt-1.5 space-y-2">
              {subjects.map(([c, g, p], i) => (
                <li key={i}>
                  <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2.75rem] gap-2">
                    <RowNumber label={`Subject ${i + 1} credits`} value={c} onChange={(v) => setSubjects(subjects.map((row, j) => (j === i ? [v, row[1], row[2]] : row)))} min={0} step={0.5} placeholder="e.g. 4" invalid={!!subjectErrors[i]} />
                    <div className={g === CUSTOM ? "grid grid-cols-2 gap-2" : ""}>
                      <RowSelect
                        label={`Subject ${i + 1} grade`}
                        value={g}
                        onChange={(v) => setSubjects(subjects.map((row, j) => (j === i ? [row[0], v, row[2]] : row)))}
                        invalid={!!subjectErrors[i]}
                        options={[{ value: "", label: "Choose grade" }, ...scale.bands.map((b) => ({ value: b.letter, label: `${b.letter} (${b.points})` })), { value: CUSTOM, label: "Enter points" }]}
                      />
                      {g === CUSTOM ? <RowNumber label={`Subject ${i + 1} grade points`} value={p} onChange={(v) => setSubjects(subjects.map((row, j) => (j === i ? [row[0], row[1], v] : row)))} min={0} max={10} placeholder="0–10" invalid={!!subjectErrors[i]} /> : null}
                    </div>
                    <RemoveRowButton label={`Remove subject ${i + 1}`} onClick={() => setSubjects(subjects.filter((_, j) => j !== i))} disabled={subjects.length <= 1} />
                  </div>
                  <RowError message={subjectErrors[i]} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setSubjects([...subjects, ["", "", ""]])}>+ Add subject</Button>
              <Button variant="ghost" onClick={reset}>
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <Toggle label="All semesters have equal credits" hint="Uses a simple average of SGPAs instead of weighting by credits." checked={equal} onChange={(v) => update({ eq: v ? "1" : "" })} />
            <div aria-hidden="true" className={`mt-5 grid gap-2 text-xs font-semibold uppercase tracking-wider text-fg-faint ${equal ? "grid-cols-[minmax(0,1fr)_2.75rem]" : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem]"}`}>
              <span>SGPA</span>
              {equal ? null : <span>Credits</span>}
              <span />
            </div>
            <ul className="mt-1.5 space-y-2">
              {semesters.map(([g, c], i) => (
                <li key={i}>
                  <div className={`grid gap-2 ${equal ? "grid-cols-[minmax(0,1fr)_2.75rem]" : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem]"}`}>
                    <RowNumber label={`Semester ${i + 1} SGPA`} value={g} onChange={(v) => setSemesters(semesters.map((row, j) => (j === i ? [v, row[1]] : row)))} min={0} max={10} placeholder="e.g. 8.2" invalid={!!semesterErrors[i]} />
                    {equal ? null : <RowNumber label={`Semester ${i + 1} credits`} value={c} onChange={(v) => setSemesters(semesters.map((row, j) => (j === i ? [row[0], v] : row)))} min={0} step={0.5} placeholder="e.g. 24" invalid={!!semesterErrors[i]} />}
                    <RemoveRowButton label={`Remove semester ${i + 1}`} onClick={() => setSemesters(semesters.filter((_, j) => j !== i))} disabled={semesters.length <= 1} />
                  </div>
                  <RowError message={semesterErrors[i]} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setSemesters([...semesters, ["", ""]])}>+ Add semester</Button>
              <Button variant="ghost" onClick={reset}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        {!hasResult ? (
          <HeroResult tone="neutral" badge="Waiting for numbers" value="—" verdict={mode === "s" ? "Enter credits and a grade for each subject to see your SGPA." : "Enter the SGPA of each semester to see your CGPA."} sub="Nothing you type leaves your device." />
        ) : mode === "s" && subjectResult.valid ? (
          <SubjectResults sgpa={subjectResult.gpa} credits={subjectResult.totalCredits} points={subjectResult.totalPoints} rows={subjectResult.rows} onReset={reset} />
        ) : semesterResult.valid ? (
          <SemesterResults cgpa={semesterResult.cgpa} credits={semesterResult.totalCredits} rows={semesterResult.rows} equal={equal} onReset={reset} />
        ) : null}
      </div>
    </div>
  );
}

function SubjectResults({ sgpa, credits, points, rows, onReset }: { sgpa: number; credits: number; points: number; rows: { credits: number; points: number }[]; onReset: () => void }) {
  const { badge, tone } = classify(sgpa);
  const value = sgpa.toFixed(2);
  const steps = rows.filter((r) => r.credits > 0).map((r) => `${fmt(r.credits)}×${fmt(r.points)}`);
  return (
    <>
      <HeroResult tone={tone} badge={badge} value={value} unit="SGPA" verdict={`${fmt(points)} credit points over ${fmt(credits)} credits.`} sub="Class thresholds (7.5 / 6.0 / 5.0) vary by university; check your regulations." />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total credits" value={fmt(credits)} />
        <Stat label="Credit points" value={fmt(points)} hint="Σ credits × grade points" />
        <Stat label="× 9.5" value={`${fmt(sgpa * 9.5)}%`} hint="CBSE-style equivalence" />
        <Stat label="× 10" value={`${fmt(sgpa * 10)}%`} hint="Anna Univ., VTU 2021+" />
      </div>
      <p className="px-1 text-xs text-fg-muted">
        The percentage formula depends on your university.{" "}
        <a href="/cgpa-to-percentage/" className="font-medium text-accent underline-offset-2 hover:underline">
          Compare every formula →
        </a>
      </p>
      <Card title="How this was calculated">
        <p className="tnum break-words text-sm text-fg">
          ({steps.join(" + ")}) ÷ {fmt(credits)} = <strong>{value}</strong>
        </p>
        <p className="mt-2 text-xs text-fg-muted">SGPA = Σ(credits × grade points) ÷ Σ credits. Each subject counts in proportion to its credits.</p>
      </Card>
      <ShareBar text={`SGPA ${value} over ${fmt(credits)} credits (${badge}).`} onReset={onReset} />
    </>
  );
}

function SemesterResults({ cgpa, credits, rows, equal, onReset }: { cgpa: number; credits: number; rows: { gpa: number; credits: number }[]; equal: boolean; onReset: () => void }) {
  const { badge, tone } = classify(cgpa);
  const value = cgpa.toFixed(2);
  const steps = equal ? rows.map((r) => fmt(r.gpa)) : rows.filter((r) => r.credits > 0).map((r) => `${fmt(r.gpa)}×${fmt(r.credits)}`);
  return (
    <>
      <HeroResult tone={tone} badge={badge} value={value} unit="CGPA" verdict={equal ? `Simple average of ${rows.length} semester${rows.length === 1 ? "" : "s"}.` : `Credit-weighted over ${fmt(credits)} credits across ${rows.length} semester${rows.length === 1 ? "" : "s"}.`} sub="Class thresholds (7.5 / 6.0 / 5.0) vary by university; check your regulations." />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Semesters" value={rows.length} />
        {equal ? <Stat label="Method" value="Average" hint="equal credits assumed" /> : <Stat label="Total credits" value={fmt(credits)} />}
        <Stat label="× 9.5" value={`${fmt(cgpa * 9.5)}%`} hint="CBSE-style equivalence" />
        <Stat label="× 10" value={`${fmt(cgpa * 10)}%`} hint="Anna Univ., VTU 2021+" />
      </div>
      <p className="px-1 text-xs text-fg-muted">
        The percentage formula depends on your university.{" "}
        <a href="/cgpa-to-percentage/" className="font-medium text-accent underline-offset-2 hover:underline">
          Compare every formula →
        </a>
      </p>
      <Card title="How this was calculated">
        <p className="tnum break-words text-sm text-fg">
          ({steps.join(" + ")}) ÷ {equal ? rows.length : fmt(credits)} = <strong>{value}</strong>
        </p>
        <p className="mt-2 text-xs text-fg-muted">{equal ? "Simple average: CGPA = Σ SGPA ÷ number of semesters. Only exact when every semester carries the same credits." : "Credit-weighted: CGPA = Σ(SGPA × semester credits) ÷ Σ credits. This is what most universities print on the final marks card."}</p>
      </Card>
      <ShareBar text={`CGPA ${value} across ${rows.length} semesters (${badge}).`} onReset={onReset} />
    </>
  );
}
