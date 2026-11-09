"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { tr, type Scene } from "@/content/service-stories";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SKY = "#5ec4ff";
const glass = "bg-[rgba(14,16,20,.7)] backdrop-blur-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,.09),0_30px_70px_-30px_rgba(0,0,0,.95)]";

/** Ogni scena ha la sua timeline: riparte da capo ogni volta che diventa la scena attiva. */
function useScene(active: boolean, build: (q: (s: string) => Element[]) => gsap.core.Timeline) {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  useGSAP(
    () => {
      tl.current = build(gsap.utils.selector(ref.current)).pause();
      if (prefersReducedMotion()) tl.current.progress(1);
    },
    { scope: ref },
  );
  useEffect(() => {
    const t = tl.current;
    if (!t || prefersReducedMotion()) return;
    if (active) t.restart();
  }, [active]);
  return ref;
}

function Flow({ s, l, active }: { s: Extract<Scene, { kind: "flow" }>; l: Locale; active: boolean }) {
  const ref = useScene(active, (q) => {
    const tl = gsap
      .timeline()
      .from(q("[data-n]"), { y: 18, autoAlpha: 0, scale: 0.9, duration: 0.6, stagger: 0.16, ease: "power3.out" })
      .from(q("[data-j]"), { scaleX: 0, transformOrigin: "0 50%", duration: 0.4, stagger: 0.16, ease: "power2.out" }, 0.3);
    const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
    q("[data-n]").forEach((n, i) => run.to(n, { boxShadow: `inset 0 0 0 1px ${SKY}, 0 0 40px -12px ${SKY}`, duration: 0.3, yoyo: true, repeat: 1 }, i * 0.5));
    return tl.add(run, 1);
  });
  return (
    <div ref={ref} className="flex w-full flex-col items-center justify-center sm:flex-row">
      {s.items.map((it, i) => (
        <div key={i} className="contents">
          <div data-n className={`flex w-[118px] flex-col items-center gap-3 rounded-[20px] px-3 py-5 text-center ${glass}`}>
            <span className="t-fig flex h-9 w-9 items-center justify-center rounded-full font-mono text-[13px] text-black" style={{ background: SKY }}>
              {i + 1}
            </span>
            <span className="text-[14px] leading-tight text-ink">{tr(it, l)}</span>
          </div>
          {i < s.items.length - 1 && <span data-j className="h-5 w-px shrink-0 sm:h-px sm:w-10" style={{ background: SKY }} />}
        </div>
      ))}
    </div>
  );
}

function CheckList({ s, l, active }: { s: Extract<Scene, { kind: "check" }>; l: Locale; active: boolean }) {
  const ref = useScene(active, (q) =>
    gsap
      .timeline()
      .from(q("[data-card]"), { y: 20, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
      .from(q("[data-row]"), { x: -10, autoAlpha: 0, duration: 0.4, stagger: 0.18, ease: "power2.out" }, 0.25)
      .fromTo(q("[data-tick]"), { scale: 0 }, { scale: 1, duration: 0.4, stagger: 0.18, ease: "back.out(3)" }, 0.5),
  );
  return (
    <div ref={ref} className="flex w-full justify-center">
      <div data-card className={`w-full max-w-[380px] rounded-[24px] p-6 ${glass}`}>
        {s.items.map((it, i) => (
          <p key={i} data-row className="flex items-center gap-3.5 border-b border-white/[0.06] py-3.5 text-[16px] text-ink last:border-0">
            <span data-tick className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-black" style={{ background: SKY }}>
              <Check size={13} strokeWidth={3} />
            </span>
            {tr(it, l)}
          </p>
        ))}
      </div>
    </div>
  );
}

const ORBIT = [
  [-150, -96],
  [150, -96],
  [-150, 96],
  [150, 96],
];
function Orbit({ s, l, active }: { s: Extract<Scene, { kind: "orbit" }>; l: Locale; active: boolean }) {
  const ref = useScene(active, (q) => {
    const tl = gsap
      .timeline()
      .from(q("[data-core]"), { scale: 0.6, autoAlpha: 0, duration: 0.7, ease: "expo.out" })
      .from(q("[data-link]"), { strokeDashoffset: 100, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0.3);
    q("[data-sat]").forEach((sat, i) => tl.from(sat, { x: -ORBIT[i][0], y: -ORBIT[i][1], scale: 0.4, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 0.35 + i * 0.08));
    q("[data-sat]").forEach((sat, i) => tl.to(sat, { y: i % 2 ? "+=6" : "-=6", duration: 2 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" }, 1.4));
    return tl.to(q("[data-ring]"), { rotation: 360, svgOrigin: "0 0", duration: 30, repeat: -1, ease: "none" }, 0);
  });
  return (
    <div ref={ref} className="relative h-[300px] w-[460px] max-w-full">
      <svg viewBox="-230 -150 460 300" className="absolute inset-0 h-full w-full">
        <g data-ring>
          <circle r="120" fill="none" stroke="rgba(94,196,255,.12)" strokeDasharray="2 6" />
        </g>
        {ORBIT.map(([x, y], i) => (
          <line key={i} data-link x1="0" y1="0" x2={x} y2={y} stroke="rgba(94,196,255,.35)" pathLength={100} strokeDasharray="100" />
        ))}
      </svg>
      <span data-core className="absolute left-1/2 top-1/2 -ml-[52px] -mt-[52px] flex h-[104px] w-[104px] items-center justify-center rounded-full text-center text-[14px] font-medium text-black" style={{ background: SKY, boxShadow: `0 0 60px -10px ${SKY}` }}>
        {tr(s.center, l)}
      </span>
      {s.items.map((it, i) => (
        <span
          key={i}
          data-sat
          className={`absolute left-1/2 top-1/2 flex h-11 -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap rounded-full px-4 text-[14px] text-ink ${glass}`}
          style={{ marginLeft: ORBIT[i][0], marginTop: ORBIT[i][1] }}
        >
          {tr(it, l)}
        </span>
      ))}
    </div>
  );
}

function Compare({ s, l, active, labels }: { s: Extract<Scene, { kind: "compare" }>; l: Locale; active: boolean; labels: [string, string] }) {
  const ref = useScene(active, (q) =>
    gsap
      .timeline()
      .from(q("[data-before]"), { y: 20, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
      .fromTo(q("[data-strike]"), { scaleX: 0 }, { scaleX: 1, transformOrigin: "0 50%", duration: 0.5, stagger: 0.15, ease: "power2.inOut" }, 0.5)
      .to(q("[data-before]"), { autoAlpha: 0.45, scale: 0.96, duration: 0.5 }, 0.9)
      .from(q("[data-after]"), { x: 30, autoAlpha: 0, duration: 0.8, ease: "expo.out" }, 1)
      .from(q("[data-after] [data-row]"), { y: 8, autoAlpha: 0, duration: 0.4, stagger: 0.12 }, 1.2),
  );
  return (
    <div ref={ref} className="grid w-full max-w-[520px] gap-4 sm:grid-cols-2">
      <div data-before className={`rounded-[22px] p-5 ${glass}`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">{labels[0]}</p>
        {s.before.map((b, i) => (
          <p key={i} className="relative mt-4 w-max max-w-full text-[15px] text-ink-2">
            {tr(b, l)}
            <span data-strike className="absolute inset-x-0 top-1/2 h-px bg-white/60" />
          </p>
        ))}
      </div>
      <div data-after className={`rounded-[22px] p-5 ${glass}`} style={{ boxShadow: `inset 0 0 0 1px ${SKY}, 0 0 50px -16px ${SKY}` }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: SKY }}>
          {labels[1]}
        </p>
        {s.after.map((a, i) => (
          <p key={i} data-row className="mt-4 flex items-center gap-2 text-[15px] text-ink">
            <Check size={15} strokeWidth={2.6} style={{ color: SKY }} />
            {tr(a, l)}
          </p>
        ))}
      </div>
    </div>
  );
}

function Screen({ s, l, active }: { s: Extract<Scene, { kind: "screen" }>; l: Locale; active: boolean }) {
  const phone = s.device === "phone";
  const ref = useScene(active, (q) =>
    gsap
      .timeline()
      .from(q("[data-dev]"), { y: 30, autoAlpha: 0, rotateX: 12, duration: 0.9, ease: "expo.out" })
      .from(q("[data-title]"), { y: 10, autoAlpha: 0, duration: 0.5 }, 0.35)
      .from(q("[data-row]"), { x: -12, autoAlpha: 0, duration: 0.45, stagger: 0.1, ease: "power2.out" }, 0.5)
      .from(q("[data-btn]"), { scale: 0.8, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" }, 0.9)
      .to(q("[data-btn]"), { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 }, 1.8)
      .to(q("[data-row]")[0], { backgroundColor: "rgba(94,196,255,.14)", duration: 0.3 }, 1.8),
  );
  return (
    <div ref={ref} className="flex w-full justify-center [perspective:1200px]">
      <div
        data-dev
        className={`flex flex-col overflow-hidden ${glass} ${phone ? "h-[380px] w-[200px] rounded-[36px] p-3" : "h-[290px] w-[460px] max-w-full rounded-[18px]"}`}
      >
        {phone ? (
          <span className="mx-auto mb-3 mt-1 h-1.5 w-14 rounded-full bg-white/15" />
        ) : (
          <div className="flex h-8 items-center gap-1.5 border-b border-white/[0.06] px-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />
            ))}
          </div>
        )}
        <div className={`flex flex-1 flex-col ${phone ? "px-2" : "p-5"}`}>
          <p data-title className={`font-medium tracking-[-0.02em] text-ink ${phone ? "text-[17px]" : "text-[22px]"}`}>
            {tr(s.title, l)}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {s.rows.map((r, i) => (
              <span key={i} data-row className="flex h-10 items-center justify-between rounded-[12px] bg-white/[0.05] px-3 text-[13px] text-ink-2">
                {tr(r, l)}
                <span className="text-ink-3">›</span>
              </span>
            ))}
          </div>
          <span data-btn className="mt-auto flex h-10 items-center justify-center rounded-full text-[13px] font-medium text-black" style={{ background: SKY }}>
            {l === "it" ? "Continua" : "Continue"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Meter({ s, l, active }: { s: Extract<Scene, { kind: "meter" }>; l: Locale; active: boolean }) {
  const ref = useScene(active, (q) => {
    const el = q("[data-val]")[0];
    const num = parseFloat(s.value.replace(",", "."));
    const dec = (s.value.split(/[.,]/)[1] ?? "").replace(/\D/g, "").length;
    const suffix = s.value.replace(/^[\d.,]+/, "");
    const o = { v: 0 };
    return gsap
      .timeline()
      .from(q("[data-card]"), { y: 20, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
      .to(o, { v: num, duration: 1.6, ease: "power2.out", onUpdate: () => void (el.textContent = o.v.toFixed(dec).replace(".", l === "it" ? "," : ".") + suffix) }, 0.2)
      .from(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%", duration: 1, stagger: 0.15, ease: "power2.out" }, 0.4);
  });
  return (
    <div ref={ref} className="flex w-full justify-center">
      <div data-card className={`w-full max-w-[380px] rounded-[24px] p-7 ${glass}`}>
        <p className="text-[13px] text-ink-3">{tr(s.label, l)}</p>
        <p data-val className="t-fig mt-2 text-[64px] font-medium leading-none tracking-[-0.045em] text-ink">
          {s.value}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {s.bars.map((b, i) => (
            <span key={i} className="relative block h-1.5 rounded-full bg-white/[0.07]">
              <span data-bar className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${b * 100}%`, background: SKY }} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chat({ s, l, active }: { s: Extract<Scene, { kind: "chat" }>; l: Locale; active: boolean }) {
  const ref = useScene(active, (q) =>
    gsap
      .timeline()
      .from(q("[data-card]"), { y: 20, autoAlpha: 0, duration: 0.6, ease: "power3.out" })
      .from(q("[data-in]"), { y: 12, autoAlpha: 0, duration: 0.5 }, 0.3)
      .fromTo(q("[data-typing]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 0.9)
      .to(q("[data-dot]"), { y: -3, duration: 0.25, stagger: { each: 0.1, repeat: 3, yoyo: true } }, 0.9)
      .to(q("[data-typing]"), { autoAlpha: 0, duration: 0.2 }, 2)
      .from(q("[data-out]"), { y: 12, autoAlpha: 0, duration: 0.5, ease: "power3.out" }, 2.1),
  );
  return (
    <div ref={ref} className="flex w-full justify-center">
      <div data-card className={`flex w-full max-w-[400px] flex-col gap-3 rounded-[24px] p-6 ${glass}`}>
        <p data-in className="max-w-[85%] self-start rounded-[16px] rounded-bl-[4px] bg-white/[0.07] px-4 py-2.5 text-[14px] text-ink">
          {tr(s.q, l)}
        </p>
        <div className="relative min-h-[44px] self-end">
          <span data-typing className="absolute right-0 top-0 flex h-9 items-center gap-1 rounded-full bg-white/[0.07] px-3 opacity-0">
            {[0, 1, 2].map((i) => (
              <span key={i} data-dot className="h-1.5 w-1.5 rounded-full bg-white/60" />
            ))}
          </span>
          <p data-out className="flex items-center gap-2 rounded-[16px] rounded-br-[4px] px-4 py-2.5 text-[14px] text-black" style={{ background: SKY }}>
            <Check size={15} strokeWidth={2.6} />
            {tr(s.a, l)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SceneView({ s, l, active, labels }: { s: Scene; l: Locale; active: boolean; labels: [string, string] }) {
  switch (s.kind) {
    case "flow":
      return <Flow s={s} l={l} active={active} />;
    case "check":
      return <CheckList s={s} l={l} active={active} />;
    case "orbit":
      return <Orbit s={s} l={l} active={active} />;
    case "compare":
      return <Compare s={s} l={l} active={active} labels={labels} />;
    case "screen":
      return <Screen s={s} l={l} active={active} />;
    case "meter":
      return <Meter s={s} l={l} active={active} />;
    case "chat":
      return <Chat s={s} l={l} active={active} />;
  }
}

/**
 * Cosa include il servizio, raccontato scorrendo: su desktop la sezione si ferma, a sinistra le voci,
 * a destra la scena della voce attiva che si anima. Su telefono ogni voce ha la sua scena sotto il testo.
 */
export function ServiceStory({
  title,
  items,
  scenes,
  locale,
  labels,
}: {
  title: string;
  items: { title: string; body: string }[];
  scenes: Scene[];
  locale: Locale;
  labels: [string, string];
}) {
  const root = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);
  const [desk, setDesk] = useState(true);
  const [seen, setSeen] = useState<boolean[]>(() => items.map(() => false));
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
    const on = () => setDesk(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useGSAP(
    () => {
      if (!desk) {
        // telefono: ogni scena parte quando entra in vista
        gsap.utils.toArray<HTMLElement>("[data-mstep]").forEach((el, i) =>
          ScrollTrigger.create({ trigger: el, start: "top 75%", once: true, onEnter: () => setSeen((s) => s.map((v, k) => v || k === i)) }),
        );
        return;
      }
      const n = items.length;
      ScrollTrigger.create({
        trigger: root.current!.querySelector("[data-pin]"),
        pin: true,
        start: "top top",
        end: () => `+=${window.innerHeight * n * 0.8}`,
        onUpdate: (self) => setAt(Math.min(n - 1, Math.floor(self.progress * n))),
      });
      gsap.fromTo("[data-prog]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current!.querySelector("[data-pin]"), start: "top top", end: () => `+=${window.innerHeight * n * 0.8}`, scrub: true } });
    },
    { scope: root, dependencies: [desk], revertOnUpdate: true },
  );

  // cambio di scena: quella vecchia sfuma, la nuova entra
  useEffect(() => {
    if (!desk || !root.current) return;
    const scenesEl = root.current.querySelectorAll<HTMLElement>("[data-scene]");
    scenesEl.forEach((el, i) => gsap.to(el, { autoAlpha: i === at ? 1 : 0, scale: i === at ? 1 : 0.97, duration: 0.5, ease: "power2.out" }));
  }, [at, desk]);

  return (
    <section ref={root} className="relative">
      {desk ? (
        <div data-pin className="relative flex h-[100svh] items-center">
          <div className="mx-auto grid w-full max-w-[1280px] grid-cols-12 items-center gap-10 px-8">
            <div className="col-span-5">
              <p className="t-label text-ink-3">{title}</p>
              <ol className="relative mt-8 pl-6">
                <span aria-hidden className="absolute bottom-1 left-0 top-1 w-px bg-white/10">
                  <span data-prog className="block h-full w-full origin-top" style={{ background: SKY }} />
                </span>
                {items.map((it, i) => (
                  <li key={i} className={`py-4 transition-opacity duration-500 ${i === at ? "opacity-100" : "opacity-35"}`}>
                    <p className="flex items-baseline gap-3">
                      <span className="t-fig font-mono text-[12px]" style={{ color: SKY }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[clamp(22px,2vw,30px)] font-medium tracking-[-0.03em] text-ink">{it.title}</span>
                    </p>
                    <p className={`ml-8 max-w-[42ch] overflow-hidden text-[16px] leading-[1.55] text-ink-2 transition-[max-height,opacity,margin] duration-500 ${i === at ? "mt-2 max-h-40 opacity-100" : "mt-0 max-h-0 opacity-0"}`}>
                      {it.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative col-span-7 h-[460px]">
              <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sky)] opacity-[0.06] blur-[90px]" />
              {scenes.map((s, i) => (
                <div key={i} data-scene className="absolute inset-0 flex items-center justify-center" style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}>
                  <SceneView s={s} l={locale} active={inView && i === at} labels={labels} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
          <p className="t-label text-ink-3">{title}</p>
          <ol className="mt-6 flex flex-col gap-16">
            {items.map((it, i) => (
              <li key={i} data-mstep>
                <p className="flex items-baseline gap-3">
                  <span className="t-fig font-mono text-[12px]" style={{ color: SKY }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[24px] font-medium tracking-[-0.03em] text-ink">{it.title}</span>
                </p>
                <p className="mt-2 text-[16px] leading-[1.55] text-ink-2">{it.body}</p>
                <div className="mt-6 flex min-h-[260px] items-center justify-center overflow-hidden">
                  <div className="origin-center scale-[0.82] sm:scale-100">
                    <SceneView s={scenes[i]} l={locale} active={seen[i]} labels={labels} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
