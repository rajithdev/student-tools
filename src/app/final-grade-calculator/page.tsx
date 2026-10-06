import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { FinalGradeCalculator } from "@/components/calculators/FinalGradeCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("final-grade-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="final-grade-calculator"
      intro="Enter your current grade, how much the final exam is worth and the grade you want. You get the exact score you need on the final, whether that is realistic, and what every possible final score would leave you with."
      calculator={<FinalGradeCalculator />}
    >
      <h2 id="formula">The final grade formula</h2>
      <p className="formula">Score needed on final = (Target grade − Current grade × (1 − Final weight)) ÷ Final weight</p>
      <p>
        With an 82% current grade, a final worth 30% and a target of 85%: (85 − 82 × 0.7) ÷ 0.3 = (85 − 57.4) ÷ 0.3 = <strong>92%</strong>. Weights are used as decimals (30% = 0.3). If the answer is above 100%, the target is out of reach; if it is at or below 0%, you have already secured it.
      </p>

      <h2 id="examples">Examples</h2>
      <ul>
        <li>
          <strong>Pass the course</strong>: 55% current, final worth 40%, need 60% overall: (60 − 55 × 0.6) ÷ 0.4 = 67.5% on the final.
        </li>
        <li>
          <strong>Keep an A</strong>: 94% current, final worth 20%, want 90%: (90 − 94 × 0.8) ÷ 0.2 = 74%. You have room to spare.
        </li>
        <li>
          <strong>Unreachable</strong>: 70% current, final worth 25%, want 85%: (85 − 52.5) ÷ 0.25 = 130%. Even a perfect final gives 77.5%.
        </li>
      </ul>

      <h2 id="points">If your course uses points</h2>
      <p className="formula">Points needed on final = Target % × (Points possible so far + Final points) ÷ 100 − Points earned so far</p>
      <p>420 earned of 500 so far, a 200-point final and an 85% target: 0.85 × 700 − 420 = 175 points, or 87.5% on the final. Switch to Points mode in the calculator for this form.</p>

      <h2 id="weight">How to find the final’s weight</h2>
      <p>It is in the syllabus, usually as a percentage. If only points are listed, the weight is final points ÷ total course points. If your course drops a low score or replaces a midterm with the final, your current grade should be computed after those rules; the <Link href="/grade-calculator/">grade calculator</Link> can produce it.</p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Using the final’s weight as a percentage without converting</strong>: 30 instead of 0.3 in the formula gives nonsense. The calculator handles this for you.
        </li>
        <li>
          <strong>Entering an unweighted current grade</strong> when categories have different weights.
        </li>
        <li>
          <strong>Targeting the letter’s midpoint</strong>: you only need the minimum percentage for the letter, which the letter picker fills in.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>What do I need on my final to get an A?</h3>
      <p>Choose A from the letter picker (90% on the default scale) and read the result. For a different cut-off, type the percentage your syllabus specifies.</p>
      <h3>Can I still pass if I fail the final?</h3>
      <p>Look at the “if you score 0” figure. If it is above the pass mark, yes.</p>
      <h3>How many hours should I study for the score I need?</h3>
      <p>
        Plan the time with the <Link href="/study-time-calculator/">study time calculator</Link> once you know how far you are from the mark.
      </p>
    </ToolPage>
  );
}
