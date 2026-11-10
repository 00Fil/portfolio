"use client";

import { useActionState, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "@/app/[locale]/accedi/actions";
import { prefersReducedMotion } from "@/lib/env";

gsap.registerPlugin(useGSAP);

type Txt = { title: string; lead: string; email: string; password: string; submit: string; show: string; hide: string; errors: Record<NonNullable<NonNullable<LoginState>["error"]>, string>; noAccess: string; noAccessCta: string };

export function LoginForm({ locale, t }: { locale: string; t: Txt }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  const root = useRef<HTMLFormElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-in]", { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: "expo.out", delay: 0.2 });
    },
    { scope: root },
  );
  // a ogni errore il modulo vibra appena
  useGSAP(
    () => {
      if (!state?.error || prefersReducedMotion()) return;
      gsap.fromTo(root.current, { x: 0 }, { x: 8, duration: 0.07, repeat: 5, yoyo: true, ease: "sine.inOut", clearProps: "x" });
    },
    { dependencies: [state] },
  );

  const field = "peer h-14 w-full rounded-[16px] bg-[var(--card)] px-4 pt-4 text-[16px] text-ink shadow-[inset_0_0_0_1px_var(--hair)] outline-none transition-shadow focus:shadow-[inset_0_0_0_1.5px_var(--sky)]";
  const label = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-3 transition-all duration-200 peer-focus:top-[14px] peer-focus:text-[11.5px] peer-[:not(:placeholder-shown)]:top-[14px] peer-[:not(:placeholder-shown)]:text-[11.5px]";

  return (
    <form ref={root} action={action} className="w-full max-w-[400px]" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <h1 data-in className="text-[clamp(32px,3.6vw,48px)] font-medium leading-[1.02] tracking-[-0.045em] text-ink">
        {t.title}
      </h1>
      <p data-in className="mt-3 text-[16px] leading-[1.5] text-ink-2">
        {t.lead}
      </p>
      <div data-in className="relative mt-9">
        <input id="email" name="email" type="email" autoComplete="email" required placeholder=" " defaultValue={state?.email} className={field} aria-invalid={!!state?.error} />
        <label htmlFor="email" className={label}>
          {t.email}
        </label>
      </div>
      <div data-in className="relative mt-3">
        <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required minLength={6} placeholder=" " className={`${field} pr-14`} aria-invalid={!!state?.error} />
        <label htmlFor="password" className={label}>
          {t.password}
        </label>
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.hide : t.show} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 transition-colors hover:text-ink">
          {show ? <EyeOff size={18} strokeWidth={1.7} /> : <Eye size={18} strokeWidth={1.7} />}
        </button>
      </div>
      <p role="alert" aria-live="polite" className={`overflow-hidden text-[14px] text-[#e5484d] transition-all duration-300 ${state?.error ? "mt-3 max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
        {state?.error ? t.errors[state.error] : ""}
      </p>
      <div data-in className="mt-6">
        <button
          type="submit"
          disabled={pending}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-[16px] bg-ink text-[16px] font-medium text-[var(--bg-canvas)] transition-transform active:scale-[.985] disabled:opacity-60"
        >
          {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.submit}
          {!pending && <ArrowRight size={18} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" aria-hidden />}
        </button>
      </div>
      <p data-in className="mt-8 border-t border-[var(--hair)] pt-6 text-[14.5px] text-ink-2">
        {t.noAccess}{" "}
        <a href="#brief" className="font-medium text-ink underline decoration-[var(--hair-strong)] underline-offset-4 hover:decoration-current">
          {t.noAccessCta}
        </a>
      </p>
    </form>
  );
}
