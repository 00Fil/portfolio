"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ArrowRight, ArrowUpRight, ChevronLeft, FileText, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { SERVICES } from "@/content/services";
import { projects } from "@/content/projects";
import { COVERS } from "@/content/covers";
import { profile } from "@/content/profile";
import { Cover } from "@/components/work/Covers";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { ClientRow } from "./ClientStrip";
import { useScrollingDown } from "@/lib/use-scroll-dir";
import { useRouter } from "@/i18n/navigation";
import { LensFilter } from "@/components/glass/LensFilter";
import { bevelImage } from "@/lib/glass";
import { SPR, Spring } from "@/lib/spring";
import { scrollToY } from "@/lib/scroll";
import { play } from "@/lib/sound";
import { ACCENT, INK_2, lerpColor, prefersReducedMotion, supportsBackdropLens, supportsElementLens, vibrate } from "@/lib/env";

export type Tab = { id: string; label: string; icon: LucideIcon };

type Props = {
  tabs: Tab[];
  navLabel: string;
  /** Pagina di dettaglio: la barra si allunga verso l'alto con il titolo e il ritorno (come il brano in Relay). */
  detail?: { title: string; backLabel: string; activeIndex: number; section?: string };
};

const ROW_H = 66;
const PAD_X = 6;
const PAD_Y = 5;
const EXTRA_H = 44;
const CORNER = 33;
/** Riga dell'area clienti, sempre dentro la capsula (36 + margini). */
const STRIP_H = 42;
/** Voci che, toccate, aprono il cassetto invece di scorrere alla sezione. */
const DRAWER: Record<string, "services" | "work" | "contact"> = { approach: "services", work: "work", contact: "contact" };
type DrawerKind = "services" | "work" | "contact";

/** Contenuto del cassetto: le stesse scelte dei menu della barra in alto. */
function DrawerBody({ kind, onPick, toSection }: { kind: DrawerKind; onPick: (href: string, external?: boolean) => void; toSection: () => void }) {
  const t = useTranslations("nav");
  const tc = useTranslations("contact");
  const locale = useLocale() as Locale;
  const head = (label: string) => (
    <div className="flex items-center justify-between px-2 pb-2 pt-1">
      <p className="t-label text-ink-3">{label}</p>
      <button type="button" onClick={toSection} className="t-foot inline-flex items-center gap-1 text-ink-2">
        {t("toSection")}
        <ArrowRight size={13} strokeWidth={1.8} aria-hidden />
      </button>
    </div>
  );
  if (kind === "services")
    return (
      <>
        {head(t("menuServices"))}
        <ul className="grid grid-cols-2 gap-1">
          {SERVICES.map((sv) => (
            <li key={sv.slug} data-di>
              <button type="button" onClick={() => onPick(`/servizi/${sv.slug}`)} className="flex w-full items-center gap-2.5 rounded-[16px] p-1.5 text-left active:bg-[var(--hover)]">
                <ServiceIcon k={sv.key} size={32} />
                <span className="line-clamp-2 text-[13px] font-medium leading-[1.2] tracking-[-0.01em] text-ink">{sv.title[locale]}</span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  if (kind === "work")
    return (
      <>
        {head(t("menuWork"))}
        <ul className="space-y-1">
          {COVERS.map((c) => projects.find((x) => x.slug === c.slug)!).map((pr) => (
            <li key={pr.slug} data-di>
              <button type="button" onClick={() => onPick(`/lavori/${pr.slug}`)} className="flex w-full items-center gap-3 rounded-[16px] p-1.5 text-left active:bg-[var(--hover)]">
                <span className="relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[10px] shadow-[0_0_0_1px_var(--hair)]">
                  <Cover slug={pr.slug} mini />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-medium text-ink">{pr.name}</span>
                  <span className="t-foot line-clamp-1 text-ink-3">{pr.line[locale]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  const links = [
    profile.github && { href: profile.github, label: tc("github"), ext: true },
    profile.linkedin && { href: profile.linkedin, label: tc("linkedin"), ext: true },
    profile.cv[locale] && { href: profile.cv[locale], label: tc("cv"), ext: true, cv: true },
  ].filter(Boolean) as { href: string; label: string; ext: boolean; cv?: boolean }[];
  return (
    <>
      {head(t("menuContact"))}
      <ul className="space-y-1">
        <li data-di>
          <a href="#brief" onClick={() => onPick("", true)} className="flex items-center justify-between rounded-[16px] bg-[var(--strip-btn)] px-3 py-3 text-[14px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--strip-edge)]">
            {t("quote")}
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
          </a>
        </li>
        {links.map((l) => (
          <li key={l.href} data-di>
            <a href={l.href} target="_blank" rel="noopener noreferrer" download={l.cv || undefined} onClick={() => onPick("", true)} className="flex items-center justify-between rounded-[16px] px-3 py-2.5 text-[14px] text-ink active:bg-[var(--hover)]">
              <span className="flex items-center gap-2">
                {l.cv && <FileText size={15} strokeWidth={1.8} aria-hidden className="text-ink-2" />}
                {l.label}
              </span>
              <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden className="text-ink-3" />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * GlassTabBar di Relay (GlassBar.kt), per il web.
 * La bolla sta sull'indice continuo della sezione (come la posizione del pager in Relay). Toccata si gonfia,
 * segue il puntatore con un po' di ritardo allungandosi nel verso del moto, e al rilascio si assesta sulla voce.
 */
export function GlassTabBar({ tabs, navLabel, detail }: Props) {
  const n = tabs.length;
  const locale = useLocale();
  const router = useRouter();
  const barRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLElement | null)[]>([]);
  const cloneIconRefs = useRef<(HTMLElement | null)[]>([]);
  const barDropRef = useRef<HTMLDivElement>(null);
  const bubbleDropRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, itemW: 0 });
  const [current, setCurrent] = useState(detail?.activeIndex ?? 0);
  const [lens, setLens] = useState({ bar: false, bubble: false });
  const [drawer, setDrawer] = useState<DrawerKind | null>(null);
  const [drawerH, setDrawerH] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  // l'ultimo contenuto resta montato mentre il cassetto si richiude
  const lastKind = useRef<DrawerKind>("services");
  if (drawer) lastKind.current = drawer;
  // scorrendo verso il basso restano solo le icone: area clienti e riga di dettaglio si ritirano
  const down = useScrollingDown();
  const slim = down && !drawer;

  const st = useRef({
    holding: false,
    settling: false,
    scrollPos: detail?.activeIndex ?? 0,
    anchors: [] as { start: number; end: number; target: number }[],
    lastTab: -1,
    openIdx: -1,
  });
  const follow = useRef(new Spring(detail?.activeIndex ?? 0));
  const bubble = useRef(new Spring(1));

  useEffect(() => {
    setLens({ bar: supportsBackdropLens(), bubble: supportsElementLens() });
    if (supportsBackdropLens()) document.documentElement.classList.add("lens");
  }, []);

  // ------------------------------------------------------------ misure
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const w = row.clientWidth;
      setSize({ w: w + PAD_X * 2, itemW: w / n });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [n]);

  // smusso di vetro cotto per la misura della capsula e della bolla
  useEffect(() => {
    if (!size.itemW) return;
    const bar = barDropRef.current;
    const bub = bubbleDropRef.current;
    if (bar) {
      const u = bevelImage(bar.offsetWidth, ROW_H + (slim ? 0 : STRIP_H + (detail ? EXTRA_H : 0)) + drawerH, CORNER);
      if (u) { bar.style.setProperty("--bevel", u); bar.dataset.bevel = "1"; }
    }
    if (bub) {
      const u = bevelImage(size.itemW, ROW_H - PAD_Y * 2);
      if (u) { bub.style.setProperty("--bevel", u); bub.dataset.bevel = "1"; }
    }
  }, [size.itemW, size.w, detail, drawerH, slim]);

  // ------------------------------------------------------------ posizione dallo scroll
  const computeAnchors = useCallback(() => {
    if (detail) return;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const tops = tabs.map((t) => {
      const el = document.getElementById(t.id);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
    const anchors: { start: number; end: number; target: number }[] = [{ start: 0, end: 0, target: 0 }];
    for (let i = 1; i < n; i++) {
      const end = Math.max(Math.min(tops[i] - vh * 0.25, max), anchors[i - 1].end + 2);
      const start = Math.max(end - vh * 0.5, anchors[i - 1].end + 1);
      anchors.push({ start, end, target: Math.min(tops[i], max) });
    }
    st.current.anchors = anchors;
  }, [detail, n, tabs]);

  const posFromScroll = useCallback(() => {
    const a = st.current.anchors;
    if (!a.length) return st.current.scrollPos;
    const y = window.scrollY;
    let pos = 0;
    for (let i = 1; i < a.length; i++) {
      if (y >= a[i].end) pos = i;
      else {
        if (y > a[i].start) pos = i - 1 + (y - a[i].start) / (a[i].end - a[i].start);
        break;
      }
    }
    return pos;
  }, []);

  useEffect(() => {
    if (detail) return;
    computeAnchors();
    const onResize = () => computeAnchors();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      ro.disconnect();
    };
  }, [computeAnchors, detail]);

  // ------------------------------------------------------------ disegno, sul ticker di GSAP
  useEffect(() => {
    const reduce = prefersReducedMotion();
    const render = () => {
      const s = st.current;
      if (!detail) s.scrollPos = posFromScroll();
      const pill = s.holding || s.settling || s.openIdx >= 0 ? follow.current.value : s.scrollPos;
      const itemW = size.itemW;
      const b = bubble.current.value;
      const stretch = reduce ? 0 : Math.min(Math.abs(follow.current.target - follow.current.value) * 0.3, 0.34);
      const x = pill * itemW;
      if (bubbleRef.current) {
        bubbleRef.current.style.transform = `translate3d(${x}px,0,0) scale(${b * (1 + stretch)}, ${1 + (b - 1) * 0.75 - stretch * 0.28})`;
      }
      if (cloneRef.current) cloneRef.current.style.transform = `translate3d(${-x}px,0,0)`;
      for (let i = 0; i < n; i++) {
        const near = 1 - Math.min(1, Math.abs(i - pill));
        const lt = document.documentElement.dataset.theme === "light";
        const col = lerpColor(lt ? [0x7b, 0x7c, 0x82] : INK_2, lt ? [0x1f, 0x8f, 0xd0] : ACCENT, near);
        const el = iconRefs.current[i];
        if (el) el.style.color = col;
        const c = cloneIconRefs.current[i];
        if (c) c.style.color = col;
      }
      if (!s.holding && !s.settling && s.openIdx < 0) {
        const r = Math.round(pill);
        setCurrent((prev) => (prev === r ? prev : r));
      }
    };
    gsap.ticker.add(render);
    return () => gsap.ticker.remove(render);
  }, [detail, n, posFromScroll, size.itemW]);

  // ------------------------------------------------------------ icona che si ridisegna quando diventa attiva (TabGlyph)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const targets = [iconRefs.current[current], cloneIconRefs.current[current]];
    targets.forEach((root) => {
      if (!root) return;
      const shapes = root.querySelectorAll<SVGGeometryElement>("path, circle, rect, line, polyline, polygon, ellipse");
      shapes.forEach((sh) => {
        let len = 0;
        try {
          len = sh.getTotalLength();
        } catch {
          len = 0;
        }
        if (!len) return;
        gsap.fromTo(
          sh,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.56, ease: "power2.inOut", onComplete: () => { sh.style.strokeDasharray = ""; sh.style.strokeDashoffset = ""; } },
        );
      });
    });
  }, [current]);

  // ------------------------------------------------------------ vai alla voce
  const go = useCallback(
    (idx: number, done?: () => void) => {
      if (detail) {
        router.push(`/#${tabs[idx].id}`);
        done?.();
        return;
      }
      computeAnchors();
      const a = st.current.anchors[idx];
      scrollToY(a ? a.target : 0, done);
    },
    [computeAnchors, detail, router, tabs],
  );

  // ------------------------------------------------------------ cassetto
  const closeDrawer = useCallback(() => {
    const s = st.current;
    if (s.openIdx < 0) return;
    s.openIdx = -1;
    s.settling = true;
    follow.current.to(s.scrollPos, SPR.barSettle, () => (s.settling = false));
    setDrawer(null);
  }, []);
  const toggleDrawer = useCallback(
    (idx: number) => {
      const s = st.current;
      const kind = DRAWER[tabs[idx].id];
      if (s.openIdx === idx) return closeDrawer();
      s.openIdx = idx;
      follow.current.to(idx, SPR.barSettle);
      setDrawer(kind);
      vibrate(8);
      play("open");
    },
    [closeDrawer, tabs],
  );
  // altezza del contenuto, misurata a ogni apertura
  useLayoutEffect(() => {
    if (!drawer) return setDrawerH(0);
    const el = drawerRef.current;
    if (!el) return;
    setDrawerH(el.scrollHeight);
    if (!prefersReducedMotion()) gsap.fromTo(el.querySelectorAll("[data-di]"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.03, ease: "power3.out", delay: 0.08 });
  }, [drawer]);
  // si chiude con Esc o scorrendo la pagina
  useEffect(() => {
    if (!drawer) return;
    const y0 = window.scrollY;
    const onScroll = () => Math.abs(window.scrollY - y0) > 60 && closeDrawer();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [drawer, closeDrawer]);
  const pick = (href: string, external?: boolean) => {
    closeDrawer();
    if (external || !href) return;
    play("open");
    router.push(href);
  };

  // ------------------------------------------------------------ gesto: tieni premuto, trascina, rilascia
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const s = st.current;
    const toTab = (clientX: number) => {
      const r = row.getBoundingClientRect();
      const itemPx = r.width / n;
      return Math.min(n - 1, Math.max(0, (clientX - r.left) / itemPx - 0.5));
    };
    let active = false;
    let lastX = 0;
    let pointerId = -1;
    let unlock: number | undefined;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      active = true;
      pointerId = e.pointerId;
      row.setPointerCapture(e.pointerId);
      window.clearTimeout(unlock);
      const startPos = s.holding || s.settling ? follow.current.value : s.scrollPos;
      s.holding = true;
      s.settling = false;
      vibrate(10);
      play("press");
      follow.current.snap(startPos);
      lastX = e.clientX;
      s.lastTab = Math.round(toTab(lastX));
      follow.current.to(toTab(lastX), SPR.follow);
      bubble.current.to(1.24, SPR.bubble);
    };
    const onMove = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      lastX = e.clientX;
      const t = Math.round(toTab(lastX));
      if (t !== s.lastTab) {
        s.lastTab = t;
        vibrate(4);
        play("tick");
      }
      follow.current.to(toTab(lastX), SPR.follow);
    };
    const finish = (e: PointerEvent, cancel = false) => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      try {
        row.releasePointerCapture(pointerId);
      } catch {
        /* già rilasciato */
      }
      const idx = cancel ? Math.round(s.scrollPos) : Math.round(toTab(lastX));
      s.holding = false;
      if (!cancel && DRAWER[tabs[idx].id]) {
        bubble.current.to(1, SPR.bubble);
        toggleDrawer(idx);
        return;
      }
      if (s.openIdx >= 0) {
        s.openIdx = -1;
        setDrawer(null);
      }
      s.settling = true;
      bubble.current.to(1, SPR.bubble);
      let springDone = false;
      let scrollDone = cancel;
      const release = () => {
        if (springDone && scrollDone) s.settling = false;
      };
      follow.current.to(idx, SPR.barSettle, () => {
        springDone = true;
        release();
      });
      if (!cancel) {
        play("open");
        go(idx, () => {
          scrollDone = true;
          release();
        });
      }
      unlock = window.setTimeout(() => (s.settling = false), 1800);
    };
    const onUp = (e: PointerEvent) => finish(e);
    const onCancel = (e: PointerEvent) => finish(e, true);
    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove);
    row.addEventListener("pointerup", onUp);
    row.addEventListener("pointercancel", onCancel);
    return () => {
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerup", onUp);
      row.removeEventListener("pointercancel", onCancel);
      window.clearTimeout(unlock);
    };
  }, [go, n, tabs, toggleDrawer]);

  const onKeyNav = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const j = (i + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
      (barRef.current?.querySelectorAll<HTMLAnchorElement>("[data-tab]")[j])?.focus();
    }
  };

  const extra = detail ? EXTRA_H : 0;
  const totalH = ROW_H + (slim ? 0 : extra + STRIP_H) + drawerH;
  const pillW = size.itemW;
  const pillH = ROW_H - PAD_Y * 2;
  const href = (id: string) => (detail ? `/${locale}#${id}` : `#${id}`);

  const items = (refs: React.MutableRefObject<(HTMLElement | null)[]>, interactive: boolean) =>
    tabs.map((t, i) => {
      const Icon = t.icon;
      const inner = (
        <>
          <Icon size={24} strokeWidth={1.6} aria-hidden className="shrink-0" />
          <span className="sr-only">{t.label}</span>
        </>
      );
      return interactive ? (
        <a
          key={t.id}
          data-tab
          href={href(t.id)}
          ref={(el) => {
            refs.current[i] = el;
          }}
          aria-current={current === i ? "location" : undefined}
          aria-expanded={DRAWER[t.id] ? drawer === DRAWER[t.id] : undefined}
          aria-label={t.label}
          onClick={(e) => {
            e.preventDefault();
            if (e.detail !== 0) return;
            if (DRAWER[t.id]) toggleDrawer(i);
            else {
              closeDrawer();
              go(i);
            }
          }}
          onKeyDown={(e) => onKeyNav(e, i)}
          className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-full outline-offset-[-2px]"
          style={{ color: "var(--label-secondary)" }}
          draggable={false}
        >
          {inner}
        </a>
      ) : (
        <span
          key={t.id}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-[3px]"
          style={{ color: "var(--label-secondary)" }}
        >
          {inner}
        </span>
      );
    });

  return (
    <nav
      aria-label={navLabel}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 lg:hidden"
      style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
    >
      {lens.bar && size.w > 0 && (
        <LensFilter id="lens-bar" width={size.w} height={totalH} radius={CORNER} edge={12} amount={5} aberr={0.18} sat={1.5} />
      )}
      {lens.bubble && pillW > 0 && (
        <LensFilter id="lens-bubble" width={pillW} height={pillH} radius={pillH / 2} edge={10} amount={5} aberr={0.1} sat={1.3} />
      )}
      {/* fuori dal cassetto: un tocco lo chiude */}
      <div aria-hidden onClick={closeDrawer} className={`fixed inset-0 bg-black/20 transition-opacity duration-300 ${drawer ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <div
        ref={barRef}
        className="pointer-events-auto relative w-full max-w-[440px]"
        style={{ height: totalH, borderRadius: CORNER, boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.08)", transition: "height 520ms cubic-bezier(.2,.9,.25,1.04)" }}
      >
        {/* 1) vetro della capsula · 2) velo · 3) contorno tonale e riflesso */}
        <div className="bar-glass absolute inset-0" style={{ borderRadius: CORNER }} />
        <div className="bar-veil absolute inset-0" style={{ borderRadius: CORNER }} />
        <div ref={barDropRef} className="drop absolute inset-0" style={{ borderRadius: CORNER, ["--drop-tint" as string]: "transparent" }} aria-hidden />

        {/* cassetto: cresce verso l'alto con le scelte della voce toccata */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: drawerH, transition: "height 520ms cubic-bezier(.2,.9,.25,1.04)" }} aria-hidden={!drawer}>
          <div ref={drawerRef} className="px-2.5 pb-1 pt-3">
            {(drawer || drawerH > 0) && (
              <DrawerBody
                kind={drawer ?? lastKind.current}
                onPick={pick}
                toSection={() => {
                  const i = st.current.openIdx;
                  closeDrawer();
                  if (i >= 0) go(i);
                }}
              />
            )}
          </div>
        </div>

        {/* area clienti, sempre dentro la capsula */}
        <div
          className={`absolute inset-x-[6px] transition-[opacity,transform] duration-300 ${slim ? "pointer-events-none translate-y-3 scale-95 opacity-0" : ""}`}
          style={{ bottom: ROW_H + extra, height: STRIP_H - 6 }}
        >
          <ClientRow variant="bar" />
        </div>

        {detail && (
          <div
            className={`absolute inset-x-0 flex items-center gap-2 px-4 transition-[opacity,transform] duration-300 ${slim ? "pointer-events-none translate-y-3 opacity-0" : ""}`}
            style={{ height: EXTRA_H, bottom: ROW_H }}
          >
            <a
              href={`/${locale}#${detail.section ?? "work"}`}
              onClick={(e) => {
                e.preventDefault();
                play("open");
                router.push(`/#${detail.section ?? "work"}`);
              }}
              className="t-foot inline-flex items-center gap-1 rounded-full py-1 pr-2 text-ink-2 hover:text-ink"
            >
              <ChevronLeft size={16} strokeWidth={1.8} aria-hidden />
              {detail.backLabel}
            </a>
            <span className="t-foot ml-auto truncate font-medium text-ink">{detail.title}</span>
          </div>
        )}

        {/* 4) voci */}
        <div
          ref={rowRef}
          className="absolute inset-x-0 bottom-0 flex touch-none select-none"
          style={{ height: ROW_H, padding: `${PAD_Y}px ${PAD_X}px` }}
        >
          {items(iconRefs, true)}
        </div>

        {/* 5) bolla: rifrange la capsula stessa, icone comprese */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: ROW_H, padding: `${PAD_Y}px ${PAD_X}px` }} aria-hidden>
          <div ref={bubbleRef} className="relative will-change-transform" style={{ width: pillW, height: pillH, transformOrigin: "50% 50%" }}>
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: pillH / 2 }}>
              <div
                className="absolute inset-y-0 left-0"
                style={{ filter: lens.bubble ? "url(#lens-bubble)" : undefined, width: pillW, height: pillH }}
              >
                <div ref={cloneRef} className="absolute inset-y-0 left-0 flex" style={{ width: size.w - PAD_X * 2, height: pillH, background: "color-mix(in srgb, var(--bg-canvas) 88%, transparent)" }}>
                  {items(cloneIconRefs, false)}
                </div>
              </div>
            </div>
            <div ref={bubbleDropRef} className="drop absolute inset-0" style={{ borderRadius: pillH / 2 }} />
          </div>
        </div>
      </div>
    </nav>
  );
}
