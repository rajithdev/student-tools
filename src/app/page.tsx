import type { Metadata } from "next";
import Link from "next/link";
import { site, absoluteUrl } from "@/lib/site";
import { tools, CATEGORY_LABEL, type ToolCategory } from "@/lib/tools";
import { homeLd, OG_IMAGE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { AttendanceCalculator } from "@/components/calculators/AttendanceCalculator";

export const metadata: Metadata = {
  title: { absolute: `${site.name} – Attendance, CGPA, GPA & Grade Calculators` },
  description: site.description,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { type: "website", url: absoluteUrl("/"), title: `${site.name} – ${site.tagline}`, description: site.description, siteName: site.name, images: [OG_IMAGE()] },
  twitter: { card: "summary_large_image", title: `${site.name} – ${site.tagline}`, description: site.description, images: [OG_IMAGE().url] },
};

const order: ToolCategory[] = ["attendance", "gpa", "grades", "planning"];

export default function Home() {
  return (
    <>
      <JsonLd data={homeLd()} />
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-5xl">
          Student calculators that <span className="hl">answer the real question</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-fg-muted">
          Not just “what is my attendance?” but “how many classes can I still miss?”. Not just a CGPA, but what it means on your university’s own percentage formula. Free, instant, and built for your phone.
        </p>
      </section>

      <section aria-labelledby="quick" className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="quick" className="text-xl font-semibold text-fg">
            Attendance check
          </h2>
          <Link href="/attendance-calculator/" className="text-sm font-medium text-accent hover:underline">
            Full attendance calculator →
          </Link>
        </div>
        <div className="mt-4">
          <AttendanceCalculator />
        </div>
      </section>

      <section id="tools" aria-labelledby="all-tools" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="all-tools" className="text-2xl font-semibold tracking-tight text-fg">
          All tools
        </h2>
        {order.map((cat) => (
          <div key={cat} id={cat} className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">{CATEGORY_LABEL[cat]}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tools
                .filter((t) => t.category === cat)
                .map((t) => (
                  <li key={t.slug}>
                    <Link href={`/${t.slug}/`} className="block h-full rounded-2xl border border-line bg-bg-elev p-5 shadow-card transition-colors hover:border-line-strong">
                      <span className="block text-base font-semibold text-fg">{t.name}</span>
                      <span className="mt-1 block text-sm text-fg-muted">{t.short}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="why" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="why" className="text-2xl font-semibold tracking-tight text-fg">
          Built to be trusted
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl border border-line bg-bg-elev p-5">
            <h3 className="font-semibold text-fg">Exact, not rounded</h3>
            <p className="mt-1 text-sm text-fg-muted">Thresholds are compared on exact values. 74.99% is never shown as a pass. Every formula is covered by automated tests, including the edge cases.</p>
          </li>
          <li className="rounded-2xl border border-line bg-bg-elev p-5">
            <h3 className="font-semibold text-fg">Honest about formulas</h3>
            <p className="mt-1 text-sm text-fg-muted">CGPA-to-percentage rules differ by university. We label each formula with how well it is sourced instead of pretending one multiplier fits everyone.</p>
          </li>
          <li className="rounded-2xl border border-line bg-bg-elev p-5">
            <h3 className="font-semibold text-fg">Private by default</h3>
            <p className="mt-1 text-sm text-fg-muted">Calculations run in your browser. No account, no uploads, and results you can bookmark or share with a link.</p>
          </li>
        </ul>
      </section>
    </>
  );
}
