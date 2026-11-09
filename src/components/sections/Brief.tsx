"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMessages } from "next-intl";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft } from "lucide-react";
import { prefersReducedMotion } from "@/lib/env";

type Field = { id: string; ph: string; req?: boolean; type?: string };
type Step = { key: string; q: string; hint?: string; multi?: boolean; options?: string[]; fields?: Field[]; note?: string };
type T = {
  kicker: string;
  next: string;
  back: string;
  send: string;
  enter: string;
  optional: string;
  step: string;
  steps: Step[];
  doneTitle: string;
  doneBody: string;
  again: string;
  demo: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Richiesta di progetto a passi, come un Typeform: una domanda alla volta, avanzamento in alto,
 * scelta singola che va avanti da sola, Invio per proseguire. Per ora non invia nulla.
 */
export function Brief() {
  const t = (useMessages() as unknown as { brief: T }).brief;
  const steps = t.steps;
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [data, setData] = useState<Record<string, string | string[]>>({});
  const stage = useRef<HTMLDivElement>(null);
  const dir = useRef(1);
  const step = steps[i];
  const last = i === steps.length - 1;

  const val = (k: string) => data[k];
  const set = (k: string, v: string | string[]) => setData((d) => ({ ...d, [k]: v }));

  const valid = (() => {
    if (step.fields) return step.fields.every((f) => !f.req || (f.type === "email" ? EMAIL.test(String(val(f.id) ?? "")) : String(val(f.id) ?? "").trim().length > 1));
    const v = val(step.key);
    return Array.isArray(v) ? v.length > 0 : !!v;
  })();

  const go = (to: number) => {
    dir.current = to > i ? 1 : -1;
    setI(to);
  };
  const next = () => {
    if (!valid) return;
    if (last) {
      dir.current = 1;
      setDone(true);
    } else go(i + 1);
  };

  // ogni domanda entra dal lato verso cui si va
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline();
    tl.fromTo(el, { autoAlpha: 0, x: 28 * dir.current, filter: "blur(6px)" }, { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }).from(
      q("[data-opt]"),
      { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.035, ease: "power2.out" },
      0.12,
    );
    if (done) tl.from(q("[data-tick]"), { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2.4)" }, 0.1);
    return () => {
      tl.kill();
    };
  }, [i, done]);

  // il primo campo prende il fuoco quando la domanda ha dei campi
  useEffect(() => {
    if (done) return;
    stage.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  }, [i, done]);

  const pick = (o: string) => {
    if (step.multi) {
      const cur = (val(step.key) as string[]) ?? [];
      set(step.key, cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
      return;
    }
    set(step.key, o);
    if (!step.note) window.setTimeout(() => go(Math.min(i + 1, steps.length - 1)), 320);
  };

  const restart = () => {
    setData({});
    setDone(false);
    dir.current = -1;
    setI(0);
  };

  const progress = done ? 1 : i / steps.length;

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#0d0e10] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)] sm:p-10">
      <span aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[var(--sky)] opacity-[0.08] blur-[70px]" />

      {/* avanzamento: un segmento per domanda */}
      <div className="relative flex items-center gap-4">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {steps.map((s, k) => (
            <span key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full origin-left rounded-full bg-[var(--sky)] transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                style={{ transform: `scaleX(${done || k < i ? 1 : 0})` }}
              />
            </span>
          ))}
        </div>
        <span className="t-fig shrink-0 font-mono text-[12px] text-ink-3" aria-live="polite">
          {done ? `${String(steps.length).padStart(2, "0")}/${String(steps.length).padStart(2, "0")}` : `${String(i + 1).padStart(2, "0")}/${String(steps.length).padStart(2, "0")}`}
        </span>
      </div>
      <span className="sr-only">{Math.round(progress * 100)}%</span>

      <form
        className="relative mt-10 min-h-[360px] sm:mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <div ref={stage}>
          {done ? (
            <div className="flex min-h-[360px] flex-col items-start justify-center">
              <span data-tick className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sky)] text-black shadow-[0_0_40px_-6px_var(--sky)]">
                <Check size={26} strokeWidth={2.6} />
              </span>
              <h3 className="mt-8 text-[clamp(28px,3vw,40px)] font-medium tracking-[-0.035em] text-ink">{t.doneTitle}</h3>
              <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.55] text-ink-2">{t.doneBody.replace("{name}", String(val("name") ?? "").split(" ")[0])}</p>
              <p className="mt-6 font-mono text-[12px] text-ink-3">{t.demo}</p>
              <button type="button" onClick={restart} className="mt-8 h-11 rounded-full px-5 text-[15px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] transition-colors hover:bg-white/[0.06]">
                {t.again}
              </button>
            </div>
          ) : (
            <fieldset>
              <legend className="flex items-baseline gap-3 text-[clamp(26px,3vw,40px)] font-medium leading-[1.1] tracking-[-0.035em] text-ink">
                <span className="t-fig font-mono text-[14px] text-[var(--sky)]">{String(i + 1).padStart(2, "0")}</span>
                {step.q}
              </legend>
              {step.hint && <p className="mt-3 text-[15px] text-ink-3">{step.hint}</p>}

              {step.fields && (
                <div className="mt-8 grid gap-4">
                  {step.fields.map((f) => (
                    <label key={f.id} data-opt className="block">
                      <span className="sr-only">{f.ph}</span>
                      <input
                        type={f.type ?? "text"}
                        value={String(val(f.id) ?? "")}
                        onChange={(e) => set(f.id, e.target.value)}
                        placeholder={f.req ? f.ph : `${f.ph} · ${t.optional}`}
                        autoComplete={f.id === "name" ? "name" : f.id === "email" ? "email" : f.id === "phone" ? "tel" : f.id === "company" ? "organization" : "off"}
                        className="h-14 w-full border-b border-white/15 bg-transparent text-[clamp(18px,1.8vw,22px)] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-[var(--sky)]"
                      />
                    </label>
                  ))}
                </div>
              )}

              {step.options && (
                <div className="mt-8 flex flex-wrap gap-2.5" role={step.multi ? "group" : "radiogroup"}>
                  {step.options.map((o, k) => {
                    const v = val(step.key);
                    const on = Array.isArray(v) ? v.includes(o) : v === o;
                    return (
                      <button
                        key={o}
                        type="button"
                        data-opt
                        role={step.multi ? "checkbox" : "radio"}
                        aria-checked={on}
                        onClick={() => pick(o)}
                        className={`group flex h-12 items-center gap-3 rounded-full pl-2 pr-5 text-[15px] transition-[background-color,box-shadow,color] duration-300 ${
                          on ? "bg-[rgba(94,196,255,.14)] text-ink shadow-[inset_0_0_0_1px_var(--sky)]" : "bg-white/[0.04] text-ink-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] hover:bg-white/[0.07] hover:text-ink"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-[11px] transition-colors duration-300 ${
                            on ? "bg-[var(--sky)] text-black" : "bg-white/[0.06] text-ink-3"
                          }`}
                        >
                          {on ? <Check size={14} strokeWidth={2.8} /> : String.fromCharCode(65 + k)}
                        </span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}

              {step.note && (
                <label data-opt className="mt-6 block">
                  <span className="sr-only">{step.note}</span>
                  <textarea
                    rows={2}
                    value={String(val(`${step.key}Note`) ?? "")}
                    onChange={(e) => set(`${step.key}Note`, e.target.value)}
                    placeholder={`${step.note} · ${t.optional}`}
                    className="w-full resize-none border-b border-white/15 bg-transparent py-3 text-[17px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-[var(--sky)]"
                  />
                </label>
              )}
            </fieldset>
          )}
        </div>

        {!done && (
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => go(i - 1)}
              disabled={i === 0}
              className="flex h-11 items-center gap-2 rounded-full px-4 text-[15px] text-ink-2 transition-opacity hover:text-ink disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft size={16} strokeWidth={1.9} />
              {t.back}
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 text-[13px] text-ink-3 sm:flex">
                <CornerDownLeft size={13} strokeWidth={1.8} />
                {t.enter}
              </span>
              <button
                type="submit"
                disabled={!valid}
                className="flex h-12 items-center gap-2 rounded-full bg-[var(--sky)] px-6 text-[15px] font-medium text-black transition-[opacity,transform] duration-300 active:scale-[0.97] disabled:bg-white/[0.08] disabled:text-ink-3"
              >
                {last ? t.send : t.next}
                <ArrowRight size={16} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
