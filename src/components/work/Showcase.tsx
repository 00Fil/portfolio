"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BRAND } from "@/content/brand-icons";
import { RelayPreview } from "@/components/previews/RelayPreview";
import { CreaCloudPreview } from "@/components/previews/CreaCloudPreview";
import { UniSpacePreview } from "@/components/previews/UniSpacePreview";
import { play } from "@/lib/sound";
import { prefersReducedMotion } from "@/lib/env";
import { scrollToY } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const GlassObject = dynamic(() => import("@/components/canvasui/GlassObject"), { ssr: false });

export type ShowcaseItem = {
  slug: string;
  name: string;
  headline: string;
  context: string;
  role: string;
  year: string;
  stack: string[];
};

const PREVIEW: Record<string, ReactNode> = {
  relay: <RelayPreview />,
  creacloud: <CreaCloudPreview />,
  unispace: <UniSpacePreview />,
};

/** Tinta del vetro per progetto: tre varianti dello stesso azzurro. */
const TINT: Record<string, string> = { relay: "#5ec4ff", creacloud: "#7fd6e6", unispace: "#9fb8ff" };

const BRAND_OF: Record<string, string> = {
  Kotlin: "kotlin",
  "Jetpack Compose": "compose",
  "C#": "dotnet",
  "Node.js": "node",
  "GitHub Actions": "githubactions",
  "Next.js 16": "nextjs",
  Supabase: "supabase",
  Python: "python",
  FastAPI: "fastapi",
  Gemini: "gemini",
  "Docker Compose": "docker",
  Caddy: "caddy",
  SQLite: "sqlite",
};

function StackRow({ stack }: { stack: string[] }) {
  const items = stack.filter((s) => BRAND_OF[s]).slice(0, 5);
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((s) => (
        <li key={s} className="t-foot inline-flex items-center gap-1.5 text-ink-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
            <path d={BRAND[BRAND_OF[s]].path} />
          </svg>
          {s.replace(" 16", "")}
        </li>
      ))}
    </ul>
  );
}

const chars = (text: string) =>
  [...text].map((c, i) => (
    <span key={i} data-ch className="inline-block will-change-transform">
      {c === " " ? " " : c}
    </span>
  ));

function Glass({ slug, className }: { slug: string; className?: string }) {
  return (
    <GlassObject
      className={className}
      src={`/marks/${slug}.svg`}
      tint={TINT[slug]}
      tintDensity={0.55}
      ior={1.5}
      thickness={1.4}
      roughness={0.04}
      dispersion={0.55}
      depth={0.22}
      bevel={0.6}
      highlight="#5ec4ff"
      environmentIntensity={1.1}
      background=""
      scale={2.1}
      floatIntensity={0.6}
      rotationIntensity={0.8}
      floatSpeed={0.9}
      orbit={false}
      zoom={false}
    />
  );
}

/**
 * Lavori selezionati. Su desktop la scena resta ferma e lo scorrimento cambia progetto:
 * il nome cade lettera per lettera, l'anteprima entra a tendina, il marchio di vetro (Canvas UI) si rifà.
 * Su telefono i progetti scorrono uno sotto l'altro.
 */
export function Showcase({ items, open }: { items: ShowcaseItem[]; open: string }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const cur = useRef(0);
  const st = useRef<ScrollTrigger | null>(null);
  const n = items.length;

  // cambio di progetto: animazioni discrete, guidate dall'indice che la timeline di scorrimento decide
  const go = (next: number) => {
    const prev = cur.current;
    if (next === prev || !root.current) return;
    cur.current = next;
    setActive(next);
    play("tick");
    const dir = next > prev ? 1 : -1;
    const q = (s: string) => root.current!.querySelectorAll(s);
    const blk = (i: number) => root.current!.querySelector(`[data-blk="${i}"]`)!;
    const pv = (i: number) => root.current!.querySelector(`[data-pv="${i}"]`)!;
    if (prefersReducedMotion()) {
      gsap.set(q("[data-blk]"), { autoAlpha: 0 });
      gsap.set(blk(next), { autoAlpha: 1 });
      gsap.set(q("[data-pv]"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(pv(next), { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }
    const out = blk(prev);
    const inn = blk(next);
    gsap.killTweensOf([out, inn, out.querySelectorAll("[data-ch],[data-ln]"), inn.querySelectorAll("[data-ch],[data-ln]")]);
    gsap.to(out.querySelectorAll("[data-ch]"), { yPercent: -110 * dir, duration: 0.45, ease: "power3.in", stagger: 0.018 });
    gsap.to(out.querySelectorAll("[data-ln]"), { y: -18 * dir, autoAlpha: 0, filter: "blur(6px)", duration: 0.35, ease: "power2.in", stagger: 0.03 });
    gsap.set(out, { autoAlpha: 0, delay: 0.5 });
    gsap.set(inn, { autoAlpha: 1 });
    gsap.fromTo(inn.querySelectorAll("[data-ch]"), { yPercent: 110 * dir }, { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.025, delay: 0.2 });
    gsap.fromTo(
      inn.querySelectorAll("[data-ln]"),
      { y: 22 * dir, autoAlpha: 0, filter: "blur(6px)" },
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.35, clearProps: "filter" },
    );
    // anteprime: l'entrante sale a tendina, l'uscente arretra
    const pIn = pv(next);
    const pOut = pv(prev);
    gsap.set(pIn, { zIndex: 2 });
    gsap.set(pOut, { zIndex: 1 });
    gsap.fromTo(
      pIn,
      { clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", scale: 1.08 },
      { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.95, ease: "expo.inOut" },
    );
    gsap.to(pOut, { scale: 0.94, opacity: 0.35, duration: 0.95, ease: "expo.inOut", onComplete: () => gsap.set(pOut, { clipPath: "inset(100% 0% 0% 0%)", opacity: 1, scale: 1 }) });
    // il vetro si ritrae e torna con la nuova forma
    gsap.fromTo(glass.current, { scale: 0.5, rotate: -18 * dir, autoAlpha: 0.2 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.2, ease: "elastic.out(1, 0.55)" });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.set(root.current!.querySelectorAll("[data-blk]"), { autoAlpha: 0 });
        gsap.set(root.current!.querySelector('[data-blk="0"]'), { autoAlpha: 1 });
        gsap.set(root.current!.querySelectorAll("[data-pv]"), { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(root.current!.querySelector('[data-pv="0"]'), { clipPath: "inset(0% 0% 0% 0%)" });
        cur.current = 0;
        setActive(0);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (n - 0.2)}`,
            pin: true,
            scrub: 0.6,
            onUpdate: (self) => go(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
          },
        });
        st.current = tl.scrollTrigger ?? null;
        // continuo: il riquadro ruota leggermente, il numero di sfondo scorre, la barra si riempie
        tl.fromTo(frame.current, { rotateY: -9, rotateX: 4, y: 40 }, { rotateY: 9, rotateX: -3, y: -40, ease: "none" }, 0)
          .fromTo("[data-bignum]", { yPercent: 20 }, { yPercent: -40, ease: "none" }, 0)
          .fromTo("[data-rail]", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
        return () => {
          st.current = null;
        };
      });
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-mob]").forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll("[data-ch]"),
            { yPercent: 110 },
            { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.03, scrollTrigger: { trigger: el, start: "top 80%", once: true } },
          );
          gsap.fromTo(
            el.querySelector("[data-mframe]"),
            { clipPath: "inset(12% 8% 12% 8% round 28px)", scale: 1.06 },
            { clipPath: "inset(0% 0% 0% 0% round 28px)", scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: true } },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // il cursore inclina il marchio di vetro
  useEffect(() => {
    const el = stage.current;
    const g = glass.current;
    if (!el || !g || prefersReducedMotion()) return;
    const x = gsap.quickTo(g, "x", { duration: 0.8, ease: "power3.out" });
    const y = gsap.quickTo(g, "y", { duration: 0.8, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x(((e.clientX - r.left) / r.width - 0.5) * 40);
      y(((e.clientY - r.top) / r.height - 0.5) * 30);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  const jump = (i: number) => {
    const s = st.current;
    if (!s) return;
    scrollToY(s.start + ((s.end - s.start) * (i + 0.5)) / n);
  };

  const pad = (i: number) => String(i + 1).padStart(2, "0");

  return (
    <div ref={root}>
      {/* desktop: scena fissa */}
      <div ref={stage} className="relative hidden h-[100svh] overflow-hidden lg:block">
        <span data-bignum aria-hidden className="pointer-events-none absolute -right-[2vw] top-[8vh] select-none font-mono text-[34vw] font-medium leading-none tracking-[-0.06em] text-white/[0.025]">
          {pad(active)}
        </span>
        <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-12 items-center gap-8 px-8 pt-16">
          <div className="relative col-span-5 grid">
            {items.map((p, i) => (
              <article key={p.slug} data-blk={i} aria-hidden={active !== i} className="[grid-area:1/1]">
                <p data-ln className="t-label t-fig font-mono text-ink-3">
                  {pad(i)} / {pad(n - 1)}
                </p>
                <h3 className="mt-5 overflow-hidden pb-[0.06em] text-[clamp(56px,7vw,112px)] font-medium leading-[0.95] tracking-[-0.05em] text-ink" aria-label={p.name}>
                  <span aria-hidden>{chars(p.name)}</span>
                </h3>
                <p data-ln className="t-title3 mt-6 max-w-[26ch] text-ink">
                  {p.headline}
                </p>
                <p data-ln className="mt-3 text-ink-3">
                  {p.context} · {p.role} · {p.year}
                </p>
                <div data-ln className="mt-7">
                  <StackRow stack={p.stack} />
                </div>
                <div data-ln className="mt-9">
                  <Link
                    href={`/lavori/${p.slug}`}
                    tabIndex={active === i ? 0 : -1}
                    onClick={() => play("open")}
                    className="drop float-glass inline-flex h-12 items-center gap-2 px-5 font-medium text-ink"
                  >
                    {open}
                    <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <div className="relative col-span-7 [perspective:1600px]">
            <div ref={frame} className="relative aspect-[4/3] w-full [transform-style:preserve-3d]">
              <div className="absolute inset-0 overflow-hidden rounded-[36px] bg-surface shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                {items.map((p, i) => (
                  <div key={p.slug} data-pv={i} className="absolute inset-0 bg-surface" aria-hidden={active !== i}>
                    {PREVIEW[p.slug]}
                  </div>
                ))}
              </div>
            </div>
            <div ref={glass} aria-hidden className="pointer-events-none absolute -bottom-[14%] -left-[16%] z-10 aspect-square w-[42%]">
              <Glass key={items[active].slug} slug={items[active].slug} className="h-full w-full" />
            </div>
          </div>
        </div>
        {/* indice dei progetti con avanzamento */}
        <div className="absolute inset-x-0 bottom-8">
          <div className="mx-auto w-full max-w-[1280px] px-8">
            <div className="relative h-px w-full bg-white/10">
              <span data-rail className="absolute inset-0 origin-left bg-[var(--sky)]" />
            </div>
            <ol className="mt-4 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              {items.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    className={`t-foot inline-flex items-center gap-2 transition-colors duration-300 ${active === i ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}
                  >
                    <span className="font-mono">{pad(i)}</span>
                    {p.name}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* telefono e tablet: progetti in colonna */}
      <div className="mx-auto w-full max-w-[1280px] space-y-20 px-5 sm:px-8 lg:hidden">
        {items.map((p, i) => (
          <MobileItem key={p.slug} p={p} i={i} n={n} open={open} pad={pad} />
        ))}
      </div>
    </div>
  );
}

function MobileItem({ p, i, n, open, pad }: { p: ShowcaseItem; i: number; n: number; open: string; pad: (i: number) => string }) {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <article ref={ref} data-mob className="relative">
      <div className="relative">
        <div data-mframe className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-surface">
          {PREVIEW[p.slug]}
        </div>
        <div aria-hidden className="pointer-events-none absolute -bottom-[10%] -right-3 aspect-square w-[34%]">
          {near && <Glass slug={p.slug} className="h-full w-full" />}
        </div>
      </div>
      <p className="t-label t-fig mt-8 font-mono text-ink-3">
        {pad(i)} / {pad(n - 1)}
      </p>
      <h3 className="mt-3 overflow-hidden text-[clamp(44px,13vw,72px)] font-medium leading-[0.95] tracking-[-0.05em] text-ink" aria-label={p.name}>
        <span aria-hidden>{chars(p.name)}</span>
      </h3>
      <p className="t-title3 mt-4 text-ink">{p.headline}</p>
      <p className="mt-2 text-ink-3">
        {p.context} · {p.year}
      </p>
      <div className="mt-5">
        <StackRow stack={p.stack} />
      </div>
      <Link href={`/lavori/${p.slug}`} onClick={() => play("open")} className="drop float-glass mt-7 inline-flex h-12 items-center gap-2 px-5 font-medium text-ink">
        {open}
        <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden />
      </Link>
    </article>
  );
}
