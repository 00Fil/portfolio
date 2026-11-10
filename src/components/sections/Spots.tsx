"use client";

/*
 * Gli spot dei servizi, stile app Apple: per ogni passo di quello che facciamo un commento a tutto quadro e poi
 * una sola inquadratura, pulita, con un oggetto al centro e un movimento che racconta il passo.
 * In chiusura il marchio e il tasto. Il motore è uno solo; ogni servizio dichiara le sue inquadrature.
 */

import type { ReactNode } from "react";
import { gsap } from "gsap";
import { useLocale } from "next-intl";
import * as si from "simple-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowUp01Icon,
  Calendar03Icon,
  AiChat02Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Edit02Icon,
  Invoice01Icon,
  LockKeyIcon,
  Mail01Icon,
  Notification01Icon,
  Package01Icon,
  Search01Icon,
  ShoppingCart01Icon,
  SparklesIcon,
  ThermometerWarmIcon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { Bead } from "@/components/glass/Bead";
import { Canvas, addEnd, addSay } from "./ServiceWidgets";
import { play as sfx, type Sfx } from "@/lib/sound";

type Q = (s: string) => Element[];
export type Shot = { node: ReactNode; play?: (run: gsap.core.Timeline, $: Q, at: number) => void; dur?: number; say?: boolean };
/** Un suono nella timeline, nell'istante preciso dell'azione. */
const snd = (run: gsap.core.Timeline, name: Sfx, at: number) => run.call(() => sfx(name), undefined, at);

const W = 620;
const EN: Record<string, string> = {"Prenota": "Book", "Caricamento": "Load time", "Avviso in homepage": "Homepage notice", "Modifica · bozza": "Edit · draft", "Chiusi il 25 e 26 dicembre": "Closed on 25 and 26 December", "Pubblica sul sito": "Publish on the site", "Online in tutto il sito": "Live across the site", "dentista a brescia": "dentist in brescia", "Prestazioni": "Performance", "Accessibilità": "Accessibility", "Visite dalla ricerca": "Visits from search", "Un buon dentista a Brescia?": "A good dentist in Brescia?", "Sto cercando le fonti migliori…": "Looking for the best sources…", "Risposta": "Answer", "Ti consiglio": "I’d recommend", ", in centro a Brescia:": ", in central Brescia:", "orari estesi, prenotazione online e recensioni molto positive.": "long opening hours, online booking and great reviews.", "Ti cita": "Cites you", "Ordine fornitore": "Supplier order", "da confermare": "to confirm", "Sincronizzato su tutti i dispositivi": "Synced on every device", "Prenota la visita": "Book a visit", "Scegli giorno e ora, ti confermiamo subito.": "Pick a day and time, confirmed instantly.", "Continua": "Continue", "Test con 5 persone": "Tested with 5 people", "Riescono a prenotare da sole?": "Can they book on their own?", "Trova il servizio": "Finds the service", "Sceglie giorno e ora": "Picks a day and time", "Conferma la visita": "Confirms the visit", "Colori": "Colour", "Testo": "Type", "Titolo · Corpo · Nota": "Title · Body · Note", "Componenti": "Components", "Annulla": "Cancel", "Posta in arrivo": "Inbox", "Ordine 40 pz. articolo 118": "Order: 40 pcs of item 118", "Fattura di ottobre": "October invoice", "Non riesco ad accedere": "I can’t log in", "Disponibilità per martedì?": "Available on Tuesday?", "Ordini": "Orders", "Fatture": "Invoices", "Assistenza": "Support", "Letto e smistato": "Read and sorted", "bozza pronta": "draft ready", "4 risposte pronte": "4 replies ready", "Le invio?": "Send them?", "Rivedi": "Review", "Approva": "Approve", "Inviate · 2 ore risparmiate oggi": "Sent · 2 hours saved today", "Cella frigo 2": "Cold room 2", "Laboratorio · dal vivo": "Kitchen · live", "Temperatura in aumento": "Temperature rising", "Cella frigo 2 · porta aperta da 6 min": "Cold room 2 · door open for 6 min", "Impianti": "Equipment", "Tutto regolare": "All normal", "Cella frigo 1": "Cold room 1", "Forno": "Oven", "Compressore": "Compressor", "Negozio": "Shop", "Gestionale": "ERP", "Pagato · 3 articoli": "Paid · 3 items", "Fattura FT-1042": "Invoice FT-1042", "Emessa e inviata": "Issued and sent", "Magazzino": "Stock", "Scorte aggiornate": "Stock updated", "Ordine #1042": "Order #1042", "Ore risparmiate ogni mese": "Hours saved every month", "Nessun dato ricopiato a mano": "No data retyped by hand", "Olio extravergine": "Extra virgin olive oil", "Aggiungi al carrello": "Add to cart", "Totale": "Total", "Spedizione inclusa · arriva giovedì": "Shipping included · arrives Thursday", "Paga": "Pay", "Pagamento protetto": "Secure payment", "Pagamento riuscito": "Payment successful", "Ordini di oggi": "Today’s orders", "disponibili": "in stock", "Giulia R. · 2 articoli": "Giulia R. · 2 items", "Spedito": "Shipped", "Consegnato": "Delivered", "Marco B. · 1 articolo": "Marco B. · 1 item", "Elena T. · 3 articoli": "Elena T. · 3 items", "Pagato": "Paid", "Olio extravergine ·": "Extra virgin olive oil ·", "Carta": "Card", "Igiene, ortodonzia e implantologia in centro città.": "Hygiene, orthodontics and implants in the city centre.", "Prenota online, orari estesi, anche il sabato.": "Book online, long hours, Saturdays too.", "Visite e preventivi su appuntamento.": "Visits and quotes by appointment.", "Cerca con Google": "Google Search", "Mi sento fortunato": "I'm Feeling Lucky", "dentista brescia": "dentist brescia", "Prenota online in 1 minuto. Orari estesi, anche il sabato.": "Book online in 1 minute. Long hours, Saturdays too.", "Livelli": "Layers", "Desktop": "Desktop", "Hero": "Hero", "Titolo": "Title", "Servizi": "Services", "Prenota una visita": "Book a visit", "Perfetto così!": "Love it!", "Riempimento": "Fill", "Angoli": "Corners", "Il tuo sorriso, in buone mani": "Your smile, in good hands", "Pubblicazione": "Deployment", "Pubblica": "Deploy", "Compilato in 9 s": "Built in 9 s", "24 pagine generate": "24 pages generated", "Immagini ottimizzate": "Images optimised", "Online su studiobianchi.it": "Live on studiobianchi.it", "Online": "Live", "Chi siamo": "About", "Contatti": "Contact", "Giovedì 14 novembre": "Thursday 14 November", "Conferma": "Confirm", "Nuova prenotazione": "New booking", "Giulia R. · giovedì alle 14:30": "Giulia R. · Thursday at 2:30 pm", "ora": "now", "Buonasera, Marco": "Good evening, Marco", "Come posso aiutarti oggi?": "How can I help you today?", "Mi consigli un buon dentista a Brescia?": "Can you recommend a good dentist in Brescia?", ", in centro a Brescia: prenotazione online, orari estesi e recensioni molto positive.": ", in central Brescia: online booking, long hours and excellent reviews.", "e": "and", "Sei la loro": "You’re their", "prima scelta,": "first choice,", "quando si parla del tuo settore.": "whenever your field comes up.", "Nuova attività": "New task", "Recenti": "Recent", "Report vendite": "Sales report", "Fatture ottobre": "October invoices", "Listino 2026": "2026 price list", "Cosa facciamo oggi?": "What shall we do today?", "Smista le email di oggi, inserisci gli ordini e prepara le risposte": "Sort today’s emails, enter the orders and draft the replies", "Al lavoro sulle email di oggi": "Working on today’s emails", "Lette 24 email": "Read 24 emails", "12 ordini inseriti nel gestionale": "12 orders entered in the ERP", "9 risposte preparate": "9 replies drafted", "3 da controllare a mano": "3 to check by hand", "File": "Files", "ordini.xlsx": "orders.xlsx", "risposte (9)": "replies (9)", "Fatto. 9 risposte pronte": "Done. 9 replies ready", "12 ordini già nel gestionale · 3 da guardare tu": "12 orders already in the ERP · 3 for you to check", "Approva e invia": "Approve and send", "Prenotazione — Prototipo": "Booking — Prototype", "Presenta": "Present", "Scegli l'orario": "Pick a time", "Confermato": "Confirmed", "Ci vediamo giovedì": "See you Thursday", "Test con 5 persone vere": "Tested with 5 real people", "prenotare una visita": "book a visit", "Tempo medio": "Average time", "Completano la prenotazione": "Complete the booking", "Prima": "Before", "Dopo": "After", "2,5 volte più prenotazioni": "2.5× more bookings", "Il tuo gestionale": "Your ERP", "Nuovo ordine #1042 · 89,00 €": "New order #1042 · €89.00", "Pagamento ricevuto": "Payment received", "Fattura FT-1042 creata e scorte aggiornate": "Invoice FT-1042 created, stock updated", "Conferma inviata al cliente": "Confirmation sent to the customer", "Richiesta del cliente chiusa": "Customer request closed", "Prenota e gestisci le visite": "Book and manage visits", "Ottieni": "Get", "Apri": "Open", "Salute": "Health", "Età": "Age", "Avvisa": "Notify", "Avvisato": "Notified", "In compilazione": "Building", "Codice scaricato": "Code fetched", "Dipendenze installate": "Dependencies installed", "Novembre 2026": "November 2026", "Giovedì 12 novembre": "Thursday 12 November"};
/** Le scritte dentro le inquadrature: italiano, oppure inglese quando il sito è in inglese. */
function Tx({ children }: { children: string }) {
  return <>{useLocale() === "en" ? (EN[children] ?? children) : children}</>;
}
function Months() {
  const en = useLocale() === "en";
  return (
    <>
      {(en ? ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"] : ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO"]).map((m) => (
        <span key={m}>{m}</span>
      ))}
    </>
  );
}
const H = 400;
const GL = "rgba(12,18,26,.74)";
const AQUA = "#8fd8ff";
const GREEN = "#6ee7a8";
const AMBER = "#f5c46b";

/* ───────────── Motore ───────────── */

export function StoryV({ shots, max }: { shots: Shot[]; max?: number }) {
  return (
    <Canvas
      framed={false}
      ownSpot
      stretch
      w={W}
      h={H}
      max={max}
      build={(q) => {
        const scrim = q("[data-scrim]")[0];
        const zoom = q("[data-zoom]")[0];
        const says = q("[data-say]");
        const els = q("[data-shot]");
        const tl = gsap.timeline();
        const run = gsap.timeline({ repeat: -1 });
        let at = 0;
        let n = 0;
        shots.forEach((s, i) => {
          const el = els[i];
          const $: Q = (sel) => Array.from(el.querySelectorAll(sel));
          const say = s.say === false ? null : says[n++];
          if (say) addSay(run, say, scrim, zoom, at, 1);
          const st = at + (say ? 1.45 : 0);
          const inner = el.firstElementChild as Element;
          const full = !!inner.firstElementChild?.hasAttribute("data-full");
          // le azioni vivono in una timeline a parte: la scena dura quanto servono, più un respiro per leggere
          const sub = gsap.timeline();
          s.play?.(sub, $, 0.35);
          const dur = Math.max(sub.duration() + 1, (s.dur ?? 3) * 0.7);
          run
            .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out", immediateRender: false }, st)
            .call(() => sfx("whoosh"), undefined, st);
          if (full) {
            // le schermate a tutto riquadro non si rimpiccioliscono: partono un filo più grandi e si assestano
            run.fromTo(inner, { scale: 1.04 }, { scale: 1, duration: 0.9, ease: "expo.out", immediateRender: false }, st);
          } else {
            // entra dal basso, leggermente più piccola, e poi continua a muoversi piano finché resta in scena
            run.fromTo(inner, { y: 40, scale: 0.92 }, { y: 0, scale: 1, duration: 0.8, ease: "expo.out", immediateRender: false }, st).to(inner, { y: -6, duration: Math.max(0.1, dur - 0.8), ease: "sine.inOut" }, st + 0.8);
          }
          run.add(sub, st);
          run.to(el, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, st + dur);
          if (!full) run.to(inner, { y: -26, scale: 0.98, duration: 0.4, ease: "power2.in" }, st + dur);
          at = st + dur + 0.15;
        });
        const end = addEnd(run, q, at);
        run.to({}, { duration: 0.01 }, end + 0.4);
        return tl.add(run, 0.2);
      }}
    >
      {shots.map((s, i) => (
        <div key={i} data-shot className="invisible absolute inset-0">
          <div className="flex h-full w-full flex-col items-center justify-center will-change-transform">{s.node}</div>
          {/* il cursore che tocca i pulsanti: micro interazioni vere, non solo cose che compaiono */}
          <svg data-cursor viewBox="0 0 24 24" className="pointer-events-none absolute left-0 top-0 z-30 h-6 w-6 opacity-0 drop-shadow-[0_3px_6px_rgba(0,0,0,.45)]" style={{ marginLeft: -5, marginTop: -3.5, transformOrigin: "5px 3.5px" }} aria-hidden>
            <path d="M5 3.5 19 11l-6.2 1.7L10 19z" fill="#fff" stroke="#0b1620" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </Canvas>
  );
}

/* ───────────── Pezzi comuni ───────────── */

const Ico = ({ i, s = 18, c = "" }: { i: typeof Mail01Icon; s?: number; c?: string }) => <HugeiconsIcon icon={i} size={s} strokeWidth={1.7} className={c} />;
const Brand = ({ p, c = "h-5 w-5" }: { p: { path: string }; c?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-current ${c}`} aria-hidden>
    <path d={p.path} />
  </svg>
);
const Tile = ({ children, tone = "sky", size = 44, light = false }: { children: ReactNode; tone?: "sky" | "green" | "amber"; size?: number; light?: boolean }) => (
  <Bead
    tint={light ? "rgba(255,255,255,.94)" : tone === "amber" ? "rgba(245,165,36,.2)" : tone === "green" ? "rgba(48,209,88,.18)" : "rgba(255,255,255,.1)"}
    radius={Math.round(size * 0.3)}
    className={`flex shrink-0 items-center justify-center ${light ? "text-black" : tone === "amber" ? "text-[#ffd48a]" : "text-white"}`}
    style={{ width: size, height: size }}
  >
    {children}
  </Bead>
);
/** Logo a colori dell'azienda citata, come un'icona d'app. */
const Logo = ({ src, size = 44, pad = 0.22 }: { src: string; size?: number; pad?: number }) => (
  <Tile size={size} light>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={src} alt="" className="block" style={{ width: size * (1 - pad * 2), height: size * (1 - pad * 2) }} draggable={false} />
  </Tile>
);
const OPENAI = "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z";

/** Etichetta sotto l'inquadratura: una riga che dice cosa sta succedendo. */
const Note = ({ children, attr = "data-note" }: { children: ReactNode; attr?: string }) => (
  <span {...{ [attr]: "" }} className="mt-6 inline-flex overflow-hidden p-1">
    <Bead tint={GL} radius={16} className="flex h-8 items-center gap-2 whitespace-nowrap px-3.5 text-[12.5px] text-white">
      {children}
    </Bead>
  </span>
);
const Ok = ({ children }: { children: ReactNode }) => (
  <>
    <Ico i={CheckmarkCircle02Icon} s={14} c="text-[#6ee7a8]" />
    {children}
  </>
);
/** Testo che compare come battuto a macchina. */
const typeIn = (run: gsap.core.Timeline, el: Element, at: number, dur = 1) => run.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: dur, ease: `steps(${Math.max(8, (el.textContent ?? "").length)})` }, at);
const count = (run: gsap.core.Timeline, el: Element, from: number, to: number, at: number, dur: number, fmt: (n: number) => string) => {
  const o = { v: from };
  run.set(o, { v: from }, at).to(o, { v: to, duration: dur, ease: "power2.out", onUpdate: () => void (el.textContent = fmt(o.v)) }, at);
};
/** Il cursore arriva sul pulsante, lo preme (il pulsante si abbassa), poi scivola via. */
const tap = (run: gsap.core.Timeline, $: Q, sel: string, at: number) => {
  const cur = $("[data-cursor]")[0];
  const btn = $(sel)[0] as HTMLElement | undefined;
  if (!cur || !btn) return;
  const shot = cur.parentElement as HTMLElement;
  const to = () => {
    const a = shot.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const k = a.width / shot.offsetWidth || 1;
    return { x: (b.left - a.left + b.width * 0.62) / k, y: (b.top - a.top + b.height * 0.55) / k };
  };
  run
    .set(cur, { x: () => to().x + 90, y: () => to().y + 70 }, at - 0.9)
    .to(cur, { opacity: 1, duration: 0.25 }, at - 0.9)
    .to(cur, { x: () => to().x, y: () => to().y, duration: 0.8, ease: "power3.inOut" }, at - 0.85)
    .call(() => sfx("click"), undefined, at)
    .to(cur, { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" }, at)
    .to(btn, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.inOut" }, at)
    .to(cur, { x: () => to().x + 60, y: () => to().y + 80, opacity: 0, duration: 0.7, ease: "power2.in" }, at + 0.6);
};
/** Una nota che arriva facendosi spazio: cresce in altezza e spinge su il resto, invece di comparire sopra. */
const grow = (run: gsap.core.Timeline, el: Element | undefined, at: number, gap = 24) => {
  if (!el) return;
  run.fromTo(el, { height: 0, marginTop: 0, autoAlpha: 0, y: 10 }, { height: "auto", marginTop: gap, autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.inOut" }, at);
};
const it = (n: number, d = 0) => n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });
const enter = (run: gsap.core.Timeline, els: Element[], at: number, stagger = 0.12) => run.fromTo(els, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger, ease: "expo.out" }, at);

/** Finestra del browser in vetro: barra con i tre pallini e l'indirizzo. */
const Browser = ({ w, h, url = "studiobianchi.it", children }: { w?: number; h?: number; url?: string; children: ReactNode }) => (
  <Bead data-full={w ? undefined : ""} tint={GL} radius={w ? 18 : 0} className={`flex flex-col overflow-hidden text-white ${w ? "" : "h-full w-full"}`} style={w ? { width: w, height: h } : undefined}>
    <span className="flex h-9 shrink-0 items-center gap-1.5 border-b border-white/10 px-3.5">
      {[0, 1, 2].map((k) => (
        <span key={k} className="h-2.5 w-2.5 rounded-full bg-white/20" />
      ))}
      <span className="mx-auto flex h-5 items-center gap-1 rounded-full bg-white/[.07] px-3 text-[10.5px] text-white/60">
        <Ico i={LockKeyIcon} s={10} />
        {url}
      </span>
    </span>
    <span className="relative flex-1">{children}</span>
  </Bead>
);
const Phone = ({ w = 150, h = 300, children }: { w?: number; h?: number; children: ReactNode }) => (
  <Bead tint={GL} radius={30} className="block relative overflow-hidden p-2 text-white" style={{ width: w, height: h }}>
    <span className="absolute left-1/2 top-2.5 h-[14px] w-[46px] -translate-x-1/2 rounded-full bg-black/70" />
    <span className="relative block h-full overflow-hidden rounded-[23px] bg-white/[.04] px-3 pt-8">{children}</span>
  </Bead>
);
const Bar = ({ w, c = "bg-white/25", h = 7 }: { w: string | number; c?: string; h?: number }) => <span className={`block rounded-full ${c}`} style={{ width: w, height: h }} />;

/* ───────────── Strumenti per le scene col cursore ───────────── */

/** Finestra d'app in vetro scuro, a tutto quadro: semafori e titolo. */
const Win = ({ w, h, title, logo, tint = "rgba(20,24,30,.98)", children }: { w?: number; h?: number; title?: ReactNode; logo?: ReactNode; tint?: string; children: ReactNode }) => (
  // senza misure riempie tutta la scheda: la schermata è l'app, non una finestra appoggiata sopra
  <Bead data-full={w ? undefined : ""} tint={tint} radius={w ? 18 : 0} className={`relative flex flex-col overflow-hidden text-white ${w ? "" : "h-full w-full"}`} style={w ? { width: w, height: h } : undefined}>
    <span className="flex h-10 shrink-0 items-center gap-2 border-b border-white/[.07] px-3.5">
      <span className="flex gap-1.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: 0.85 }} />
        ))}
      </span>
      <span className="ml-2 flex items-center gap-2 text-[12px] text-white/70">
        {logo}
        {title}
      </span>
    </span>
    <span className="relative block flex-1">{children}</span>
  </Bead>
);
const Img = ({ src, s = 18, c = "" }: { src: string; s?: number; c?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt="" className={`block shrink-0 ${c}`} style={{ width: s, height: s }} draggable={false} />
);
/** Posizione di un elemento dentro l'inquadratura, nelle unità della tela (che è scalata). */
const spot = (shot: HTMLElement, el: Element, fx = 0.5, fy = 0.5) => {
  const a = shot.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  const k = a.width / shot.offsetWidth || 1;
  return { x: (b.left - a.left + b.width * fx) / k, y: (b.top - a.top + b.height * fy) / k };
};
/** Un movimento da mano vera: parte piano, corre, frena, con una leggera curva; arriva esattamente sul punto.
 *  Il bersaglio si rilegge a ogni fotogramma, quindi se la scena si muove il cursore la segue e non sbaglia mai. */
let bendDir = 1;
const human = (run: gsap.core.Timeline, cur: Element, get: () => { x: number; y: number }, at: number, dur = 0.55) => {
  const d = { p: 0 };
  const m = { sx: 0, sy: 0, last: 1, dir: (bendDir *= -1) };
  run.fromTo(
    d,
    { p: 0 },
    {
      p: 1,
      duration: dur,
      ease: "none",
      immediateRender: false,
      onUpdate: () => {
        const p = d.p;
        if (p < m.last) {
          m.sx = Number(gsap.getProperty(cur, "x"));
          m.sy = Number(gsap.getProperty(cur, "y"));
        }
        m.last = p;
        const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const t = get();
        const dx = t.x - m.sx;
        const dy = t.y - m.sy;
        const dist = Math.hypot(dx, dy) || 1;
        const bend = Math.sin(Math.PI * e) * Math.min(26, dist * 0.09) * m.dir;
        gsap.set(cur, { x: m.sx + dx * e - (dy / dist) * bend, y: m.sy + dy * e + (dx / dist) * bend });
      },
    },
    at,
  );
  return at + dur;
};
const press = (run: gsap.core.Timeline, cur: Element, btn: Element, at: number) => {
  snd(run, "click", at);
  return run.to(cur, { scale: 0.78, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out" }, at).to(btn, { scale: 0.95, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out" }, at);
};
/** Il cursore entra dal basso a destra rispetto a un elemento. */
const cursorIn = (run: gsap.core.Timeline, $: Q, near: Element, at: number) => {
  const cur = $("[data-cursor]")[0];
  const shot = cur.parentElement as HTMLElement;
  run.set(cur, { x: () => spot(shot, near).x + 160, y: () => spot(shot, near).y + 130, opacity: 0, scale: 1 }, at - 0.3).to(cur, { opacity: 1, duration: 0.2 }, at);
  return { cur, shot };
};
/** Va su un elemento e lo preme. Restituisce l'istante del clic. */
const click = (run: gsap.core.Timeline, c: { cur: Element; shot: HTMLElement }, el: Element, at: number, dur = 0.5, fx = 0.5, fy = 0.55) => {
  const t = human(run, c.cur, () => spot(c.shot, el, fx, fy), at, dur);
  press(run, c.cur, el, t);
  return t;
};
/** Scrive in un campo con il ritmo irregolare di una persona. Restituisce quando ha finito. */
const typeText = (run: gsap.core.Timeline, el: Element, text: string, at: number, fast = 1) => {
  run.call(() => void (el.textContent = ""), undefined, Math.max(0, at - 0.3));
  let t = at;
  for (let i = 1; i <= text.length; i++) {
    const sub = text.slice(0, i);
    run.call(() => {
      el.textContent = sub;
      sfx("key");
    }, undefined, t);
    t += (text[i - 1] === " " ? 0.09 : 0.035 + ((i * 37) % 5) * 0.01) / fast;
  }
  return t;
};
/** Testo che arriva a parole, come una risposta generata. */
const stream = (run: gsap.core.Timeline, els: Element[], at: number, gap = 0.035) => {
  els.forEach((_, i) => i % 3 === 0 && snd(run, "tick", at + i * gap));
  return run.fromTo(els, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25, stagger: gap, ease: "power2.out" }, at);
};
function Words({ s, attr = "data-wd" }: { s: string; attr?: string }) {
  const t = useLocale() === "en" ? (EN[s] ?? s) : s;
  return (
    <>
      {t.split(" ").map((w, i) => (
        <span key={i} {...{ [attr]: "" }} className="inline-block">
          {w}&nbsp;
        </span>
      ))}
    </>
  );
}
/** Traduzione per i testi usati dentro le animazioni (scritti a macchina). */
const L = (s: string) => (typeof document !== "undefined" && document.documentElement.lang === "en" ? (EN[s] ?? s) : s);
const claudeLogo = "/visual/brands/claude.svg";

/** Il nostro gestionale: una tessera di vetro con il suo simbolo, pulita, sopra tutti gli altri. */
const Ours = ({ size = 92 }: { size?: number }) => (
  <Bead tint="linear-gradient(160deg, rgba(158,220,255,.55), rgba(31,127,184,.42) 55%, rgba(11,47,69,.7))" radius={Math.round(size * 0.28)} className="flex items-center justify-center text-white" style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" className="fill-none stroke-white" style={{ width: size * 0.46, height: size * 0.46 }} strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.8 20 7.4v9.2l-8 4.6-8-4.6V7.4Z" />
      <path d="M12 12 20 7.4M12 12v9.2M12 12 4 7.4" opacity=".55" />
      <circle cx="12" cy="12" r="2.2" fill="#fff" stroke="none" />
    </svg>
  </Bead>
);

/* ───────────── Siti e web app: si disegna in Figma con il cliente, si pubblica in un clic, porta prenotazioni ───────────── */

/** Il cursore resta incollato a un elemento mentre questo cambia (si allarga, si sposta): non perde mai il punto. */
const follow = (run: gsap.core.Timeline, c: { cur: Element; shot: HTMLElement }, el: Element, at: number, dur: number, fx = 1, fy = 1) =>
  run.to({}, { duration: dur, ease: "none", onUpdate: () => void gsap.set(c.cur, spot(c.shot, el, fx, fy)) }, at);

const DOW_IT = ["L", "M", "M", "G", "V", "S", "D"];
const DOW_EN = ["M", "T", "W", "T", "F", "S", "S"];
const Tool = ({ d, on = false }: { d: string; on?: boolean }) => (
  <span className={`flex h-6 w-6 items-center justify-center rounded-[6px] ${on ? "bg-[#0d99ff]" : ""}`}>
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-white/85" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  </span>
);
const SiteBlock = ({ cls = "" }: { cls?: string }) => <span className={`block rounded-[10px] bg-[linear-gradient(135deg,#9edcff,#3ea4dc_55%,#1f7fb8)] ${cls}`} />;
const FIG_LAYERS: [string, number, boolean][] = [
  ["Desktop", 0, true],
  ["Nav", 1, true],
  ["Hero", 1, false],
  ["Titolo", 2, false],
  ["Prenota", 2, false],
  ["Servizi", 1, false],
];
const LOG = ["Codice scaricato", "Dipendenze installate", "Compilato in 9 s", "24 pagine generate", "Immagini ottimizzate", "Online su studiobianchi.it"];

function Dow() {
  const d = useLocale() === "en" ? DOW_EN : DOW_IT;
  return (
    <>
      {d.map((x, i) => (
        <span key={i} className="text-center text-[10px] text-black/35">
          {x}
        </span>
      ))}
    </>
  );
}

export const WEB: Shot[] = [
  {
    dur: 6,
    node: (
      <Win title={<span>Studio Bianchi — Home</span>} logo={<Img src="/visual/brands/figma.svg" s={14} />}>
        <span className="absolute inset-0 flex flex-col">
          {/* barra degli strumenti */}
          <span className="flex h-9 shrink-0 items-center gap-1 border-b border-white/[.07] px-3">
            <Tool on d="M3 2.5 13 7.2 8.6 8.6 7.2 13Z" />
            <Tool d="M2.5 5.5h11M2.5 10.5h11M5.5 2.5v11M10.5 2.5v11" />
            <Tool d="M2.5 3.5h11v9h-11Z" />
            <Tool d="M8 2.5 13 12.5H3Z" />
            <Tool d="M3 4V3h10v1M8 3v10M6 13h4" />
            <span className="mx-auto flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a259ff] text-[9px] font-semibold">M</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0d99ff] text-[9px] font-semibold">F</span>
            </span>
            <span className="rounded-[6px] bg-[#0d99ff] px-2.5 py-1 text-[11px] font-medium"><Tx>Presenta</Tx></span>
          </span>
          <span className="grid min-h-0 flex-1 grid-cols-[136px_1fr_136px]">
            {/* livelli */}
            <span className="block border-r border-white/[.07] p-2.5 text-[11px] text-white/65">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.08em] text-white/35"><Tx>Livelli</Tx></span>
              {FIG_LAYERS.map(([l, depth, shown], i) => (
                <span key={l} data-layer={i} className={`flex items-center gap-1.5 rounded-[6px] py-1 ${shown ? "" : "opacity-0"}`} style={{ paddingLeft: 6 + depth * 12 }}>
                  <span className={`h-2 w-2 border border-white/45 ${i === 0 ? "rounded-none" : "rounded-[2px]"}`} />
                  <Tx>{l}</Tx>
                </span>
              ))}
            </span>
            {/* tela */}
            <span className="relative block overflow-hidden bg-[#1e1e1e]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
              <span className="absolute left-5 top-2.5 text-[10px] text-white/45">Desktop</span>
              <span data-frame className="absolute inset-x-5 bottom-5 top-7 block overflow-hidden rounded-[3px] bg-[#f7f7f4] text-[#111827]">
                <span className="flex items-center justify-between px-4 pt-3">
                  <span className="flex items-center gap-1.5 text-[10.5px] font-semibold">
                    <span className="h-3.5 w-3.5 rounded-[5px] bg-[#1f7fb8]" />
                    Studio Bianchi
                  </span>
                  <span className="flex gap-3 text-[9.5px] text-[#111827]/50">
                    <Tx>Servizi</Tx>
                    <Tx>Chi siamo</Tx>
                    <Tx>Contatti</Tx>
                  </span>
                </span>
                <span data-tl className="absolute left-[6%] top-[17%] block h-0 w-0" />
                <span data-hero className="absolute left-[6%] top-[17%] block rounded-[10px] bg-[linear-gradient(135deg,#9edcff,#3ea4dc_55%,#1f7fb8)]" style={{ width: 0, height: 0 }}>
                  <span data-sel className="pointer-events-none absolute -inset-px block border border-[#0d99ff] opacity-0">
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} className="absolute h-1.5 w-1.5 border border-[#0d99ff] bg-white" style={{ left: k % 2 ? "auto" : -3, right: k % 2 ? -3 : "auto", top: k < 2 ? -3 : "auto", bottom: k < 2 ? "auto" : -3 }} />
                    ))}
                    <span data-dim className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0d99ff] px-1.5 py-0.5 font-mono text-[9px] text-white" />
                  </span>
                </span>
                <span data-h1w className="absolute left-[11%] top-[26%] block h-6 w-[70%] text-white">
                  <span data-h1 className="block whitespace-pre text-[17px] font-semibold leading-6 tracking-[-0.02em]" />
                </span>
                <span data-sub className="absolute left-[11%] top-[40%] block space-y-1.5 opacity-0">
                  <span className="block h-1.5 w-[190px] rounded-full bg-white/55" />
                  <span className="block h-1.5 w-[130px] rounded-full bg-white/40" />
                </span>
                <span data-cta className="absolute left-[11%] top-[49%] block h-[26px] w-[126px]">
                  <span data-btn className="flex h-full w-full items-center justify-center rounded-full bg-white text-[10px] font-medium text-[#1f7fb8] opacity-0">
                    <Tx>Prenota una visita</Tx>
                  </span>
                  <span data-pin className="absolute left-full top-0 ml-2 flex -translate-y-5 items-center gap-1.5 whitespace-nowrap rounded-full rounded-bl-[4px] bg-white py-1 pl-1 pr-2.5 text-[10px] text-[#111] opacity-0 shadow-[0_8px_20px_-6px_rgba(0,0,0,.5)]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#a259ff] text-[8px] font-semibold text-white">M</span>
                    <Tx>Perfetto così!</Tx>
                  </span>
                </span>
                <span className="absolute inset-x-[6%] top-[66%] grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((k) => (
                    <span key={k} data-card className="block h-[56px] rounded-[8px] bg-white p-2 opacity-0 shadow-[0_4px_14px_-6px_rgba(0,0,0,.2)]">
                      <span className="block h-4 w-4 rounded-[5px] bg-[#3ea4dc]/30" />
                      <span className="mt-1.5 block h-1.5 w-12 rounded-full bg-[#111827]/50" />
                    </span>
                  ))}
                </span>
                {/* il cursore del cliente */}
                <span data-mcur className="pointer-events-none absolute left-0 top-0 z-20 block opacity-0">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path d="M5 3.5 19 11l-6.2 1.7L10 19z" fill="#a259ff" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  <span className="ml-3.5 -mt-1 inline-block rounded-full rounded-tl-[3px] bg-[#a259ff] px-2 py-0.5 text-[9px] font-medium text-white">Marco</span>
                </span>
              </span>
            </span>
            {/* proprietà */}
            <span className="block border-l border-white/[.07] p-2.5 text-[10.5px] text-white/60">
              <span className="mb-2.5 flex gap-3 text-[10.5px]">
                <span className="text-white">Design</span>
                <span className="text-white/40">Prototype</span>
              </span>
              <span className="flex gap-3 font-mono text-[10px]">
                <span>W <span data-w>0</span></span>
                <span>H <span data-hh>0</span></span>
              </span>
              <span className="mb-2 mt-4 block text-[10px] uppercase tracking-[0.08em] text-white/35"><Tx>Riempimento</Tx></span>
              <span className="flex items-center gap-2">
                <span className="relative block h-4 w-4 overflow-hidden rounded-[4px] bg-white/25">
                  <span data-swatch className="absolute inset-0 block bg-[linear-gradient(135deg,#9edcff,#1f7fb8)] opacity-0" />
                </span>
                <span data-hex className="font-mono" />
              </span>
              <span className="mb-2 mt-4 block text-[10px] uppercase tracking-[0.08em] text-white/35"><Tx>Angoli</Tx></span>
              <span>12</span>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-tl]")[0], at);
      const hero = $("[data-hero]")[0] as HTMLElement;
      const sel = $("[data-sel]")[0];
      const layer = (i: number) => $(`[data-layer="${i}"]`)[0];
      const light = (i: number, a: number, b: number) =>
        run.to(layer(i), { autoAlpha: 1, duration: 0.25 }, a).to(layer(i), { backgroundColor: "rgba(13,153,255,.28)", duration: 0.15 }, a).to(layer(i), { backgroundColor: "rgba(13,153,255,0)", duration: 0.25 }, b);
      const dims = () => {
        $("[data-w]")[0].textContent = String(Math.round(hero.offsetWidth));
        $("[data-hh]")[0].textContent = String(Math.round(hero.offsetHeight));
        $("[data-dim]")[0].textContent = `${Math.round(hero.offsetWidth)} × ${Math.round(hero.offsetHeight)}`;
      };
      // 1 · trascina un rettangolo da un angolo all'altro: il cursore resta sul vertice mentre cresce
      let t = human(run, c.cur, () => spot(c.shot, $("[data-tl]")[0]), at + 0.05, 0.5);
      snd(run, "click", t);
      run
        .set(hero, { width: 0, height: 0 }, t)
        .set(sel, { opacity: 1 }, t)
        .to(hero, { width: "88%", height: "44%", duration: 0.7, ease: "power2.inOut", onUpdate: dims }, t);
      follow(run, c, hero, t, 0.7);
      light(2, t + 0.1, t + 0.8);
      run.to($("[data-swatch]"), { opacity: 1, duration: 0.3 }, t + 0.7).call(() => void ($("[data-hex]")[0].textContent = "#3EA4DC"), undefined, t + 0.75);
      t += 0.8;
      // 2 · il titolo: un clic nel riquadro e si scrive
      run.to(sel, { opacity: 0, duration: 0.2 }, t);
      t = human(run, c.cur, () => spot(c.shot, $("[data-h1w]")[0], 0.1, 0.5), t, 0.4);
      press(run, c.cur, $("[data-h1w]")[0], t);
      light(3, t, t + 0.9);
      t = typeText(run, $("[data-h1]")[0], L("Il tuo sorriso, in buone mani"), t + 0.12, 2.2);
      run.fromTo($("[data-sub]"), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, t);
      // 3 · il pulsante
      t = human(run, c.cur, () => spot(c.shot, $("[data-cta]")[0], 0.5, 0.5), t + 0.1, 0.4);
      press(run, c.cur, $("[data-cta]")[0], t);
      run.fromTo($("[data-btn]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.2)" }, t + 0.05);
      light(4, t + 0.05, t + 0.7);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.4);
      // 4 · la sezione dei servizi, mentre il cliente entra nel file e lascia un commento
      run.fromTo($("[data-card]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1, ease: "expo.out" }, t + 0.2);
      light(5, t + 0.25, t + 1);
      const cta = $("[data-cta]")[0] as HTMLElement;
      const mc = $("[data-mcur]")[0];
      run
        .set(mc, { x: () => cta.offsetLeft + cta.offsetWidth + 140, y: () => cta.offsetTop + 120, opacity: 0 }, t)
        .to(mc, { opacity: 1, duration: 0.2 }, t + 0.5)
        .to(mc, { x: () => cta.offsetLeft + cta.offsetWidth * 0.8, y: () => cta.offsetTop + cta.offsetHeight * 0.6, duration: 0.7, ease: "power3.inOut" }, t + 0.5)
        .fromTo($("[data-pin]"), { opacity: 0, scale: 0.5, y: -14 }, { opacity: 1, scale: 1, y: -20, duration: 0.45, ease: "back.out(2)" }, t + 1.25);
      snd(run, "notify", t + 1.25);
    },
  },
  {
    dur: 5,
    node: (
      <Win title={<span>studiobianchi.it</span>} logo={<Brand p={si.siVercel} c="h-3 w-3" />}>
        <span className="absolute inset-0 flex flex-col p-5">
          <span className="flex items-center gap-3">
            <span className="text-[18px] font-semibold tracking-[-0.02em]"><Tx>Pubblicazione</Tx></span>
            <span className="relative ml-1 flex h-6 items-center text-[11.5px]">
              <span data-building className="flex items-center gap-1.5 whitespace-nowrap text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#f5c46b]" />
                <Tx>In compilazione</Tx>
              </span>
              <span data-live className="absolute left-0 flex items-center gap-1.5 whitespace-nowrap text-white opacity-0">
                <span className="h-2 w-2 rounded-full bg-[#30d158] shadow-[0_0_0_3px_rgba(48,209,88,.25)]" />
                <Tx>Online</Tx>
              </span>
            </span>
            <span data-deploy className="ml-auto rounded-full bg-white px-4 py-1.5 text-[12px] font-semibold text-black">
              <Tx>Pubblica</Tx>
            </span>
          </span>
          <span className="mt-4 block h-1.5 shrink-0 overflow-hidden rounded-full bg-white/10">
            <span data-prog className="block h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#5ec4ff,#9ee4ff)]" style={{ transform: "scaleX(0)" }} />
          </span>
          <span className="mt-4 flex shrink-0 flex-col gap-2 rounded-[12px] bg-black/40 p-4 font-mono text-[11.5px] text-white/80">
            {LOG.map((l, i) => (
              <span key={l} data-log className="flex items-center gap-2.5 opacity-0">
                <span className="w-7 text-white/35">0:{String(i * 2 + 1).padStart(2, "0")}</span>
                <span className="relative block h-3.5 w-3.5">
                  <span data-spin className="absolute inset-0 block rounded-full border-[1.5px] border-white/25 border-t-white/80" />
                  <span data-chk className="absolute inset-0 opacity-0">
                    <Ico i={CheckmarkCircle02Icon} s={14} c="text-[#6ee7a8]" />
                  </span>
                </span>
                <Tx>{l}</Tx>
              </span>
            ))}
          </span>
          <span className="mt-4 grid min-h-0 flex-1 grid-cols-[1.15fr_1fr] gap-4">
            <span data-prev className="relative block overflow-hidden rounded-[10px] bg-[#f7f7f4]" style={{ clipPath: "inset(0 0 100% 0)" }}>
              <span className="absolute inset-x-3 top-3 flex items-center justify-between">
                <span className="h-1.5 w-10 rounded-full bg-[#1f2937]/60" />
                <span className="flex gap-1.5">
                  <span className="h-1.5 w-5 rounded-full bg-[#1f2937]/25" />
                  <span className="h-1.5 w-5 rounded-full bg-[#1f2937]/25" />
                </span>
              </span>
              <SiteBlock cls="absolute inset-x-3 top-8 h-[44%]" />
              <span className="absolute left-3 top-[66%] h-2 w-24 rounded-full bg-[#111827]/75" />
              <span className="absolute left-3 top-[78%] h-4 w-16 rounded-full bg-[#1f7fb8]" />
            </span>
            <span className="flex flex-col justify-between gap-3">
              <span data-domain className="flex items-center gap-2 rounded-[10px] bg-white/[.06] px-3 py-2.5 text-[12px] opacity-0">
                <Ico i={LockKeyIcon} s={12} c="text-[#6ee7a8]" />
                studiobianchi.it
                <span className="ml-auto font-mono text-[11px] text-white/45">0,8 s</span>
              </span>
              <span className="flex justify-between pb-1">
                {[
                  ["Prestazioni", 100],
                  ["SEO", 100],
                  ["Accessibilità", 100],
                ].map(([l, v]) => (
                  <span key={l} className="flex flex-col items-center gap-1">
                    <span className="relative h-11 w-11">
                      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                        <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="3.5" />
                        <circle data-ring={v} cx="20" cy="20" r="17" fill="none" stroke={GREEN} strokeWidth="3.5" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
                      </svg>
                      <span data-score className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tabular-nums">
                        0
                      </span>
                    </span>
                    <span className="text-[9.5px] text-white/55"><Tx>{l as string}</Tx></span>
                  </span>
                ))}
              </span>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-deploy]")[0], at);
      const t = click(run, c, $("[data-deploy]")[0], at + 0.05, 0.5);
      const logs = $("[data-log]");
      run.fromTo($("[data-prog]"), { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: "power1.inOut" }, t + 0.1).to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.45);
      logs.forEach((l, i) => {
        const a = t + 0.2 + i * 0.26;
        run
          .fromTo(l, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }, a)
          .to($("[data-spin]")[i], { rotation: 360, duration: 0.25, ease: "none" }, a)
          .to($("[data-spin]")[i], { opacity: 0, duration: 0.1 }, a + 0.25)
          .fromTo($("[data-chk]")[i], { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2.5)" }, a + 0.25);
        snd(run, "tick", a + 0.25);
      });
      const done = t + 0.2 + logs.length * 0.26 + 0.2;
      run
        .to($("[data-building]"), { opacity: 0, duration: 0.2 }, done)
        .to($("[data-live]"), { opacity: 1, duration: 0.3 }, done + 0.1)
        .to($("[data-prev]"), { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power3.inOut" }, done)
        .fromTo($("[data-domain]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, done + 0.5);
      snd(run, "success", done);
      $("[data-ring]").forEach((r, i) => {
        run.fromTo(r, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, done + 0.6 + i * 0.1);
        count(run, $("[data-score]")[i], 0, 100, done + 0.6 + i * 0.1, 0.8, (n) => String(Math.round(n)));
      });
    },
  },
  {
    dur: 6,
    node: (
      <Browser>
        <span className="absolute inset-0 block overflow-hidden bg-[#f7f7f4] text-[#111827]">
          <span className="flex items-center justify-between px-6 pt-4 text-[12px]">
            <span className="flex items-center gap-2 font-semibold">
              <span className="h-5 w-5 rounded-[7px] bg-[#1f7fb8]" />
              Studio Bianchi
            </span>
            <span className="flex items-center gap-5 text-[#111827]/55">
              <span data-nav className="relative">
                <Tx>Servizi</Tx>
                <span data-uline className="absolute inset-x-0 -bottom-1 block h-px origin-left bg-[#111827]/60" style={{ transform: "scaleX(0)" }} />
              </span>
              <Tx>Chi siamo</Tx>
              <Tx>Contatti</Tx>
              <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] text-white"><Tx>Prenota</Tx></span>
            </span>
          </span>
          <span className="absolute inset-x-6 bottom-6 top-[68px] grid grid-cols-[1.1fr_1fr] items-center gap-6">
            <span className="block">
              <span className="block text-[26px] font-semibold leading-[1.05] tracking-[-0.03em]">
                <Tx>Il tuo sorriso, in buone mani</Tx>
              </span>
              <span className="mt-3 block space-y-1.5">
                <span className="block h-1.5 w-[84%] rounded-full bg-[#111827]/25" />
                <span className="block h-1.5 w-[62%] rounded-full bg-[#111827]/20" />
              </span>
              <span data-book className="mt-5 inline-flex h-9 items-center rounded-full bg-[#1f7fb8] px-5 text-[12.5px] font-medium text-white">
                <Tx>Prenota una visita</Tx>
              </span>
            </span>
            <span className="relative block h-full max-h-[250px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#9edcff,#3ea4dc_55%,#1f7fb8)]">
              <span className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/20" />
              <span className="absolute -bottom-10 left-6 h-36 w-36 rounded-full bg-white/15" />
            </span>
          </span>
          {/* prenotazione */}
          <span data-veil className="absolute inset-0 block bg-black/35 opacity-0" />
          <span data-modal className="absolute left-1/2 top-1/2 block w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] bg-white p-4 opacity-0 shadow-[0_30px_70px_-20px_rgba(0,0,0,.45)]">
            <span data-form className="block">
              <span className="flex items-center justify-between text-[12.5px] font-semibold">
                <Tx>Novembre 2026</Tx>
                <Ico i={Calendar03Icon} s={15} c="text-[#111827]/50" />
              </span>
              <span className="mt-3 grid grid-cols-7 gap-y-1">
                <Dow />
                {[...Array.from({ length: 6 }, () => -1), ...Array.from({ length: 30 }, (_, k) => k + 1)].map((d, i) => (
                  <span key={i} data-day={d > 0 ? d : undefined} className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10.5px] ${d < 0 ? "" : d <= 10 ? "text-black/25" : ""}`}>
                    {d > 0 ? d : ""}
                  </span>
                ))}
              </span>
              <span data-slots className="mt-3 flex gap-1.5 text-[10.5px]">
                {["9:00", "11:30", "14:30", "17:00"].map((h) => (
                  <span key={h} data-slot={h} className="rounded-full bg-black/[.05] px-2.5 py-1 opacity-0">
                    {h}
                  </span>
                ))}
              </span>
              <span data-confirm className="mt-3 flex h-8 items-center justify-center rounded-full bg-[#1f7fb8] text-[12px] font-medium text-white opacity-30">
                <Tx>Conferma</Tx>
              </span>
            </span>
            <span data-done className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[18px] bg-white opacity-0">
              <Ico i={CheckmarkCircle02Icon} s={34} c="text-[#30d158]" />
              <span className="text-[13px] font-semibold"><Tx>Giovedì 12 novembre</Tx></span>
              <span className="text-[11.5px] text-black/50">14:30</span>
            </span>
          </span>
          {/* notifica al titolare */}
          <span data-notif className="absolute right-4 top-3 block w-[290px] opacity-0">
            <Bead tint="rgba(30,34,40,.94)" radius={18} className="flex items-center gap-3 p-3 pr-4 text-white">
              <Ours size={34} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block text-[12.5px] font-semibold"><Tx>Nuova prenotazione</Tx></span>
                <span className="block truncate text-[11.5px] text-white/65"><Tx>Giulia R. · giovedì alle 14:30</Tx></span>
              </span>
              <span className="text-[10.5px] text-white/45"><Tx>ora</Tx></span>
            </Bead>
          </span>
        </span>
      </Browser>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-nav]")[0], at);
      // passa sul menu, poi va sul pulsante e preme
      let t = human(run, c.cur, () => spot(c.shot, $("[data-nav]")[0], 0.5, 0.5), at + 0.05, 0.5);
      run.to($("[data-uline]"), { scaleX: 1, duration: 0.25, ease: "power2.out" }, t).to($("[data-uline]"), { scaleX: 0, transformOrigin: "right", duration: 0.25 }, t + 0.45);
      t = click(run, c, $("[data-book]")[0], t + 0.3, 0.5);
      run.to($("[data-veil]"), { opacity: 1, duration: 0.3 }, t + 0.05).fromTo($("[data-modal]"), { opacity: 0, scale: 0.92, y: 14 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "expo.out" }, t + 0.05);
      snd(run, "whoosh", t + 0.05);
      // giorno, poi ora, poi conferma: il cursore arriva sempre sul punto giusto
      const day = $('[data-day="12"]')[0];
      t = click(run, c, day, t + 0.55, 0.5);
      run.to(day, { backgroundColor: "#1f7fb8", color: "#fff", duration: 0.15 }, t).fromTo($("[data-slot]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: "expo.out" }, t + 0.1);
      const slot = $('[data-slot="14:30"]')[0];
      t = click(run, c, slot, t + 0.5, 0.4);
      run.to(slot, { backgroundColor: "#1f7fb8", color: "#fff", duration: 0.15 }, t).to($("[data-confirm]"), { opacity: 1, duration: 0.2 }, t);
      t = click(run, c, $("[data-confirm]")[0], t + 0.25, 0.4);
      run
        .to($("[data-done]"), { opacity: 1, duration: 0.3 }, t + 0.05)
        .fromTo($("[data-done] svg"), { scale: 0.3 }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, t + 0.05)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.3)
        .to([$("[data-modal]"), $("[data-veil]")], { opacity: 0, duration: 0.35, ease: "power2.in" }, t + 1)
        .fromTo($("[data-notif]"), { opacity: 0, y: -26, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.6)" }, t + 1.15);
      snd(run, "success", t + 0.05);
      snd(run, "notify", t + 1.2);
    },
  },
];


/* ───────────── SEO ───────────── */

const RESULTS = [
  ["studiobianchi.it", "Studio Bianchi · Dentista a Brescia", "Prenota online in 1 minuto. Orari estesi, anche il sabato."],
  ["clinicarossi.it", "Clinica Dentale Rossi", "Igiene, ortodonzia e implantologia in centro città."],
  ["dentistiassociati.it", "Dentisti Associati", "Visite e preventivi su appuntamento."],
];
const QUERY = "dentista brescia";
/** Il logo di Google in lettere, coi suoi colori. */
const GoogleWord = ({ size }: { size: number }) => (
  <span className="font-medium tracking-[-0.04em]" style={{ fontSize: size, lineHeight: 1 }}>
    {["#4285f4", "#ea4335", "#fbbc05", "#4285f4", "#34a853", "#ea4335"].map((c, i) => (
      <span key={i} style={{ color: c }}>
        {"Google"[i]}
      </span>
    ))}
  </span>
);

export const SEO: Shot[] = [
  {
    dur: 5.6,
    node: (
      <Bead data-full="" tint="rgba(32,33,36,.99)" radius={0} className="relative block h-full w-full overflow-hidden text-[#e8eaed]">
        {/* home di Google */}
        <span data-home className="absolute inset-0 flex flex-col items-center justify-center">
          <span data-word className="block origin-center">
            <GoogleWord size={58} />
          </span>
          <span data-bar className="mt-7 flex h-[46px] w-[min(440px,72%)] items-center gap-3 rounded-full bg-[#303134] px-4 text-[15px] shadow-[inset_0_0_0_1px_#5f6368]">
            <Ico i={Search01Icon} s={17} c="text-[#9aa0a6]" />
            <span data-q className="whitespace-pre" />
            <span data-caret className="-ml-2 h-[18px] w-[1.5px] bg-[#8ab4f8] opacity-0" />
          </span>
          <span data-btns className="mt-6 flex gap-3 text-[13px]">
            <span data-go className="rounded-[6px] bg-[#303134] px-4 py-2">
              <Tx>Cerca con Google</Tx>
            </span>
            <span className="rounded-[6px] bg-[#303134] px-4 py-2">
              <Tx>Mi sento fortunato</Tx>
            </span>
          </span>
        </span>
        {/* risultati */}
        <span data-serp className="absolute inset-0 block px-8 pt-6 opacity-0">
          <span className="flex items-center gap-4 border-b border-white/10 pb-4">
            <GoogleWord size={22} />
            <span className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#303134] px-4 text-[13.5px]">
              <Tx>{QUERY}</Tx>
              <Ico i={Search01Icon} s={15} c="ml-auto text-[#8ab4f8]" />
            </span>
          </span>
          <span className="mt-4 block space-y-4">
            {RESULTS.map(([d, t, sn], i) => (
              <span key={d} data-r className={`block rounded-[14px] px-3 py-2 ${i === 0 ? "bg-[rgba(138,180,248,.1)] shadow-[inset_0_0_0_1px_rgba(138,180,248,.3)]" : ""}`}>
                <span className="flex items-center gap-2 text-[11.5px] text-[#bdc1c6]">
                  <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold ${i === 0 ? "bg-[#5ec4ff] text-[#04121c]" : "bg-white/15"}`}>{t[0]}</span>
                  {d}
                </span>
                <span data-t={i} className="mt-0.5 block text-[16.5px] leading-tight text-[#8ab4f8]">
                  {t}
                </span>
                <span className="mt-0.5 block truncate text-[12.5px] text-[#bdc1c6]">
                  <Tx>{sn}</Tx>
                </span>
              </span>
            ))}
          </span>
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      const cur = $("[data-cursor]")[0];
      const shot = cur.parentElement as HTMLElement;
      const bar = $("[data-bar]")[0];
      const go = $("[data-go]")[0];
      const q = $("[data-q]")[0] as HTMLElement;
      const caret = $("[data-caret]")[0];
      const first = $('[data-t="0"]')[0];
      const word = (document.documentElement.lang === "en" ? EN[QUERY] : undefined) ?? QUERY;
      // stato iniziale, a ogni giro
      run
        .call(() => void (q.textContent = ""), undefined, at - 0.35)
        .set($("[data-home]"), { autoAlpha: 1, y: 0 }, at - 0.35)
        .set($("[data-word]"), { scale: 1, x: 0, y: 0 }, at - 0.35)
        .set($("[data-serp]"), { autoAlpha: 0 }, at - 0.35)
        .set(bar, { boxShadow: "inset 0 0 0 1px #5f6368" }, at - 0.35)
        .set(first, { color: "#8ab4f8", textDecoration: "none" }, at - 0.35)
        .set(cur, { x: () => spot(shot, bar).x + 170, y: () => spot(shot, bar).y + 150, opacity: 0, scale: 1 }, at - 0.35)
        .to(cur, { opacity: 1, duration: 0.2 }, at);
      // 1 · sulla barra, clic
      human(run, cur, () => spot(shot, bar, 0.3, 0.55), at + 0.05, 0.65);
      press(run, cur, bar, at + 0.9);
      run.to(bar, { boxShadow: "inset 0 0 0 1px #8ab4f8, 0 0 0 4px rgba(138,180,248,.18)", duration: 0.2 }, at + 0.9).to(caret, { opacity: 1, duration: 0.01 }, at + 0.95);
      // 2 · scrive, con il ritmo irregolare di una persona
      let t = at + 1.05;
      for (let i = 1; i <= word.length; i++) {
        const sub = word.slice(0, i);
        run.call(() => {
          q.textContent = sub;
          sfx("key");
        }, undefined, t);
        t += word[i - 1] === " " ? 0.1 : 0.04 + ((i * 37) % 5) * 0.01;
      }
      // 3 · al pulsante, clic
      human(run, cur, () => spot(shot, go, 0.55, 0.6), t + 0.1, 0.5);
      press(run, cur, go, t + 0.65);
      snd(run, "send", t + 0.7);
      run.to(caret, { opacity: 0, duration: 0.01 }, t + 0.65);
      // 4 · la pagina dei risultati: il logo vola in alto a sinistra, i risultati arrivano a raffica
      const sw = t + 0.75;
      run
        .to($("[data-btns]"), { autoAlpha: 0, y: 6, duration: 0.2 }, sw)
        .to(bar, { autoAlpha: 0, y: -40, duration: 0.35, ease: "power3.in" }, sw)
        .to($("[data-word]"), { x: () => -spot(shot, $("[data-word]")[0]).x + spot(shot, shot.querySelector("[data-serp] .font-medium") as Element).x, y: () => -spot(shot, $("[data-word]")[0]).y + spot(shot, shot.querySelector("[data-serp] .font-medium") as Element).y, scale: 0.38, duration: 0.5, ease: "expo.inOut" }, sw)
        .set($("[data-home]"), { autoAlpha: 0 }, sw + 0.5)
        .to($("[data-serp]"), { autoAlpha: 1, duration: 0.2 }, sw + 0.42)
        .fromTo($("[data-r]"), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "expo.out" }, sw + 0.48);
      // 5 · il primo risultato è il nostro: il cursore ci va e clicca
      human(run, cur, () => spot(shot, first, 0.35, 0.6), sw + 0.75, 0.55);
      run.to(first, { textDecoration: "underline", duration: 0.01 }, sw + 1.3);
      press(run, cur, first, sw + 1.45);
      run.to(first, { color: "#c58af9", duration: 0.2 }, sw + 1.5).to(cur, { opacity: 0, duration: 0.3 }, sw + 2.1);
    },
  },
  {
    node: (
      <>
        <span className="flex gap-6">
          {[
            ["Prestazioni", 98],
            ["SEO", 100],
            ["Accessibilità", 96],
          ].map(([l, v]) => (
            <span key={l} className="flex flex-col items-center gap-3">
              <span className="relative h-[110px] w-[110px]">
                <svg viewBox="0 0 110 110" className="absolute inset-0 -rotate-90">
                  <circle cx="55" cy="55" r="48" fill="rgba(10,16,24,.5)" stroke="rgba(255,255,255,.1)" strokeWidth="7" />
                  <circle data-ring={v} cx="55" cy="55" r="48" fill="none" stroke={GREEN} strokeWidth="7" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
                </svg>
                <span data-score={v} className="absolute inset-0 flex items-center justify-center font-mono text-[26px] tabular-nums text-white">
                  0
                </span>
              </span>
              <span className="text-[13px] text-white/75"><Tx>{l as string}</Tx></span>
            </span>
          ))}
        </span>
      </>
    ),
    play: (run, $, at) =>
      $("[data-ring]").forEach((r, i) => {
        const v = Number(r.getAttribute("data-ring"));
        run.fromTo(r, { strokeDashoffset: 100 }, { strokeDashoffset: 100 - v, duration: 1.4, ease: "power2.out" }, at + i * 0.15);
        count(run, $("[data-score]")[i], 0, v, at + i * 0.15, 1.4, (n) => String(Math.round(n)));
      }),
  },
  {
    node: (
      <>
        <Bead tint={GL} radius={26} className="block w-[460px] p-5 text-white">
          <span className="flex items-baseline justify-between">
            <span className="text-[14px] text-white/60"><Tx>Visite dalla ricerca</Tx></span>
            <span data-pct className="font-mono text-[22px] tabular-nums text-[#8ff0ad]">
              +0%
            </span>
          </span>
          <svg viewBox="0 0 420 150" className="mt-3 w-full overflow-visible">
            {[30, 70, 110].map((y) => (
              <line key={y} x1="0" x2="420" y1={y} y2={y} stroke="rgba(255,255,255,.07)" />
            ))}
            <path data-area d="M0 132 L60 124 L120 118 L180 104 L240 92 L300 70 L360 46 L420 22 L420 150 L0 150 Z" fill="url(#seo-fill)" opacity="0" />
            <defs>
              <linearGradient id="seo-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={AQUA} stopOpacity=".35" />
                <stop offset="1" stopColor={AQUA} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path data-line d="M0 132 L60 124 L120 118 L180 104 L240 92 L300 70 L360 46 L420 22" fill="none" stroke={AQUA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          </svg>
          <span className="mt-2 flex justify-between font-mono text-[10.5px] text-white/40">
            <Months />
          </span>
        </Bead>
      </>
    ),
    play: (run, $, at) => {
      run.fromTo($("[data-line]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, at).fromTo($("[data-area]"), { opacity: 0 }, { opacity: 1, duration: 1 }, at + 1.2);
      count(run, $("[data-pct]")[0], 0, 142, at, 2, (n) => `+${Math.round(n)}%`);
    },
  },
];

/* ───────────── Visibilità nelle risposte AI: si chiede a Claude, Claude risponde con il tuo nome ───────────── */

const ClaudeUI = "rgba(38,38,36,.97)";
const ASK = "Mi consigli un buon dentista a Brescia?";

export const GEO: Shot[] = [
  {
    dur: 5.2,
    node: (
      <Win tint={ClaudeUI} title={<span>Claude</span>} logo={<Img src={claudeLogo} s={14} />}>
        {/* schermata iniziale */}
        <span data-home className="absolute inset-0 flex flex-col items-center justify-center px-10">
          <span className="flex items-center gap-3">
            <Img src={claudeLogo} s={30} />
            <span className="font-[family-name:var(--font-serif)] text-[34px] leading-none text-[#ece9e1]">
              <Tx>Buonasera, Marco</Tx>
            </span>
          </span>
          <span data-box className="mt-7 block w-full max-w-[470px] rounded-[18px] bg-[#30302e] p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
            <span className="flex min-h-[38px] items-start text-[14.5px] text-[#ece9e1]">
              <span data-q className="whitespace-pre-wrap" />
              <span data-caret className="ml-0.5 mt-0.5 h-[18px] w-[1.5px] bg-[#d97757] opacity-0" />
              <span data-ph className="text-white/35">
                <Tx>Come posso aiutarti oggi?</Tx>
              </span>
            </span>
            <span className="mt-2 flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-[8px] text-white/45 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]">+</span>
              <span data-send className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#d97757] text-white">
                <Ico i={ArrowUp01Icon} s={16} />
              </span>
            </span>
          </span>
        </span>
        {/* conversazione */}
        <span data-chat className="absolute inset-0 block px-7 pt-6 opacity-0">
          <span className="flex justify-end">
            <span className="rounded-[14px] bg-[#30302e] px-3.5 py-2 text-[13.5px] text-[#ece9e1]">
              <Tx>{ASK}</Tx>
            </span>
          </span>
          <span className="mt-5 grid grid-cols-[22px_minmax(0,1fr)] items-start gap-3">
            <span data-think className="mt-1 block">
              <Img src={claudeLogo} s={22} />
            </span>
            <span className="block text-[15px] leading-[1.6] text-[#ece9e1]">
              <Words s="Ti consiglio" />
              <span data-wd className="relative inline-block font-semibold text-white">
                Studio Bianchi
                <span data-mark className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[#5ec4ff]" style={{ transform: "scaleX(0)" }} />
              </span>
              <Words s=", in centro a Brescia: prenotazione online, orari estesi e recensioni molto positive." />
              <span data-wd className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-white/[.07] px-2.5 py-1 text-[11.5px] text-white/70">
                <Ico i={LockKeyIcon} s={11} />
                studiobianchi.it
              </span>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-box]")[0], at);
      run
        .set($("[data-home]"), { autoAlpha: 1, y: 0 }, at - 0.3)
        .set($("[data-chat]"), { autoAlpha: 0 }, at - 0.3)
        .set($("[data-ph]"), { autoAlpha: 1 }, at - 0.3)
        .set($("[data-wd]"), { opacity: 0 }, at - 0.3)
        .set($("[data-mark]"), { scaleX: 0 }, at - 0.3);
      let t = click(run, c, $("[data-box]")[0], at + 0.05, 0.5, 0.35, 0.35);
      run.to($("[data-ph]"), { autoAlpha: 0, duration: 0.05 }, t).to($("[data-caret]"), { opacity: 1, duration: 0.01 }, t);
      t = typeText(run, $("[data-q]")[0], L(ASK), t + 0.1, 1.8);
      t = click(run, c, $("[data-send]")[0], t + 0.05, 0.4);
      run
        .to($("[data-caret]"), { opacity: 0, duration: 0.01 }, t)
        .to($("[data-home]"), { autoAlpha: 0, y: -20, duration: 0.3, ease: "power2.in" }, t + 0.1)
        .fromTo($("[data-chat]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, t + 0.3)
        .fromTo($("[data-think]"), { rotate: 0 }, { rotate: 180, duration: 0.6, ease: "power2.inOut" }, t + 0.35)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.2);
      stream(run, $("[data-wd]"), t + 0.85, 0.035);
      run.to($("[data-mark]"), { scaleX: 1, duration: 0.45, ease: "expo.out" }, t + 1.15);
    },
  },
  {
    say: false,
    dur: 3.4,
    node: (
      <span className="block px-6 text-center text-[42px] font-semibold leading-[1.25] tracking-[-0.045em] text-white">
        <span data-n className="inline-flex items-center gap-2 whitespace-nowrap">
          ChatGPT
          <span data-lg className="inline-flex">
            <Tile size={40} light>
              <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-black" aria-hidden>
                <path d={OPENAI} />
              </svg>
            </Tile>
          </span>
          ,
        </span>{" "}
        <span data-n className="inline-flex items-center gap-2 whitespace-nowrap">
          Gemini
          <span data-lg className="inline-flex">
            <Logo src="/visual/brands/gemini.svg" size={40} />
          </span>
          ,
        </span>
        <br />
        <span data-n className="inline-flex items-center gap-2 whitespace-nowrap">
          Claude
          <span data-lg className="inline-flex">
            <Logo src={claudeLogo} size={40} />
          </span>
        </span>{" "}
        <span data-n className="inline-flex items-center gap-2 whitespace-nowrap">
          <Tx>e</Tx> Perplexity
          <span data-lg className="inline-flex">
            <Logo src="/visual/brands/perplexity.svg" size={40} />
          </span>
          .
        </span>
      </span>
    ),
    play: (run, $, at) =>
      run
        .fromTo($("[data-n]"), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, stagger: 0.16, ease: "expo.out" }, at - 0.3)
        .fromTo($("[data-lg]"), { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, stagger: 0.16, ease: "back.out(2.4)" }, at - 0.1),
  },
  {
    say: false,
    dur: 3.2,
    node: (
      <span className="block px-8 text-center">
        <span className="block text-[46px] font-semibold leading-[1.08] tracking-[-0.05em] text-white">
          <Words s="Sei la loro" attr="data-big" />
          <span data-big className="relative inline-block text-[#8fd8ff]">
            <Tx>prima scelta,</Tx>
            <span data-ul className="absolute -bottom-1 left-0 h-[3px] w-[96%] origin-left rounded-full bg-[#5ec4ff]" style={{ transform: "scaleX(0)" }} />
          </span>
        </span>
        <span className="mt-3 block text-[24px] font-medium tracking-[-0.03em] text-white/70">
          <Words s="quando si parla del tuo settore." attr="data-big" />
        </span>
      </span>
    ),
    play: (run, $, at) =>
      run
        .fromTo($("[data-big]"), { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.06, ease: "expo.out" }, at - 0.3)
        .fromTo($("[data-ul]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, at + 0.5),
  },
];


/* ───────────── App multipiattaforma ───────────── */

const AppUI = () => (
  <span className="flex flex-col gap-2">
    <Bar w="55%" h={9} c="bg-white/80" />
    <span className="mt-1 h-16 rounded-[12px] bg-[linear-gradient(135deg,rgba(94,196,255,.45),rgba(31,127,184,.25))]" />
    {[0, 1, 2].map((k) => (
      <span key={k} className="flex items-center gap-2 rounded-[10px] bg-white/[.06] p-2">
        <span className="h-5 w-5 rounded-[6px] bg-white/20" />
        <Bar w="60%" h={6} />
      </span>
    ))}
  </span>
);
export const APPS: Shot[] = [
  {
    dur: 4.2,
    node: (
      <Phone w={210} h={380}>
        <span data-store className="absolute inset-0 block px-3.5 pt-9">
          <span className="flex gap-3">
            <Ours size={64} />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[14px] font-semibold">Studio Bianchi</span>
              <span className="block text-[10.5px] text-white/55"><Tx>Prenota e gestisci le visite</Tx></span>
              <span data-get className="relative mt-2 flex h-7 w-[64px] items-center justify-center rounded-full bg-[#0a84ff] text-[11.5px] font-semibold text-white">
                <span data-get-l><Tx>Ottieni</Tx></span>
                <svg data-ring viewBox="0 0 28 28" className="absolute h-7 w-7 -rotate-90 opacity-0" aria-hidden>
                  <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2.5" />
                  <circle data-ring-fill cx="14" cy="14" r="11" fill="none" stroke="#fff" strokeWidth="2.5" pathLength={100} strokeDasharray="100" strokeDashoffset="100" strokeLinecap="round" />
                </svg>
                <span data-open className="absolute inset-0 flex items-center justify-center opacity-0"><Tx>Apri</Tx></span>
              </span>
            </span>
          </span>
          <span className="mt-3 flex justify-between border-y border-white/10 py-2 text-center text-[9.5px] text-white/55">
            <span>
              <span className="block text-[12px] font-semibold text-white/85">4,9</span>★★★★★
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-white/85">N. 3</span>
              <Tx>Salute</Tx>
            </span>
            <span>
              <span className="block text-[12px] font-semibold text-white/85">4+</span>
              <Tx>Età</Tx>
            </span>
          </span>
          <span className="mt-3 grid grid-cols-2 gap-2">
            <span className="h-[150px] rounded-[12px] bg-[linear-gradient(160deg,#9edcff,#3ea4dc_55%,#1f7fb8)]" />
            <span className="h-[150px] rounded-[12px] bg-[linear-gradient(160deg,#1f7fb8,#0b2f45)]" />
          </span>
        </span>
        {/* l'app che si apre */}
        <span data-app className="absolute inset-0 block rounded-[23px] bg-[#0f1a24] px-3.5 pt-9 opacity-0">
          <AppUI />
        </span>
      </Phone>
    ),
    play: (run, $, at) => {
      const get = $("[data-get]")[0];
      const c = cursorIn(run, $, get, at);
      run
        .set($("[data-get-l]"), { opacity: 1 }, at - 0.3)
        .set([$("[data-ring]")[0], $("[data-open]")[0], $("[data-app]")[0]], { opacity: 0 }, at - 0.3)
        .set($("[data-ring-fill]"), { strokeDashoffset: 100 }, at - 0.3)
        .set(get, { width: 64 }, at - 0.3);
      let t = click(run, c, get, at + 0.05, 0.5);
      run
        .to($("[data-get-l]"), { opacity: 0, duration: 0.1 }, t)
        .to(get, { width: 28, backgroundColor: "rgba(10,132,255,0)", duration: 0.25, ease: "power2.inOut" }, t)
        .to($("[data-ring]"), { opacity: 1, duration: 0.1 }, t + 0.2)
        .to($("[data-ring-fill]"), { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" }, t + 0.25)
        .to($("[data-ring]"), { opacity: 0, duration: 0.1 }, t + 1.15)
        .to(get, { width: 64, backgroundColor: "rgba(255,255,255,.14)", duration: 0.25, ease: "power2.inOut" }, t + 1.15)
        .to($("[data-open]"), { opacity: 1, duration: 0.15 }, t + 1.3);
      t = click(run, c, get, t + 1.45, 0.25);
      run
        .fromTo($("[data-app]"), { opacity: 0, scale: 0.3, transformOrigin: "20% 15%" }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, t + 0.1)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.2);
    },
  },
  {
    node: (
      <span className="flex gap-3">
        {[
          ["iPhone", <Tile key="i" size={48} light><Brand p={si.siApple} c="h-6 w-6" /></Tile>],
          ["Android", <Logo key="a" src="/visual/brands/android.svg" size={48} />],
          ["Mac", <Tile key="m" size={48} light><Brand p={si.siApple} c="h-6 w-6" /></Tile>],
          ["Windows", <Logo key="w" src="/visual/brands/windows.svg" size={48} pad={0.25} />],
          ["Linux", <Logo key="l" src="/visual/brands/linux.svg" size={48} pad={0.18} />],
        ].map(([n, ic]) => (
          <span key={n as string} data-p>
            <Bead tint={GL} radius={22} className="flex w-[100px] flex-col items-center gap-3 py-5 text-white">
              {ic}
              <span className="text-[13px] font-medium">{n as string}</span>
            </Bead>
          </span>
        ))}
      </span>
    ),
    play: (run, $, at) => enter(run, $("[data-p]"), at, 0.1),
  },
  {
    node: (
      <>
        <span className="relative flex items-center gap-24">
          <Phone w={130} h={250}>
            <span data-note-src className="block rounded-[12px] bg-[rgba(94,196,255,.28)] p-2.5 text-[11px] leading-snug">
              <Tx>Ordine fornitore</Tx>
              <span className="mt-1 block text-white/60"><Tx>da confermare</Tx></span>
            </span>
          </Phone>
          <Browser w={260} h={200} url="app.studiobianchi.it">
            <span className="absolute inset-0 p-3.5">
              <span data-note-dst className="block rounded-[12px] bg-[rgba(94,196,255,.28)] p-2.5 text-[12px] leading-snug opacity-0">
                <Tx>Ordine fornitore</Tx>
                <span className="mt-1 block text-white/60"><Tx>da confermare</Tx></span>
              </span>
            </span>
          </Browser>
          <span data-fly className="absolute left-[30px] top-[60px] w-[100px] rounded-[12px] bg-[rgba(94,196,255,.4)] p-2.5 text-[11px] text-white opacity-0 shadow-[0_10px_30px_-10px_rgba(94,196,255,.8)]">
            <Tx>Ordine fornitore</Tx>
          </span>
        </span>
        <Note attr="data-sync">
          <Ok><Tx>Sincronizzato su tutti i dispositivi</Tx></Ok>
        </Note>
      </>
    ),
    play: (run, $, at) => {
      run
        .fromTo($("[data-fly]"), { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.2 }, at + 0.4)
        .to($("[data-fly]"), { x: 270, y: -10, duration: 1.1, ease: "power3.inOut" }, at + 0.5)
        .to($("[data-fly]"), { opacity: 0, duration: 0.2 }, at + 1.6)
        .fromTo($("[data-note-dst]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 1.55)
;
      grow(run, $("[data-sync]")[0], at + 1.8);
    },
  },
];

/* ───────────── UI/UX: si progetta il percorso, lo si prova, e più persone arrivano in fondo ───────────── */

const Screen = ({ i }: { i: number }) => (
  <span className="flex h-full flex-col gap-1.5 bg-[#f6f6f3] p-2 text-[#111827]">
    <span className="text-[8.5px] font-semibold">{i === 0 ? <Tx>Prenota</Tx> : i === 1 ? <Tx>Scegli l'orario</Tx> : <Tx>Confermato</Tx>}</span>
    {i === 0 && (
      <>
        <span className="h-10 rounded-[5px] bg-[linear-gradient(135deg,#9edcff,#1f7fb8)]" />
        <span className="h-1.5 w-4/5 rounded-full bg-black/15" />
        <span data-p0 className="mt-auto flex h-5 items-center justify-center rounded-full bg-[#1f7fb8] text-[7.5px] font-medium text-white">
          <Tx>Continua</Tx>
        </span>
      </>
    )}
    {i === 1 && (
      <span className="grid grid-cols-2 gap-1">
        {["9:00", "11:30", "14:30", "17:00"].map((h) => (
          <span key={h} data-p1={h} className="rounded-[4px] bg-black/[.06] py-1 text-center text-[7.5px]">
            {h}
          </span>
        ))}
      </span>
    )}
    {i === 2 && (
      <span className="mt-3 flex flex-col items-center gap-1.5 text-[8px]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#30d158] text-white">
          <Ico i={CheckmarkCircle02Icon} s={16} />
        </span>
        <Tx>Ci vediamo giovedì</Tx>
      </span>
    )}
  </span>
);

export const DESIGN: Shot[] = [
  {
    dur: 4.6,
    node: (
      <Win title={<span>Prenotazione — Prototipo</span>} logo={<Img src="/visual/brands/figma.svg" s={14} />}>
        <span className="absolute inset-0 bg-[#1b1d21]">
          <span data-play className="absolute right-3 top-3 z-10 flex h-7 items-center gap-1.5 rounded-[7px] bg-[#0d99ff] px-2.5 text-[11px] font-medium text-white">
            ▶ <Tx>Presenta</Tx>
          </span>
          <svg viewBox="0 0 580 320" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {[
              "M188 180 C220 180 230 150 262 150",
              "M372 150 C404 150 414 180 446 180",
            ].map((d) => (
              <path key={d} data-noodle d={d} fill="none" stroke="#0d99ff" strokeWidth="1.6" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
            ))}
          </svg>
          <span data-frames className="absolute inset-0 block">
            {[0, 1, 2].map((i) => (
              <span key={i} className="absolute block overflow-hidden rounded-[14px] shadow-[0_0_0_1px_rgba(255,255,255,.12),0_10px_30px_-10px_rgba(0,0,0,.6)]" style={{ left: 78 + i * 184, top: 60 + (i % 2 ? -30 : 0), width: 110, height: 220 }}>
                <Screen i={i} />
              </span>
            ))}
          </span>
          {/* modalità presentazione: il prototipo si usa come un'app vera */}
          <span data-player className="absolute left-1/2 top-1/2 block h-[280px] w-[140px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] opacity-0 shadow-[0_0_0_1px_rgba(255,255,255,.18),0_20px_50px_-12px_rgba(0,0,0,.7)]">
            <span data-track className="flex h-full w-[420px]">
              {[0, 1, 2].map((i) => (
                <span key={i} className="block h-full w-[140px]">
                  <Screen i={i} />
                </span>
              ))}
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-play]")[0], at);
      run.fromTo($("[data-noodle]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.2, ease: "power2.inOut" }, at - 0.2);
      let t = click(run, c, $("[data-play]")[0], at + 0.15, 0.45);
      // modalità presentazione: le tavole spariscono, il prototipo si apre al centro e si usa davvero
      const player = $("[data-player]")[0];
      const track = $("[data-track]")[0];
      run
        .set(track, { x: 0 }, at - 0.3)
        .set(player, { autoAlpha: 0, scale: 0.8 }, at - 0.3)
        .set($("[data-frames]"), { autoAlpha: 1, scale: 1 }, at - 0.3)
        .to($("[data-frames]"), { autoAlpha: 0, scale: 0.92, duration: 0.35, ease: "power2.in" }, t + 0.1)
        .to($("[data-noodle]"), { opacity: 0, duration: 0.2 }, t + 0.1)
        .to(player, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "expo.out" }, t + 0.3);
      t = click(run, c, $("[data-player] [data-p0]")[0], t + 0.85, 0.4);
      run.to(track, { x: -140, duration: 0.4, ease: "expo.out" }, t + 0.05);
      const slot = $('[data-player] [data-p1="14:30"]')[0];
      t = click(run, c, slot, t + 0.5, 0.4);
      run
        .to(slot, { backgroundColor: "#1f7fb8", color: "#fff", duration: 0.12 }, t)
        .to(track, { x: -280, duration: 0.4, ease: "expo.out" }, t + 0.25)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.45);
    },
  },
  {
    dur: 3.4,
    node: (
      <Bead tint={GL} radius={26} className="block w-[480px] p-6 text-white">
        <span className="flex items-center justify-between">
          <span className="text-[15px] font-semibold"><Tx>Test con 5 persone vere</Tx></span>
          <span className="font-mono text-[12px] text-white/50"><Tx>prenotare una visita</Tx></span>
        </span>
        <span className="mt-5 flex justify-between">
          {["G", "M", "L", "S", "A"].map((n, i) => (
            <span key={n} data-who className="flex flex-col items-center gap-2">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold" style={{ background: ["#5ec4ff", "#a259ff", "#30d158", "#f5a524", "#ff6b6b"][i] + "33", color: ["#9edcff", "#cfa8ff", "#8ff0ad", "#ffd48a", "#ffb4ae"][i] }}>
                {n}
                <span data-tick className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#30d158] text-white opacity-0">
                  <Ico i={CheckmarkCircle02Icon} s={12} />
                </span>
              </span>
              <span data-sec className="font-mono text-[11px] text-white/55">{[34, 41, 29, 38, 45][i]} s</span>
            </span>
          ))}
        </span>
        <span className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-4 text-[13px]">
          <span className="text-white/60"><Tx>Tempo medio</Tx></span>
          <span className="flex items-baseline gap-3">
            <span className="font-mono text-white/40 line-through">2:40</span>
            <span data-avg className="font-mono text-[22px] text-[#8ff0ad]">0:37</span>
          </span>
        </span>
      </Bead>
    ),
    play: (run, $, at) =>
      run
        .fromTo($("[data-who]"), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "expo.out" }, at - 0.3)
        .fromTo($("[data-tick]"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.18, ease: "back.out(2.6)" }, at + 0.3)
        .fromTo($("[data-avg]"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, at + 1.4),
  },
  {
    dur: 3.2,
    node: (
      <span className="flex w-[520px] flex-col text-white">
        <span className="text-[13px] uppercase tracking-[0.12em] text-white/50"><Tx>Completano la prenotazione</Tx></span>
        <span className="mt-4 grid grid-cols-[70px_1fr_64px] items-center gap-4 text-[13px]">
          <span className="text-white/55"><Tx>Prima</Tx></span>
          <span className="block h-3 overflow-hidden rounded-full bg-white/10">
            <span data-b0 className="block h-full rounded-full bg-white/35" style={{ width: "31%" }} />
          </span>
          <span className="font-mono text-white/60">31%</span>
          <span className="font-medium"><Tx>Dopo</Tx></span>
          <span className="block h-3 overflow-hidden rounded-full bg-white/10">
            <span data-b1 className="block h-full rounded-full bg-[linear-gradient(90deg,#5ec4ff,#9ee4ff)]" style={{ width: "78%" }} />
          </span>
          <span data-pct className="font-mono text-[20px] text-[#8fd8ff]">78%</span>
        </span>
        <span data-x className="mt-6 self-start rounded-full bg-[rgba(94,196,255,.18)] px-4 py-2 text-[15px] font-medium text-[#cdeeff]">
          <Tx>2,5 volte più prenotazioni</Tx>
        </span>
      </span>
    ),
    play: (run, $, at) => {
      run
        .fromTo($("[data-b0]"), { width: "0%" }, { width: "31%", duration: 0.5, ease: "expo.out" }, at - 0.2)
        .fromTo($("[data-b1]"), { width: "0%" }, { width: "78%", duration: 0.9, ease: "expo.out" }, at + 0.15)
        .fromTo($("[data-x]"), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, at + 0.9);
      count(run, $("[data-pct]")[0], 0, 78, at + 0.15, 0.9, (n) => `${Math.round(n)}%`);
    },
  },
];


/* ───────────── AI e sistemi integrati: un compito dato all'agente, che lavora da solo con i tuoi strumenti ───────────── */

const TASK = "Smista le email di oggi, inserisci gli ordini e prepara le risposte";
const Side = () => (
  <span className="block border-r border-white/[.07] p-3 text-[11.5px] text-white/55">
    <span className="mb-3 flex items-center gap-2 text-[12.5px] font-medium text-white/85">
      <Img src={claudeLogo} s={15} />
      Cowork
    </span>
    <span className="block rounded-[8px] bg-white/[.07] px-2 py-1.5 text-white/85">
      <Tx>Nuova attività</Tx>
    </span>
    <span className="mt-3 block px-2 text-[10px] uppercase tracking-[0.08em] text-white/30"><Tx>Recenti</Tx></span>
    {["Report vendite", "Fatture ottobre", "Listino 2026"].map((r) => (
      <span key={r} className="mt-1 block truncate px-2 py-1">
        <Tx>{r}</Tx>
      </span>
    ))}
  </span>
);
const STEPS: [string, string][] = [
  ["/gmail", "Lette 24 email"],
  ["/sheets", "12 ordini inseriti nel gestionale"],
  ["/gmail", "9 risposte preparate"],
  ["!", "3 da controllare a mano"],
];

export const AI: Shot[] = [
  {
    dur: 3.4,
    node: (
      <Win tint={ClaudeUI} title={<span>Cowork</span>} logo={<Img src={claudeLogo} s={14} />}>
        <span className="absolute inset-0 grid grid-cols-[150px_1fr]">
          <Side />
          <span className="flex flex-col items-center justify-center px-8">
            <span className="font-[family-name:var(--font-serif)] text-[28px] text-[#ece9e1]">
              <Tx>Cosa facciamo oggi?</Tx>
            </span>
            <span data-box className="mt-5 block w-full rounded-[16px] bg-[#30302e] p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
              <span className="flex min-h-[44px] items-start text-[13.5px] leading-snug text-[#ece9e1]">
                <span data-q className="whitespace-pre-wrap" />
                <span data-caret className="ml-0.5 mt-0.5 h-[16px] w-[1.5px] bg-[#d97757] opacity-0" />
              </span>
              <span className="mt-2 flex items-center gap-2 text-[11px] text-white/45">
                <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-1">
                  <Brand p={si.siGmail} c="h-3 w-3 text-[#ea4335]" />
                  Gmail
                </span>
                <span className="flex items-center gap-1 rounded-full bg-white/[.06] px-2 py-1">
                  <Brand p={si.siGooglesheets} c="h-3 w-3 text-[#34a853]" />
                  <Tx>Gestionale</Tx>
                </span>
                <span data-send className="ml-auto flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#d97757] text-white">
                  <Ico i={ArrowUp01Icon} s={16} />
                </span>
              </span>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-box]")[0], at);
      let t = click(run, c, $("[data-box]")[0], at + 0.05, 0.45, 0.3, 0.3);
      run.to($("[data-caret]"), { opacity: 1, duration: 0.01 }, t);
      t = typeText(run, $("[data-q]")[0], L(TASK), t + 0.08, 2.4);
      t = click(run, c, $("[data-send]")[0], t + 0.05, 0.35);
      run.to($("[data-caret]"), { opacity: 0, duration: 0.01 }, t).to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.3);
    },
  },
  {
    dur: 3.6,
    node: (
      <Win tint={ClaudeUI} title={<span>Cowork</span>} logo={<Img src={claudeLogo} s={14} />}>
        <span className="absolute inset-0 grid grid-cols-[150px_1fr_150px]">
          <Side />
          <span className="block px-6 pt-5">
            <span className="flex items-center gap-2.5">
              <span data-spin className="block">
                <Img src={claudeLogo} s={20} />
              </span>
              <span className="text-[14px] font-medium text-[#ece9e1]">
                <Tx>Al lavoro sulle email di oggi</Tx>
              </span>
            </span>
            <span className="mt-3 block h-1 overflow-hidden rounded-full bg-white/10">
              <span data-bar className="block h-full w-full origin-left rounded-full bg-[#d97757]" style={{ transform: "scaleX(0)" }} />
            </span>
            <span className="mt-4 block space-y-2">
              {STEPS.map(([k, l]) => (
                <span key={l} data-step className="flex items-center gap-3 rounded-[12px] bg-white/[.05] px-3 py-2.5 text-[13px] text-[#ece9e1] opacity-0">
                  {k === "/gmail" ? <Brand p={si.siGmail} c="h-4 w-4 text-[#ea4335]" /> : k === "/sheets" ? <Brand p={si.siGooglesheets} c="h-4 w-4 text-[#34a853]" /> : <Ico i={Alert02Icon} s={16} c="text-[#f5c46b]" />}
                  <span className="flex-1">
                    <Tx>{l}</Tx>
                  </span>
                  <span data-ok className="opacity-0">
                    <Ico i={CheckmarkCircle02Icon} s={16} c="text-[#6ee7a8]" />
                  </span>
                </span>
              ))}
            </span>
          </span>
          {/* i file prodotti */}
          <span className="block border-l border-white/[.07] p-3 text-[11.5px] text-white/60">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.08em] text-white/30"><Tx>File</Tx></span>
            {[
              [si.siGooglesheets, "#34a853", "ordini.xlsx"],
              [si.siGmail, "#ea4335", "risposte (9)"],
            ].map(([p, col, n]) => (
              <span key={n as string} data-file className="mb-2 flex items-center gap-2 rounded-[10px] bg-white/[.06] p-2 opacity-0">
                <span style={{ color: col as string }}>
                  <Brand p={p as { path: string }} c="h-4 w-4" />
                </span>
                <Tx>{n as string}</Tx>
              </span>
            ))}
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      run
        .fromTo($("[data-spin]"), { rotate: 0 }, { rotate: 360, duration: 2.6, ease: "none" }, at - 0.3)
        .fromTo($("[data-bar]"), { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: "power1.inOut" }, at - 0.2)
        .fromTo($("[data-step]"), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.5, ease: "expo.out" }, at - 0.1)
        .fromTo($("[data-ok]"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.5, ease: "back.out(2.4)" }, at + 0.3)
        .fromTo($("[data-file]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.6, ease: "expo.out" }, at + 0.8);
    },
  },
  {
    dur: 3.4,
    node: (
      <Win tint={ClaudeUI} title={<span>Cowork</span>} logo={<Img src={claudeLogo} s={14} />}>
        <span className="absolute inset-0 grid grid-cols-[150px_1fr]">
          <Side />
          <span className="flex flex-col items-center justify-center px-8 text-[#ece9e1]">
            <span className="flex items-center gap-3 self-stretch rounded-[16px] bg-[#30302e] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
              <Img src={claudeLogo} s={28} />
              <span className="leading-tight">
                <span className="block text-[15px] font-semibold"><Tx>Fatto. 9 risposte pronte</Tx></span>
                <span className="block text-[12px] text-white/55"><Tx>12 ordini già nel gestionale · 3 da guardare tu</Tx></span>
              </span>
            </span>
            <span className="mt-3 grid w-full grid-cols-2 gap-2 text-[13.5px]">
              <span className="flex h-10 items-center justify-center rounded-[10px] bg-white/[.08]"><Tx>Rivedi</Tx></span>
              <span data-go className="flex h-10 items-center justify-center rounded-[10px] bg-[#d97757] font-medium text-white">
                <Tx>Approva e invia</Tx>
              </span>
            </span>
            <span data-done className="mt-4 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/[.07] px-3.5 py-1.5 text-[12.5px] opacity-0">
              <Ok>
                <Tx>Inviate · 2 ore risparmiate oggi</Tx>
              </Ok>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-go]")[0], at);
      const t = click(run, c, $("[data-go]")[0], at + 0.05, 0.5);
      run.fromTo($("[data-done]"), { opacity: 0, y: 8, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, t + 0.15);
      snd(run, "success", t + 0.15);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.5);
    },
  },
];


/* ───────────── Soluzioni hardware ───────────── */

const SPARK = "M0 40 L30 38 L60 41 L90 37 L120 39 L150 36 L180 38 L210 35 L240 37 L270 36 L300 38";
const RISE = "M0 40 L30 38 L60 39 L90 35 L120 31 L150 26 L180 20 L210 15 L240 11 L270 8 L300 5";
const Fridge = ({ hot = false }: { hot?: boolean }) => (
  <Bead tint={GL} radius={26} className="block w-[420px] p-5 text-white">
    <span className="flex items-center gap-3">
      <Tile size={40} tone={hot ? "amber" : "sky"}>
        <Ico i={ThermometerWarmIcon} s={18} />
      </Tile>
      <span className="flex-1 leading-tight">
        <span className="block text-[15px] font-semibold tracking-[-0.02em]"><Tx>Cella frigo 2</Tx></span>
        <span className="block text-[12px] text-white/55"><Tx>Laboratorio · dal vivo</Tx></span>
      </span>
      <span data-temp className={`font-mono text-[26px] tabular-nums ${hot ? "text-[#ffd48a]" : ""}`}>
        3,9°
      </span>
    </span>
    <svg viewBox="0 0 300 50" className="mt-5 w-full overflow-visible">
      <line x1="0" x2="300" y1="16" y2="16" stroke={AMBER} strokeOpacity=".5" strokeDasharray="4 4" />
      <path data-spark d={hot ? RISE : SPARK} fill="none" stroke={hot ? AMBER : AQUA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
    </svg>
  </Bead>
);
export const HW: Shot[] = [
  {
    dur: 6,
    node: (
      <Win title={<span>Cucina · Monitoraggio</span>} logo={<Ours size={16} />}>
        <span className="absolute inset-0 grid grid-cols-[190px_1fr]">
          <span className="block border-r border-white/[.07] p-3">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.08em] text-white/35"><Tx>Impianti</Tx></span>
            {[
              ["Cella frigo 1", "3,8°", false],
              ["Cella frigo 2", "3,9°", true],
              ["Forno", "180°", false],
              ["Compressore", "On", false],
            ].map(([n, v, live]) => (
              <span key={n as string} {...(live ? { "data-dev": "" } : {})} className="mb-1.5 flex items-center gap-2 rounded-[10px] bg-white/[.05] px-2.5 py-2 text-[12px]">
                <span {...(live ? { "data-dot": "" } : {})} className="h-2 w-2 rounded-full bg-[#34d399]" />
                <span className="flex-1"><Tx>{n as string}</Tx></span>
                <span {...(live ? { "data-val": "" } : {})} className="font-mono text-white/70">{v}</span>
              </span>
            ))}
          </span>
          <span className="relative flex min-h-0 flex-col p-5">
            <span className="flex items-center gap-3">
              <Tile size={38}>
                <Ico i={ThermometerWarmIcon} s={17} />
              </Tile>
              <span className="flex-1 leading-tight">
                <span className="block text-[15px] font-semibold tracking-[-0.02em]"><Tx>Cella frigo 2</Tx></span>
                <span className="block text-[11.5px] text-white/50"><Tx>Laboratorio · dal vivo</Tx></span>
              </span>
              <span data-temp className="font-mono text-[28px] tabular-nums">3,9°</span>
            </span>
            <span className="relative mt-4 block min-h-[120px] flex-1 rounded-[14px] bg-black/30 p-3">
              <svg viewBox="0 0 300 50" preserveAspectRatio="none" className="h-full w-full overflow-visible">
                <line x1="0" x2="300" y1="16" y2="16" stroke={AMBER} strokeOpacity=".55" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                <path data-spark d={RISE} fill="none" stroke={AQUA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
            <span data-alert className="mt-4 block overflow-hidden opacity-0">
              <Bead tint="rgba(30,34,40,.7)" radius={18} className="flex items-center gap-3 p-3 pr-3.5 text-white">
                <Tile size={34} tone="amber">
                  <Ico i={Notification01Icon} s={16} />
                </Tile>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] font-semibold"><Tx>Temperatura in aumento</Tx></span>
                  <span className="block truncate text-[11.5px] text-white/65"><Tx>Cella frigo 2 · porta aperta da 6 min</Tx></span>
                </span>
                <span data-ack className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-black"><Tx>Avvisa</Tx></span>
              </Bead>
            </span>
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const hot = "#ffd48a";
      run.fromTo($("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2.4, ease: "power1.in" }, at);
      count(run, $("[data-temp]")[0], 3.9, 7.8, at, 2.4, (n) => `${it(n, 1)}°`);
      run
        .to($("[data-temp]"), { color: hot, duration: 0.4 }, at + 1.5)
        .to($("[data-dot]"), { backgroundColor: AMBER, duration: 0.3 }, at + 1.6)
        .to($("[data-spark]"), { stroke: AMBER, duration: 0.4 }, at + 1.5)
        .call(() => void ($("[data-val]")[0].textContent = "7,8°"), undefined, at + 2.4)
        .fromTo($("[data-alert]"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }, at + 1.9);
      snd(run, "notify", at + 1.9);
      const c = cursorIn(run, $, $("[data-ack]")[0], at + 2.6);
      const t = click(run, c, $("[data-ack]")[0], at + 2.65, 0.5);
      run
        .call(() => void ($("[data-ack]")[0].textContent = L("Avvisato")), undefined, t + 0.05)
        .to($("[data-ack]"), { backgroundColor: "#6ee7a8", duration: 0.2 }, t + 0.05)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.4);
      snd(run, "success", t + 0.1);
    },
  },
  {
    node: (
      <Phone w={210} h={340}>
        <span className="block text-[15px] font-semibold"><Tx>Impianti</Tx></span>
        <span className="mb-3 block text-[11px] text-white/50"><Tx>Tutto regolare</Tx></span>
        <span className="block space-y-2">
          {[
            ["Cella frigo 1", "3,8°"],
            ["Cella frigo 2", "4,0°"],
            ["Forno", "180°"],
            ["Compressore", "On"],
          ].map(([n, v]) => (
            <span key={n} data-row className="flex items-center gap-2 rounded-[12px] bg-white/[.07] px-3 py-2.5 text-[12px]">
              <span className="h-2 w-2 rounded-full bg-[#34d399]" />
              <span className="flex-1"><Tx>{n}</Tx></span>
              <span className="font-mono text-white/70">{v}</span>
            </span>
          ))}
        </span>
      </Phone>
    ),
    play: (run, $, at) => enter(run, $("[data-row]"), at, 0.15),
  },
];

/* ───────────── Integrazioni: il nostro software al centro, collegato a tutti gli strumenti che usi già ───────────── */

const TOOLS: { n: string; p?: { path: string; hex: string }; src?: string }[] = [
  { n: "Shopify", p: si.siShopify },
  { n: "Stripe", p: si.siStripe },
  { n: "Gmail", p: si.siGmail },
  { n: "WhatsApp", p: si.siWhatsapp },
  { n: "Zendesk", p: si.siZendesk },
  { n: "Sheets", p: si.siGooglesheets },
  { n: "HubSpot", p: si.siHubspot },
  { n: "Slack", src: "/visual/brands/slack.svg" },
];
const HUB = { x: 310, y: 92 };
const toolPos = (i: number) => ({ x: 52 + i * 73, y: 300 });
const ToolTile = ({ t, size = 52 }: { t: (typeof TOOLS)[number]; size?: number }) =>
  t.src ? (
    <Logo src={t.src} size={size} pad={0.24} />
  ) : (
    <Tile size={size} light>
      <span style={{ color: `#${t.p!.hex}` }}>
        <Brand p={t.p!} c="h-6 w-6" />
      </span>
    </Tile>
  );

const EVENTS: [number, string, string][] = [
  [0, "Shopify", "Nuovo ordine #1042 · 89,00 €"],
  [1, "Stripe", "Pagamento ricevuto"],
  [5, "Gestionale", "Fattura FT-1042 creata e scorte aggiornate"],
  [3, "WhatsApp", "Conferma inviata al cliente"],
  [4, "Zendesk", "Richiesta del cliente chiusa"],
];

export const API: Shot[] = [
  {
    dur: 3.8,
    node: (
      <span className="relative block h-[380px] w-[620px]">
        <svg viewBox="0 0 620 380" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {TOOLS.map((_, i) => {
            const p = toolPos(i);
            const d = `M${HUB.x} ${HUB.y + 46} C${HUB.x} ${HUB.y + 130} ${p.x} ${p.y - 110} ${p.x} ${p.y - 30}`;
            return (
              <g key={i}>
                <path data-wire d={d} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.4" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
                <path data-pulse d={d} fill="none" stroke="#9ee4ff" strokeWidth="2.6" strokeLinecap="round" pathLength={100} strokeDasharray="6 200" strokeDashoffset="6" opacity="0" />
              </g>
            );
          })}
        </svg>
        <span data-hub className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: HUB.x, top: HUB.y }}>
          <Ours />
        </span>
        <span data-hubl className="absolute -translate-x-1/2 text-center text-[13px] font-medium text-white" style={{ left: HUB.x, top: HUB.y + 56 }}>
          <Tx>Il tuo gestionale</Tx>
        </span>
        {TOOLS.map((t, i) => {
          const p = toolPos(i);
          return (
            <span key={t.n} data-tool className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5" style={{ left: p.x, top: p.y }}>
              <ToolTile t={t} />
              <span className="text-[11px] text-white/70">{t.n}</span>
            </span>
          );
        })}
      </span>
    ),
    play: (run, $, at) => {
      run
        .fromTo($("[data-hub]"), { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, at - 0.3)
        .fromTo($("[data-hubl]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, at)
        .fromTo($("[data-tool]"), { scale: 0.4, opacity: 0, y: 16 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "back.out(2)" }, at - 0.1)
        .fromTo($("[data-wire]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.04, ease: "power2.out" }, at + 0.2);
      // dati che vanno e vengono, di continuo
      const pulses = $("[data-pulse]");
      for (let k = 0; k < 14; k++) {
        const el = pulses[(k * 3) % pulses.length];
        const s = at + 0.8 + k * 0.17;
        const up = k % 2 === 0;
        run
          .set(el, { opacity: 1 }, s)
          .fromTo(el, { strokeDashoffset: up ? -100 : 6 }, { strokeDashoffset: up ? 6 : -100, duration: 0.55, ease: "power1.inOut", immediateRender: false }, s)
          .set(el, { opacity: 0 }, s + 0.56);
      }
    },
  },
  {
    dur: 3.8,
    node: (
      <span className="grid w-[600px] grid-cols-[150px_1fr] items-center gap-6">
        <span className="flex flex-col items-center gap-3">
          <span data-hub2>
            <Ours size={104} />
          </span>
          <span className="text-[13px] font-medium text-white"><Tx>Il tuo gestionale</Tx></span>
        </span>
        <span className="block space-y-2">
          {EVENTS.map(([ti, n, e]) => (
            <span key={e} data-ev className="block">
              <Bead tint={GL} radius={16} className="flex items-center gap-3 p-2.5 pr-3.5 text-white">
                {n === "Gestionale" ? (
                  <Tile size={34}>
                    <Ico i={Invoice01Icon} s={16} />
                  </Tile>
                ) : (
                  <ToolTile t={TOOLS[ti]} size={34} />
                )}
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[11px] text-white/50">{n === "Gestionale" ? <Tx>Gestionale</Tx> : n}</span>
                  <span className="block truncate text-[13px]">
                    <Tx>{e}</Tx>
                  </span>
                </span>
                <Ico i={CheckmarkCircle02Icon} s={15} c="text-[#6ee7a8]" />
              </Bead>
            </span>
          ))}
        </span>
      </span>
    ),
    play: (run, $, at) => {
      run.fromTo($("[data-ev]"), { opacity: 0, x: 24, scale: 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.4, stagger: 0.42, ease: "expo.out" }, at - 0.2);
      $("[data-ev]").forEach((_, i) => run.to($("[data-hub2]"), { scale: 1.06, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out" }, at - 0.15 + i * 0.42));
    },
  },
  {
    dur: 3,
    node: (
      <span className="flex flex-col items-center text-white">
        <span className="text-[13px] uppercase tracking-[0.12em] text-white/50"><Tx>Ore risparmiate ogni mese</Tx></span>
        <span data-h className="mt-2 font-mono text-[110px] leading-none tabular-nums tracking-[-0.04em]">
          0
        </span>
        <Note attr="data-n2">
          <Ok>
            <Tx>Nessun dato ricopiato a mano</Tx>
          </Ok>
        </Note>
      </span>
    ),
    play: (run, $, at) => {
      count(run, $("[data-h]")[0], 0, 32, at - 0.2, 1.1, (n) => String(Math.round(n)));
      grow(run, $("[data-n2]")[0], at + 0.8);
    },
  },
];


/* ───────────── Negozi online ───────────── */

export const SHOP: Shot[] = [
  {
    dur: 6,
    node: (
      <Browser url="oliobianchi.it">
        <span className="absolute inset-0 block overflow-hidden bg-[#f7f7f4] text-[#111827]">
          <span className="flex items-center justify-between px-6 pt-4 text-[12px]">
            <span className="flex items-center gap-2 font-semibold">
              <span className="h-5 w-5 rounded-full bg-[#1f7fb8]" />
              Olio Bianchi
            </span>
            <span data-cartbtn className="relative flex h-8 w-8 items-center justify-center rounded-full bg-black/[.06]">
              <Ico i={ShoppingCart01Icon} s={16} />
              <span data-badge className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#30d158] px-1 font-mono text-[9.5px] font-semibold text-white opacity-0">
                1
              </span>
            </span>
          </span>
          <span className="absolute inset-x-6 bottom-6 top-[64px] grid grid-cols-[1fr_1fr] items-center gap-6">
            <span className="block h-full max-h-[270px] rounded-[18px] bg-[radial-gradient(circle_at_35%_30%,#fff3c6,#e3b94f_45%,#9a7b1f)]" />
            <span className="block">
              <span className="block text-[20px] font-semibold tracking-[-0.02em]"><Tx>Olio extravergine</Tx></span>
              <span className="mt-1 block font-mono text-[15px]">18,00 €</span>
              <span className="mt-3 block space-y-1.5">
                <span className="block h-1.5 w-[80%] rounded-full bg-[#111827]/20" />
                <span className="block h-1.5 w-[58%] rounded-full bg-[#111827]/15" />
              </span>
              <span data-add className="mt-5 flex h-10 items-center justify-center gap-2 rounded-full bg-[#111827] text-[13px] font-medium text-white">
                <Ico i={ShoppingCart01Icon} s={15} />
                <Tx>Aggiungi al carrello</Tx>
              </span>
            </span>
          </span>
          <span data-veil className="absolute inset-0 block bg-black/30 opacity-0" />
          {/* carrello */}
          <span data-drawer className="absolute bottom-0 right-0 top-0 flex w-[260px] translate-x-[105%] flex-col bg-white p-4 shadow-[-20px_0_50px_-20px_rgba(0,0,0,.35)]">
            <span className="flex items-baseline justify-between">
              <span className="text-[13px] font-semibold"><Tx>Totale</Tx></span>
              <span className="font-mono text-[18px]">23,90 €</span>
            </span>
            <span className="mt-1 block text-[11px] text-black/45"><Tx>Spedizione inclusa · arriva giovedì</Tx></span>
            <span className="mt-4 flex items-center gap-2.5 rounded-[12px] bg-black/[.04] p-2">
              <span className="h-10 w-10 rounded-[8px] bg-[radial-gradient(circle_at_35%_30%,#fff3c6,#e3b94f_60%,#9a7b1f)]" />
              <span className="flex-1 text-[12px]"><Tx>Olio extravergine</Tx></span>
              <span className="font-mono text-[11.5px] text-black/55">18,00 €</span>
            </span>
            <span data-pay className="mt-auto flex h-11 items-center justify-center rounded-full bg-black text-white">
              <Brand p={si.siApplepay} c="h-10 w-10" />
            </span>
            <span className="mt-2 flex items-center justify-center gap-1.5 text-[10.5px] text-black/45">
              <Ico i={LockKeyIcon} s={11} />
              <Tx>Pagamento protetto</Tx>
            </span>
            <span data-paid className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white opacity-0">
              <Ico i={CheckmarkCircle02Icon} s={36} c="text-[#30d158]" />
              <span className="text-[13px] font-semibold"><Tx>Pagamento riuscito</Tx></span>
            </span>
          </span>
        </span>
      </Browser>
    ),
    play: (run, $, at) => {
      const c = cursorIn(run, $, $("[data-add]")[0], at);
      let t = click(run, c, $("[data-add]")[0], at + 0.05, 0.5);
      run.fromTo($("[data-badge]"), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.6)" }, t + 0.05);
      snd(run, "tick", t + 0.05);
      t = click(run, c, $("[data-cartbtn]")[0], t + 0.35, 0.45);
      run.to($("[data-veil]"), { opacity: 1, duration: 0.3 }, t + 0.05).fromTo($("[data-drawer]"), { xPercent: 105 }, { xPercent: 0, duration: 0.5, ease: "expo.out" }, t + 0.05);
      snd(run, "whoosh", t + 0.05);
      t = click(run, c, $("[data-pay]")[0], t + 0.5, 0.5);
      run.to($("[data-paid]"), { opacity: 1, duration: 0.3 }, t + 0.1).fromTo($("[data-paid] svg"), { scale: 0.3 }, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, t + 0.1).to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.4);
      snd(run, "success", t + 0.1);
    },
  },
  {
    dur: 4.2,
    node: (
      <Win title={<span>Ordini</span>} logo={<Ours size={16} />}>
        <span className="absolute inset-0 flex flex-col p-5">
          <span className="flex items-baseline justify-between pb-3 text-[13px] text-white/60">
            <span className="text-[16px] font-semibold tracking-[-0.02em] text-white"><Tx>Ordini di oggi</Tx></span>
            <span className="flex items-center gap-1.5">
              <Tx>Olio extravergine ·</Tx>
              <span data-stock className="font-mono tabular-nums text-white">11</span>
              <Tx>disponibili</Tx>
            </span>
          </span>
          <span className="block space-y-2">
            <span data-new className="flex items-center gap-3 rounded-[14px] bg-[rgba(94,196,255,.16)] px-3.5 py-3 text-[13.5px] opacity-0">
              <span className="font-mono text-white/60">#2048</span>
              <span className="flex-1"><Tx>Giulia R. · 2 articoli</Tx></span>
              <span className="rounded-full bg-[rgba(110,231,168,.18)] px-2.5 py-0.5 text-[11.5px] text-[#8ff0ad]"><Tx>Pagato</Tx></span>
            </span>
            {[
              ["#2047", "Marco B. · 1 articolo", "Spedito"],
              ["#2046", "Elena T. · 3 articoli", "Consegnato"],
            ].map(([n, c, s]) => (
              <span key={n} className="flex items-center gap-3 rounded-[14px] bg-white/[.06] px-3.5 py-3 text-[13.5px]">
                <span className="font-mono text-white/60">{n}</span>
                <span className="flex-1"><Tx>{c}</Tx></span>
                <span className="text-[11.5px] text-white/55"><Tx>{s}</Tx></span>
              </span>
            ))}
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      run.fromTo($("[data-new]"), { autoAlpha: 0, y: -18, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" }, at + 0.2);
      snd(run, "notify", at + 0.25);
      count(run, $("[data-stock]")[0], 11, 10, at + 0.7, 0.2, (n) => String(Math.round(n)));
      run.fromTo($("[data-stock]"), { color: "#fff" }, { color: AMBER, duration: 0.3, yoyo: true, repeat: 1 }, at + 0.7);
    },
  },
];
