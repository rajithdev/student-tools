import Link from "next/link";
import type { Metadata } from "next";
import { tools } from "@/lib/tools";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-faint">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">That page does not exist</h1>
      <p className="mt-3 text-fg-muted">The address may be mistyped, or the page may have moved. Here are the tools people use most.</p>
      <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
        {tools.slice(0, 6).map((t) => (
          <li key={t.slug}>
            <Link href={`/${t.slug}/`} className="block rounded-xl border border-line bg-bg-elev p-4 hover:border-line-strong">
              <span className="block font-semibold text-fg">{t.name}</span>
              <span className="block text-sm text-fg-muted">{t.short}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="mt-8 inline-block font-medium text-accent hover:underline">
        Back to the homepage
      </Link>
    </div>
  );
}
