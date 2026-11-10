"use client";

import { Wordmark } from "./Wordmark";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight, ChevronDown, FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { projects } from "@/content/projects";
import { COVERS } from "@/content/covers";
import { Cover } from "@/components/work/Covers";
import { profile } from "@/content/profile";
import { Drop } from "@/components/glass/Drop";
import { GlassSegmented } from "./GlassSegmented";
import { SPR, Spring } from "@/lib/spring";
import { bevelImage } from "@/lib/glass";
import { scrollToY } from "@/lib/scroll";
import { play } from "@/lib/sound";
import { SERVICES } from "@/content/services";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { ThemeToggle } from "./ThemeToggle";
import { ClientRow } from "./ClientStrip";
import { prefersReducedMotion } from "@/lib/env";
import { Clock } from "@/components/sections/Clock";

gsap.registerPlugin(ScrollTrigger);

type Menu = "services" | "work" | "contact";
type Item = { id: string; label: string; menu?: Menu };
const NAMES: Record<Locale, string> = { it: "Italiano", en: "English" };

/**
 * Barra superiore per desktop, stessa materia della barra di Relay.
 * Una bolla di vetro sta sotto la sezione attiva; al passaggio del mouse insegue la voce con la molla `follow`
 * allungandosi nel verso del moto, e all'uscita torna alla sezione con `settle`.
 * Le voci con menu aprono un pannello di vetro che cambia misura con una molla e fa scorrere il contenuto
 * nel verso in cui ti sposti tra i menu.
 */
export function GlassTopNav({ home, section = "work" }: { home: boolean; section?: "work" | "approach" }) {
  const t = useTranslations("nav");
  const tc = useTranslations("contact");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const items: Item[] = [
    { id: "approach", label: t("approach"), menu: "services" },
    { id: "work", label: t("work"), menu: "work" },
    { id: "path", label: t("path") },
    { id: "stack", label: t("stack") },
    { id: "contact", label: t("contact"), menu: "contact" },
  ];

  const wrap = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const panes = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState(home ? -1 : section === "approach" ? 0 : 1);
  const [hover, setHover] = useState<number | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [compact, setCompact] = useState(false);
  const bx = useRef(new Spring(0));
  const bw = useRef(new Spring(0));
  const bo = useRef(new Spring(0));
  const lastMenu = useRef<string | null>(null);
  const closeT = useRef<number | undefined>(undefined);

  // vetro della barra: smusso cotto per misura
  useLayoutEffect(() => {
    const el = shell.current;
    if (!el) return;
    const bake = () => {
      const u = bevelImage(el.offsetWidth, el.offsetHeight, 30);
      if (u) {
        el.style.setProperty("--bevel", u);
        el.dataset.bevel = "1";
      }
    };
    bake();
    const ro = new ResizeObserver(bake);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sezione attiva
  useEffect(() => {
    if (!home) return;
    const trig = items.map((it, i) =>
      ScrollTrigger.create({
        trigger: `#${it.id}`,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: (s) => s.isActive && setActive(i),
        onLeaveBack: () => i === 0 && setActive(-1),
      }),
    );
    const top = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => setCompact(s.scroll() > 40) });
    return () => {
      trig.forEach((x) => x.kill());
      top.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home]);

  // bolla: x, larghezza, opacità con le molle di Relay
  useEffect(() => {
    const render = () => {
      const b = bubble.current;
      if (!b) return;
      const stretch = Math.min(Math.abs(bx.current.target - bx.current.value) / 400, 0.18);
      b.style.transform = `translate3d(${bx.current.value}px,0,0) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.5})`;
      b.style.width = `${Math.max(0, bw.current.value)}px`;
      b.style.opacity = String(Math.max(0, Math.min(1, bo.current.value)));
    };
    const subs = [bx, bw, bo].map((s) => s.current.subscribe(render));
    return () => subs.forEach((u) => u());
  }, []);

  useEffect(() => {
    const target = hover ?? (active >= 0 ? active : null);
    const reduce = prefersReducedMotion();
    if (target === null) {
      bo.current.to(0, SPR.settle);
      return;
    }
    const el = itemRefs.current[target];
    const r = row.current;
    if (!el || !r) return;
    const x = el.offsetLeft;
    const w = el.offsetWidth;
    if (bo.current.value < 0.05 || reduce) {
      bx.current.snap(x);
      bw.current.snap(w);
    } else {
      const spec = hover !== null ? SPR.follow : SPR.settle;
      bx.current.to(x, spec);
      bw.current.to(w, spec);
    }
    bo.current.to(1, SPR.settle);
  }, [hover, active]);

  // pannello dei menu
  const openMenu = useCallback((m: Menu | null) => {
    window.clearTimeout(closeT.current);
    setMenu(m);
  }, []);
  const scheduleClose = () => {
    window.clearTimeout(closeT.current);
    closeT.current = window.setTimeout(() => {
      setMenu(null);
      setHover(null);
    }, 140);
  };

  // scorrendo la pagina il menu si chiude, così non resta sospeso sopra i contenuti
  useEffect(() => {
    if (!menu) return;
    const y0 = window.scrollY;
    const on = () => Math.abs(window.scrollY - y0) > 40 && setMenu(null);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [menu]);

  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    const reduce = prefersReducedMotion();
    const d = reduce ? 0 : 1;
    gsap.killTweensOf(p);
    if (!menu) {
      p.style.pointerEvents = "none";
      gsap.to(p, { opacity: 0, y: -6, scale: 0.97, duration: 0.2 * d, ease: "power2.in", onComplete: () => (p.style.visibility = "hidden") });
      lastMenu.current = null;
      return;
    }
    const pane = panes.current[menu];
    const anchor = itemRefs.current[items.findIndex((i) => i.menu === menu)];
    if (!pane || !anchor || !wrap.current) return;
    const w = pane.offsetWidth;
    const h = pane.offsetHeight;
    const shellRect = wrap.current.getBoundingClientRect();
    const aRect = anchor.getBoundingClientRect();
    const left = Math.max(0, Math.min(shellRect.width - w, aRect.left - shellRect.left + aRect.width / 2 - w / 2));
    const first = lastMenu.current === null;
    p.style.visibility = "visible";
    p.style.pointerEvents = "auto";
    if (first) {
      gsap.set(p, { width: w, height: h, x: left });
      gsap.fromTo(p, { opacity: 0, y: -8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.42 * d, ease: "back.out(1.6)" });
    } else {
      gsap.to(p, { width: w, height: h, x: left, duration: 0.5 * d, ease: "back.out(1.2)" });
    }
    const order: (string | null)[] = ["services", "work", "contact"];
    const dir = lastMenu.current ? Math.sign(order.indexOf(menu) - order.indexOf(lastMenu.current)) : 0;
    Object.entries(panes.current).forEach(([k, el]) => {
      if (!el) return;
      if (k === menu) {
        el.style.pointerEvents = "auto";
        gsap.fromTo(el, { opacity: 0, x: dir * 48, filter: "blur(6px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.45 * d, ease: "power3.out", delay: first ? 0.05 : 0 });
        gsap.fromTo(el.querySelectorAll("[data-mi]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 * d, stagger: 0.04, ease: "power3.out", delay: 0.06 });
      } else {
        el.style.pointerEvents = "none";
        gsap.to(el, { opacity: 0, x: -dir * 48, filter: "blur(6px)", duration: 0.3 * d, ease: "power2.in" });
      }
    });
    lastMenu.current = menu;
    play("tick");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  const go = (id: string) => {
    setMenu(null);
    if (!home) {
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (!el) return;
    play("open");
    scrollToY(Math.min(el.getBoundingClientRect().top + window.scrollY - (id === "path" ? 0 : 24), document.documentElement.scrollHeight - window.innerHeight));
  };

  const options = routing.locales.map((l) => ({ value: l, label: l.toUpperCase(), full: NAMES[l] }));
  const onLang = (i: number) => {
    try {
      sessionStorage.setItem("restoreY", String(window.scrollY));
    } catch {
      /* niente */
    }
    router.replace(`${pathname}${window.location.hash}`, { locale: routing.locales[i], scroll: false });
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden justify-center px-6 pt-4 lg:flex">
      <div ref={wrap} className="pointer-events-auto relative w-full max-w-[1180px]" onMouseLeave={scheduleClose}>
        <div
          ref={shell}
          className="drop float-glass relative flex flex-col"
          style={{ borderRadius: 30, ["--drop-tint" as string]: "var(--bar-tint)" }}
        >
          <div className="flex items-center gap-2 transition-[padding] duration-500 ease-[var(--ease-out)]" style={{ padding: compact ? "5px 6px 5px 18px" : "8px 8px 8px 22px" }}>
          <a
            href={`/${locale}`}
            onClick={(e) => {
              if (home) {
                e.preventDefault();
                scrollToY(0);
              }
            }}
            className="shrink-0 rounded-full py-2 pr-3 text-ink"
          >
            <Wordmark />
          </a>
          <nav aria-label={t("label")} className="mx-auto">
            <div ref={row} className="relative flex items-center" onMouseLeave={() => !menu && setHover(null)}>
              <span ref={bubble} aria-hidden className="drop pointer-events-none absolute inset-y-0 left-0 origin-center opacity-0" style={{ borderRadius: 999 }} />
              {items.map((it, i) => (
                <button
                  key={it.id}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  aria-current={active === i ? "location" : undefined}
                  aria-expanded={it.menu ? menu === it.menu : undefined}
                  aria-haspopup={it.menu ? "true" : undefined}
                  onMouseEnter={() => {
                    setHover(i);
                    if (it.menu) openMenu(it.menu);
                    else if (menu) scheduleClose();
                  }}
                  onFocus={() => {
                    setHover(i);
                    if (it.menu) openMenu(it.menu);
                  }}
                  onClick={() => go(it.id)}
                  className={`relative z-10 inline-flex h-10 items-center gap-1 rounded-full px-4 text-[14px] transition-colors duration-200 ${
                    active === i || hover === i ? "text-ink" : "text-ink-2"
                  }`}
                >
                  {it.label}
                  {it.menu && (
                    <ChevronDown
                      size={14}
                      strokeWidth={1.8}
                      aria-hidden
                      className="text-ink-3 transition-transform duration-300 ease-[var(--ease-out)]"
                      style={{ transform: menu === it.menu ? "rotate(180deg)" : undefined }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>
          <div className="flex shrink-0 items-center gap-2" onMouseEnter={() => menu && scheduleClose()}>
            <GlassSegmented id="lens-lang-top" options={options} selected={routing.locales.indexOf(locale)} onSelect={onLang} label={t("language")} />
            <ThemeToggle />
            <Drop href="#brief" accent className="h-[42px] px-4 text-[14px] font-medium text-ink">
              {t("write")}
            </Drop>
          </div>
          </div>
          <ClientRow variant="top" />
        </div>

        {/* pannello */}
        <div className="absolute left-0 top-full pt-3" onMouseEnter={() => window.clearTimeout(closeT.current)}>
          <div
            ref={panel}
            className="drop float-glass invisible relative overflow-hidden opacity-0"
            style={{ borderRadius: 28, ["--drop-tint" as string]: "var(--panel-tint)" }}
          >
            <div
              ref={(el) => {
                panes.current.services = el;
              }}
              className="absolute left-0 top-0 w-[760px] p-3 opacity-0"
            >
              <div className="flex items-center justify-between px-3 pb-2 pt-2">
                <p className="t-label text-ink-3">{t("menuServices")}</p>
                <a href="#brief" data-mi className="t-foot inline-flex items-center gap-1 text-ink-2 hover:text-ink">
                  {t("quote")}
                  <ArrowRight size={13} strokeWidth={1.8} aria-hidden />
                </a>
              </div>
              <ul className="grid grid-cols-2 gap-1">
                {SERVICES.map((s) => (
                  <li key={s.slug} data-mi>
                    <a
                      href={`/${locale}/servizi/${s.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setMenu(null);
                        play("open");
                        router.push(`/servizi/${s.slug}`);
                      }}
                      className="group flex items-center gap-3.5 rounded-[18px] px-2.5 py-2.5 transition-colors hover:bg-[var(--hover)]"
                    >
                      <ServiceIcon k={s.key} size={42} className="transition-transform duration-500 ease-[var(--ease-out)] group-hover:-rotate-6 group-hover:scale-105" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-[15px] font-medium tracking-[-0.01em] text-ink">
                          {s.title[locale]}
                          <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden className="-translate-x-1 text-ink-3 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                        <span className="t-foot mt-0.5 line-clamp-1 text-ink-3">{s.short[locale]}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div
              ref={(el) => {
                panes.current.work = el;
              }}
              className="absolute left-0 top-0 w-[620px] p-3 opacity-0"
            >
              <p className="t-label px-3 pb-2 pt-2 text-ink-3">{t("menuWork")}</p>
              <ul className="grid grid-cols-2 gap-1">
                {COVERS.map((c) => projects.find((x) => x.slug === c.slug)!).map((p) => {
                  return (
                    <li key={p.slug} data-mi>
                      <a
                        href={`/${locale}/lavori/${p.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setMenu(null);
                          play("open");
                          router.push(`/lavori/${p.slug}`);
                        }}
                        className="group flex gap-3 rounded-[18px] p-3 transition-colors hover:bg-[var(--hover)]"
                      >
                        <span className="relative h-[52px] w-[84px] shrink-0 overflow-hidden rounded-[12px] shadow-[0_0_0_1px_var(--hair)] transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-105">
                          <Cover slug={p.slug} mini />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 font-medium text-ink">
                            {p.name}
                            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden className="-translate-x-1 text-ink-3 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                          </span>
                          <span className="t-foot line-clamp-2 text-ink-3">{p.line[locale]}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <a href={`/${locale}/lavori`} data-mi className="t-foot mx-3 mb-1 mt-2 inline-flex items-center gap-1 text-ink-2 hover:text-ink">
                {t("allWork")}
                <ArrowUpRight size={13} strokeWidth={1.8} aria-hidden />
              </a>
            </div>
            <div
              ref={(el) => {
                panes.current.contact = el;
              }}
              className="absolute left-0 top-0 w-[360px] p-3 opacity-0"
            >
              <p className="t-label px-3 pb-2 pt-2 text-ink-3">{t("menuContact")}</p>
              <ul className="space-y-1">
                {profile.email && (
                  <li data-mi>
                    <a href={`mailto:${profile.email}`} className="flex items-center justify-between rounded-[16px] px-3 py-2.5 text-ink hover:bg-[var(--hover)]">
                      {profile.email}
                    </a>
                  </li>
                )}
                {[
                  profile.github && { href: profile.github, label: tc("github") },
                  profile.linkedin && { href: profile.linkedin, label: tc("linkedin") },
                ]
                  .filter(Boolean)
                  .map((l) => {
                    const x = l as { href: string; label: string };
                    return (
                      <li key={x.href} data-mi>
                        <a href={x.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between rounded-[16px] px-3 py-2.5 text-ink hover:bg-[var(--hover)]">
                          {x.label}
                          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden className="text-ink-3 transition-colors group-hover:text-ink" />
                        </a>
                      </li>
                    );
                  })}
                {profile.cv[locale] && (
                  <li data-mi>
                    <a href={profile.cv[locale]} download className="flex items-center gap-2 rounded-[16px] px-3 py-2.5 text-ink hover:bg-[var(--hover)]">
                      <FileText size={15} strokeWidth={1.8} aria-hidden className="text-ink-2" />
                      {tc("cv")}
                    </a>
                  </li>
                )}
                <li data-mi className="flex items-center justify-between px-3 pb-1 pt-3 text-ink-2">
                  <span className="t-foot">
                    {profile.city}, IT · {tc("time")}
                  </span>
                  <span className="t-foot">
                    <Clock locale={locale} />
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
