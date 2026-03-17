import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";

const routes = ["", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norabyte.com";

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [
            l === "es" ? "es-MX" : "en-US",
            `${baseUrl}/${l}${route}`,
          ])
        ),
      },
    }))
  );
}
