import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, FileText } from "lucide-react";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { CopyEmail } from "./CopyEmail";
import { Clock } from "./Clock";
import { Brief } from "./Brief";
import { Reveal } from "@/components/motion/Reveal";

const STAR = "M512 196Q556 468 828 512Q556 556 512 828Q468 556 196 512Q468 468 512 196Z";

/** Contatti e chiusura: nome in grande, email, collegamenti, ora locale e il marchio di Relay tratteggiato. */
export function Footer({ withContact = true }: { withContact?: boolean }) {
  const t = useTranslations("contact");
  const tn = useTranslations("nav");
  const tf = useTranslations("footer");
  const locale = useLocale() as Locale;
  const cv = profile.cv[locale];
  const links = [
    profile.linkedin && { href: profile.linkedin, label: t("linkedin") },
    profile.github && { href: profile.github, label: t("github") },
  ].filter(Boolean) as { href: string; label: string }[];
  return (
    <footer id={withContact ? "contact" : undefined} className="relative overflow-hidden">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-32">
        {withContact && (
          <div className="mb-16 grid gap-10 sm:mb-24 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="t-label mb-4 text-ink-3" data-reveal>
                {t("title")}
              </p>
              <p className="t-title2 max-w-[24ch] text-ink sm:text-[40px] sm:leading-[46px]" data-reveal data-split>
                {t("lead")}
              </p>
              {profile.email && (
                <div className="mt-10">
                  <CopyEmail email={profile.email} copy={t("copy")} copied={t("copied")} />
                </div>
              )}
            </div>
            <div className="lg:col-span-8" data-reveal>
              <Brief />
            </div>
          </div>
        )}
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div data-reveal>
            <p className="t-serif text-[clamp(44px,6vw,84px)] leading-[0.95] text-ink">{profile.name}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-ink-2">
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
                  {l.label}
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden />
                </a>
              ))}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="hover:text-ink">
                  {profile.email}
                </a>
              )}
              {cv && (
                <a href={cv} download className="inline-flex items-center gap-1 hover:text-ink">
                  <FileText size={14} strokeWidth={1.8} aria-hidden />
                  {t("cv")}
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8" data-reveal>
            <ul className="space-y-1.5 text-ink-2">
              {(["work", "approach", "stack", "path"] as const).map((k) => (
                <li key={k}>
                  <a href={`/${locale}#${k}`} className="hover:text-ink">
                    {tn(k)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5">
              <p className="t-label text-ink-3">{t("time")}</p>
              <p className="text-ink">{profile.city}, IT</p>
              <p className="text-ink-2">
                <Clock locale={locale} />
              </p>
            </div>
          </div>
        </div>
        <p className="t-foot mt-16 text-ink-3">
          © 2026 {profile.name}. {tf("made")}
        </p>
      </Reveal>
      <svg aria-hidden viewBox="160 300 704 360" className="mx-auto mt-8 block w-[min(900px,92vw)] text-[var(--accent)]" preserveAspectRatio="xMidYMin slice">
        <defs>
          <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="3" />
          </pattern>
        </defs>
        <path d={STAR} fill="url(#hatch)" />
      </svg>
      <div className="h-24" />
    </footer>
  );
}
