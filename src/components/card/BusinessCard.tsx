"use client";

import { useRef, useState } from "react";
import { Download, Wallet } from "lucide-react";
import { Bead } from "@/components/glass/Bead";
import { Wordmark } from "@/components/nav/Wordmark";
import { vcard } from "@/content/vcard";
import s from "./business.module.css";

export function BusinessCard({ apple, google }: { apple: boolean; google: boolean }) {
  const card = useRef<HTMLDivElement>(null);
  const [flip, setFlip] = useState(false);

  const move = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 16).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    const el = card.current;
    if (!el) return;
    ["--rx", "--ry"].forEach((k) => el.style.setProperty(k, "0deg"));
    el.style.setProperty("--gx", "30%");
    el.style.setProperty("--gy", "20%");
  };

  const btn = "no-ring flex h-12 items-center justify-center gap-2 px-6 text-[15px] font-semibold text-ink";
  return (
    <div className={s.wrap}>
      <div className={s.stage} onPointerMove={move} onPointerLeave={leave}>
        <div ref={card} className={s.card} data-flip={flip} role="button" tabIndex={0} aria-label="Gira il biglietto" onClick={() => setFlip(!flip)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setFlip(!flip))}>
          <div className={`${s.face} ${s.front}`}>
            <p className={s.eyebrow}>{vcard.role}</p>
            <div className={s.bottom}>
              <h1 className={s.name}>{vcard.name}</h1>
              <p className={s.tag}>{vcard.tagline}</p>
            </div>
            <span className={s.city}>{vcard.city}</span>
            <i className={s.sheen} />
          </div>
          <div className={`${s.face} ${s.back}`}>
            <Wordmark className={s.logo} />
            <p className={s.link}>{vcard.github.replace("https://", "")}</p>
            <i className={s.sheen} />
          </div>
        </div>
        <div className={s.shadow} />
      </div>

      <div className={s.actions}>
        {apple && (
          <Bead as="a" href="/api/wallet/apple" tint="dark" radius={999} className={btn}>
            <Wallet size={18} strokeWidth={1.8} /> Apple Wallet
          </Bead>
        )}
        {google && (
          <Bead as="a" href="/api/wallet/google" tint="dark" radius={999} className={btn}>
            <Wallet size={18} strokeWidth={1.8} /> Google Wallet
          </Bead>
        )}
        <Bead as="a" href="/api/biglietto/vcf" tint="sky" radius={999} className={btn}>
          <Download size={18} strokeWidth={1.8} /> Salva contatto
        </Bead>
      </div>
    </div>
  );
}
