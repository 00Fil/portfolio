"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginGate } from "@/app/[locale]/accedi/actions";
import { Bead } from "@/components/glass/Bead";
import GradientWaves from "@/components/reactbits/GradientWaves";
import { onIntroLift } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/env";

type Txt = { status: string; title: string; lead: string; email: string; password: string; submit: string; show: string; hide: string; errors: Record<"fields" | "wrong" | "limit" | "off", string> };

/** Campo di testo che si scrive a lettere: l'input vero resta (trasparente) per cursore e tastiera, sopra c'è il testo che muta. */
function MorphField({ id, name, type = "text", masked = false, label, invalid, defaultValue, inputRef, autoComplete, end }: {
  id: string;
  name: string;
  type?: string;
  masked?: boolean;
  label: string;
  invalid?: boolean;
  defaultValue?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  autoComplete?: string;
  end?: React.ReactNode;
}) {
  const [v, setV] = useState(defaultValue ?? "");
  const [dx, setDx] = useState(0);
  const el = useRef<HTMLInputElement | null>(null);
  const prev = useRef(v.length);
  const sync = () => setDx(el.current?.scrollLeft ?? 0);
  const chars = Array.from(v);
  const fresh = chars.length > prev.current;
  useEffect(() => {
    prev.current = chars.length;
  });
  return (
    <>
      <label htmlFor={id} className="mt-5 block pl-2 text-[13px] font-medium text-ink-2 first:mt-8">
        {label}
      </label>
      <Bead as="div" radius={27} className={`relative mt-2 block h-[54px] transition-shadow ${invalid ? "shadow-[0_0_0_2px_#e5484d]" : ""}`}>
        <span className="mf-in">
          <span className="mf-text text-[15.5px] text-ink" style={{ transform: `translateX(${-dx}px)` }} aria-hidden>
            {chars.map((c, i) => (
              <span key={i} className={`mf-ch ${fresh && i === chars.length - 1 ? "mf-new" : ""}`} style={{ "--d": `${Math.min(i, 24) * 0.018}s` } as React.CSSProperties}>
                <span className="mf-chr" data-m={masked ? 1 : 0}>
                  {c === " " ? " " : c}
                </span>
                <span className="mf-dot" data-m={masked ? 1 : 0} style={{ opacity: masked ? 1 : 0 }}>
                  •
                </span>
              </span>
            ))}
          </span>
          <input
            ref={(n) => {
              el.current = n;
              if (typeof inputRef === "function") inputRef(n);
              else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = n;
            }}
            id={id}
            name={name}
            type={type}
            value={v}
            onChange={(e) => setV(e.target.value)}
            onScroll={sync}
            onKeyUp={sync}
            onInput={sync}
            autoComplete={autoComplete}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-invalid={invalid}
            className="absolute inset-0 h-full w-full rounded-[inherit] bg-transparent px-5 pr-14 text-[15.5px] text-transparent caret-[var(--label-primary)] outline-none selection:bg-[color-mix(in_srgb,var(--accent)_35%,transparent)] focus-visible:!rounded-[inherit] focus-visible:!outline-none"
          />
        </span>
        {end}
      </Bead>
    </>
  );
}

/** Sfondo: onde nei blu del sito, nei due temi. */
function Waves() {
  const [c, setC] = useState<{ dark: boolean; bg: string } | null>(null);
  useEffect(() => {
    const read = () => {
      const d = document.documentElement;
      const dark = d.dataset.theme ? d.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
      setC({ dark, bg: getComputedStyle(d).getPropertyValue("--bg-canvas").trim() || (dark ? "#000" : "#f6f6f3") });
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => mo.disconnect();
  }, []);
  if (!c) return null;
  const small = typeof innerWidth !== "undefined" && innerWidth < 768;
  return (
    <GradientWaves
      key={c.dark ? "d" : "l"}
      className="!absolute inset-0"
      horizonColor={c.dark ? "#1b5fae" : "#9fd9ff"}
      waveColor={c.dark ? "#5ec4ff" : "#2f8fe0"}
      crestColor={c.dark ? "#d4efff" : "#ffffff"}
      backgroundColor={c.bg}
      lightMode={!c.dark}
      speed={0.35}
      amplitude={2.4}
      relief={1}
      sheen={c.dark ? 0.5 : 0}
      brightness={c.dark ? 1 : 1.05}
      quality={small ? "low" : "medium"}
      dpr={small ? 1 : 1.5}
      mouseInteraction
    />
  );
}

/** Manutenzione: dopo il nome compaiono, uno dopo l'altro, lo stato, il titolo e l'accesso riservato. */
export function GateScreen({ t }: { t: Txt }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(loginGate, undefined);
  const [on, setOn] = useState(false);
  const [show, setShow] = useState(false);
  const pw = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return setOn(true);
    return onIntroLift(() => setOn(true));
  }, []);
  useEffect(() => {
    if (state?.ok) router.refresh();
    else if (state?.error) pw.current?.focus();
  }, [state, router]);

  const rise = (i: number) => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(18px) scale(.985)",
    filter: on ? "blur(0)" : "blur(8px)",
    transition: "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1), filter .9s cubic-bezier(.16,1,.3,1)",
    transitionDelay: `${0.12 + i * 0.12}s`,
  });

  return (
    <main id="main" className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-[var(--bg-canvas)] px-4 py-10">
      <div aria-hidden className="pointer-events-auto absolute inset-0">
        <Waves />
      </div>
      <div className="relative w-full max-w-[380px]">
        <span className="flex items-center gap-2.5 text-[13px] font-medium text-ink-2" style={rise(1)}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#f5b84b] opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-[#f5b84b]" />
          </span>
          {t.status}
        </span>
        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink" style={rise(2)}>
          {t.title}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-ink-2" style={rise(3)}>
          {t.lead}
        </p>
        <form action={action} noValidate style={rise(4)}>
          <MorphField id="g-email" name="email" type="email" label={t.email} invalid={!!state?.error} defaultValue={state?.email} autoComplete="username" />
          <MorphField
            id="g-pw"
            name="password"
            label={t.password}
            masked={!show}
            invalid={!!state?.error}
            inputRef={pw}
            autoComplete="current-password"
            end={
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.hide : t.show} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink focus-visible:!rounded-full">
                {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
              </button>
            }
          />
          <Bead as="button" type="submit" tint="sky" radius={27} disabled={pending || !!state?.ok} className="mt-7 flex h-[54px] w-full items-center justify-center gap-2 text-[15.5px] font-semibold text-ink transition-[transform,opacity] focus-visible:!rounded-[27px] active:scale-[.985] disabled:opacity-60">
            {pending || state?.ok ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.submit}
          </Bead>
          <p role="alert" aria-live="polite" className={`text-center text-[13.5px] text-[#e5484d] transition-all duration-300 ${state?.error ? "mt-3 opacity-100" : "h-0 opacity-0"}`}>
            {state?.error ? t.errors[state.error] : ""}
          </p>
        </form>
      </div>
    </main>
  );
}
