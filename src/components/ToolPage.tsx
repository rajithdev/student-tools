import Link from "next/link";
import type { ReactNode } from "react";
import { getTool, relatedTools, CATEGORY_LABEL } from "@/lib/tools";
import { toolPageLd } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

/** Shared shell for every calculator page: breadcrumb, H1, calculator slot, long-form content, related tools. */
export function ToolPage({ slug, intro, calculator, children }: { slug: string; intro: ReactNode; calculator: ReactNode; children: ReactNode }) {
  const tool = getTool(slug);
  const related = relatedTools(slug);
  return (
    <>
      <JsonLd data={toolPageLd(tool)} />
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-fg-faint">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-fg hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/#${tool.category}`} className="hover:text-fg hover:underline">
                {CATEGORY_LABEL[tool.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fg-muted">
              {tool.name}
            </li>
          </ol>
        </nav>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl">{tool.h1}</h1>
        <p className="mt-2 max-w-2xl text-base text-fg-muted sm:text-lg">{intro}</p>
        <div className="mt-6">{calculator}</div>
        <div className="mt-6" data-ad-slot="below-calculator" aria-hidden="true" />
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="prose-tool">{children}</article>
          <aside className="lg:pt-11">
            <div className="lg:sticky lg:top-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">Related tools</h2>
              <ul className="mt-3 space-y-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/${r.slug}/`} className="block rounded-xl border border-line bg-bg-elev p-3.5 hover:border-line-strong">
                      <span className="block text-sm font-semibold text-fg">{r.name}</span>
                      <span className="mt-0.5 block text-xs text-fg-muted">{r.short}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6" data-ad-slot="sidebar" aria-hidden="true" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
