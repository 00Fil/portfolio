import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.site;
  const paths = ["", ...projects.map((p) => `/lavori/${p.slug}`)];
  return paths.map((p) => ({
    url: `${base}/it${p}`,
    alternates: { languages: { it: `${base}/it${p}`, en: `${base}/en${p}` } },
  }));
}
