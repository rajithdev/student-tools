import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { tools, staticPages } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = tools.map((t) => t.dateModified).sort().at(-1) ?? "2026-10-07";
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    ...tools.map((t) => ({ url: absoluteUrl(`/${t.slug}`), lastModified: t.dateModified, changeFrequency: "monthly" as const, priority: t.slug === "attendance-calculator" ? 0.9 : 0.8 })),
    ...staticPages.map((p) => ({ url: absoluteUrl(`/${p.slug}`), lastModified: latest, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
