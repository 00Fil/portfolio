"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, User } from "lucide-react";
import localFont from "next/font/local";
import { unlockCard } from "@/app/[locale]/card/actions";
import s from "./card.module.css";

const nunito = localFont({ src: "../../fonts/nunito-700.woff2", variable: "--nunito", display: "swap", weight: "700" });

type Txt = { code: string; open: string; flip: string; copied: string; errors: { wrong: string; limit: string; off: string } };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Card girevole in 3D: trascina per ruotarla, riflessi che seguono il puntatore, si ferma sempre su un lato. */
export function CardViewer({ t }: { t: Txt }) {
  const scene = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [creds, setCreds] = useState<{ user: string; pass: string } | null>(null);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [pending, setPending] = useState(false);
  const [tip, setTip] = useState<"user" | "pass" | null>(null);

  const st = useRef({ ry: -24, rx: 8, vy: 0, vx: 0, snap: 0, px: 0, py: 0, drag: false, moved: 0, lastX: 0, lastY: 0, lastT: 0, raf: 0, reduce: false });

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
    el.style.setProperty("--so", `${(0.75 - Math.abs(Math.sin((a.ry * Math.PI) / 180)) * 0.3).toFixed(2)}`);
  }, []);

  const loop = useCallback(() => {
    const a = st.current;
    const dt = 1 / 60;
    if (!a.drag) {
      const ty = a.snap + (a.reduce ? 0 : a.px * 10);
      const tx = a.reduce ? 0 : -a.py * 8;
      const k = 120, c = 16;
      a.vy += ((ty - a.ry) * k - a.vy * c) * dt;
      a.vx += ((tx - a.rx) * k - a.vx * c) * dt;
      a.ry += a.vy * dt;
      a.rx += a.vx * dt;
    }
    paint();
    const settled = !a.drag && Math.abs(a.vy) < 0.05 && Math.abs(a.vx) < 0.05 && Math.abs(a.snap + a.px * 10 - a.ry) < 0.05 && Math.abs(-a.py * 8 - a.rx) < 0.05;
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
    a.drag = true; a.moved = 0; a.vy = 0; a.vx = 0;
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
  const up = (e: React.PointerEvent) => {
    const a = st.current;
    if (!a.drag) return;
    a.drag = false;
    scene.current?.releasePointerCapture(e.pointerId);
    if (a.moved < 6) a.snap = Math.round(a.ry / 180) * 180 + 180; // un tocco gira la card
    else a.snap = Math.round((a.ry + clamp(a.vy, -900, 900) * 0.22) / 180) * 180;
    kick();
  };
  const leave = () => { const a = st.current; if (!a.drag) { a.px = 0; a.py = 0; kick(); } };

  const flip = () => { st.current.snap = Math.round(st.current.ry / 180) * 180 + 180; kick(); };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("code") ?? "");
    if (!v.trim()) return;
    setPending(true); setErr("");
    const r = await unlockCard(v);
    setPending(false);
    if (r.ok) {
      setCreds({ user: r.user, pass: r.pass });
      const a = st.current;
      a.snap = Math.round(a.ry / 180) * 180 + (((Math.round(a.ry / 180) % 2) + 2) % 2 === 0 ? 180 : 0); // mostra il retro
      kick();
    } else {
      setErr(t.errors[r.error]);
      setShake(true); setTimeout(() => setShake(false), 450);
    }
  };

  const copy = (k: "user" | "pass") => {
    if (!creds) return;
    navigator.clipboard?.writeText(creds[k]).then(() => { setTip(k); setTimeout(() => setTip(null), 1100); }).catch(() => {});
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
        <div ref={card} className={s.card}>
          <div className={`${s.face} ${s.front}`}>
            <div className={s.sheen} />
            <div className={s.glare} />
          </div>
          <div className={`${s.face} ${s.back}`}>
            <div className={s.bar} style={{ top: "18.93cqw", ["--fs" as string]: "4.67cqw" }} onClick={() => copy("user")}>
              <User aria-hidden strokeWidth={2} />
              <span className={creds ? "" : s.dots}>{creds ? creds.user : "••••••••"}</span>
              <i className={`${s.tip} ${tip === "user" ? s.tipOn : ""}`}>{t.copied}</i>
            </div>
            <div className={s.bar} style={{ top: "32.94cqw", ["--fs" as string]: "3.62cqw" }} onClick={() => copy("pass")}>
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

      <form onSubmit={submit} className={`${s.form} ${creds ? s.formGone : ""} ${shake ? s.shake : ""}`} autoComplete="off">
        <input name="code" type="password" placeholder={t.code} aria-label={t.code} autoComplete="off" spellCheck={false} />
        <button type="submit" disabled={pending} aria-label={t.open}><ArrowRight size={18} /></button>
      </form>
      <p className={s.err} role="status">{err}</p>
    </div>
  );
}
