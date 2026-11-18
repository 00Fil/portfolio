"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginGate } from "@/app/[locale]/accedi/actions";
import { Bead } from "@/components/glass/Bead";
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
  const field = "h-full w-full rounded-[inherit] bg-transparent px-5 text-[15.5px] text-ink outline-none focus-visible:!outline-none focus-visible:!rounded-[inherit] placeholder:text-ink-3";
  const shell = "relative mt-2 block h-[54px] transition-shadow has-[[aria-invalid=true]]:shadow-[0_0_0_2px_#e5484d]";

  return (
    <main id="main" className="cine-acr relative flex min-h-[100svh] items-center justify-center px-4 pb-36 pt-[calc(var(--bar-h)+32px)] lg:pb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute -left-[10%] top-[8%] h-[46vmax] w-[46vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_46%,transparent),transparent_68%)] blur-2xl" />
        <span className="absolute -right-[12%] bottom-[2%] h-[52vmax] w-[52vmax] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,#2f6fe0_38%,transparent),transparent_66%)] blur-2xl" />
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
          <label htmlFor="g-email" className="mt-8 block pl-2 text-[13px] font-medium text-ink-2">
            {t.email}
          </label>
          <Bead as="div" radius={27} className={shell}>
            <input id="g-email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required defaultValue={state?.email} className={field} aria-invalid={!!state?.error} />
          </Bead>
          <label htmlFor="g-pw" className="mt-5 block pl-2 text-[13px] font-medium text-ink-2">
            {t.password}
          </label>
          <Bead as="div" radius={27} className={shell}>
            <input ref={pw} id="g-pw" name="password" type={show ? "text" : "password"} autoComplete="current-password" required minLength={6} className={`${field} pr-14`} aria-invalid={!!state?.error} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.hide : t.show} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full focus-visible:!rounded-full text-ink-2 transition-colors hover:text-ink">
              {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
            </button>
          </Bead>
          <Bead as="button" type="submit" tint="sky" radius={27} disabled={pending || !!state?.ok} className="focus-visible:!rounded-[27px] mt-7 flex h-[54px] w-full items-center justify-center gap-2 text-[15.5px] font-semibold text-ink transition-[transform,opacity] active:scale-[.985] disabled:opacity-60">
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
