import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as si from "simple-icons";
import { ArrowUpRight, LogOut } from "lucide-react";
import { findClient, readSession } from "@/lib/session";
import { logout } from "../accedi/actions";
import { profile } from "@/content/profile";
import { SkyGradient } from "@/components/motion/SkyGradient";
import { SiteNav } from "@/components/nav/SiteNav";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("areaTitle"), robots: { index: false } };
}

const Logo = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
    <path d={path} />
  </svg>
);

export default async function ClientArea({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const s = await readSession();
  if (!s) redirect(`/${locale}/accedi`);
  const c = findClient(s.email);
  const t = await getTranslations("auth");
  const tm = await getTranslations("method");
  const phases = tm.raw("phases") as { name: string; title: string; out: string }[];
  const phase = Math.max(0, Math.min(phases.length - 1, c?.phase ?? 0));
  const progress = Math.max(0, Math.min(100, c?.progress ?? Math.round((phase / (phases.length - 1)) * 100)));
  const first = s.name.split(" ")[0];
  const card = "rounded-[28px] bg-[var(--card)] p-6 shadow-[inset_0_0_0_1px_var(--hair)] sm:p-8";
  const apps = [
    { href: profile.clientArea.ios, label: "App Store", icon: <Logo path={si.siApple.path} /> },
    { href: profile.clientArea.android, label: "Google Play", icon: <Logo path={si.siGoogleplay.path} /> },
  ].filter((a) => a.href);

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-[1280px] px-3 pb-36 pt-[calc(var(--bar-h)+20px)] sm:px-5 lg:pb-20">
        {/* il progetto, in cima */}
        <section className="theme-dark relative overflow-hidden rounded-[32px] bg-[#05131d] sm:rounded-[40px]">
          <SkyGradient angle={15} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,10,16,.65),transparent_75%)]" />
          <div className="pointer-events-none relative flex min-h-[300px] flex-col justify-between gap-10 p-7 sm:p-12">
            <div className="flex items-start justify-between gap-4">
              <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/70">{t("areaTitle")}</p>
              <form action={logout} className="pointer-events-auto">
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="flex h-10 items-center gap-2 rounded-full bg-[rgba(3,12,20,.42)] px-4 text-[14px] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] backdrop-blur-md transition-colors hover:bg-[rgba(3,12,20,.6)]">
                  <LogOut size={15} strokeWidth={1.8} aria-hidden />
                  {t("logout")}
                </button>
              </form>
            </div>
            <div>
              <h1 className="text-[clamp(36px,5vw,72px)] font-medium leading-[0.98] tracking-[-0.05em] text-white">{t("hello", { name: first })}</h1>
              <p className="mt-4 text-[17px] text-white/80">{c?.project ?? t("noProject")}</p>
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* avanzamento: le cinque fasi del metodo */}
          <section className={`${card} lg:col-span-8`}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-[22px] font-medium tracking-[-0.025em] text-ink">{t("progress")}</h2>
              <p className="text-[clamp(32px,3.4vw,48px)] font-medium tabular-nums tracking-[-0.05em] text-ink">{progress}%</p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--hair)]">
              <div className="h-full rounded-full bg-[var(--sky)]" style={{ width: `${progress}%` }} />
            </div>
            <ol className="mt-8 grid gap-4 sm:grid-cols-5 sm:gap-3">
              {phases.map((p, i) => (
                <li key={p.name} className={`flex gap-3 sm:block ${i > phase ? "opacity-45" : ""}`}>
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums sm:mb-3 ${i < phase ? "bg-[var(--label-primary)] text-[var(--bg-canvas)]" : i === phase ? "bg-[var(--sky)] text-[#05131d]" : "shadow-[inset_0_0_0_1.5px_var(--hair-strong)] text-ink-3"}`}>
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-medium text-ink">{p.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{p.out}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* versione da provare e app */}
          <section className={`${card} flex flex-col lg:col-span-4`}>
            <h2 className="text-[22px] font-medium tracking-[-0.025em] text-ink">{t("preview")}</h2>
            <p className="mt-2 text-[15px] leading-[1.5] text-ink-2">{c?.preview ? t("previewOn") : t("previewOff")}</p>
            {c?.preview && (
              <a href={c.preview} target="_blank" rel="noopener noreferrer" className="mt-5 flex h-12 items-center justify-between rounded-[16px] bg-[var(--label-primary)] px-4 text-[15px] font-medium text-[var(--bg-canvas)]">
                {t("open")}
                <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
              </a>
            )}
            {apps.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {apps.map((a) => (
                  <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center gap-2 rounded-full px-4 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] hover:bg-[var(--hover)]">
                    {a.icon}
                    {a.label}
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* modifiche e messaggi al team */}
          <section className={`${card} lg:col-span-6`}>
            <h2 className="text-[22px] font-medium tracking-[-0.025em] text-ink">{t("changes")}</h2>
            <p className="mt-2 max-w-[44ch] text-[15px] leading-[1.5] text-ink-2">{t("changesBody")}</p>
            <a href="#brief" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] hover:bg-[var(--hover)]">
              {t("changesCta")}
            </a>
          </section>
          <section className={`${card} lg:col-span-6`}>
            <h2 className="text-[22px] font-medium tracking-[-0.025em] text-ink">{t("team")}</h2>
            <p className="mt-2 max-w-[44ch] text-[15px] leading-[1.5] text-ink-2">{t("teamBody")}</p>
            <a href="#brief" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14.5px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] hover:bg-[var(--hover)]">
              {t("teamCta")}
            </a>
          </section>
        </div>
      </main>
      <SiteNav detail={{ title: t("areaTitle") }} />
    </>
  );
}
