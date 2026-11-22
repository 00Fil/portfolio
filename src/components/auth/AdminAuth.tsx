"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { register, signIn } from "@/app/[locale]/login/actions";
import { Wordmark } from "@/components/nav/Wordmark";
import { Bead } from "@/components/glass/Bead";
import { MorphField, Waves } from "./GateScreen";
import { onIntroLift } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/env";

/** /login: la prima volta registra l'unico admin, poi solo accesso. Nessun tasto nel sito che porta qui. */
export function AdminAuth({ mode }: { mode: "register" | "login" }) {
  const [state, action, pending] = useActionState(mode === "register" ? register : signIn, undefined);
  const [on, setOn] = useState(false);
  const [show, setShow] = useState(false);
  const pw = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return setOn(true);
    return onIntroLift(() => setOn(true));
  }, []);
  useEffect(() => {
    if (state?.ok) window.location.reload();
    else if (state?.error) pw.current?.focus();
  }, [state]);

  const rise = (i: number) => ({
    opacity: on ? 1 : 0,
    transform: on ? "none" : "translateY(18px) scale(.985)",
    filter: on ? "blur(0)" : "blur(8px)",
    transition: "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1), filter .9s cubic-bezier(.16,1,.3,1)",
    transitionDelay: `${0.1 + i * 0.12}s`,
  });
  const eye = (
    <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Nascondi" : "Mostra"} className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink focus-visible:!rounded-full">
      {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
    </button>
  );

  return (
    <main id="main" className="fixed inset-0 z-[150] flex items-center justify-center overflow-y-auto bg-[var(--bg-canvas)] px-4 py-10">
      <div aria-hidden className="pointer-events-auto absolute inset-0">
        <Waves />
      </div>
      <div className="relative w-full max-w-[380px]">
        <h1 className="mb-9 flex justify-center" style={{ ...rise(0), ["--logo-size" as string]: "clamp(40px,12vw,56px)" }} aria-label="Admin">
          <Wordmark />
        </h1>
        <form action={action} noValidate style={rise(2)}>
          <MorphField id="a-user" name="user" label="Utente" invalid={!!state?.error} defaultValue={state?.user} autoComplete="username" />
          <MorphField id="a-pw" name="password" label="Password" masked={!show} invalid={!!state?.error} inputRef={pw} autoComplete={mode === "register" ? "new-password" : "current-password"} end={eye} />
          {mode === "register" && <MorphField id="a-again" name="again" label="Ripeti password" masked={!show} invalid={!!state?.error} autoComplete="new-password" />}
          <Bead as="button" type="submit" tint="sky" radius={27} disabled={pending || !!state?.ok} className="mt-7 flex h-[54px] w-full items-center justify-center gap-2 text-[15.5px] font-semibold text-ink transition-[transform,opacity] focus-visible:!rounded-[27px] active:scale-[.985] disabled:opacity-60">
            {pending || state?.ok ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : mode === "register" ? "Crea accesso" : "Entra"}
          </Bead>
          <p role="alert" aria-live="polite" className={`text-center text-[13.5px] text-[#e5484d] transition-all duration-300 ${state?.error ? "mt-3 opacity-100" : "h-0 opacity-0"}`}>
            {state?.error ?? ""}
          </p>
        </form>
      </div>
    </main>
  );
}
