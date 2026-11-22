"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, KeyRound, User } from "lucide-react";
import { onIntroLift } from "@/lib/intro";
import localFont from "next/font/local";
import { unlockCard } from "@/app/[locale]/card/actions";
import { CiaoGlass, type CiaoGlassHandle } from "./CiaoGlass";
import s from "./card.module.css";

const nunito = localFont({ src: "../../fonts/nunito-700.woff2", variable: "--nunito", display: "swap", weight: "700" });

const SWATCHES = ["#182032", "#132a5e", "#1d4ed8", "#0d3b32", "#4a1525", "#232126"];

type Txt = { code: string; open: string; flip: string; site: string; copied: string; errors: { wrong: string; limit: string; off: string } };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Card girevole in 3D: trascina per ruotarla, riflessi coerenti con la luce dall'alto, si ferma sempre su un lato. */
export function CardViewer({ t, slug, logo, name }: { t: Txt; slug?: string; logo?: string; name?: string }) {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const ciao = useRef<CiaoGlassHandle>(null);
  const ciaoShadow = useRef<CiaoGlassHandle>(null);
  const [creds, setCreds] = useState<{ user: string; pass: string; url: string } | null>(null);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [pending, setPending] = useState(false);
  const [tip, setTip] = useState<"user" | "pass" | null>(null);
  const [cardColor, setCardColor] = useState("#182032");

  useEffect(() => {
    if (!slug) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      ciao.current?.settle();
      ciaoShadow.current?.settle();
      return;
    }
    return onIntroLift(() => {
      ciao.current?.play(180);
      ciaoShadow.current?.play(180);
    });
  }, [slug]);

  const st = useRef({ ry: -24, rx: 8, vy: 0, vx: 0, snap: 0, px: 0, py: 0, drag: false, moved: 0, hit: "" as "" | "user" | "pass", lastX: 0, lastY: 0, lastT: 0, raf: 0, reduce: false });

  const paint = useCallback(() => {
    const el = card.current;
    const sc = scene.current;
    if (!el || !sc) return;
    const a = st.current;
    el.style.setProperty("--rx", `${a.rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${a.ry.toFixed(2)}deg`);
    const ang = ((a.ry % 360) + 360) % 360;
    const front = ang < 90 || ang > 270;
    const rel = front ? (ang > 270 ? ang - 360 : ang) : ang - 180; // -90..90 per faccia
    const ryRad = (a.ry * Math.PI) / 180;
    const rxRad = (a.rx * Math.PI) / 180;
    const cosY = Math.abs(Math.cos(ryRad));
    const sinX = Math.abs(Math.sin(rxRad));

    // Luce coerente con il faretto centrale in alto: il riflesso scorre sull'asse verticale e segue l'inclinazione reale
    const gx = 50 - rel * 0.55;
    const gy = 16 + a.rx * 1.15;
    el.style.setProperty("--gx", `${gx.toFixed(1)}%`);
    el.style.setProperty("--gy", `${gy.toFixed(1)}%`);
    el.style.setProperty("--sh", `${(50 - rel * 2.2).toFixed(1)}%`);
    el.style.setProperty("--so2", `${(0.28 + 0.55 * Math.abs(Math.sin(((rel + 18) * Math.PI) / 90))).toFixed(2)}`);
    el.style.setProperty("--lx", `${(((50 - gx) / 50) * 1.2).toFixed(2)}`);
    el.style.setProperty("--ly", `${(((42 - gy) / 42) * 0.85).toFixed(2)}`);
    el.style.setProperty("--so", `${(0.35 + 0.55 * cosY).toFixed(2)}`);

    // Ombra sul pavimento coerente col faretto centrale dall'alto:
    // - larga come la proiezione orizzontale della card (si assottiglia quando vista di taglio a 90deg)
    // - profonda quando la card e' inclinata avanti/indietro (rx), sottile quando e' verticale
    const shW = 0.09 + 0.91 * cosY;
    const shH = 0.55 + 1.35 * sinX;
    const shY = Math.sin(rxRad) * 1.4;
    const shOp = (0.34 + 0.56 * cosY) * (0.85 + 0.15 * sinX);
    sc.style.setProperty("--sh-w", shW.toFixed(3));
    sc.style.setProperty("--sh-h", shH.toFixed(3));
    sc.style.setProperty("--sh-y", `${shY.toFixed(2)}cqw`);
    sc.style.setProperty("--sh-o", shOp.toFixed(2));

    // Sincronizza in tempo reale la rifrazione e i riflessi del vetro "Ciao!" con la rotazione 3D
    ciao.current?.setTilt(a.rx, a.ry);
    ciaoShadow.current?.setTilt(a.rx, a.ry);
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
    <div className={`${s.stage} ${nunito.variable}`}>
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
        <div ref={card} className={s.card} style={slug ? ({ ["--card-bg" as string]: cardColor } as React.CSSProperties) : undefined}>
          <div className={`${s.face} ${s.front} ${slug ? s.frontCustom : ""}`}>
            {slug && (
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
            )}
            <div className={s.sheen} />
            <div className={s.glare} />
          </div>
          {slug && (
            <>
              <div className={s.ciaoShadow}>
                <CiaoGlass ref={ciaoShadow} layer="shadow" bgColor={cardColor} />
              </div>
              <div className={s.ciao3d}>
                <CiaoGlass ref={ciao} layer="glass" bgColor={cardColor} />
              </div>
            </>
          )}
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
          <i className={`${s.edge} ${s.eR} ${slug ? s.edgeCustom : ""}`} />
          <i className={`${s.edge} ${s.eL} ${slug ? s.edgeCustom : ""}`} />
          <i className={`${s.edge} ${s.eT} ${slug ? s.edgeCustom : ""}`} />
          <i className={`${s.edge} ${s.eB} ${slug ? s.edgeCustom : ""}`} />
        </div>
        <div className={s.shadow} aria-hidden />
      </div>

      {slug && (
        <div className={s.picker}>
          <input
            type="color"
            value={cardColor}
            onChange={(e) => setCardColor(e.target.value)}
            className={s.pickerInput}
            aria-label="Colore card"
          />
          <span className={s.pickerHex}>{cardColor.toUpperCase()}</span>
          <div className={s.pickerSwatches}>
            {SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`${s.swatch} ${cardColor.toLowerCase() === hex ? s.swatchActive : ""}`}
                style={{ backgroundColor: hex }}
                onClick={() => setCardColor(hex)}
                aria-label={hex}
              />
            ))}
          </div>
        </div>
      )}

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
