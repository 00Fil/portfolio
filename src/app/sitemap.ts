import type { MetadataRoute } from "next";
import { SERVICES } from "@/content/services";
import { projects } from "@/content/projects";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = profile.site;
  const paths = ["", "/lavori", "/cv", ...projects.map((p) => `/lavori/${p.slug}`), ...SERVICES.map((s) => `/servizi/${s.slug}`)];
  return paths.map((p) => ({
    url: `${base}/it${p}`,
    alternates: { languages: { it: `${base}/it${p}`, en: `${base}/en${p}` } },
  }));
}
