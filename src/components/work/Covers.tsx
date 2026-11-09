"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Monitor, Smartphone, ArrowLeftRight } from "lucide-react";
import { Stage } from "./Stage";

/**
 * Copertine dei progetti: schermate e materiali veri, composti come una foto di prodotto.
 * Ogni copertina ha livelli con una profondità (data-depth) che la scheda usa per la parallasse.
 * `active` = la copertina è in primo piano (passaggio del mouse o pagina del progetto): parte il video, si accende lo sfondo vivo.
 */
export type CoverProps = { active?: boolean; live?: boolean; hero?: boolean };

/** In apertura di pagina la composizione si sposta in alto a destra per lasciare spazio al titolo. */
function Shift({ on, x, y, s, children }: { on?: boolean; x: number; y: number; s: number; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{ transform: on ? `translate(${x}px, ${y}px) scale(${s})` : "none", transformOrigin: "100% 0%", transition: "transform 1.1s cubic-bezier(.7,0,.2,1)" }}
    >
      {children}
    </div>
  );
}
const fade = (on?: boolean): CSSProperties => ({ opacity: on ? 0 : 1, transition: "opacity .6s ease" });

/** Finestra del browser: cornice sobria, senza imitare un sistema operativo preciso. */
function Browser({ url, children, style, className = "", dark = true }: { url: string; children: ReactNode; style?: CSSProperties; className?: string; dark?: boolean }) {
  return (
    <div
      className={`absolute overflow-hidden rounded-[18px] ${className}`}
      style={{
        background: dark ? "#16171a" : "#ffffff",
        boxShadow: dark
          ? "0 60px 120px -30px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.08), inset 0 1px 0 rgba(255,255,255,.06)"
          : "0 60px 120px -40px rgba(60,50,40,.35), 0 0 0 1px rgba(41,37,36,.08)",
        ...style,
      }}
    >
      <div className="flex h-[42px] items-center gap-[8px] px-[16px]" style={{ background: dark ? "#1d1e22" : "#f6f4f0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.06)" : "rgba(41,37,36,.07)"}` }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[11px] w-[11px] rounded-full" style={{ background: dark ? "rgba(255,255,255,.14)" : "rgba(41,37,36,.14)" }} />
        ))}
        <span
          className="mx-auto flex h-[24px] items-center rounded-full px-[14px] text-[13px]"
          style={{ background: dark ? "rgba(255,255,255,.06)" : "rgba(41,37,36,.05)", color: dark ? "rgba(255,255,255,.5)" : "rgba(41,37,36,.5)" }}
        >
          {url}
        </span>
        <span className="w-[49px]" />
      </div>
      <div className="relative h-[calc(100%-42px)]">{children}</div>
    </div>
  );
}

/** Ritaglio ingrandito di una schermata vera. */
function Crop({ src, iw, x, y, w, h, k, style }: { src: string; iw: number; x: number; y: number; w: number; h: number; k: number; style?: CSSProperties }) {
  return (
    <div
      className="absolute rounded-[16px] bg-white"
      style={{
        width: w * k,
        height: h * k,
        backgroundImage: `url(${src})`,
        backgroundSize: `${iw * k}px auto`,
        backgroundPosition: `${-x * k}px ${-y * k}px`,
        boxShadow: "0 40px 80px -24px rgba(60,50,40,.35), 0 0 0 1px rgba(41,37,36,.08)",
        ...style,
      }}
    />
  );
}

/* ─────────────────────────────── CreaCloud ─────────────────────────────── */

export function CreaCloudCover({ active, hero }: CoverProps) {
  const S = "/work/creacloud/richiesta.webp";
  return (
    <div className="absolute inset-0 bg-[#F4F1EC]">
      <div aria-hidden className="absolute -right-[10%] -top-[30%] h-[90%] w-[60%] rounded-full bg-[#8C9BBE] opacity-40 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-[35%] -left-[10%] h-[80%] w-[55%] rounded-full bg-[#D98A6C] opacity-30 blur-[120px]" />
      <Stage>
        <Shift on={hero} x={140} y={-10} s={0.76}>
        <div data-depth="0.4" className="absolute inset-0">
          <Browser url="creacloud" dark={false} style={{ left: 150, top: 80, width: 640, height: 900, transform: "rotate(-2deg)" }}>
            <img src={S} alt="" className="absolute inset-x-0 top-0 w-full" draggable={false} />
          </Browser>
        </div>
        <div data-depth="1" className="absolute inset-0">
          <Crop src={S} iw={1100} x={232} y={398} w={636} h={92} k={1.15} style={{ left: 760, top: 300, transform: `rotate(1.5deg) translateY(${active ? -8 : 0}px)`, transition: "transform .8s cubic-bezier(.2,.8,.2,1)" }} />
          <Crop src={S} iw={1100} x={232} y={1066} w={636} h={130} k={1.15} style={{ left: 800, top: 560, transform: `rotate(-1deg) translateY(${active ? 8 : 0}px)`, transition: "transform .8s cubic-bezier(.2,.8,.2,1)" }} />
        </div>
        <div data-depth="1.4" className="absolute" style={{ left: 820, top: 150, ...fade(hero) }}>
          <span className="t-serif block text-[96px] leading-none tracking-[-0.02em] text-[#3F4A7D]">CreaCloud</span>
        </div>
        </Shift>
      </Stage>
    </div>
  );
}

/* ─────────────────────────────── Relay ─────────────────────────────── */

export function RelayCover({ live, hero }: CoverProps) {
  return (
    <div className="absolute inset-0 bg-[#05070F]">
      <img src="/work/relay/fibers.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      {live && (
        <iframe
          title=""
          aria-hidden
          tabIndex={-1}
          src="/visual/gradient.html?shape=hero&bg=05070f&touch=0&intro=0"
          className="pointer-events-none absolute inset-0 h-full w-full border-0 opacity-0 transition-opacity duration-1000"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
      )}
      <Stage>
        <div data-depth="1.2" className="absolute" style={{ left: 250, top: 290, width: 360, height: 360, transform: hero ? "translate(840px, -60px) scale(.95)" : "none", transition: "transform 1.1s cubic-bezier(.7,0,.2,1)" }}>
          <div aria-hidden className="absolute inset-[-30%] rounded-full bg-[#2F5FFF] opacity-50 blur-[90px]" />
          <img src="/work/relay/icon.webp" alt="" className="relative h-full w-full drop-shadow-[0_40px_60px_rgba(0,0,0,.6)]" draggable={false} />
        </div>
        <div data-depth="0.6" className="absolute" style={{ left: 680, top: 330, ...fade(hero) }}>
          <span className="block text-[210px] font-medium leading-[0.9] tracking-[-0.06em] text-[#F2F2F0]">Relay</span>
          <div className="mt-[44px] flex items-center gap-[18px] text-[26px] text-[#F2F2F0]">
            <span className="drop flex h-[64px] items-center gap-[12px] px-[26px]" style={{ ["--drop-tint" as string]: "rgba(20,26,48,.55)" }}>
              <Monitor size={26} strokeWidth={1.6} /> Windows
            </span>
            <ArrowLeftRight size={30} strokeWidth={1.6} className="text-[#5C9DFF]" />
            <span className="drop flex h-[64px] items-center gap-[12px] px-[26px]" style={{ ["--drop-tint" as string]: "rgba(20,26,48,.55)" }}>
              <Smartphone size={26} strokeWidth={1.6} /> Android
            </span>
          </div>
        </div>
      </Stage>
    </div>
  );
}

/* ─────────────────────────────── uniSpace ─────────────────────────────── */

export function UniSpaceCover({ active, hero }: CoverProps) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);
  return (
    <div className="absolute inset-0 bg-[#0C0D0F]">
      <img src="/work/unispace/band.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-80 blur-[60px]" draggable={false} />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(118deg,transparent_38%,rgba(246,240,230,.10)_50%,transparent_62%)]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_100%,rgba(12,13,15,.85),transparent)]" />
      <Stage>
        <Shift on={hero} x={40} y={-30} s={0.86}>
        <div data-depth="0.5" className="absolute inset-0" style={{ perspective: 2200 }}>
          <Browser url="studykit / studycut" style={{ left: 330, top: 120, width: 1180, height: 780, transform: "rotateY(-12deg) rotateX(5deg) rotateZ(-1deg)", transformOrigin: "left center" }}>
            <img src="/work/unispace/studycut.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-left-top" draggable={false} />
            <video
              ref={video}
              src="/work/unispace/studycut.mp4"
              muted
              playsInline
              loop
              preload="none"
              poster="/work/unispace/studycut-poster.webp"
              className="absolute inset-0 h-full w-full object-cover object-left-top transition-opacity duration-500"
              style={{ opacity: active ? 1 : 0 }}
            />
          </Browser>
        </div>
        <div data-depth="1.3" className="absolute" style={{ left: 70, top: 560, width: 360, height: 360, transform: hero ? "translate(1120px, -20px) scale(.8)" : "none", transition: "transform 1.1s cubic-bezier(.7,0,.2,1)" }}>
          <img src="/work/unispace/mascot-ciao.webp" alt="" className="h-full w-full drop-shadow-[0_40px_50px_rgba(0,0,0,.55)]" draggable={false} />
        </div>
        <div data-depth="1.6" className="absolute" style={{ left: 1060, top: 820 }}>
          <span className="drop flex h-[62px] items-center gap-[14px] px-[26px] text-[24px] text-[#F3EEE6]" style={{ ["--drop-tint" as string]: "rgba(12,13,15,.55)" }}>
            <span className="h-[12px] w-[12px] rounded-full bg-[#3F9C97]" />
            Salta silenzi
            <span className="font-mono text-[20px] text-[#A9A49B]">4:03 → 3:21</span>
          </span>
        </div>
        </Shift>
      </Stage>
    </div>
  );
}

export function Cover({ slug, ...p }: CoverProps & { slug: string }) {
  if (slug === "creacloud") return <CreaCloudCover {...p} />;
  if (slug === "relay") return <RelayCover {...p} />;
  return <UniSpaceCover {...p} />;
}
