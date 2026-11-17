import type { MetadataRoute } from "next";
import { siteUrl } from "@/utils/siteUrl";

function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", siteUrl).toString(),
    },
  ];
}

export default sitemap;
