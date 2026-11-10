"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { sendRequest, type RequestState } from "@/app/[locale]/area-clienti/actions";

type Item = { id: string; title: string; body: string; priority: "low" | "normal" | "high"; status: "new" | "review" | "doing" | "done"; created: string; note?: string };
type Txt = {
  requests: string;
  newRequest: string;
  reqTitle: string;
  reqTitlePh: string;
  reqBody: string;
  reqBodyPh: string;
  reqPriority: string;
  prio: Record<Item["priority"], string>;
  st: Record<Item["status"], string>;
  send: string;
  cancel: string;
  sent: string;
  noRequests: string;
  reqErr: Record<NonNullable<NonNullable<RequestState>["error"]>, string>;
};

const DOT: Record<Item["status"], string> = {
  new: "bg-[var(--hair-strong)]",
  review: "bg-[#f5a524]",
  doing: "bg-[var(--sky)]",
  done: "bg-[#30a46c]",
};

/** Richieste di modifica: si aprono qui, restano in elenco con il loro stato fino al rilascio. */
export function RequestPanel({ items, locale, t }: { items: Item[]; locale: string; t: Txt }) {
  const [state, action, pending] = useActionState(sendRequest, undefined);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));

  useEffect(() => {
    if (!state?.ok) return;
    form.current?.reset();
    setOpen(false);
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 3500);
    return () => window.clearTimeout(id);
  }, [state]);

  const field = "w-full rounded-[10px] bg-[var(--bg-canvas)] px-3 text-[14.5px] text-ink shadow-[inset_0_0_0_1px_var(--hair-strong)] outline-none transition-shadow placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--sky)]";

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-baseline gap-2 text-[17px] font-medium tracking-[-0.02em] text-ink">
          {t.requests}
          <span className="text-[13px] font-normal tabular-nums text-ink-3">{items.length}</span>
        </h2>
        {!open && (
          <button type="button" onClick={() => setOpen(true)} className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-ink px-3 text-[13.5px] font-medium text-[var(--bg-canvas)] transition-transform active:scale-[.97]">
            <Plus size={15} strokeWidth={2} aria-hidden />
            <span className="max-[380px]:sr-only">{t.newRequest}</span>
          </button>
        )}
      </div>

      {flash && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-[10px] bg-[color-mix(in_srgb,#30a46c_12%,transparent)] px-3 py-2.5 text-[13.5px] text-ink">
          <Check size={15} strokeWidth={2.2} className="text-[#30a46c]" aria-hidden />
          {t.sent}
        </p>
      )}

      {open && (
        <form ref={form} action={action} className="mt-5 grid gap-4 rounded-[14px] p-4 shadow-[inset_0_0_0_1px_var(--hair)] animate-[fadeIn_.3s_ease_both]">
          <label className="grid gap-1.5">
            <span className="text-[12.5px] font-medium text-ink-2">{t.reqTitle}</span>
            <input name="title" required maxLength={120} placeholder={t.reqTitlePh} className={`${field} h-11`} autoFocus />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[12.5px] font-medium text-ink-2">{t.reqBody}</span>
            <textarea name="body" required rows={4} maxLength={4000} placeholder={t.reqBodyPh} className={`${field} resize-y py-2.5 leading-[1.5]`} />
          </label>
          <fieldset className="grid gap-1.5">
            <legend className="mb-1.5 text-[12.5px] font-medium text-ink-2">{t.reqPriority}</legend>
            <div className="inline-flex w-fit rounded-[10px] p-0.5 shadow-[inset_0_0_0_1px_var(--hair-strong)]">
              {(["low", "normal", "high"] as const).map((p) => (
                <label key={p} className="cursor-pointer">
                  <input type="radio" name="priority" value={p} defaultChecked={p === "normal"} className="peer sr-only" />
                  <span className="block rounded-[8px] px-3.5 py-1.5 text-[13px] text-ink-2 transition-colors peer-checked:bg-[var(--hover)] peer-checked:font-medium peer-checked:text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--sky)]">{t.prio[p]}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {state?.error && (
            <p role="alert" className="text-[13px] text-[#e5484d]">
              {t.reqErr[state.error]}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-[10px] px-3.5 text-[13.5px] text-ink-2 transition-colors hover:bg-[var(--hover)] hover:text-ink">
              {t.cancel}
            </button>
            <button type="submit" disabled={pending} className="flex h-9 min-w-[76px] items-center justify-center rounded-[10px] bg-ink px-3.5 text-[13.5px] font-medium text-[var(--bg-canvas)] disabled:opacity-60">
              {pending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : t.send}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        !open && <p className="mt-6 rounded-[12px] py-8 text-center text-[14px] text-ink-3 shadow-[inset_0_0_0_1px_var(--hair)]">{t.noRequests}</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--hair)]">
          {items.map((r) => (
            <li key={r.id} className="grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 py-3.5">
              <p className="min-w-0 truncate text-[14.5px] font-medium text-ink">
                {r.title}
                {r.priority === "high" && <span className="ml-2 rounded-[6px] bg-[color-mix(in_srgb,#e5484d_12%,transparent)] px-1.5 py-0.5 align-[1px] text-[11px] font-medium text-[#e5484d]">{t.prio.high}</span>}
              </p>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[12.5px] text-ink-2">
                <span className={`h-1.5 w-1.5 rounded-full ${DOT[r.status]}`} aria-hidden />
                {t.st[r.status]}
              </span>
              <p className="min-w-0 truncate text-[13px] text-ink-3">{r.note || r.body}</p>
              <span className="text-right font-mono text-[11.5px] tabular-nums text-ink-3">
                #{r.id} · {date(r.created)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
