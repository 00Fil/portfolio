"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { LensFilter } from "@/components/glass/LensFilter";
import { bevelImage } from "@/lib/glass";
import { SPR, Spring } from "@/lib/spring";
import { play } from "@/lib/sound";
import { INK_2, ON_SUBTLE, lerpColor, supportsElementLens, vibrate } from "@/lib/env";

type Props = {
  options: { value: string; label: string; full: string }[];
  selected: number;
  onSelect: (i: number) => void;
  label: string;
  id: string;
};

const H = 42;
const PAD = 3;

/** GlassSegmented di Relay: una goccia azzurra scivola sotto l'opzione scelta, si gonfia se tenuta premuta, si trascina. */
export function GlassSegmented({ options, selected, onSelect, label, id }: Props) {
  const n = options.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const cloneLabels = useRef<(HTMLElement | null)[]>([]);
  const [itemW, setItemW] = useState(0);
  const [lens, setLens] = useState(false);
  const follow = useRef(new Spring(selected));
  const bubble = useRef(new Spring(1));
  const holding = useRef(false);
  const selRef = useRef(selected);
  selRef.current = selected;

  useEffect(() => setLens(supportsElementLens()), []);

  useLayoutEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const m = () => setItemW(t.clientWidth / n);
    m();
    const ro = new ResizeObserver(m);
    ro.observe(t);
    return () => ro.disconnect();
  }, [n]);

  useEffect(() => {
    if (!holding.current) follow.current.to(selected, SPR.settle);
  }, [selected]);

  useEffect(() => {
    const d = dropRef.current;
    if (!d || !itemW) return;
    const u = bevelImage(itemW, H - PAD * 2);
    if (u) {
      d.style.setProperty("--bevel", u);
      d.dataset.bevel = "1";
    }
  }, [itemW]);

  useEffect(() => {
    const render = () => {
      const p = follow.current.value;
      const b = bubble.current.value;
      const x = p * itemW;
      const wrap = dropRef.current?.parentElement;
      if (wrap) wrap.style.transform = `translate3d(${x}px,0,0) scale(${b}, ${1 + (b - 1) * 0.75})`;
      if (cloneRef.current) cloneRef.current.style.transform = `translate3d(${-x}px,0,0)`;
      for (let i = 0; i < n; i++) {
        const near = 1 - Math.min(1, Math.abs(i - p));
        const lt = document.documentElement.dataset.theme === "light";
        const c = lerpColor(lt ? [0x7b, 0x7c, 0x82] : INK_2, lt ? [0x0b, 0x4a, 0x70] : ON_SUBTLE, near);
        if (labels.current[i]) labels.current[i]!.style.color = c;
        if (cloneLabels.current[i]) cloneLabels.current[i]!.style.color = c;
      }
    };
    gsap.ticker.add(render);
    return () => gsap.ticker.remove(render);
  }, [itemW, n]);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const toTab = (x: number) => {
      const r = t.getBoundingClientRect();
      return Math.min(n - 1, Math.max(0, (x - r.left) / (r.width / n) - 0.5));
    };
    let active = false;
    let lastX = 0;
    let lastTab = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      active = true;
      holding.current = true;
      t.setPointerCapture(e.pointerId);
      lastX = e.clientX;
      lastTab = Math.round(toTab(lastX));
      vibrate(8);
      play("press");
      bubble.current.to(1.24, SPR.bubble);
      follow.current.to(toTab(lastX), SPR.follow);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      lastX = e.clientX;
      const k = Math.round(toTab(lastX));
      if (k !== lastTab) {
        lastTab = k;
        vibrate(4);
        play("tick");
      }
      follow.current.to(toTab(lastX), SPR.follow);
    };
    const up = () => {
      if (!active) return;
      active = false;
      holding.current = false;
      const idx = Math.round(toTab(lastX));
      bubble.current.to(1, SPR.bubble);
      follow.current.to(idx, SPR.settle);
      if (idx !== selRef.current) {
        play("toggle");
        onSelect(idx);
      }
    };
    t.addEventListener("pointerdown", down);
    t.addEventListener("pointermove", move);
    t.addEventListener("pointerup", up);
    t.addEventListener("pointercancel", up);
    return () => {
      t.removeEventListener("pointerdown", down);
      t.removeEventListener("pointermove", move);
      t.removeEventListener("pointerup", up);
      t.removeEventListener("pointercancel", up);
    };
  }, [n, onSelect]);

  const h = H - PAD * 2;
  const row = (refs: React.MutableRefObject<(HTMLElement | null)[]>, interactive: boolean) =>
    options.map((o, i) =>
      interactive ? (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={selected === i}
          aria-label={o.full}
          ref={(el) => {
            refs.current[i] = el;
          }}
          onClick={(e) => {
            if (e.detail === 0 && i !== selected) onSelect(i);
          }}
          className="t-label relative flex h-full flex-1 items-center justify-center rounded-full font-medium"
        >
          {o.label}
        </button>
      ) : (
        <span
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="t-label flex h-full flex-1 items-center justify-center font-medium"
        >
          {o.label}
        </span>
      ),
    );

  return (
    <div className="drop float-glass relative" style={{ height: H, width: 44 * n + PAD * 2, ["--drop-tint" as string]: "var(--bar-tint)" }}>
      {lens && itemW > 0 && <LensFilter id={id} width={itemW} height={h} radius={h / 2} edge={9} amount={7} aberr={0.3} sat={1.3} />}
      <div ref={trackRef} role="radiogroup" aria-label={label} className="absolute flex touch-none select-none" style={{ inset: PAD }}>
        {row(labels, true)}
      </div>
      <div className="pointer-events-none absolute" style={{ inset: PAD }} aria-hidden>
        <div className="relative will-change-transform" style={{ width: itemW, height: h }}>
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0" style={{ filter: lens ? `url(#${id})` : undefined }}>
              <div ref={cloneRef} className="absolute inset-y-0 left-0 flex" style={{ width: itemW * n, background: "color-mix(in srgb, var(--bg-canvas) 90%, transparent)" }}>
                {row(cloneLabels, false)}
              </div>
            </div>
          </div>
          <div ref={dropRef} className="drop absolute inset-0" style={{ ["--drop-tint" as string]: "color-mix(in srgb, var(--sky) 18%, transparent)" }} />
        </div>
      </div>
    </div>
  );
}
