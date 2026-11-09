import { useLocale, useTranslations } from "next-intl";
import { profile } from "@/content/profile";
import { SERVICES } from "@/content/services";
import type { Locale } from "@/i18n/routing";
import { Clock } from "./Clock";
import { FooterCta, FooterGiant, ToTop } from "./FooterGiant";
import { Reveal } from "@/components/motion/Reveal";

/** Chiusura: invito enorme (apre il modulo a schermo intero), indice del sito e il nome a tutta larghezza pieno di liquido azzurro. */
export function Footer({ withContact = true }: { withContact?: boolean }) {
  const t = useTranslations("contact");
  const tn = useTranslations("nav");
  const tf = useTranslations("footer");
  const locale = useLocale() as Locale;
  const cv = profile.cv[locale];
  const [first, ...rest] = profile.name.split(" ");
  const contacts = [
    profile.email && { href: `mailto:${profile.email}`, label: profile.email },
    profile.linkedin && { href: profile.linkedin, label: t("linkedin"), ext: true },
    profile.github && { href: profile.github, label: t("github"), ext: true },
    cv && { href: cv, label: t("cv"), download: true },
  ].filter(Boolean) as { href: string; label: string; ext?: boolean; download?: boolean }[];
  const head = "mb-5 font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink-3";
  const link = "relative inline-block text-ink-2 transition-colors duration-300 hover:text-ink after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100";

  return (
    <footer id={withContact ? "contact" : undefined} className="relative overflow-hidden">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 pt-24 sm:px-8 sm:pt-32">
        <FooterCta q={tf("q")} a={tf("a")} cta={tf("cta")} href="#brief" />

        <div className="mt-20 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-white/[0.08] pt-10 sm:mt-28 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <p className="flex items-center gap-2.5 text-[15px] text-ink">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--sky)] opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--sky)]" />
              </span>
              {tf("available")}
            </p>
            <p className="mt-3 text-ink-2">
              {profile.city}, {tf("country")} · <Clock locale={locale} />
            </p>
          </div>
          <nav aria-label={tf("pages")} className="lg:col-span-2">
            <p className={head}>{tf("pages")}</p>
            <ul className="space-y-2.5">
              {(["approach", "work", "path", "stack"] as const).map((k) => (
                <li key={k}>
                  <a href={`/${locale}#${k}`} className={link}>
                    {tn(k)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={tf("services")} className="lg:col-span-4">
            <p className={head}>{tf("services")}</p>
            <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <a href={`/${locale}/servizi/${s.slug}`} className={link}>
                    {s.label[locale]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-2">
            <p className={head}>{tf("contacts")}</p>
            <ul className="space-y-2.5">
              {contacts.map((c) => (
                <li key={c.href}>
                  <a href={c.href} className={link} {...(c.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(c.download ? { download: true } : {})}>
                    {c.label}
                    {c.ext && <span aria-hidden> ↗</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      <div className="mt-20 sm:mt-28">
        <FooterGiant first={first} last={rest.join(" ")} />
      </div>
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4 px-5 py-6 text-[13px] text-ink-3 sm:px-8">
        <p>© 2026 {profile.name}</p>
        <p className="hidden md:block">{tf("made")}</p>
        <ToTop label={tf("top")} />
      </div>
      <div className="h-20 lg:h-0" />
    </footer>
  );
}
