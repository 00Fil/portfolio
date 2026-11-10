"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { useLocale, useMessages } from "next-intl";
import { gsap } from "gsap";
import { ArrowUp, X } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { bevelImage } from "@/lib/glass";
import { Bead } from "@/components/glass/Bead";
import { prefersReducedMotion } from "@/lib/env";
import { play } from "@/lib/sound";
import type { Line } from "@/lib/chat-actions";
import { answer, type ChatText, type Msg } from "./engine";
import { WidgetView } from "./Widgets";

/** Dopo quanto compare la notifica, una volta per visita. */
const NOTE_AFTER_MS = 6000;
/** Quanto resta visibile se non la tocchi. */
const NOTE_FOR_MS = 9000;

/** Smusso di vetro cotto per misura, come per la barra. */
function useBevel(ref: RefObject<HTMLElement | null>, radius: number, on = true) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !on) return;
    const bake = () => {
      const u = bevelImage(el.offsetWidth, el.offsetHeight, radius);
      if (u) {
        el.style.setProperty("--bevel", u);
        el.dataset.bevel = "1";
      }
    };
    bake();
    const ro = new ResizeObserver(bake);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, radius, on]);
}

/** Icona dell'"app": il monogramma, come un'icona su macOS e iOS. */
function AppIcon({ size = 38 }: { size?: number }) {
  return (
    <Bead aria-hidden tint="dark" radius={size * 0.3} className="relative flex shrink-0 items-center justify-center overflow-hidden font-medium tracking-[-0.04em] text-white" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      <span className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_30%_0%,rgba(94,196,255,.5),transparent_62%)]" />
      <span className="relative">FC</span>
    </Bead>
  );
}

/**
 * Chat di supporto sempre a portata: si presenta come una notifica di sistema (in alto a destra come su macOS,
 * in alto al centro come su iOS), si apre in una finestra di vetro acrilico e, quando serve, passa la
 * conversazione a Filippo. Si apre anche dal menu dei contatti (evento `chat:open`).
 */
export function ChatDock() {
  const t = (useMessages() as unknown as { chat: ChatText }).chat;
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const reserved = /\/(accedi|area-clienti)/.test(pathname);

  const [desk, setDesk] = useState(true);
  const [note, setNote] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [typing, setTyping] = useState(false);

  const noteRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(1);
  const hideT = useRef<number | undefined>(undefined);
  const hovering = useRef(false);

  useBevel(noteRef, desk ? 18 : 26, note);
  useBevel(panelRef, desk ? 26 : 28, open);
  useBevel(launcherRef, 999, ready && !open);

  // computer o telefono: decide lo stile della notifica e della finestra
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const on = () => setDesk(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // la notifica arriva poco dopo l'ingresso, una sola volta per visita
  useEffect(() => {
    if (reserved) return;
    let timer: number | undefined;
    const arm = () => {
      setReady(true);
      let seen = false;
      try {
        seen = sessionStorage.getItem("chat-note") === "1";
      } catch {
        /* niente */
      }
      if (seen) return;
      timer = window.setTimeout(() => {
        try {
          sessionStorage.setItem("chat-note", "1");
        } catch {
          /* niente */
        }
        setNote(true);
        setUnread(true);
      }, NOTE_AFTER_MS);
    };
    if (document.documentElement.dataset.intro === "done" || !document.documentElement.dataset.intro) arm();
    else window.addEventListener("intro:done", arm, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("intro:done", arm);
    };
  }, [reserved]);

  const hideNote = useCallback(() => {
    const el = noteRef.current;
    window.clearTimeout(hideT.current);
    if (!el || prefersReducedMotion()) return setNote(false);
    gsap.to(el, { ...(desk ? { y: "140%" } : { y: "-130%" }), opacity: desk ? 0 : 1, duration: 0.42, ease: "power3.in", onComplete: () => setNote(false) });
  }, [desk]);

  // ingresso della notifica e uscita da sola dopo un po'
  useLayoutEffect(() => {
    const el = noteRef.current;
    if (!note || !el) return;
    play("tick");
    if (!prefersReducedMotion()) {
      if (desk) gsap.fromTo(el, { y: "140%", opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
      else gsap.fromTo(el, { y: "-130%", scale: 0.96 }, { y: 0, scale: 1, duration: 0.75, ease: "back.out(1.25)" });
    }
    const arm = () => {
      window.clearTimeout(hideT.current);
      hideT.current = window.setTimeout(() => !hovering.current && hideNote(), NOTE_FOR_MS);
    };
    arm();
    return () => window.clearTimeout(hideT.current);
  }, [note, desk, hideNote]);

  const openChat = useCallback(() => {
    setUnread(false);
    setOpen(true);
    if (note) hideNote();
  }, [note, hideNote]);
  const closeChat = useCallback(() => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return setOpen(false);
    gsap.to(el, desk ? { opacity: 0, scale: 0.94, y: 12, duration: 0.25, ease: "power2.in", onComplete: () => setOpen(false) } : { y: "100%", duration: 0.35, ease: "power3.in", onComplete: () => setOpen(false) });
  }, [desk]);

  useEffect(() => {
    const on = () => openChat();
    window.addEventListener("chat:open", on);
    return () => window.removeEventListener("chat:open", on);
  }, [openChat]);

  // apertura della finestra; il primo messaggio arriva come una risposta vera
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!open || !el) return;
    play("open");
    if (!prefersReducedMotion()) {
      if (desk) gsap.fromTo(el, { opacity: 0, scale: 0.92, y: 16, transformOrigin: "100% 100%" }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" });
      else gsap.fromTo(el, { y: "100%" }, { y: 0, duration: 0.55, ease: "expo.out" });
    }
    if (!msgs.length) {
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        setMsgs([{ id: 0, from: "bot", text: t.hello }]);
      }, 650);
    }
    window.setTimeout(() => desk && inputRef.current?.focus(), 400);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeChat();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // su telefono la finestra segue l'area visibile: quando sale la tastiera si accorcia e resta tutta sopra
  const [kb, setKb] = useState<{ top: number; h: number } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || desk || !vv) return;
    const fit = () => {
      const covered = window.innerHeight - vv.height > 120;
      setKb(covered ? { top: vv.offsetTop + 8, h: vv.height - 16 } : null);
      if (covered) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
      setKb(null);
    };
  }, [open, desk]);

  // su telefono la pagina sotto resta ferma mentre la chat è aperta
  useEffect(() => {
    if (!open || desk) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => void (document.documentElement.style.overflow = prev);
  }, [open, desk]);

  const ask = (text: string) => {
    const v = text.trim();
    if (!v || typing) return;
    setMsgs((s) => [...s, { id: seq.current++, from: "me", text: v }]);
    setQ("");
    setTyping(true);
    const r = answer(v, locale, t);
    window.setTimeout(() => {
      setTyping(false);
      setMsgs((s) => [...s, { id: seq.current++, from: "bot", ...r }]);
      play("tick");
    }, 450 + Math.min(700, r.text.length * 4));
  };
  const lines = (): Line[] => msgs.map((m) => ({ from: m.from, text: m.text }));

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    const items = el.querySelectorAll("[data-msg]");
    const last = items[items.length - 1];
    if (last && !prefersReducedMotion()) gsap.fromTo(last, { y: 10, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" });
  }, [msgs, typing]);

  // su telefono la notifica si scaccia trascinandola in su
  const drag = useRef<{ y0: number; dy: number } | null>(null);

  if (reserved) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(q);
  };
  const asked = msgs.some((m) => m.from === "me");

  return (
    <>
      {/* notifica */}
      {note && (
        <div
          className={`pointer-events-none fixed z-[96] ${desk ? "bottom-7 left-1/2 w-[392px] -translate-x-1/2" : "left-1/2 top-[max(env(safe-area-inset-top),8px)] w-[min(calc(100vw-16px),420px)] -translate-x-1/2"}`}
          role="status"
        >
          <div
            ref={noteRef}
            onMouseEnter={() => {
              hovering.current = true;
              window.clearTimeout(hideT.current);
            }}
            onMouseLeave={() => {
              hovering.current = false;
              hideT.current = window.setTimeout(hideNote, 3000);
            }}
            onPointerDown={(e) => {
              if (!desk) drag.current = { y0: e.clientY, dy: 0 };
            }}
            onPointerMove={(e) => {
              if (!drag.current || !noteRef.current) return;
              drag.current.dy = Math.min(0, e.clientY - drag.current.y0);
              noteRef.current.style.transform = `translateY(${drag.current.dy}px)`;
            }}
            onPointerUp={() => {
              const d = drag.current;
              drag.current = null;
              if (d && d.dy < -24) hideNote();
              else if (noteRef.current) gsap.to(noteRef.current, { y: 0, duration: 0.3, ease: "back.out(2)" });
            }}
            className="drop acrylic group pointer-events-auto relative cursor-pointer touch-none"
            style={{ borderRadius: desk ? 18 : 26, ["--drop-tint" as string]: "var(--acrylic)" }}
          >
            <button type="button" onClick={openChat} className={`flex w-full items-start gap-3 text-left ${desk ? "p-3" : "px-3.5 py-3.5"}`}>
              <AppIcon size={desk ? 36 : 40} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate font-semibold text-ink ${desk ? "text-[13px]" : "text-[15px]"}`}>{t.notifTitle}</span>
                  <span className={`shrink-0 text-ink-3 ${desk ? "text-[11.5px]" : "text-[13px]"}`}>{t.now}</span>
                </span>
                <span className={`mt-0.5 line-clamp-2 text-ink ${desk ? "text-[13px] leading-[1.3]" : "text-[15px] leading-[1.3]"}`}>{t.notifBody}</span>
              </span>
            </button>
            {desk && (
              <button
                type="button"
                aria-label={t.close}
                onClick={(e) => {
                  e.stopPropagation();
                  hideNote();
                }}
                className="acrylic absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--acrylic)] text-ink-2 opacity-0 shadow-[inset_0_0_0_1px_var(--hair-strong),0_2px_6px_rgba(0,0,0,.15)] transition-opacity group-hover:opacity-100"
              >
                <X size={12} strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* pulsante sempre presente su computer */}
      {desk && ready && !open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={openChat}
          aria-label={t.open}
          className="drop acrylic fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105"
          style={{ ["--drop-tint" as string]: "var(--acrylic)" }}
        >
          <AppIcon size={38} />
          {unread && <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#ff3b30] shadow-[0_0_0_2px_var(--bg-canvas)]" aria-hidden />}
        </button>
      )}

      {/* finestra della chat */}
      {open && (
        <>
          {!desk && <div aria-hidden onClick={closeChat} className="fixed inset-0 z-[94] bg-black/25" />}
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t.name}
            className={`drop acrylic fixed z-[95] flex select-text flex-col overflow-hidden ${desk ? "bottom-6 right-6 h-[min(640px,calc(100svh-var(--bar-h)-80px))] w-[400px]" : "inset-x-2 bottom-2 top-[max(calc(env(safe-area-inset-top)+12px),40px)]"}`}
            style={{ borderRadius: desk ? 26 : 28, ["--drop-tint" as string]: "var(--acrylic)", ...(kb ? { top: kb.top, height: kb.h, bottom: "auto" } : {}) }}
          >
            <header className="flex items-center gap-3 border-b border-[var(--hair)] px-4 py-3.5">
              <span className="relative">
                <AppIcon size={38} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#30d158] shadow-[0_0_0_2px_var(--acrylic-solid)]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[15px] font-semibold text-ink">{t.name}</span>
                <span className="block truncate text-[12.5px] text-ink-3">{t.role}</span>
              </span>
              <button type="button" onClick={closeChat} aria-label={t.close} className="flex h-9 w-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-[var(--hover)] hover:text-ink">
                <X size={18} strokeWidth={1.9} />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5" data-lenis-prevent aria-live="polite">
              {msgs.map((m) =>
                m.from === "me" ? (
                  <div key={m.id} data-msg className="flex justify-end">
                    <Bead as="p" tint="sky" radius={20} className="drop-soft max-w-[82%] px-3.5 py-2 text-[15px] leading-[1.38] text-ink">{m.text}</Bead>
                  </div>
                ) : (
                  <div key={m.id} data-msg className="max-w-[90%]">
                    <Bead as="p" radius={20} className="drop-soft block w-fit px-3.5 py-2 text-[15px] leading-[1.42] text-ink">{m.text}</Bead>
                    {m.w && m.w.length > 0 && (
                      <div className="mt-2 grid gap-1.5">
                        {m.w.map((w, k) => (
                          <WidgetView key={k} w={w} t={t} locale={locale} lines={lines} />
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
              {typing && (
                <Bead as="div" data-msg radius={18} className="drop-soft flex w-fit gap-1 px-3.5 py-3" aria-hidden>
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--label-tertiary,#999)]" style={{ animationDelay: `${k * 0.13}s` }} />
                  ))}
                </Bead>
              )}
            </div>

            <div className="border-t border-[var(--hair)] p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
              {!asked && msgs.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {t.starts.map((c) => (
                    <Bead as="button" key={c} type="button" onClick={() => ask(c)} radius={16} className="drop-soft h-8 px-3.5 text-[13px] text-ink transition-transform active:scale-[.97]">
                      {c}
                    </Bead>
                  ))}
                </div>
              )}
              <form onSubmit={onSubmit} className="flex items-center gap-2">
                <Bead radius={22} className="drop-soft flex h-11 min-w-0 flex-1 items-center">
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.placeholder}
                    aria-label={t.placeholder}
                    maxLength={400}
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-[16px] text-ink lg:text-[15px] outline-none placeholder:text-ink-3"
                  />
                </Bead>
                <Bead as="button" type="submit" tint="sky" radius={22} aria-label={t.send} disabled={!q.trim() || typing} className="drop-soft flex h-11 w-11 shrink-0 items-center justify-center text-ink transition-[opacity,transform] active:scale-95 disabled:opacity-35">
                  <ArrowUp size={18} strokeWidth={2.2} />
                </Bead>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
