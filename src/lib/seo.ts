import type { Metadata } from "next";
import { site, absoluteUrl } from "./site";
import type { ToolDef } from "./tools";

export const OG_IMAGE = () => ({ url: `${site.url}${site.basePath}/og.png`, width: 1200, height: 630, alt: `${site.name} – ${site.tagline}` });

export function toolMetadata(tool: ToolDef): Metadata {
  const url = absoluteUrl(`/${tool.slug}`);
  return {
    title: { absolute: tool.title },
    description: tool.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: tool.title,
      description: tool.description,
      siteName: site.name,
      locale: "en_US",
      images: [OG_IMAGE()],
    },
    twitter: { card: "summary_large_image", title: tool.title, description: tool.description, images: [OG_IMAGE().url] },
  };
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: `${title} · ${site.name}`, description, siteName: site.name, images: [OG_IMAGE()] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE().url] },
  };
}

/* ---------------- JSON-LD ---------------- */

export const ORG_ID = () => `${absoluteUrl("/")}#organization`;
export const SITE_ID = () => `${absoluteUrl("/")}#website`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID(),
    name: site.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: `${site.url}${site.basePath}/icon-512.png`, width: 512, height: 512 },
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID(),
    name: site.name,
    alternateName: site.shortName,
    url: absoluteUrl("/"),
    publisher: { "@id": ORG_ID() },
    inLanguage: "en",
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function toolPageLd(tool: ToolDef) {
  const url = absoluteUrl(`/${tool.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(),
      websiteLd(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: tool.title,
        description: tool.description,
        isPartOf: { "@id": SITE_ID() },
        publisher: { "@id": ORG_ID() },
        datePublished: tool.datePublished,
        dateModified: tool.dateModified,
        inLanguage: "en",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      { ...breadcrumbLd([{ name: "Home", path: "/" }, { name: tool.name, path: `/${tool.slug}` }]), "@id": `${url}#breadcrumb` },
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: tool.name,
        url,
        description: tool.short,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": ORG_ID() },
      },
    ],
  };
}

export function homeLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationLd(), websiteLd()],
  };
}
