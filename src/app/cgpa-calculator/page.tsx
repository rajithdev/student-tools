import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { CgpaCalculator } from "@/components/calculators/CgpaCalculator";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";

export const metadata: Metadata = toolMetadata(getTool("cgpa-calculator"));

export default function Page() {
  return (
    <ToolPage
      slug="cgpa-calculator"
      intro="Enter each subject’s grade and credits to get your SGPA, or enter each semester’s SGPA and credits to get your CGPA. The calculator uses the credit-weighted formula from the UGC Choice Based Credit System and shows every step with your own numbers."
      calculator={<CgpaCalculator />}
    >
      <h2 id="sgpa-formula">How SGPA is calculated</h2>
      <p>SGPA (Semester Grade Point Average) weights every subject by its credits, so a 4-credit course counts twice as much as a 2-credit lab:</p>
      <p className="formula">SGPA = Σ (Credits × Grade point) ÷ Σ Credits</p>
      <p>
        Example: Mathematics (4 credits, A = 8), Physics (3 credits, A+ = 9), Programming lab (2 credits, O = 10) and English (2 credits, B+ = 7). Credit points are 32 + 27 + 20 + 14 = 93, total credits 11, so SGPA = 93 ÷ 11 = <strong>8.45</strong>. A simple average of the grade points (8.5) would be wrong because it ignores the credit weighting.
      </p>

      <h2 id="cgpa-formula">How CGPA is calculated from SGPA</h2>
      <p>CGPA (Cumulative Grade Point Average) applies the same idea across semesters:</p>
      <p className="formula">CGPA = Σ (Semester credits × SGPA) ÷ Σ Semester credits</p>
      <p>
        Two semesters with 20 credits at 8.0 and 24 credits at 9.0 give (160 + 216) ÷ 44 = <strong>8.55</strong>, not 8.5. Only when every semester carries the same credits does CGPA equal the plain average of SGPAs, which is why the calculator offers that as a shortcut rather than the default.
      </p>

      <h2 id="scale">The 10-point grading scale</h2>
      <p>The UGC CBCS guidelines define this letter-to-point mapping, which most Indian universities adopt with small variations:</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Letter</th>
              <th scope="col">Meaning</th>
              <th scope="col">Grade point</th>
              <th scope="col">Typical marks range</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>O</td><td>Outstanding</td><td>10</td><td>90–100</td></tr>
            <tr><td>A+</td><td>Excellent</td><td>9</td><td>80–89</td></tr>
            <tr><td>A</td><td>Very good</td><td>8</td><td>70–79</td></tr>
            <tr><td>B+</td><td>Good</td><td>7</td><td>60–69</td></tr>
            <tr><td>B</td><td>Above average</td><td>6</td><td>50–59</td></tr>
            <tr><td>C</td><td>Average</td><td>5</td><td>45–49</td></tr>
            <tr><td>P</td><td>Pass</td><td>4</td><td>40–44</td></tr>
            <tr><td>F</td><td>Fail</td><td>0</td><td>below 40</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        VTU’s 2017 CBCS scheme uses S = 10, A = 9, B = 8, C = 7, D = 6, E = 4, F = 0 and several autonomous colleges use their own letters, so the calculator lets you switch scales or type grade points directly. Marks ranges in the last column are the common pattern; your university’s regulations are the authority.
      </p>

      <h2 id="classes">What CGPA counts as first class or distinction?</h2>
      <p>
        There is no national rule. A common pattern in engineering universities is First Class with Distinction at CGPA 7.5 and above, First Class from 6.0 (or 6.5) to 7.49, and Second Class from 5.0 to 5.99, but the thresholds and the names vary. Some universities define the class by the percentage equivalent instead (for example, VTU uses 70% for FCD), which is why the result also shows percentage equivalents and links to the{" "}
        <Link href="/cgpa-to-percentage/">CGPA to percentage converter</Link>.
      </p>

      <h2 id="mistakes">Common mistakes</h2>
      <ul>
        <li>
          <strong>Averaging SGPAs without credits.</strong> Semesters with more credits must count more.
        </li>
        <li>
          <strong>Counting failed subjects wrongly.</strong> Under CBCS a failed subject contributes 0 grade points but its credits still count in the denominator until you clear it. After re-examination, the new grade replaces the old one.
        </li>
        <li>
          <strong>Mixing scales.</strong> Do not combine a 10-point SGPA with a 4-point GPA. Convert first.
        </li>
        <li>
          <strong>Rounding too early.</strong> Keep full precision until the final CGPA; most universities print two decimals.
        </li>
      </ul>

      <h2 id="faq">Common questions</h2>
      <h3>Is CGPA the average of all SGPAs?</h3>
      <p>Only when every semester has the same number of credits. Otherwise it is the credit-weighted average shown above.</p>
      <h3>How do I calculate CGPA from marks?</h3>
      <p>Convert each subject’s marks to a grade point using your university’s table (see the scale above), then apply the credit-weighted formula. For CBSE Class X in the grading years, CGPA was the plain average of grade points across the five main subjects.</p>
      <h3>How do I convert CGPA to a 4.0 GPA for applications abroad?</h3>
      <p>
        Evaluators such as WES convert course by course rather than with one multiplier. The <Link href="/cgpa-to-gpa/">CGPA to GPA converter</Link> gives an estimate and explains the limits.
      </p>
    </ToolPage>
  );
}
