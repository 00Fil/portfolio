"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, KeyRound, User } from "lucide-react";
import { gsap } from "gsap";
import { onIntroLift } from "@/lib/intro";
import localFont from "next/font/local";
import { unlockCard } from "@/app/[locale]/card/actions";
import s from "./card.module.css";

const nunito = localFont({ src: "../../fonts/nunito-700.woff2", variable: "--nunito", display: "swap", weight: "700" });

type Txt = { code: string; open: string; flip: string; site: string; copied: string; errors: { wrong: string; limit: string; off: string } };

/** Tratti del "Ciao!" nell'ordine in cui si scrive a mano: il cursore segue la linea centrale delle lettere (viewBox 1320x450). */
const PEN = [
  { d: "M307 128 L303 120 L298 112 L294 104 L289 96 L284 89 L278 83 L271 77 L264 71 L256 67 L247 64 L239 61 L230 60 L221 58 L212 58 L203 57 L194 58 L185 59 L176 61 L167 63 L159 66 L150 69 L142 74 L135 79 L128 84 L121 90 L115 97 L109 103 L103 110 L98 118 L93 126 L89 134 L85 142 L82 150 L79 159 L76 167 L73 176 L71 185 L70 194 L68 202 L67 211 L66 220 L65 229 L65 238 L65 248 L65 257 L66 266 L67 275 L69 283 L70 292 L73 301 L76 310 L79 318 L83 326 L87 334 L92 341 L98 349 L104 355 L110 362 L117 367 L125 372 L133 377 L141 381 L149 384 L158 387 L166 390 L175 392 L184 393 L193 394 L202 395 L211 396 L220 396 L229 395 L238 394 L247 393 L256 392 L265 390 L274 388 L282 385 L291 382 L299 379 L307 375 L315 371 L323 366 L331 361 L338 356 L345 350 L353 345 L361 341 L369 338 L378 335 L385 330 L391 323 L393 314 L395 306 L397 297 L399 288 L401 279 L402 270 L404 261 L406 252 L407 244 L409 235 L411 226 L413 217 L413 208", n: 949 },
  { d: "M390 328 L395 336 L398 344 L400 353 L402 362 L405 370 L410 378 L417 384 L425 388 L434 390 L443 392 L452 392 L461 392 L470 390 L479 388 L487 385 L495 381 L503 377 L510 371 L517 366 L525 360 L532 355 L540 351 L549 348 L557 344 L562 337 L564 328 L566 319 L568 310 L569 301 L571 292 L572 283 L575 275 L578 266 L581 258 L585 250 L590 242 L596 235 L602 229 L609 223 L617 218 L625 214 L633 212 L642 210 L651 209 L660 209 L669 210 L678 211 L687 212 L696 213 L705 214 L714 216 L720 222 L719 231 L719 240 L718 249 L717 258 L717 267 L716 276 L714 285 L713 294 L712 303 L711 312 L710 321 L709 330 L709 339 L708 348 L707 357 L708 366 L713 373 L720 379 L727 385 L736 388 L744 391 L753 393 L762 393 L771 393 L780 391 L789 389 L797 386 L805 382 L813 377 L820 371 L826 365 L833 358 L840 352 L848 348 L856 344 L863 339 L867 331 L869 322 L870 313 L872 305 L873 296 L875 287 L878 278 L881 270 L884 261 L888 253 L893 246 L899 238 L905 232 L911 226 L919 220 L927 216 L935 213 L944 211 L953 210 L962 209 L971 210 L980 211 L989 213 L998 215 L1006 219 L1014 223 L1022 227 L1030 231 L1039 232 L1048 232 L1057 231 L1066 230 L1075 229 L1084 227 L1092 225 L1101 221 L1108 216 L1115 210 L1122 204", n: 1148 },
  { d: "M562 343 L568 350 L573 357 L577 365 L582 373 L588 380 L595 386 L603 389 L612 392 L621 393 L630 394 L639 393 L648 392 L657 389 L665 386 L673 381 L681 377 L689 373 L697 370 L706 367", n: 172 },
  { d: "M1033 233 L1034 242 L1035 251 L1035 260 L1035 269 L1035 278 L1034 287 L1034 296 L1033 305 L1031 314 L1029 323 L1027 332 L1023 340 L1020 348 L1015 356 L1010 363 L1003 370 L997 376 L989 381 L981 385 L973 388 L964 390 L955 392 L946 392 L937 392 L928 391 L919 389 L911 386 L903 381 L895 376 L889 369 L884 362 L879 354 L873 347 L867 341", n: 307 },
  { d: "M1247 58 L1246 67 L1244 76 L1243 85 L1241 94 L1240 103 L1239 112 L1238 121 L1236 130 L1235 139 L1234 147 L1233 156 L1231 165 L1230 174 L1229 183 L1227 192 L1226 201 L1225 210 L1224 219 L1222 228 L1221 237 L1220 246 L1219 255", n: 199 },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Card girevole in 3D: trascina per ruotarla, riflessi che seguono il puntatore, si ferma sempre su un lato. */
export function CardViewer({ t, slug, logo, name }: { t: Txt; slug?: string; logo?: string; name?: string }) {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [creds, setCreds] = useState<{ user: string; pass: string; url: string } | null>(null);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [pending, setPending] = useState(false);
  const [tip, setTip] = useState<"user" | "pass" | null>(null);

  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);

  /**
   * Ingresso: una stanza bianca (lo schermo e' la parete di fondo, poi due pareti, pavimento e soffitto).
   * La card parte distesa sul pavimento, si alza e fluttua, poi la camera avanza fino alla situazione di sempre;
   * a quel punto il "Ciao!" si scrive a mano e compare il campo del codice.
   */
  useEffect(() => {
    const st = stage.current;
    const wd = world.current;
    const fl = float.current;
    if (!st || !wd || !fl) return;
    const pens = Array.from(st.querySelectorAll<SVGPathElement>(".pen"));
    const spark = st.querySelector<SVGElement>(".spark");
    const dot = st.querySelector<SVGElement>(".dot");
    const planes = Array.from(st.querySelectorAll<HTMLElement>("[data-plane]"));
    const drop = st.querySelector<HTMLElement>("[data-drop]");
    const done = () => {
      st.dataset.intro = "done";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pens.forEach((p) => p.setAttribute("stroke-dashoffset", "0"));
      spark?.setAttribute("transform", "");
      dot?.setAttribute("transform", "");
      return done();
    }
    // misure della stanza sul vero schermo, prima che appaia qualcosa
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rh = Math.round(vh * 0.55);
    st.style.setProperty("--rw", `${Math.round(vw * 1.4)}px`);
    st.style.setProperty("--rh", `${rh}px`);
    const portrait = vw < vh;
    gsap.set(fl, { y: rh - 3, rotationX: 90, rotationZ: -7, transformOrigin: "50% 50%" });
    gsap.set(wd, { z: portrait ? -1500 : -1100, y: -vh * 0.06, rotationX: portrait ? -24 : -20, transformOrigin: "50% 50%" });
    if (drop) gsap.set(drop, { opacity: 0.85, scale: 1 });
    st.dataset.intro = "run";

    const SPEED = 560;
    const at = (i: number) => PEN[i].n / SPEED;
    const grow = (tl: gsap.core.Timeline, el: SVGElement | null, cx: number, cy: number, t: number | string) => {
      if (!el) return;
      const o = { k: 0 };
      tl.to(o, { k: 1, duration: 0.32, ease: "back.out(2)", onUpdate: () => el.setAttribute("transform", `translate(${cx} ${cy}) scale(${o.k}) translate(${-cx} ${-cy})`) }, t);
    };
    const build = () => {
      const tl = gsap.timeline({ delay: 0.2, onComplete: done });
      intro.current = tl;
      // 1. la card si stacca dal pavimento e sale
      tl.to(fl, { y: 0, rotationX: 0, duration: 1.7, ease: "power3.out" }, 0);
      tl.to(fl, { rotationZ: 0, duration: 1.9, ease: "sine.out" }, 0);
      if (drop) tl.to(drop, { opacity: 0.32, scale: 0.72, duration: 1.7, ease: "power3.out" }, 0);
      // 2. fluttua
      tl.to(fl, { y: -16, rotationY: 7, duration: 0.8, ease: "sine.inOut" }, 1.55);
      tl.to(fl, { y: 0, rotationY: 0, duration: 0.7, ease: "sine.inOut" }, 2.35);
      // 3. la camera avanza fino alla vista di sempre
      tl.to(wd, { z: 0, y: 0, rotationX: 0, duration: 1.9, ease: "power3.inOut" }, 1.9);
      tl.to(planes, { opacity: 0, duration: 0.6, ease: "power1.in" }, 3.2);
      if (drop) tl.to(drop, { opacity: 0, duration: 0.5 }, 3.2);
      tl.add(() => done(), 3.8);
      // 4. il Ciao! si scrive a mano
      const w0 = 3.55;
      tl.to(pens[0], { strokeDashoffset: 0, duration: at(0), ease: "sine.inOut" }, w0);
      tl.to(pens[1], { strokeDashoffset: 0, duration: at(1) * 0.9, ease: "none" }, ">-0.05");
      tl.to(pens[2], { strokeDashoffset: 0, duration: at(2), ease: "sine.inOut" }, ">-0.12");
      tl.to(pens[3], { strokeDashoffset: 0, duration: at(3), ease: "sine.inOut" }, ">-0.05");
      tl.to(pens[4], { strokeDashoffset: 0, duration: at(4), ease: "sine.inOut" }, ">+0.12");
      grow(tl, dot, 1201, 384, ">-0.05");
      grow(tl, spark, 432, 97, ">+0.05");
      return tl;
    };
    // parte appena si alza il telo d'apertura del sito
    let tl: gsap.core.Timeline | null = null;
    const off = onIntroLift(() => {
      tl = build();
    });
    return () => {
      off();
      tl?.kill();
      intro.current = null;
    };
  }, [slug]);

  const st = useRef({ ry: -24, rx: 8, vy: 0, vx: 0, snap: 0, px: 0, py: 0, drag: false, moved: 0, hit: "" as "" | "user" | "pass", lastX: 0, lastY: 0, lastT: 0, raf: 0, reduce: false });

  const paint = useCallback(() => {
    const el = card.current;
    if (!el) return;
    const a = st.current;
    el.style.setProperty("--rx", `${a.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${a.ry.toFixed(2)}deg`);
    const ang = ((a.ry % 360) + 360) % 360;
    const front = ang < 90 || ang > 270;
    const rel = front ? (ang > 270 ? ang - 360 : ang) : ang - 180; // -90..90 per faccia
    const gx = 50 + (front ? 1 : -1) * a.px * 38 - rel * 0.25;
    const gy = 42 + a.py * 34 + a.rx * 0.6;
    el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
    el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
    el.style.setProperty("--sh", `${(50 - (rel + a.px * 14) * 2.6).toFixed(1)}%`);
    el.style.setProperty("--so2", `${(0.35 + 0.65 * Math.abs(Math.sin(((rel + a.px * 14 + 20) * Math.PI) / 90))).toFixed(2)}`);
    el.style.setProperty("--ss", `${(1 - Math.min(0.45, Math.abs(Math.sin((a.ry * Math.PI) / 180)) * 0.45)).toFixed(2)}`);
    el.style.setProperty("--lx", `${(((50 - gx) / 50) * 1.5).toFixed(2)}`);
    el.style.setProperty("--ly", `${(((42 - gy) / 42) * 0.9).toFixed(2)}`);
    el.style.setProperty("--so", `${(0.75 - Math.abs(Math.sin((a.ry * Math.PI) / 180)) * 0.3).toFixed(2)}`);
  }, []);

  const loop = useCallback(() => {
    const a = st.current;
    const dt = 1 / 60;
    if (!a.drag) {
      const ty = a.snap + (a.reduce ? 0 : a.px * 8);
      const tx = a.reduce ? 0 : -a.py * 7;
      const k = 26, c = 9.5;
      a.vy += ((ty - a.ry) * k - a.vy * c) * dt;
      a.vx += ((tx - a.rx) * k - a.vx * c) * dt;
      a.ry += a.vy * dt;
      a.rx += a.vx * dt;
    }
    paint();
    const settled = !a.drag && Math.abs(a.vy) < 0.05 && Math.abs(a.vx) < 0.05 && Math.abs(a.snap + a.px * 8 - a.ry) < 0.05 && Math.abs(-a.py * 7 - a.rx) < 0.05;
    a.raf = settled ? 0 : requestAnimationFrame(loop);
  }, [paint]);

  const kick = useCallback(() => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    st.current.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    kick();
    return () => { cancelAnimationFrame(st.current.raf); st.current.raf = 0; };
  }, [kick]);

  const rel = (e: React.PointerEvent) => {
    const r = scene.current!.getBoundingClientRect();
    st.current.px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    st.current.py = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };

  const down = (e: React.PointerEvent) => {
    const a = st.current;
    a.drag = true; a.moved = 0; a.hit = ((e.target as HTMLElement).closest("[data-copy]")?.getAttribute("data-copy") as "user" | "pass" | null) ?? ""; a.vy = 0; a.vx = 0;
    a.lastX = e.clientX; a.lastY = e.clientY; a.lastT = performance.now();
    scene.current!.setPointerCapture(e.pointerId);
    rel(e); kick();
  };
  const move = (e: React.PointerEvent) => {
    const a = st.current;
    rel(e);
    if (a.drag) {
      const dx = e.clientX - a.lastX, dy = e.clientY - a.lastY;
      const now = performance.now(), dtm = Math.max(1, now - a.lastT);
      a.moved += Math.abs(dx) + Math.abs(dy);
      a.ry += dx * 0.42;
      a.rx = clamp(a.rx - dy * 0.25, -38, 38);
      a.vy = (dx * 0.42) / (dtm / 1000);
      a.vx = (-dy * 0.25) / (dtm / 1000);
      a.lastX = e.clientX; a.lastY = e.clientY; a.lastT = now;
    }
    kick();
  };
  const copy = (k: "user" | "pass") => {
    if (!creds) return;
    navigator.clipboard?.writeText(creds[k]).then(() => { setTip(k); setTimeout(() => setTip(null), 1100); }).catch(() => {});
  };

  const up = (e: React.PointerEvent) => {
    const a = st.current;
    if (!a.drag) return;
    a.drag = false;
    scene.current?.releasePointerCapture(e.pointerId);
    if (a.moved < 6) {
      if (a.hit && creds) copy(a.hit);
      else a.snap = Math.round(a.ry / 180) * 180 + 180; // un tocco gira la card
    }
    else a.snap = Math.round((a.ry + clamp(a.vy, -700, 700) * 0.18) / 180) * 180;
    kick();
  };
  const leave = () => { const a = st.current; if (!a.drag) { a.px = 0; a.py = 0; kick(); } };

  const flip = () => { st.current.snap = Math.round(st.current.ry / 180) * 180 + 180; kick(); };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("code") ?? "");
    if (!v.trim()) return;
    setPending(true); setErr("");
    const r = await unlockCard(v, slug);
    setPending(false);
    if (r.ok) {
      setCreds({ user: r.user, pass: r.pass, url: r.url });
      const a = st.current;
      a.snap = Math.round(a.ry / 180) * 180 + (((Math.round(a.ry / 180) % 2) + 2) % 2 === 0 ? 180 : 0); // mostra il retro
      kick();
    } else {
      setErr(t.errors[r.error]);
      setShake(true); setTimeout(() => setShake(false), 450);
    }
  };

  return (
    <div
      ref={stage}
      data-intro="pre"
      className={`${s.stage} ${nunito.variable}`}
      onPointerDownCapture={(e) => {
        // un tocco durante l'ingresso lo porta subito alla fine
        if (stage.current?.dataset.intro === "run" && intro.current) {
          e.stopPropagation();
          intro.current.progress(1);
        }
      }}
    >
      <div ref={world} className={s.world}>
        <div className={s.room} aria-hidden>
          <i data-plane className={s.roomBack} />
          <i data-plane className={s.wallL} />
          <i data-plane className={s.wallR} />
          <i data-plane className={s.floor} />
          <i data-plane className={s.ceil} />
          <i data-drop className={s.drop} />
        </div>
        <div ref={float} className={s.float}>
      <div
        ref={scene}
        className={s.scene}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={leave}
        role="button"
        tabIndex={0}
        aria-label={t.flip}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); flip(); } }}
      >
        <div ref={card} className={s.card}>
          <div className={`${s.face} ${s.front} ${slug ? s.frontCustom : ""}`}>
            {slug && (
              <>
                <div className={s.ciao}>
                  <svg viewBox="0 0 1320 450" className={s.ciaoShadow} aria-hidden>
                    <defs>
                      <filter id="ciao-shadow" x="-6%" y="-14%" width="112%" height="140%" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="sb" />
                        <feFlood floodColor="#000" floodOpacity=".62" />
                        <feComposite in2="sb" operator="in" />
                      </filter>
                    </defs>
                    <g mask="url(#ciao-write)">
                      <image href="/card/ciao.png" width="1320" height="450" filter="url(#ciao-shadow)" />
                    </g>
                  </svg>
                  <svg viewBox="0 0 1320 450" className={s.glassEdge} aria-hidden>
                    <defs>
                      {/* la scrittura: i tratti bianchi si disegnano e scoprono il vetro sotto */}
                      <mask id="ciao-write" maskUnits="userSpaceOnUse" x="-60" y="-60" width="1440" height="570">
                        {PEN.map((t, i) => (
                          <path key={i} className="pen" d={t.d} pathLength={1} fill="none" stroke="#fff" strokeWidth="100" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 1" strokeDashoffset="1" />
                        ))}
                        <circle className="spark" cx="432" cy="97" r="80" fill="#fff" transform="translate(432 97) scale(0) translate(-432 -97)" />
                        <circle className="dot" cx="1201" cy="384" r="58" fill="#fff" transform="translate(1201 384) scale(0) translate(-1201 -384)" />
                      </mask>
                      {/* goccia d'acqua su un tavolo: cupola dalla mappa dell'alpha, rifrazione dello sfondo, luce che scivola, caustica in basso a destra */}
                      <filter id="ciao-glass" x="-5%" y="-12%" width="110%" height="132%" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="h" />
                        <feColorMatrix in="h" type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1" result="hc" />
                        <feOffset in="hc" dx="3" result="xp" />
                        <feOffset in="hc" dx="-3" result="xm" />
                        <feOffset in="hc" dy="3" result="yp" />
                        <feOffset in="hc" dy="-3" result="ym" />
                        <feComposite in="xp" in2="xm" operator="arithmetic" k1="0" k2="2.4" k3="-2.4" k4=".5" result="gx" />
                        <feComposite in="yp" in2="ym" operator="arithmetic" k1="0" k2="2.4" k3="-2.4" k4=".5" result="gy" />
                        <feColorMatrix in="gx" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="mx" />
                        <feColorMatrix in="gy" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1" result="my" />
                        <feComposite in="mx" in2="my" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="map" />
                        <feImage href="/card/back-dark.webp" x="-394" y="-411" width="2020" height="1274" preserveAspectRatio="none" result="bg" />
                        <feDisplacementMap in="bg" in2="map" scale="120" xChannelSelector="R" yChannelSelector="G" result="refr" />
                        <feDiffuseLighting in="h" surfaceScale="14" diffuseConstant="1.25" lightingColor="#ffffff" result="dif">
                          <feDistantLight azimuth="225" elevation="50" />
                        </feDiffuseLighting>
                        <feBlend in="refr" in2="dif" mode="multiply" result="shaded" />
                        <feComposite in="shaded" in2="SourceAlpha" operator="in" result="lens" />
                        <feFlood floodColor="#cfeaff" floodOpacity=".2" />
                        <feComposite in2="SourceAlpha" operator="in" result="veil" />
                        {/* caustica: la luce si concentra nel bordo opposto alla sorgente */}
                        <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="ib" />
                        <feOffset in="ib" dx="-9" dy="-12" result="io" />
                        <feComposite in="SourceAlpha" in2="io" operator="out" result="band" />
                        <feFlood floodColor="#a9defe" floodOpacity=".9" />
                        <feComposite in2="band" operator="in" result="caustic" />
                        {/* riflessi della sorgente */}
                        <feSpecularLighting in="h" surfaceScale="16" specularConstant="1.6" specularExponent="34" lightingColor="#ffffff" result="sp1">
                          <feDistantLight azimuth="225" elevation="44" />
                        </feSpecularLighting>
                        <feComposite in="sp1" in2="SourceAlpha" operator="in" result="spec1" />
                        <feSpecularLighting in="h" surfaceScale="10" specularConstant="1" specularExponent="18" lightingColor="#7cc8ff" result="sp2">
                          <feDistantLight azimuth="40" elevation="36" />
                        </feSpecularLighting>
                        <feComposite in="sp2" in2="SourceAlpha" operator="in" result="spec2" />
                        {/* filo di luce sul contorno */}
                        <feMorphology in="SourceAlpha" operator="erode" radius="1.8" result="er" />
                        <feComposite in="SourceAlpha" in2="er" operator="out" result="ring" />
                        <feGaussianBlur in="ring" stdDeviation=".7" result="ringb" />
                        <feFlood floodColor="#ffffff" floodOpacity=".9" />
                        <feComposite in2="ringb" operator="in" result="rim" />
                        <feMerge>
                          <feMergeNode in="lens" />
                          <feMergeNode in="veil" />
                          <feMergeNode in="caustic" />
                          <feMergeNode in="spec2" />
                          <feMergeNode in="spec1" />
                          <feMergeNode in="rim" />
                        </feMerge>
                      </filter>
                    </defs>
                    <g mask="url(#ciao-write)">
                      <image href="/card/ciao.png" width="1320" height="450" filter="url(#ciao-glass)" />
                    </g>
                  </svg>
                </div>
                <div className={s.sign}>
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={name ?? ""} draggable={false} className={s.signLogo} />
                  ) : (
                    <span className={s.signName}>{name}</span>
                  )}
                  <i>×</i>
                  <span className={s.me}>Filippo Corsini</span>
                </div>
              </>
            )}
            <div className={s.sheen} />
            <div className={s.glare} />
          </div>
          <div className={`${s.face} ${s.back} ${slug ? s.backCustom : ""}`}>
            <div className={s.bar} data-copy="user" style={{ top: "18.93cqw", ["--fs" as string]: "4.67cqw" }}>
              <User aria-hidden strokeWidth={2} />
              <span className={creds ? "" : s.dots}>{creds ? creds.user : "••••••••"}</span>
              <i className={`${s.tip} ${tip === "user" ? s.tipOn : ""}`}>{t.copied}</i>
            </div>
            <div className={s.bar} data-copy="pass" style={{ top: "32.94cqw", ["--fs" as string]: "3.62cqw" }}>
              <KeyRound aria-hidden strokeWidth={2} />
              <span className={creds ? "" : s.dots}>{creds ? creds.pass : "••••••••••"}</span>
              <i className={`${s.tip} ${tip === "pass" ? s.tipOn : ""}`}>{t.copied}</i>
            </div>
            <div className={s.sheen} />
            <div className={s.glare} />
          </div>
          <i className={`${s.edge} ${s.eR}`} /><i className={`${s.edge} ${s.eL}`} /><i className={`${s.edge} ${s.eT}`} /><i className={`${s.edge} ${s.eB}`} />
        </div>
        <div className={s.shadow} />
      </div>
        </div>
      </div>

      {creds ? (
        <a className={`${s.form} ${s.site}`} href={creds.url} target="_blank" rel="noopener noreferrer">
          <span>{t.site}</span>
          <i><ArrowUpRight size={18} /></i>
        </a>
      ) : (
        <form onSubmit={submit} className={`${s.form} ${shake ? s.shake : ""}`} autoComplete="off">
          <input name="code" type="password" placeholder={t.code} aria-label={t.code} autoComplete="off" spellCheck={false} />
          <button type="submit" disabled={pending} aria-label={t.open}><ArrowRight size={18} /></button>
        </form>
      )}
      <p className={s.err} role="status">{err}</p>
    </div>
  );
}
