import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const bp = site.basePath || "";
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: `${bp}/`,
    display: "standalone",
    background_color: "#faf9f5",
    theme_color: "#ffe14d",
    icons: [
      { src: `${bp}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${bp}/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${bp}/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
