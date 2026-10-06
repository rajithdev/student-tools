"use client";

import { useEffect, useId } from "react";
import { finalGradeNeeded, GRADE_SCALES, getScale, letterFor, minPercentFor, type GradeScale } from "@/lib/calc/grades";
import { parseNum, fmt, EPS } from "@/lib/calc/shared";
import { useUrlState, num } from "@/lib/use-url-state";
import { trackCalculatorUse } from "@/lib/analytics";
import { NumberField, SelectField, Segmented, Button } from "@/components/ui/Field";
import { HeroResult, Stat, Card, type Tone } from "@/components/ui/Result";
import { ShareBar } from "@/components/ui/ShareBar";

type Mode = "p" | "pt";
type TargetMode = "pc" | "lt";
const WEIGHT_PRESETS = [20, 25, 30, 40, 50];
const TABLE_SCORES = [50, 60, 70, 80, 90, 100];

/** Everything the result views need, in percent terms (points mode converts to this). */
interface Outcome {
  needed: number; // % on the final
  neededPts?: number; // points mode only
  finalPts?: number;
  current: number;
  w: number; // final weight as a fraction
  target: number;
  overallIfZero: number;
  overallIfPerfect: number;
  achievable: boolean;
  alreadySecured: boolean;
  explain: string;
}

const defaults = { m: "p", c: "", w: "", tm: "pc", g: "", l: "", sc: "us-plus-minus", e: "", ps: "", f: "" };

export function FinalGradeCalculator() {
  const { state, update, reset } = useUrlState(defaults, (p) => ({
    m: (["p", "pt"] as Mode[]).find((v) => v === p.get("m")),
    tm: (["pc", "lt"] as TargetMode[]).find((v) => v === p.get("tm")),
    sc: GRADE_SCALES.find((s) => s.id === p.get("sc"))?.id,
    l: GRADE_SCALES.some((s) => s.bands.some((b) => b.letter === p.get("l"))) ? p.get("l")! : undefined,
    c: num(p, "c"),
    w: num(p, "w"),
    g: num(p, "g"),
    e: num(p, "e"),
    ps: num(p, "ps"),
    f: num(p, "f"),
  }));
  const mode = state.m as Mode;
  const targetMode = state.tm as TargetMode;
  const scale = getScale(state.sc);
  const letters = scale.bands.filter((b) => b.min > 0);
  const letterOk = letters.some((b) => b.letter === state.l);
  const target = targetMode === "lt" ? (letterOk ? minPercentFor(state.l, scale) : undefined) : parseNum(state.g);

  const { outcome, errors } = compute();

  function compute(): { outcome: Outcome | null; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    if (mode === "p") {
      const current = parseNum(state.c);
      const finalWeight = parseNum(state.w);
      if (current === undefined) return { outcome: null, errors };
      const res = finalGradeNeeded({ current: current ?? NaN, finalWeight: finalWeight ?? NaN, target: target ?? NaN });
      if (!res.valid) {
        if (res.errors.current) errors.c = current === undefined ? "Enter your current grade." : res.errors.current;
        if (res.errors.finalWeight) errors.w = finalWeight === undefined ? "Pick how much the final is worth." : res.errors.finalWeight;
        if (res.errors.target) errors.g = target === undefined ? (targetMode === "lt" ? "Choose the grade you want." : "Enter the grade you want.") : res.errors.target;
        return { outcome: null, errors };
      }
      const w = finalWeight! / 100;
      const o: Outcome = { ...res, current: current!, w, target: target!, explain: `(${fmt(target!)} − ${fmt(current!)} × ${fmt(1 - w, 4)}) ÷ ${fmt(w, 4)} = ${fmt(res.needed, 1)}%` };
      return { outcome: o, errors };
    }
    const earned = parseNum(state.e);
    const possible = parseNum(state.ps);
    const finalPts = parseNum(state.f);
    if (earned === undefined) return { outcome: null, errors };
    if (earned === undefined || !Number.isFinite(earned) || earned < 0) errors.e = "Enter the points you have earned (0 or more).";
    if (possible === undefined || !Number.isFinite(possible) || possible <= 0) errors.ps = "Enter the points possible so far (greater than 0).";
    else if (earned !== undefined && earned > possible + EPS) errors.e = "Earned points cannot exceed points possible.";
    if (finalPts === undefined || !Number.isFinite(finalPts) || finalPts <= 0) errors.f = "Enter how many points the final is worth.";
    if (target === undefined || !Number.isFinite(target) || target < 0) errors.g = targetMode === "lt" ? "Choose the grade you want." : "Enter the grade you want (0 or more).";
    if (Object.keys(errors).length) return { outcome: null, errors };
    const total = possible! + finalPts!;
    const neededPts = (target! / 100) * total - earned!;
    const needed = (neededPts / finalPts!) * 100;
    const o: Outcome = {
      needed,
      neededPts,
      finalPts: finalPts!,
      current: (earned! / possible!) * 100,
      w: finalPts! / total,
      target: target!,
      overallIfZero: (earned! / total) * 100,
      overallIfPerfect: ((earned! + finalPts!) / total) * 100,
      achievable: neededPts <= finalPts! + EPS,
      alreadySecured: neededPts <= EPS,
      explain: `${fmt(target!)}% × (${fmt(possible!)} + ${fmt(finalPts!)}) − ${fmt(earned!)} = ${fmt(neededPts, 1)} points = ${fmt(needed, 1)}% of the final`,
    };
    return { outcome: o, errors };
  }

  const hasResult = outcome !== null;
  useEffect(() => {
    if (hasResult) trackCalculatorUse("final_grade", { mode });
  }, [hasResult, mode]);

  const touched = outcome !== null || Object.keys(errors).length > 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Card>
        <Segmented<Mode>
          label="How is your course graded?"
          value={mode}
          onChange={(m) => update({ m })}
          options={[
            { value: "p", label: "Percent" },
            { value: "pt", label: "Points" },
          ]}
        />
        {mode === "p" ? (
          <>
            <div className="mt-5">
              <NumberField label="Current grade" value={state.c} onChange={(v) => update({ c: v })} min={0} suffix="%" placeholder="e.g. 88" hint="Your average on everything before the final" error={errors.c} autoFocus />
            </div>
            <WeightPicker value={state.w} onChange={(w) => update({ w })} error={errors.w} />
          </>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4">
            <NumberField label="Points earned so far" value={state.e} onChange={(v) => update({ e: v })} min={0} placeholder="e.g. 420" error={errors.e} autoFocus />
            <NumberField label="Points possible so far" value={state.ps} onChange={(v) => update({ ps: v })} min={0} placeholder="e.g. 500" error={errors.ps} />
            <NumberField size="md" className="col-span-2" label="Final exam worth (points)" value={state.f} onChange={(v) => update({ f: v })} min={0} placeholder="e.g. 200" error={errors.f} />
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Segmented<TargetMode>
            className="col-span-2"
            label="Target grade as"
            value={targetMode}
            onChange={(tm) => update({ tm })}
            options={[
              { value: "pc", label: "Percent" },
              { value: "lt", label: "Letter" },
            ]}
          />
          {targetMode === "pc" ? (
            <NumberField label="Target grade" value={state.g} onChange={(v) => update({ g: v })} min={0} suffix="%" placeholder="e.g. 90" error={errors.g} />
          ) : (
            <div>
              <SelectField label="Target letter" value={letterOk ? state.l : ""} onChange={(l) => update({ l })} options={[{ value: "", label: "Choose a grade" }, ...letters.map((b) => ({ value: b.letter, label: `${b.letter} (${fmt(b.min)}%+)` }))]} />
              {errors.g ? (
                <p role="alert" className="mt-1 text-xs font-medium text-danger">
                  {errors.g}
                </p>
              ) : null}
            </div>
          )}
          <SelectField label="Grading scale" value={state.sc} onChange={(v) => update({ sc: v })} options={GRADE_SCALES.map((s) => ({ value: s.id, label: s.name }))} />
        </div>
        {touched ? (
          <div className="mt-5">
            <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
          </div>
        ) : null}
      </Card>

      <div className="space-y-4">
        {outcome ? (
          <Results o={outcome} scale={scale} onReset={reset} />
        ) : (
          <HeroResult tone="neutral" badge="Waiting for numbers" value="—" unit="%" verdict={mode === "p" ? "Enter your current grade, the final's weight and your target to see the score you need." : "Enter your points so far, the final's points and your target to see the score you need."} sub="Nothing you type leaves your device." />
        )}
      </div>
    </div>
  );
}

function WeightPicker({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string }) {
  const id = useId();
  return (
    <div className="mt-5">
      <p className="text-sm font-medium text-fg" id={id}>
        Final exam weight
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2" role="group" aria-labelledby={id}>
        {WEIGHT_PRESETS.map((p) => {
          const active = Number(value) === p;
          return (
            <button key={p} type="button" aria-pressed={active} onClick={() => onChange(String(p))} className={`tnum min-h-11 rounded-xl border px-4 text-sm font-semibold ${active ? "border-fg bg-fg text-bg" : "border-line-strong bg-bg-elev text-fg hover:border-fg-faint"}`}>
              {p}%
            </button>
          );
        })}
        <div className="relative">
          <label htmlFor={`${id}-custom`} className="sr-only">
            Custom final weight percentage
          </label>
          <input id={`${id}-custom`} type="number" inputMode="decimal" min={0} max={100} step="any" value={value} placeholder="other" onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} className={`tnum h-11 w-24 rounded-xl border bg-bg-elev pl-3 pr-7 text-sm font-semibold text-fg placeholder:text-fg-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 ${error ? "border-danger" : "border-line-strong"}`} />
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-fg-faint">
            %
          </span>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Results({ o, scale, onReset }: { o: Outcome; scale: GradeScale; onReset: () => void }) {
  const pts = o.neededPts !== undefined && o.finalPts !== undefined;
  const letter = (p: number) => letterFor(p, scale)?.letter ?? "—";
  let tone: Tone;
  let badge: string;
  let verdict: string;
  if (o.alreadySecured) {
    tone = "safe";
    badge = "Already secured";
    verdict = `You could score 0 and still finish with ${fmt(o.overallIfZero, 1)}%.`;
  } else if (o.achievable) {
    tone = o.needed <= 85 + EPS ? "safe" : "warn";
    badge = "Achievable";
    verdict = pts ? `Score at least ${fmt(o.neededPts!, 1)} of ${fmt(o.finalPts!)} points (${fmt(o.needed, 1)}%) on the final to finish with ${fmt(o.target)}%.` : `Score at least ${fmt(o.needed, 1)}% on the final to finish with ${fmt(o.target)}%.`;
  } else {
    tone = "danger";
    badge = "Not reachable";
    verdict = `Even a perfect final gives you ${fmt(o.overallIfPerfect, 1)}%.`;
  }
  const heroValue = pts ? fmt(Math.max(0, o.neededPts!), 1) : fmt(Math.max(0, o.needed), 1);
  const summary = `Final grade: need ${fmt(o.needed, 1)}% on the final for ${fmt(o.target)}% overall. ${verdict}`;

  return (
    <>
      <HeroResult tone={tone} badge={badge} value={heroValue} unit={pts ? "pts" : "%"} verdict={verdict} sub={<span className="tnum break-words">{o.explain}</span>} />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="If you score 0" value={`${fmt(o.overallIfZero, 1)}%`} hint={`${letter(o.overallIfZero)} overall`} tone={o.overallIfZero >= o.target - EPS ? "safe" : "neutral"} />
        <Stat label="If you score 100%" value={`${fmt(o.overallIfPerfect, 1)}%`} hint={`${letter(o.overallIfPerfect)} overall`} tone={o.overallIfPerfect >= o.target - EPS ? "safe" : "danger"} />
      </div>
      <Card title="What each final score gives you">
        <table className="tnum w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-fg-faint">
              <th scope="col" className="pb-2">Final score</th>
              <th scope="col" className="pb-2 text-right">Overall</th>
              <th scope="col" className="pb-2 text-right">Letter</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_SCORES.map((s) => {
              const overall = o.current * (1 - o.w) + s * o.w;
              const hit = overall >= o.target - EPS;
              return (
                <tr key={s} className="border-t border-line">
                  <td className="py-2 text-fg-muted">
                    {s}%{pts ? <span className="text-fg-faint"> ({fmt((s / 100) * o.finalPts!, 1)} pts)</span> : null}
                  </td>
                  <td className={`py-2 text-right font-semibold ${hit ? "text-safe" : "text-danger"}`}>{fmt(overall, 1)}%</td>
                  <td className="py-2 text-right text-fg">{letter(overall)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-fg-faint">Green rows reach your {fmt(o.target)}% target. Letters use the {scale.name} scale.</p>
      </Card>
      <ShareBar text={summary} onReset={onReset} />
    </>
  );
}
