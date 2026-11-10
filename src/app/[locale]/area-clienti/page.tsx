import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as si from "simple-icons";
import { ArrowUpRight, CalendarClock, Download, FileText, LogOut, Mail } from "lucide-react";
import { findClient, readSession } from "@/lib/session";
import { listRequests } from "@/lib/requests";
import { logout } from "../accedi/actions";
import { profile } from "@/content/profile";
import { RequestPanel } from "@/components/auth/RequestPanel";
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

const host = (u: string) => {
  try {
    return new URL(u).host;
  } catch {
    return u;
  }
};

export default async function ClientArea({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const s = await readSession();
  if (!s) redirect(`/${locale}/accedi`);
  const c = findClient(s.email);
  const t = await getTranslations("auth");
  const tm = await getTranslations("method");
  const phases = tm.raw("phases") as { name: string; out: string }[];
  const phase = Math.max(0, Math.min(phases.length - 1, c?.phase ?? 0));
  const progress = Math.max(0, Math.min(100, c?.progress ?? Math.round((phase / (phases.length - 1)) * 100)));
  const requests = await listRequests(s.email);
  const fmt = (iso: string, o: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }) => {
    const d = new Date(iso);
    return Number.isNaN(+d) ? iso : new Intl.DateTimeFormat(locale, o).format(d);
  };
  const initials = s.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const apps = [
    { href: profile.clientArea.ios, label: "App Store", icon: <Logo path={si.siApple.path} /> },
    { href: profile.clientArea.android, label: "Google Play", icon: <Logo path={si.siGoogleplay.path} /> },
  ].filter((a) => a.href);

  const card = "rounded-[20px] bg-[var(--card)] p-5 shadow-[inset_0_0_0_1px_var(--hair)] sm:p-6";
  const h2 = "text-[17px] font-medium tracking-[-0.02em] text-ink";
  const empty = "mt-4 text-[14px] text-ink-3";
  const ghost = "flex h-10 items-center gap-2 rounded-[10px] px-3 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] transition-colors hover:bg-[var(--hover)]";

  return (
    <>
      <main id="main" className="mx-auto w-full max-w-[1200px] px-4 pb-36 pt-[calc(var(--bar-h)+28px)] sm:px-6 lg:pb-20">
        {/* intestazione: progetto, fase, account */}
        <header className="flex flex-col gap-5 border-b border-[var(--hair)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-3">{t("areaTitle")}</p>
            <h1 className="mt-1 truncate text-[clamp(28px,3.2vw,40px)] font-medium leading-tight tracking-[-0.04em] text-ink">{c?.project ?? t("noProject")}</h1>
            {c?.project && (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--sky)]" aria-hidden />
                  {phases[phase].name} · {t("phase", { n: phase + 1, total: phases.length })}
                </span>
                {c.updated && <span className="text-ink-3">{t("updated", { date: fmt(c.updated) })}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--hover)] text-[13px] font-medium text-ink" aria-hidden>
              {initials}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[14px] font-medium text-ink">{s.name}</span>
              <span className="block truncate text-[12.5px] text-ink-3">{s.email}</span>
            </span>
            <form action={logout} className="ml-2">
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className={ghost} aria-label={t("logout")}>
                <LogOut size={15} strokeWidth={1.8} aria-hidden />
                <span className="hidden sm:inline">{t("logout")}</span>
              </button>
            </form>
          </div>
        </header>

        <div className="mt-6 grid items-start gap-4 lg:grid-cols-12">
          <div className="grid gap-4 lg:col-span-8">
            {/* stato: le cinque fasi del metodo */}
            <section className={`${card}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className={h2}>{t("status")}</h2>
                <p className="text-[13px] tabular-nums text-ink-2">
                  <span className="text-[22px] font-medium tracking-[-0.03em] text-ink">{progress}%</span> {t("done")}
                </p>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--hair)]">
                <div className="h-full rounded-full bg-[var(--sky)]" style={{ width: `${progress}%` }} />
              </div>
              <ol className="mt-5 grid gap-1 sm:mt-6 sm:grid-cols-5 sm:gap-2">
                {phases.map((p, i) => {
                  const st = i < phase ? "past" : i === phase ? "now" : "next";
                  return (
                    <li key={p.name} className={`flex items-start gap-3 rounded-[12px] px-3 py-2 sm:block sm:py-3 ${st === "now" ? "bg-[color-mix(in_srgb,var(--sky)_10%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sky)_35%,transparent)]" : ""}`}>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium tabular-nums sm:mb-2.5 ${
                          st === "past" ? "bg-ink text-[var(--bg-canvas)]" : st === "now" ? "bg-[var(--sky)] text-[#05131d]" : "text-ink-3 shadow-[inset_0_0_0_1.5px_var(--hair-strong)]"
                        }`}
                      >
                        {st === "past" ? (
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className={st === "next" ? "opacity-55" : ""}>
                        <span className="block text-[14px] font-medium text-ink">{p.name}</span>
                        <span className={`mt-0.5 text-[12.5px] leading-snug text-ink-3 ${st === "now" ? "block" : "hidden sm:block"}`}>{p.out}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              {c?.next && (
                <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-[var(--hair)] pt-4 text-[14px] text-ink-2">
                  <CalendarClock size={16} strokeWidth={1.7} className="text-ink-3" aria-hidden />
                  {t("next")}:
                  <span className="font-medium text-ink">{c.next.label}</span>
                  {c.next.date && <span className="tabular-nums text-ink-3 sm:ml-auto">{fmt(c.next.date)}</span>}
                </p>
              )}
            </section>

            {/* richieste di modifica */}
            <section className={`${card}`}>
              <RequestPanel
                locale={locale}
                items={requests.map(({ id, title, body, priority, status, created, note }) => ({ id, title, body, priority, status, created, note }))}
                t={{
                  requests: t("requests"),
                  newRequest: t("newRequest"),
                  reqTitle: t("reqTitle"),
                  reqTitlePh: t("reqTitlePh"),
                  reqBody: t("reqBody"),
                  reqBodyPh: t("reqBodyPh"),
                  reqPriority: t("reqPriority"),
                  prio: { low: t("prio.low"), normal: t("prio.normal"), high: t("prio.high") },
                  st: { new: t("st.new"), review: t("st.review"), doing: t("st.doing"), done: t("st.done") },
                  send: t("send"),
                  cancel: t("cancel"),
                  sent: t("sent"),
                  noRequests: t("noRequests"),
                  reqErr: { fields: t("reqErr.fields"), limit: t("reqErr.limit"), auth: t("reqErr.auth") },
                }}
              />
            </section>

          </div>
          <div className="grid gap-4 lg:col-span-4">
            {/* versione da provare */}
            <section className={`${card} flex flex-col`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className={h2}>{t("preview")}</h2>
                {c?.version && <span className="rounded-[6px] bg-[var(--hover)] px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">{c.version}</span>}
              </div>
              {c?.preview ? (
                <>
                  <p className="mt-4 truncate font-mono text-[13px] text-ink-2">{host(c.preview)}</p>
                  <a href={c.preview} target="_blank" rel="noopener noreferrer" className="mt-4 flex h-11 items-center justify-center gap-1.5 rounded-[10px] bg-ink text-[14.5px] font-medium text-[var(--bg-canvas)] transition-transform active:scale-[.985]">
                    {t("open")}
                    <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden />
                  </a>
                </>
              ) : (
                <p className={empty}>{t("previewOff")}</p>
              )}
              {apps.length > 0 && (
                <div className="mt-auto pt-5">
                  <p className="text-[12.5px] text-ink-3">{t("apps")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {apps.map((a) => (
                      <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={ghost}>
                        {a.icon}
                        {a.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* aggiornamenti */}
            <section className={`${card}`}>
              <h2 className={h2}>{t("updates")}</h2>
              {c?.updates?.length ? (
                <ol className="relative mt-4 space-y-4 before:absolute before:bottom-1 before:left-[3px] before:top-1.5 before:w-px before:bg-[var(--hair-strong)]">
                  {c.updates.slice(0, 5).map((u) => (
                    <li key={u.date + u.text} className="relative pl-5">
                      <span className="absolute left-0 top-[7px] h-[7px] w-[7px] rounded-full bg-[var(--card)] shadow-[inset_0_0_0_1.5px_var(--sky)]" aria-hidden />
                      <p className="text-[12px] tabular-nums text-ink-3">{fmt(u.date, { day: "numeric", month: "short" })}</p>
                      <p className="mt-0.5 text-[14px] leading-snug text-ink">{u.text}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={empty}>{t("noUpdates")}</p>
              )}
            </section>

            {/* documenti */}
            <section className={`${card}`}>
              <h2 className={h2}>{t("docs")}</h2>
              {c?.docs?.length ? (
                <ul className="mt-3 -mx-2">
                  {c.docs.map((d) => (
                    <li key={d.url}>
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-[10px] px-2 py-2.5 transition-colors hover:bg-[var(--hover)]">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--hover)] text-ink-2">
                          <FileText size={15} strokeWidth={1.7} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] text-ink">{d.label}</span>
                          {d.meta && <span className="block truncate text-[12px] text-ink-3">{d.meta}</span>}
                        </span>
                        <Download size={15} strokeWidth={1.7} className="text-ink-3 transition-colors group-hover:text-ink" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={empty}>{t("noDocs")}</p>
              )}
            </section>

            {/* assistenza */}
            <section className={`${card}`}>
              <h2 className={h2}>{t("support")}</h2>
              <div className="mt-4 grid gap-2">
                <a href="#brief" className={ghost}>
                  <CalendarClock size={16} strokeWidth={1.7} aria-hidden />
                  {t("call")}
                </a>
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className={ghost}>
                    <Mail size={16} strokeWidth={1.7} aria-hidden />
                    {t("write")}
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteNav detail={{ title: t("areaTitle"), section: "home" }} plain />
    </>
  );
}
