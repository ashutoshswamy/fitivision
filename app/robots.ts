import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/tracker", "/history", "/suggestions", "/plan-workout"],
      },
    ],
    sitemap: "https://fitvision.tech/sitemap.xml",
  };
}
