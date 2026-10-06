import Link from "next/link";
import { site } from "@/lib/site";
import { tools, staticPages, CATEGORY_LABEL, type ToolCategory } from "@/lib/tools";
import { LogoMark } from "./Logo";

const order: ToolCategory[] = ["attendance", "grades", "gpa", "planning"];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-bg-sunken/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-fg">
              <LogoMark size={24} />
              {site.name}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-fg-muted">{site.tagline}. No sign-up, no tracking of what you type, works on any phone.</p>
          </div>
          {order.map((cat) => (
            <nav key={cat} aria-label={CATEGORY_LABEL[cat]}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-faint">{CATEGORY_LABEL[cat]}</h2>
              <ul className="mt-3 space-y-2">
                {tools
                  .filter((t) => t.category === cat)
                  .map((t) => (
                    <li key={t.slug}>
                      <Link href={`/${t.slug}/`} className="text-sm text-fg-muted hover:text-fg hover:underline">
                        {t.name}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-sm text-fg-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. Calculations run in your browser.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {staticPages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}/`} className="hover:text-fg hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
