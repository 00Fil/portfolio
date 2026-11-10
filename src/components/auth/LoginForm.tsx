"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login, type LoginState } from "@/app/[locale]/accedi/actions";

type Txt = {
  title: string;
  lead: string;
  email: string;
  password: string;
  submit: string;
  show: string;
  hide: string;
  forgot: string;
  forgotHref: string;
  errors: Record<NonNullable<NonNullable<LoginState>["error"]>, string>;
  noAccess: string;
  noAccessCta: string;
};

/** Accesso: due campi con l'etichetta sopra, errori sotto il pulsante, niente altro. */
export function LoginForm({ locale, t }: { locale: string; t: Txt }) {
  const [state, action, pending] = useActionState(login, undefined);
  const [show, setShow] = useState(false);
  const pw = useRef<HTMLInputElement>(null);

  // dopo un errore la password si svuota e torna il cursore lì
  useEffect(() => {
    if (!state?.error || !pw.current) return;
    pw.current.value = "";
    pw.current.focus();
  }, [state]);

  const field =
    "h-12 w-full rounded-[12px] bg-[var(--bg-canvas)] px-3.5 text-[15.5px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky),0_0_0_4px_color-mix(in_srgb,var(--sky)_18%,transparent)] aria-[invalid=true]:shadow-[inset_0_0_0_1.5px_#e5484d]";

  return (
    <form action={action} className="w-full animate-[fadeIn_.6s_ease_both]" noValidate>
      <input type="hidden" name="locale" value={locale} />
      <h1 className="text-[26px] font-medium leading-tight tracking-[-0.03em] text-ink">{t.title}</h1>
      <p className="mt-1.5 text-[14.5px] text-ink-2">{t.lead}</p>

      <label htmlFor="email" className="mt-8 block text-[13px] font-medium text-ink-2">
        {t.email}
      </label>
      <input id="email" name="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required defaultValue={state?.email} className={`${field} mt-1.5`} aria-invalid={!!state?.error} />

      <div className="mt-5 flex items-baseline justify-between">
        <label htmlFor="password" className="text-[13px] font-medium text-ink-2">
          {t.password}
        </label>
        <a href={t.forgotHref} className="text-[13px] text-ink-3 transition-colors hover:text-ink">
          {t.forgot}
        </a>
      </div>
      <div className="relative mt-1.5">
        <input ref={pw} id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required minLength={6} className={`${field} pr-12`} aria-invalid={!!state?.error} />
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? t.hide : t.show} className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[10px] text-ink-3 transition-colors hover:text-ink">
          {show ? <EyeOff size={17} strokeWidth={1.7} /> : <Eye size={17} strokeWidth={1.7} />}
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-ink text-[15px] font-medium text-[var(--bg-canvas)] transition-[transform,opacity] active:scale-[.985] disabled:opacity-60"
      >
        {pending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.submit}
      </button>
      <p role="alert" aria-live="polite" className={`text-center text-[13.5px] text-[#e5484d] transition-all duration-300 ${state?.error ? "mt-3 opacity-100" : "h-0 opacity-0"}`}>
        {state?.error ? t.errors[state.error] : ""}
      </p>

      <p className="mt-8 border-t border-[var(--hair)] pt-5 text-center text-[13.5px] text-ink-3">
        {t.noAccess}{" "}
        <a href="#brief" className="font-medium text-ink hover:underline hover:underline-offset-4">
          {t.noAccessCta}
        </a>
      </p>
    </form>
  );
}
