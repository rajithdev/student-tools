import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/about", "About", `What ${site.name} is, how the calculators are built and tested, and how formulas are sourced.`);

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">About {site.name}</h1>
      <article className="prose-tool mt-6">
        <p>
          {site.name} is a small set of calculators for the questions students actually type into a search box: how many classes can I miss, what do I need on my final, what is my CGPA as a percentage. Each tool is designed to give the answer first and the explanation second.
        </p>
        <h2>How the tools are built</h2>
        <ul>
          <li>
            <strong>Every formula is tested.</strong> The calculation code is separated from the interface and covered by automated tests, including boundary cases such as exactly 75% attendance, 0 of 0 classes, fractional targets and very large numbers.
          </li>
          <li>
            <strong>Exact comparisons.</strong> Pass/fail status is decided on the exact value, never on a rounded display figure, and the display never rounds across a threshold.
          </li>
          <li>
            <strong>Sourced formulas.</strong> Where institutions differ, as with CGPA-to-percentage conversion, each formula is labelled as coming from an official document, from multiple secondary reports, or as a mere convention. We do not present one multiplier as universal.
          </li>
          <li>
            <strong>Fast and private.</strong> The site is static, loads one small font and no third-party widgets. Calculations run in your browser; the only place your numbers appear is in the page address so you can share a result.
          </li>
        </ul>
        <h2>Corrections</h2>
        <p>
          If your university publishes a different formula or threshold than the one shown, or you find a calculation error, please <Link href="/contact/">tell us</Link> and include a link to the official document. Corrections are applied to the tool and noted on the page.
        </p>
      </article>
    </div>
  );
}
