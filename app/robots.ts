import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://norabyte.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      // Los rastreadores de AdSense, nombrados. Los cubre el comodín, pero AdSense avisa
      // cuando no los ve y una revisión con avisos es una revisión más larga.
      { userAgent: "Mediapartners-Google", allow: "/" },
      { userAgent: "AdsBot-Google", allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
