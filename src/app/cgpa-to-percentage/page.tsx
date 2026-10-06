import type { Metadata } from "next";
import Link from "next/link";
import { ToolPage } from "@/components/ToolPage";
import { CgpaPercentageConverter } from "@/components/calculators/CgpaPercentageConverter";
import { toolMetadata } from "@/lib/seo";
import { getTool } from "@/lib/tools";
import { CONVERSION_FORMULAS } from "@/lib/calc/gpa";

export const metadata: Metadata = toolMetadata(getTool("cgpa-to-percentage"));

const LABEL = { official: "Official document", reported: "Reported by several sources", convention: "Convention only" } as const;

export default function Page() {
  return (
    <ToolPage
      slug="cgpa-to-percentage"
      intro="Convert CGPA (or SGPA) to percentage and percentage back to CGPA. Pick the formula your board or university actually uses; each one is labelled with how well it is sourced, and a comparison table shows how much the answer changes between formulas."
      calculator={<CgpaPercentageConverter />}
    >
      <h2 id="no-universal">There is no universal CGPA to percentage formula</h2>
      <p>
        The multiplier 9.5 is everywhere online because CBSE printed “Percentage = CGPA × 9.5” on its Class X grade sheets during the grading years, and CBSE itself called it indicative. The University Grants Commission’s CBCS guidelines define how SGPA and CGPA are computed but <strong>do not prescribe any percentage conversion</strong>. Each university sets its own equivalence, usually printed on the marks card or in the examination regulations, and employers and admission offices normally accept that printed equivalence.
      </p>
      <p>So the right question is not “what is 8.2 CGPA in percentage?” but “what does my university say 8.2 CGPA is?”. The converter lets you choose, and shows the spread.</p>

      <h2 id="formulas">Formulas in this converter and how well they are sourced</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Formula</th>
              <th scope="col">Where it is used</th>
              <th scope="col">Sourcing</th>
            </tr>
          </thead>
          <tbody>
            {CONVERSION_FORMULAS.map((f) => (
              <tr key={f.id}>
                <td>
                  <code>{f.display}</code>
                </td>
                <td>{f.note}</td>
                <td>{LABEL[f.confidence]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        “Official document” means we have seen the rule in the institution’s own regulation or certificate. “Reported” means several independent secondary sources agree but we could not fetch the primary document. “Convention” means it is arithmetic that some institutions happen to use. If you can send a link to an official regulation that we are missing or have wrong, please use the <Link href="/contact/">contact page</Link>.
      </p>

      <h2 id="examples">Worked examples</h2>
      <ul>
        <li>
          <strong>8.2 CGPA</strong>: 77.9% with × 9.5, 82% with × 10, 74.5% with VTU’s (CGPA − 0.75) × 10, and 69.2% with Mumbai’s 7.1 × CGPI + 11. The same transcript spans almost 13 percentage points depending on the formula.
        </li>
        <li>
          <strong>75% to CGPA</strong>: 7.89 with ÷ 9.5, 7.5 with ÷ 10, 8.25 with VTU’s inverse (75 ÷ 10 + 0.75).
        </li>
        <li>
          <strong>9.5 CGPA</strong>: 90.25% with × 9.5, 95% with × 10. Note that × 9.5 can never reach 100%: a perfect 10 CGPA maps to 95%.
        </li>
      </ul>

      <h2 id="sgpa">Converting SGPA to percentage</h2>
      <p>Use the same formula your university applies to CGPA; the equivalence is defined for grade point averages generally, not only for the cumulative figure. Enter the SGPA in the converter exactly as you would a CGPA.</p>

      <h2 id="reverse">Percentage to CGPA</h2>
      <p>
        Reversing a linear formula is straightforward: divide by the multiplier, or add back the offset. Keep in mind that the reverse is an estimate for your own planning. Universities issue CGPA from grade points, never from a percentage, so a percentage-to-CGPA figure will not appear on any official document. If you need marks rather than CGPA, the <Link href="/marks-percentage-calculator/">marks percentage calculator</Link> works from raw marks.
      </p>

      <h2 id="faq">Common questions</h2>
      <h3>Why does CBSE use 9.5?</h3>
      <p>CBSE looked at the marks of students who scored between 91 and 100 in previous years and found the average to be close to 95, which it mapped to the top grade point of 10. Dividing 95 by 10 gives the 9.5 multiplier for every other grade point.</p>
      <h3>Is 9.5 valid for engineering?</h3>
      <p>Only if your university says so. Many engineering universities use × 10 or a formula with an offset. Using 9.5 by habit can under- or over-state your percentage by several points.</p>
      <h3>What is 7.5 CGPA in percentage?</h3>
      <p>71.25% with × 9.5, 75% with × 10, 67.5% with (CGPA − 0.75) × 10. Pick your institution’s formula in the converter to see the official figure.</p>
      <h3>Is 8 CGPA good?</h3>
      <p>On a 10-point scale, 8 corresponds to the “A, very good” band, typically 70–79% marks, and sits in the first class with distinction band at universities that set FCD at 7.5.</p>
      <h3>How do I convert CGPA to a 4.0 GPA?</h3>
      <p>
        Linear multipliers do not transfer well across scales. See the <Link href="/cgpa-to-gpa/">CGPA to GPA converter</Link> for the band table and how evaluators such as WES actually do it.
      </p>
    </ToolPage>
  );
}
