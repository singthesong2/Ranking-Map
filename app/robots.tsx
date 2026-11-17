import type { MetadataRoute } from "next";
import { siteUrl } from "@/utils/siteUrl";

function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },

    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
export default robots;
