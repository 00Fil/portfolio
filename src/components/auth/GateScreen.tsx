"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Wrench } from "lucide-react";
import { loginGate } from "@/app/[locale]/accedi/actions";
import { onIntroLift } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/env";

type Txt = { status: string; title: string; lead: string; email: string; password: string; submit: string; show: string; hide: string; errors: Record<"fields" | "wrong" | "limit" | "off", string> };

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
    else if (state?.error && pw.current) {
      pw.current.value = "";
      pw.current.focus();
    }
  }, [state, router]);

  const rise = (i: number) => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(18px) scale(.985)",
    filter: on ? "blur(0)" : "blur(8px)",
    transition: "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1), filter .9s cubic-bezier(.16,1,.3,1)",
    transitionDelay: `${0.12 + i * 0.12}s`,
  });
  const field =
    "h-12 w-full rounded-[12px] bg-[var(--bg-canvas)] px-3.5 text-[15.5px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky),0_0_0_4px_color-mix(in_srgb,var(--sky)_18%,transparent)] aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_#e5484d]";

  return (
    <main id="main" className="relative flex min-h-[100svh] items-center justify-center px-4 pb-36 pt-[calc(var(--bar-h)+32px)] lg:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,var(--hair)_1px,transparent_1.4px)] [background-size:24px_24px] [mask-image:radial-gradient(50%_50%_at_50%_50%,#000,transparent)]" />
      <div className="relative w-full max-w-[400px] rounded-[24px] bg-[var(--card)] p-7 shadow-[inset_0_0_0_1px_var(--hair),0_40px_80px_-50px_var(--shadow-strong)] sm:p-9" style={rise(0)}>
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-[color-mix(in_srgb,#f5b84b_16%,transparent)] pl-2.5 pr-3.5 text-[13px] font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,#f5b84b_45%,transparent)]" style={rise(1)}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#f5b84b] opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-[#f5b84b]" />
          </span>
          <Wrench size={14} strokeWidth={1.8} className="text-ink-2" />
          {t.status}
        </span>
        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink" style={rise(2)}>
          {t.title}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-ink-2" style={rise(3)}>
          {t.lead}
        </p>
        <form action={action} noValidate style={rise(4)}>
          <label htmlFor="g-email" className="mt-8 block text-[13px] font-medium text-ink-2">
            {t.email}
          </label>
          <input id="g-email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required defaultValue={state?.email} className={`${field} mt-1.5`} aria-invalid={!!state?.error} />
          <label htmlFor="g-pw" className="mt-5 block text-[13px] font-medium text-ink-2">
            {t.password}
          </label>
          <div className="relative mt-1.5">
            <input ref={pw} id="g-pw" name="password" type={show ? "text" : "password"} autoComplete="current-password" required minLength={6} className={`${field} pr-12`} aria-invalid={!!state?.error} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.hide : t.show} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-ink-3 transition-colors hover:text-ink">
              {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
            </button>
          </div>
          <button type="submit" disabled={pending || !!state?.ok} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-ink text-[15px] font-medium text-[var(--bg-canvas)] transition-[transform,opacity] active:scale-[.985] disabled:opacity-60">
            {pending || state?.ok ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.submit}
          </button>
          <p role="alert" aria-live="polite" className={`text-center text-[13.5px] text-[#e5484d] transition-all duration-300 ${state?.error ? "mt-3 opacity-100" : "h-0 opacity-0"}`}>
            {state?.error ? t.errors[state.error] : ""}
          </p>
        </form>
      </div>
    </main>
  );
}
