import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Download, FolderGit2 as Github, MapPin, Globe, Mail, Briefcase as Linkedin } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";
import { BRAND } from "@/content/brand-icons";
import { CV } from "@/content/cv";
import { SiteNav } from "@/components/nav/SiteNav";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cv" });
  return { title: `${t("title")} · ${profile.name}`, alternates: { canonical: `/${locale}/cv`, languages: { it: "/it/cv", en: "/en/cv" } } };
}

/**
 * Curriculum nel design del sito: un foglio A4 scuro, leggibile a schermo e stampabile in PDF.
 * Con ?print=1 la pagina mostra solo il foglio (è quella da cui nascono i PDF in /public/cv).
 */
export default async function CvPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ print?: string }> }) {
  const { locale: l } = await params;
  const { print } = await searchParams;
  setRequestLocale(l);
  const locale = l as Locale;
  const t = await getTranslations("cv");
  const d = CV[locale];
  const pdf = `/cv/filippo-corsini-cv-${locale}.pdf`;

  const contacts = [
    { icon: MapPin, text: d.where, href: "" },
    { icon: Github, text: "github.com/00Fil", href: profile.github },
    profile.email && { icon: Mail, text: profile.email, href: `mailto:${profile.email}` },
    profile.linkedin && { icon: Linkedin, text: "LinkedIn", href: profile.linkedin },
    profile.site !== "https://example.com" && { icon: Globe, text: profile.site.replace(/^https?:\/\//, ""), href: profile.site },
  ].filter(Boolean) as { icon: typeof MapPin; text: string; href: string }[];

  const Sheet = (
    <article className="cv-sheet relative mx-auto flex flex-col overflow-hidden bg-black text-[#F2F2F0]" style={{ width: "210mm", height: "297mm", padding: "13mm 15mm 10mm" }}>
      {/* luce di Relay nell'angolo: solo un dettaglio */}
      <div aria-hidden className="pointer-events-none absolute -right-[40mm] -top-[50mm] h-[120mm] w-[120mm] rounded-full bg-[#2F5FFF] opacity-25 blur-[60px]" />

      <header className="relative">
        <p className="font-mono text-[8pt] uppercase tracking-[0.12em] text-[#5ec4ff]">{d.kicker}</p>
        <h1 className="mt-[3mm] text-[36pt] font-medium leading-[0.95] tracking-[-0.045em]">
          Filippo <span className="t-serif">Corsini</span>
        </h1>
        <p className="mt-[3mm] text-[12.5pt] text-[#d9d9d4]">{d.role}</p>
        <ul className="mt-[4mm] flex flex-wrap gap-x-[6mm] gap-y-[1.5mm] text-[8.5pt] text-[#A6A6A1]">
          {contacts.map((c) => (
            <li key={c.text} className="flex items-center gap-[1.5mm]">
              <c.icon size={11} strokeWidth={1.8} className="text-[#5ec4ff]" aria-hidden />
              {c.href ? <a href={c.href}>{c.text}</a> : c.text}
            </li>
          ))}
        </ul>
      </header>

      <p className="relative mt-[6mm] max-w-[165mm] text-[10.5pt] leading-[1.5] text-[#F2F2F0]">{d.profile}</p>

      <div className="relative mt-[7mm] grid flex-1 grid-cols-[1fr_58mm] gap-[10mm]">
        <div>
          <h2 className="cv-h">{d.workTitle}</h2>
          {d.work.map((w) => (
            <section key={w.title} className="mt-[4.5mm] break-inside-avoid">
              <div className="flex items-baseline justify-between gap-[4mm]">
                <h3 className="text-[12pt] font-medium tracking-[-0.02em]">{w.title}</h3>
                <span className="shrink-0 font-mono text-[7.5pt] text-[#85857F]">{w.when}</span>
              </div>
              <p className="mt-[0.8mm] text-[8.5pt] text-[#5ec4ff]">{w.what}</p>
              <ul className="mt-[1.6mm] space-y-[1mm]">
                {w.points.map((p) => (
                  <li key={p} className="grid grid-cols-[3mm_1fr] text-[8.4pt] leading-[1.42] text-[#d9d9d4]">
                    <span className="mt-[2mm] block h-[1.2mm] w-[1.2mm] rounded-full bg-[#5ec4ff]" />
                    {p}
                  </li>
                ))}
              </ul>
              {w.stack && (
                <p className="mt-[2mm] flex flex-wrap gap-x-[3mm] gap-y-[1mm] text-[7.5pt] text-[#85857F]">
                  {w.stack.map((id) => (
                    <span key={id} className="flex items-center gap-[1mm]">
                      <svg viewBox="0 0 24 24" className="h-[2.6mm] w-[2.6mm] fill-current" aria-hidden>
                        <path d={BRAND[id].path} />
                      </svg>
                      {BRAND[id].title}
                    </span>
                  ))}
                </p>
              )}
            </section>
          ))}
          <h2 className="cv-h mt-[5mm]">{d.howTitle}</h2>
          <ul className="mt-[3mm] grid grid-cols-2 gap-x-[5mm] gap-y-[1.6mm]">
            {d.how.map((h) => (
              <li key={h} className="grid grid-cols-[3mm_1fr] text-[8.2pt] leading-[1.4] text-[#d9d9d4]">
                <span className="mt-[2mm] block h-[1.2mm] w-[1.2mm] rounded-full bg-[#5ec4ff]" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <aside>
          <h2 className="cv-h">{d.eduTitle}</h2>
          {d.edu.map((e) => (
            <section key={e.title} className="mt-[5mm]">
              <p className="font-mono text-[7.5pt] text-[#85857F]">{e.when}</p>
              <h3 className="mt-[0.8mm] text-[10.5pt] font-medium leading-[1.25] tracking-[-0.01em]">{e.title}</h3>
              <p className="mt-[1mm] text-[8.3pt] leading-[1.45] text-[#A6A6A1]">{e.body}</p>
            </section>
          ))}

          <h2 className="cv-h mt-[7mm]">{d.skillsTitle}</h2>
          {d.skills.map((g) => (
            <section key={g.title} className="mt-[3.2mm]">
              <h3 className="text-[8.3pt] font-medium text-[#F2F2F0]">{g.title}</h3>
              <p className="mt-[0.8mm] text-[8pt] leading-[1.45] text-[#A6A6A1]">{g.items.join(" · ")}</p>
            </section>
          ))}

        </aside>
      </div>

      <footer className="relative mt-[8mm] flex items-center justify-between border-t border-white/10 pt-[3mm] font-mono text-[7pt] text-[#85857F]">
        <span>{d.footer}</span>
        <svg viewBox="0 0 24 24" className="h-[4mm] w-[4mm] text-[#5ec4ff]" fill="currentColor" aria-hidden>
          <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0z" />
        </svg>
      </footer>
    </article>
  );

  if (print) return <main className="cv-print bg-black">{Sheet}</main>;

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-[1280px] px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(48px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.06em] text-ink">{t("title")}</h1>
            <p className="mt-4 max-w-[44ch] text-ink-2">{t("lead")}</p>
          </div>
          <a href={pdf} download className="drop float-glass inline-flex h-12 items-center gap-2 px-5 font-medium text-ink">
            <Download size={17} strokeWidth={1.8} aria-hidden />
            {t("download")}
          </a>
        </div>
        <div className="mx-auto w-fit max-w-full overflow-x-auto rounded-[28px] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_60px_120px_-40px_rgba(0,0,0,.9)]">
          <div className="min-w-[210mm]">{Sheet}</div>
        </div>
      </main>
      <SiteNav detail={{ title: t("title") }} />
    </>
  );
}
