import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/parent/", "/child/", "/api/"],
      },
    ],
    sitemap: "https://elevo-five.vercel.app/sitemap.xml",
  };
}
