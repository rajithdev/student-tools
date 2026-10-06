import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { GradeCalculator } from "@/components/calculators/GradeCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("grade-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="grade-calculator"
      intro="Enter your assignment, quiz, test and exam scores with the weight each carries, and get your current weighted grade and letter grade. Use the single-test mode to turn one score into a percentage and letter."
      calculator={<GradeCalculator />}
    >
      <h2 id="formula">How a weighted grade is calculated</h2>
      <p className="formula">Weighted grade = Σ (Score % × Weight) ÷ Σ Weight</p>
      <p>
        Suppose homework is 20% of the course and you average 92%, two midterms are 25% each at 78% and 85%, and labs are 30% at 88%. Your current grade is (92 × 20 + 78 × 25 + 85 × 25 + 88 × 30) ÷ 100 = <strong>85.6%</strong>, a B on most US scales. Weights that do not add up to 100 are normalised, so you can enter the categories graded so far and still get a correct standing.
      </p>

      <h2 id="points">Points-based courses</h2>
      <p>
        Some syllabi grade on raw points rather than percentages: 1,000 points for the term, 150 for each midterm and so on. Enter the points earned as the score and the points possible as “out of” with the same number as the weight, and the calculator reduces to total earned ÷ total possible.
      </p>

      <h2 id="scales">Letter grade scales</h2>
      <p>
        The default is the common US plus/minus scale (A 93–100, A− 90–92, B+ 87–89 and so on). You can switch to a plain A–F scale, the Indian 10-point letters, or UK honours classifications (First 70+, 2:1 60–69, 2:2 50–59, Third 40–49). Your syllabus wins over any of these if it specifies different cut-offs.
      </p>

      <h2 id="next-letter">Reaching the next letter</h2>
      <p>
        When some weight is still ungraded, the calculator shows the average you need on the remaining work to reach the next letter. For the score needed on a single final exam, with your current grade and the final’s weight, use the <Link href="/final-grade-calculator/">final grade calculator</Link>.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Mixing percentages and raw scores.</strong> A 45 out of 50 is 90%, not 45%. Always fill in “out of”.
        </li>
        <li>
          <strong>Forgetting dropped scores.</strong> If the syllabus drops your lowest quiz, leave it out.
        </li>
        <li>
          <strong>Assuming categories are equal.</strong> Three quizzes worth 10% together are not the same as three tests worth 10% each.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>What is 15 out of 20 as a percentage?</h3>
      <p>75%, a C on the default US scale or a First on the UK scale. Use the single-test mode for any score.</p>
      <h3>How do I calculate my grade with only some assignments done?</h3>
      <p>Enter the graded items with their weights. The result is your standing on the work completed so far, with the remaining weight shown so you can plan.</p>
      <h3>How does this relate to GPA?</h3>
      <p>
        Each course’s letter grade becomes grade points in the <Link href="/gpa-calculator/">GPA calculator</Link>, weighted by credit hours.
      </p>
    </ToolPage>
  );
}
