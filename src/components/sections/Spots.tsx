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

type Q = (s: string) => Element[];
export type Shot = { node: ReactNode; play?: (run: gsap.core.Timeline, $: Q, at: number) => void; dur?: number };

const W = 620;
const EN: Record<string, string> = {"Prenota": "Book", "Caricamento": "Load time", "Avviso in homepage": "Homepage notice", "Modifica · bozza": "Edit · draft", "Chiusi il 25 e 26 dicembre": "Closed on 25 and 26 December", "Pubblica sul sito": "Publish on the site", "Online in tutto il sito": "Live across the site", "dentista a brescia": "dentist in brescia", "Prestazioni": "Performance", "Accessibilità": "Accessibility", "Visite dalla ricerca": "Visits from search", "Un buon dentista a Brescia?": "A good dentist in Brescia?", "Sto cercando le fonti migliori…": "Looking for the best sources…", "Risposta": "Answer", "Ti consiglio": "I’d recommend", ", in centro a Brescia:": ", in central Brescia:", "orari estesi, prenotazione online e recensioni molto positive.": "long opening hours, online booking and great reviews.", "Ti cita": "Cites you", "Ordine fornitore": "Supplier order", "da confermare": "to confirm", "Sincronizzato su tutti i dispositivi": "Synced on every device", "Prenota la visita": "Book a visit", "Scegli giorno e ora, ti confermiamo subito.": "Pick a day and time, confirmed instantly.", "Continua": "Continue", "Test con 5 persone": "Tested with 5 people", "Riescono a prenotare da sole?": "Can they book on their own?", "Trova il servizio": "Finds the service", "Sceglie giorno e ora": "Picks a day and time", "Conferma la visita": "Confirms the visit", "Colori": "Colour", "Testo": "Type", "Titolo · Corpo · Nota": "Title · Body · Note", "Componenti": "Components", "Annulla": "Cancel", "Posta in arrivo": "Inbox", "Ordine 40 pz. articolo 118": "Order: 40 pcs of item 118", "Fattura di ottobre": "October invoice", "Non riesco ad accedere": "I can’t log in", "Disponibilità per martedì?": "Available on Tuesday?", "Ordini": "Orders", "Fatture": "Invoices", "Assistenza": "Support", "Letto e smistato": "Read and sorted", "bozza pronta": "draft ready", "4 risposte pronte": "4 replies ready", "Le invio?": "Send them?", "Rivedi": "Review", "Approva": "Approve", "Inviate · 2 ore risparmiate oggi": "Sent · 2 hours saved today", "Cella frigo 2": "Cold room 2", "Laboratorio · dal vivo": "Kitchen · live", "Temperatura in aumento": "Temperature rising", "Cella frigo 2 · porta aperta da 6 min": "Cold room 2 · door open for 6 min", "Impianti": "Equipment", "Tutto regolare": "All normal", "Cella frigo 1": "Cold room 1", "Forno": "Oven", "Compressore": "Compressor", "Negozio": "Shop", "Gestionale": "ERP", "Pagato · 3 articoli": "Paid · 3 items", "Fattura FT-1042": "Invoice FT-1042", "Emessa e inviata": "Issued and sent", "Magazzino": "Stock", "Scorte aggiornate": "Stock updated", "Ordine #1042": "Order #1042", "Ore risparmiate ogni mese": "Hours saved every month", "Nessun dato ricopiato a mano": "No data retyped by hand", "Olio extravergine": "Extra virgin olive oil", "Aggiungi al carrello": "Add to cart", "Totale": "Total", "Spedizione inclusa · arriva giovedì": "Shipping included · arrives Thursday", "Paga": "Pay", "Pagamento protetto": "Secure payment", "Pagamento riuscito": "Payment successful", "Ordini di oggi": "Today’s orders", "disponibili": "in stock", "Giulia R. · 2 articoli": "Giulia R. · 2 items", "Spedito": "Shipped", "Consegnato": "Delivered", "Marco B. · 1 articolo": "Marco B. · 1 item", "Elena T. · 3 articoli": "Elena T. · 3 items", "Pagato": "Paid", "Olio extravergine ·": "Extra virgin olive oil ·", "Carta": "Card", "Igiene, ortodonzia e implantologia in centro città.": "Hygiene, orthodontics and implants in the city centre.", "Prenota online, orari estesi, anche il sabato.": "Book online, long hours, Saturdays too.", "Visite e preventivi su appuntamento.": "Visits and quotes by appointment."};
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
        shots.forEach((s, i) => {
          const el = els[i];
          const $: Q = (sel) => Array.from(el.querySelectorAll(sel));
          if (says[i]) addSay(run, says[i], scrim, zoom, at, 1.5);
          const st = at + (says[i] ? 2.3 : 0);
          const dur = s.dur ?? 4.6;
          run.fromTo(el, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", immediateRender: false }, st);
          s.play?.(run, $, st + 0.35);
          run.to(el, { autoAlpha: 0, y: -8, duration: 0.4, ease: "power2.in" }, st + dur);
          at = st + dur + 0.35;
        });
        const end = addEnd(run, q, at);
        run.to({}, { duration: 0.01 }, end + 0.4);
        return tl.add(run, 0.2);
      }}
    >
      {shots.map((s, i) => (
        <div key={i} data-shot className="invisible absolute inset-0 flex flex-col items-center justify-center">
          {s.node}
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
  <span {...{ [attr]: "" }} className="mt-6 inline-flex">
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
const it = (n: number, d = 0) => n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d });
const enter = (run: gsap.core.Timeline, els: Element[], at: number, stagger = 0.12) => run.fromTo(els, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger, ease: "expo.out" }, at);

/** Finestra del browser in vetro: barra con i tre pallini e l'indirizzo. */
const Browser = ({ w = 440, h = 270, url = "studiobianchi.it", children }: { w?: number; h?: number; url?: string; children: ReactNode }) => (
  <Bead tint={GL} radius={18} className="flex flex-col overflow-hidden text-white" style={{ width: w, height: h }}>
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

/* ───────────── Siti e web app ───────────── */

export const WEB: Shot[] = [
  {
    node: (
      <>
        <Browser>
          <span className="absolute inset-0 flex flex-col gap-3 p-5">
            <span data-b className="flex items-center justify-between">
              <Bar w={70} c="bg-white/50" />
              <span className="flex gap-2">
                <Bar w={28} />
                <Bar w={28} />
                <Bar w={28} />
              </span>
            </span>
            <span data-b className="mt-3 space-y-2">
              <Bar w="72%" h={14} c="bg-white/80" />
              <Bar w="48%" h={14} c="bg-white/80" />
            </span>
            <span data-b>
              <span className="inline-flex h-7 items-center rounded-full bg-[#5ec4ff] px-4 text-[11px] font-medium text-[#04121c]"><Tx>Prenota</Tx></span>
            </span>
            <span data-b className="mt-auto grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((k) => (
                <span key={k} className="h-14 rounded-[10px] bg-white/[.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" />
              ))}
            </span>
          </span>
        </Browser>
      </>
    ),
    play: (run, $, at) => enter(run, $("[data-b]"), at, 0.28),
  },
  {
    node: (
      <>
        <span className="flex items-end gap-5">
          <Browser w={300} h={196}>
            <span className="absolute inset-0 flex flex-col gap-2 p-4">
              <Bar w="70%" h={10} c="bg-white/75" />
              <Bar w="45%" h={10} c="bg-white/75" />
              <span className="mt-auto grid grid-cols-3 gap-2">
                {[0, 1, 2].map((k) => (
                  <span key={k} className="h-10 rounded-[8px] bg-white/[.08]" />
                ))}
              </span>
            </span>
          </Browser>
          <span data-dev>
            <Phone w={104} h={196}>
              <span className="flex flex-col gap-1.5">
                <Bar w="90%" h={8} c="bg-white/75" />
                <Bar w="60%" h={8} c="bg-white/75" />
                <span className="mt-3 h-10 rounded-[8px] bg-white/[.08]" />
                <span className="h-10 rounded-[8px] bg-white/[.08]" />
              </span>
            </Phone>
          </span>
        </span>
        <Note>
          <Ico i={SparklesIcon} s={14} c="text-[#8fd8ff]" />
          <span className="text-white/60"><Tx>Caricamento</Tx></span>
          <span data-load className="font-mono tabular-nums">0,0 s</span>
        </Note>
      </>
    ),
    play: (run, $, at) => {
      enter(run, $("[data-dev]"), at + 0.2);
      count(run, $("[data-load]")[0], 0, 0.8, at + 0.4, 1.4, (n) => `${it(n, 1)} s`);
    },
  },
  {
    node: (
      <>
        <Bead tint={GL} radius={24} className="block w-[400px] p-5 text-white">
          <span className="flex items-center gap-3">
            <Tile size={40}>
              <Ico i={Edit02Icon} s={18} />
            </Tile>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-[-0.02em]"><Tx>Avviso in homepage</Tx></span>
              <span className="block text-[12px] text-white/55"><Tx>Modifica · bozza</Tx></span>
            </span>
          </span>
          <span className="mt-4 flex h-11 items-center rounded-[12px] bg-black/30 px-3.5 text-[14px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]">
            <span data-type className="whitespace-nowrap">
              <Tx>Chiusi il 25 e 26 dicembre</Tx>
            </span>
            <span data-caret className="ml-0.5 h-4 w-[2px] bg-[#8fd8ff]" />
          </span>
          <span className="mt-4 flex items-center justify-between text-[13px]">
            <span className="text-white/65"><Tx>Pubblica sul sito</Tx></span>
            <span data-sw className="relative h-6 w-10 rounded-full bg-white/15 transition-colors">
              <span data-knob className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
            </span>
          </span>
        </Bead>
        <Note attr="data-pub">
          <Ok><Tx>Online in tutto il sito</Tx></Ok>
        </Note>
      </>
    ),
    play: (run, $, at) => {
      typeIn(run, $("[data-type]")[0], at + 0.2, 1.3);
      run
        .to($("[data-caret]"), { opacity: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.2 }, at)
        .to($("[data-knob]"), { x: 16, duration: 0.35, ease: "power3.out" }, at + 2)
        .to($("[data-sw]"), { backgroundColor: "#30d158", duration: 0.3 }, at + 2)
        .fromTo($("[data-pub]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 2.4);
    },
  },
];

/* ───────────── SEO ───────────── */

const RESULTS = [
  ["clinicarossi.it", "Clinica Dentale Rossi", "Igiene, ortodonzia e implantologia in centro città."],
  ["studiobianchi.it", "Studio Bianchi · Dentista a Brescia", "Prenota online, orari estesi, anche il sabato."],
  ["dentistiassociati.it", "Dentisti Associati", "Visite e preventivi su appuntamento."],
];
export const SEO: Shot[] = [
  {
    node: (
      <span className="w-[460px]">
        <Bead tint="rgba(255,255,255,.94)" radius={26} className="flex h-[52px] items-center gap-3 px-4 text-[16px] text-[#1f1f1f]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/visual/brands/google.svg" alt="" className="h-5 w-5" draggable={false} />
          <span data-type className="whitespace-nowrap">
            <Tx>dentista a brescia</Tx>
          </span>
          <Ico i={Search01Icon} s={18} c="ml-auto text-[#4285f4]" />
        </Bead>
        <span className="relative mt-5 block h-[222px] px-2">
          {RESULTS.map(([d, t, sn], i) => (
            <span key={d} data-r={i} className="absolute inset-x-2 block" style={{ top: i * 74 }}>
              <span className="flex items-center gap-2 text-[11.5px] text-white/55">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${i === 1 ? "bg-[#5ec4ff] text-[#04121c]" : "bg-white/15 text-white/80"}`}>{t[0]}</span>
                {d}
              </span>
              <span className={`mt-1 block text-[16px] leading-tight ${i === 1 ? "font-medium text-[#8fd8ff]" : "text-[#b9d4ff]"}`}>{t}</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-white/55">
                <Tx>{sn}</Tx>
              </span>
            </span>
          ))}
        </span>
      </span>
    ),
    play: (run, $, at) => {
      typeIn(run, $("[data-type]")[0], at, 1);
      enter(run, $("[data-r]"), at + 1.2, 0.12);
      run.to($('[data-r="1"]'), { y: -74, duration: 0.9, ease: "power3.inOut" }, at + 2.5).to($('[data-r="0"]'), { y: 74, duration: 0.9, ease: "power3.inOut" }, at + 2.5);
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

/* ───────────── Visibilità nelle risposte AI ───────────── */

export const GEO: Shot[] = [
  {
    node: (
      <span className="flex w-[440px] flex-col items-end gap-3">
        <Bead tint="rgba(94,196,255,.32)" radius={22} className="block max-w-[320px] px-4 py-3 text-[15px] text-white">
          <span data-type className="block whitespace-nowrap">
            <Tx>Un buon dentista a Brescia?</Tx>
          </span>
        </Bead>
        <span data-think className="flex items-center gap-2 self-start text-[13px] text-white/55">
          <Ico i={SparklesIcon} s={15} c="text-[#8fd8ff]" />
          <Tx>Sto cercando le fonti migliori…</Tx>
        </span>
      </span>
    ),
    play: (run, $, at) => {
      typeIn(run, $("[data-type]")[0], at, 1.1);
      enter(run, $("[data-think]"), at + 1.5);
    },
  },
  {
    node: (
      <Bead tint={GL} radius={26} className="block w-[460px] p-5 text-white">
        <span className="flex items-center gap-2 text-[12.5px] text-white/55">
          <Ico i={AiChat02Icon} s={16} c="text-[#8fd8ff]" />
          <Tx>Risposta</Tx>
        </span>
        <span className="mt-3 block space-y-2 text-[14.5px] leading-[1.55]">
          <span data-l className="block">
            <Tx>Ti consiglio</Tx> <span className="rounded-[6px] bg-[rgba(94,196,255,.22)] px-1.5 py-0.5 font-semibold text-[#cdeeff]">Studio Bianchi</span><Tx>, in centro a Brescia:</Tx>
          </span>
          <span data-l className="block text-white/75"><Tx>orari estesi, prenotazione online e recensioni molto positive.</Tx></span>
        </span>
        <span data-l className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/[.07] px-2.5 py-1 text-[11.5px] text-white/65">
          <Ico i={LockKeyIcon} s={11} />
          studiobianchi.it
        </span>
      </Bead>
    ),
    play: (run, $, at) => enter(run, $("[data-l]"), at, 0.4),
  },
  {
    node: (
      <>
        <span className="flex gap-3">
          {[
            ["ChatGPT", <Tile key="o" size={46} light><svg viewBox="0 0 24 24" className="h-6 w-6 fill-black" aria-hidden><path d={OPENAI} /></svg></Tile>],
            ["Gemini", <Logo key="g" src="/visual/brands/gemini.svg" size={46} />],
            ["Claude", <Logo key="c" src="/visual/brands/claude.svg" size={46} />],
            ["Perplexity", <Logo key="p" src="/visual/brands/perplexity.svg" size={46} />],
          ].map(([n, logo]) => (
            <span key={n as string} data-ai>
              <Bead tint={GL} radius={22} className="flex w-[118px] flex-col items-center gap-3 py-5 text-white">
                {logo}
                <span className="text-[13.5px] font-medium">{n as string}</span>
                <span data-cite className="flex items-center gap-1 text-[11.5px] text-[#8ff0ad] opacity-0">
                  <Ico i={CheckmarkCircle02Icon} s={12} />
                  <Tx>Ti cita</Tx>
                </span>
              </Bead>
            </span>
          ))}
        </span>
      </>
    ),
    play: (run, $, at) => {
      enter(run, $("[data-ai]"), at, 0.12);
      run.to($("[data-cite]"), { opacity: 1, duration: 0.4, stagger: 0.3 }, at + 0.9);
    },
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
    node: (
      <span className="flex items-end gap-6">
        <span data-d>
          <Phone>
            <AppUI />
          </Phone>
        </span>
        <span data-d>
          <Browser w={330} h={220} url="app.studiobianchi.it">
            <span className="absolute inset-0 grid grid-cols-[90px_1fr] gap-3 p-3.5">
              <span className="space-y-2 rounded-[10px] bg-white/[.05] p-2.5">
                {[0, 1, 2, 3].map((k) => (
                  <Bar key={k} w="80%" h={6} />
                ))}
              </span>
              <AppUI />
            </span>
          </Browser>
        </span>
      </span>
    ),
    play: (run, $, at) => enter(run, $("[data-d]"), at, 0.35),
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
        .fromTo($("[data-sync]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 1.9);
    },
  },
];

/* ───────────── UI/UX ───────────── */

export const DESIGN: Shot[] = [
  {
    node: (
      <span className="relative h-[300px] w-[160px]">
        <span data-wire className="absolute inset-0">
          <Phone w={160} h={300}>
            <span className="flex flex-col gap-2.5">
              <span className="h-3 w-3/5 rounded bg-white/25" />
              <span className="h-20 rounded-[10px] border border-dashed border-white/30" />
              <span className="h-3 w-4/5 rounded bg-white/15" />
              <span className="h-3 w-2/3 rounded bg-white/15" />
              <span className="mt-2 h-8 rounded-full border border-dashed border-white/30" />
            </span>
          </Phone>
        </span>
        <span data-ui className="absolute inset-0 opacity-0">
          <Phone w={160} h={300}>
            <span className="flex flex-col gap-2.5">
              <span className="text-[13px] font-semibold"><Tx>Prenota la visita</Tx></span>
              <span className="h-20 rounded-[12px] bg-[linear-gradient(135deg,#9edcff,#3ea4dc_55%,#1f7fb8)]" />
              <span className="text-[10.5px] leading-snug text-white/70"><Tx>Scegli giorno e ora, ti confermiamo subito.</Tx></span>
              <span className="mt-2 flex h-8 items-center justify-center rounded-full bg-[#5ec4ff] text-[11px] font-medium text-[#04121c]"><Tx>Continua</Tx></span>
            </span>
          </Phone>
        </span>
      </span>
    ),
    play: (run, $, at) => run.to($("[data-ui]"), { opacity: 1, duration: 0.9, ease: "power2.inOut" }, at + 1.4).to($("[data-wire]"), { opacity: 0, duration: 0.9 }, at + 1.4),
  },
  {
    node: (
      <Bead tint={GL} radius={26} className="block w-[420px] p-5 text-white">
        <span className="flex items-center gap-3">
          <Tile size={40}>
            <Ico i={UserCheck01Icon} s={18} />
          </Tile>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-[-0.02em]"><Tx>Test con 5 persone</Tx></span>
            <span className="block text-[12px] text-white/55"><Tx>Riescono a prenotare da sole?</Tx></span>
          </span>
        </span>
        <span className="mt-4 block space-y-2">
          {["Trova il servizio", "Sceglie giorno e ora", "Conferma la visita"].map((t) => (
            <span key={t} className="flex items-center justify-between rounded-[12px] bg-white/[.06] px-3.5 py-2.5 text-[13.5px]">
              <Tx>{t}</Tx>
              <span data-ok className="flex items-center gap-1 font-mono text-[12px] text-[#8ff0ad] opacity-0">
                5/5 <Ico i={CheckmarkCircle02Icon} s={14} />
              </span>
            </span>
          ))}
        </span>
      </Bead>
    ),
    play: (run, $, at) => run.to($("[data-ok]"), { opacity: 1, duration: 0.35, stagger: 0.55 }, at + 0.5),
  },
  {
    node: (
      <span className="grid w-[460px] grid-cols-[1fr_1fr] gap-3">
        <span data-sys>
          <Bead tint={GL} radius={22} className="flex h-full flex-col gap-3 p-4 text-white">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/45"><Tx>Colori</Tx></span>
            <span className="flex gap-2">
              {["#e6f6ff", "#9edcff", "#5ec4ff", "#1f7fb8", "#0b2f45"].map((c) => (
                <span key={c} className="h-9 flex-1 rounded-[10px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.15)]" style={{ background: c }} />
              ))}
            </span>
          </Bead>
        </span>
        <span data-sys>
          <Bead tint={GL} radius={22} className="flex h-full flex-col gap-1 p-4 text-white">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/45"><Tx>Testo</Tx></span>
            <span className="text-[30px] font-semibold leading-none tracking-[-0.04em]">Aa</span>
            <span className="text-[11px] text-white/55"><Tx>Titolo · Corpo · Nota</Tx></span>
          </Bead>
        </span>
        <span data-sys className="col-span-2">
          <Bead tint={GL} radius={22} className="flex items-center gap-3 p-4 text-white">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white/45"><Tx>Componenti</Tx></span>
            <span className="ml-auto flex items-center gap-2">
              <span className="flex h-8 items-center rounded-full bg-[#5ec4ff] px-4 text-[12px] font-medium text-[#04121c]"><Tx>Continua</Tx></span>
              <span className="flex h-8 items-center rounded-full bg-white/10 px-4 text-[12px]"><Tx>Annulla</Tx></span>
              <span className="relative h-6 w-10 rounded-full bg-[#30d158]">
                <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
              </span>
            </span>
          </Bead>
        </span>
      </span>
    ),
    play: (run, $, at) => enter(run, $("[data-sys]"), at, 0.18),
  },
];

/* ───────────── AI e sistemi integrati ───────────── */

const MAILS = [
  ["Ordine 40 pz. articolo 118", "Ordini"],
  ["Fattura di ottobre", "Fatture"],
  ["Non riesco ad accedere", "Assistenza"],
  ["Disponibilità per martedì?", "Ordini"],
];
export const AI: Shot[] = [
  {
    node: (
      <Bead tint={GL} radius={26} className="block w-[440px] p-4 text-white">
        <span className="flex items-center justify-between px-1 pb-3 text-[13px] text-white/60">
          <span className="flex items-center gap-2">
            <Ico i={Mail01Icon} s={16} />
            <Tx>Posta in arrivo</Tx>
          </span>
          <span data-n className="font-mono tabular-nums">
            0
          </span>
        </span>
        <span className="block space-y-2">
          {MAILS.map(([m]) => (
            <span key={m} data-m className="flex items-center gap-3 rounded-[14px] bg-white/[.06] px-3.5 py-2.5 text-[13.5px]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#5ec4ff]" />
              <Tx>{m}</Tx>
            </span>
          ))}
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      enter(run, $("[data-m]"), at, 0.35);
      count(run, $("[data-n]")[0], 0, 4, at, 1.4, (n) => String(Math.round(n)));
    },
  },
  {
    node: (
      <Bead tint={GL} radius={26} className="block w-[460px] p-4 text-white">
        <span className="flex items-center gap-2 px-1 pb-3 text-[13px] text-white/60">
          <Ico i={SparklesIcon} s={16} c="text-[#8fd8ff]" />
          <Tx>Letto e smistato</Tx>
        </span>
        <span className="block space-y-2">
          {MAILS.map(([m, tag]) => (
            <span key={m} className="flex items-center gap-3 rounded-[14px] bg-white/[.06] px-3.5 py-2.5 text-[13.5px]">
              <span className="min-w-0 flex-1 truncate">{m}</span>
              <span data-tag className="shrink-0 rounded-full bg-[rgba(94,196,255,.2)] px-2.5 py-0.5 text-[11.5px] text-[#cdeeff] opacity-0">
                <Tx>{tag}</Tx>
              </span>
              <span data-draft className="shrink-0 text-[11.5px] text-[#8ff0ad] opacity-0">
                <Tx>bozza pronta</Tx>
              </span>
            </span>
          ))}
        </span>
      </Bead>
    ),
    play: (run, $, at) => run.to($("[data-tag]"), { opacity: 1, duration: 0.3, stagger: 0.3 }, at + 0.3).to($("[data-draft]"), { opacity: 1, duration: 0.3, stagger: 0.25 }, at + 1.8),
  },
  {
    node: (
      <>
        <Bead tint={GL} radius={26} className="block w-[380px] p-5 text-white">
          <span className="flex items-center gap-3">
            <Tile size={40}>
              <Ico i={AiChat02Icon} s={18} />
            </Tile>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-[-0.02em]"><Tx>4 risposte pronte</Tx></span>
              <span className="block text-[12px] text-white/55"><Tx>Le invio?</Tx></span>
            </span>
          </span>
          <span className="mt-5 grid grid-cols-2 gap-2">
            <span className="flex h-10 items-center justify-center rounded-full bg-white/10 text-[13.5px]"><Tx>Rivedi</Tx></span>
            <span data-go className="flex h-10 items-center justify-center rounded-full bg-[#5ec4ff] text-[13.5px] font-medium text-[#04121c]">
              <Tx>Approva</Tx>
            </span>
          </span>
        </Bead>
        <Note attr="data-done">
          <Ok><Tx>Inviate · 2 ore risparmiate oggi</Tx></Ok>
        </Note>
      </>
    ),
    play: (run, $, at) =>
      run
        .to($("[data-go]"), { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }, at + 1.2)
        .fromTo($("[data-done]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 1.6),
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
    node: <Fridge />,
    play: (run, $, at) => {
      run.fromTo($("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 3, ease: "none" }, at);
      count(run, $("[data-temp]")[0], 3.9, 4.1, at, 3, (n) => `${it(n, 1)}°`);
    },
  },
  {
    node: (
      <>
        <Fridge hot />
        <span data-alert className="mt-4 inline-flex">
          <Bead tint="rgba(30,34,40,.62)" radius={20} className="flex w-[360px] items-center gap-3 p-3 pr-4 text-white">
            <Tile size={36} tone="amber">
              <Ico i={Notification01Icon} s={16} />
            </Tile>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold"><Tx>Temperatura in aumento</Tx></span>
              <span className="block text-[12px] text-white/65"><Tx>Cella frigo 2 · porta aperta da 6 min</Tx></span>
            </span>
          </Bead>
        </span>
      </>
    ),
    play: (run, $, at) => {
      run.fromTo($("[data-spark]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 2.2, ease: "power1.in" }, at);
      count(run, $("[data-temp]")[0], 4.1, 7.8, at, 2.2, (n) => `${it(n, 1)}°`);
      run.fromTo($("[data-alert]"), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 1.6);
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

/* ───────────── Integrazioni e API ───────────── */

const NodeApp = ({ icon, name, attr }: { icon: typeof Mail01Icon; name: string; attr?: string }) => (
  <span {...(attr ? { [attr]: "" } : {})}>
    <Bead tint={GL} radius={22} className="flex w-[124px] flex-col items-center gap-3 py-5 text-white">
      <Tile size={44}>
        <Ico i={icon} s={20} />
      </Tile>
      <span className="text-[13px] font-medium">{name}</span>
    </Bead>
  </span>
);
export const API: Shot[] = [
  {
    node: (
      <span className="relative flex items-center gap-[86px]">
        <svg viewBox="0 0 560 120" className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-visible" aria-hidden>
          <path data-wire d="M124 60 H218" stroke={AQUA} strokeWidth="2" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
          <path data-wire d="M342 60 H436" stroke={AQUA} strokeWidth="2" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
        </svg>
        <span data-app>
          <Bead tint={GL} radius={22} className="flex w-[124px] flex-col items-center gap-3 py-5 text-white">
            <Tile size={44} light>
              <Brand p={si.siShopify} c="h-6 w-6 text-[#95bf47]" />
            </Tile>
            <span className="text-[13px] font-medium">Shopify</span>
          </Bead>
        </span>
        <NodeApp icon={Package01Icon} name="Gestionale" attr="data-app" />
        <NodeApp icon={Invoice01Icon} name="Fatture" attr="data-app" />
      </span>
    ),
    play: (run, $, at) => {
      enter(run, $("[data-app]"), at, 0.15);
      run.to($("[data-wire]"), { strokeDashoffset: 0, duration: 0.7, stagger: 0.3, ease: "power2.inOut" }, at + 0.7);
    },
  },
  {
    node: (
      <span className="flex items-center gap-4">
        {[
          [ShoppingCart01Icon, "Ordine #1042", "Pagato · 3 articoli"],
          [Invoice01Icon, "Fattura FT-1042", "Emessa e inviata"],
          [Package01Icon, "Magazzino", "Scorte aggiornate"],
        ].map(([ic, t, s], i) => (
          <span key={t as string} data-step className="flex items-center gap-4">
            {i > 0 && <span className="h-px w-6 bg-white/40" />}
            <Bead tint={GL} radius={20} className="block w-[150px] p-3.5 text-white">
              <Tile size={34}>
                <Ico i={ic as typeof Mail01Icon} s={16} />
              </Tile>
              <span className="mt-3 block text-[13px] font-semibold"><Tx>{t as string}</Tx></span>
              <span className="block text-[11.5px] text-white/55"><Tx>{s as string}</Tx></span>
            </Bead>
          </span>
        ))}
      </span>
    ),
    play: (run, $, at) => enter(run, $("[data-step]"), at, 0.6),
  },
  {
    node: (
      <span className="flex flex-col items-center text-white">
        <span className="text-[13px] uppercase tracking-[0.12em] text-white/50"><Tx>Ore risparmiate ogni mese</Tx></span>
        <span data-h className="mt-2 font-mono text-[96px] leading-none tabular-nums tracking-[-0.04em]">
          0
        </span>
        <Note>
          <Ok><Tx>Nessun dato ricopiato a mano</Tx></Ok>
        </Note>
      </span>
    ),
    play: (run, $, at) => count(run, $("[data-h]")[0], 0, 32, at, 1.8, (n) => String(Math.round(n))),
  },
];

/* ───────────── Negozi online ───────────── */

export const SHOP: Shot[] = [
  {
    node: (
      <span className="relative">
        <Bead tint={GL} radius={26} className="block w-[300px] p-3.5 text-white">
          <span className="block h-[150px] rounded-[16px] bg-[radial-gradient(circle_at_35%_30%,#d9f2ff,#5ec4ff_45%,#1f7fb8)]" />
          <span className="mt-3 flex items-baseline justify-between px-1">
            <span className="text-[15px] font-semibold"><Tx>Olio extravergine</Tx></span>
            <span className="font-mono text-[14px]">18,00 €</span>
          </span>
          <span data-add className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-[#5ec4ff] text-[13.5px] font-medium text-[#04121c]">
            <Ico i={ShoppingCart01Icon} s={15} />
            <Tx>Aggiungi al carrello</Tx>
          </span>
        </Bead>
        <span data-badge className="absolute -right-3 -top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#30d158] px-2 font-mono text-[13px] font-semibold text-white opacity-0 shadow-[0_6px_18px_-4px_rgba(48,209,88,.6)]">
          1
        </span>
      </span>
    ),
    play: (run, $, at) =>
      run.to($("[data-add]"), { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 }, at + 1).fromTo($("[data-badge]"), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.4)" }, at + 1.2),
  },
  {
    node: (
      <>
        <Bead tint={GL} radius={26} className="block w-[360px] p-5 text-white">
          <span className="flex items-baseline justify-between">
            <span className="text-[15px] font-semibold"><Tx>Totale</Tx></span>
            <span className="font-mono text-[22px]">23,90 €</span>
          </span>
          <span className="mt-1 block text-[12px] text-white/50"><Tx>Spedizione inclusa · arriva giovedì</Tx></span>
          <span data-pay className="mt-5 flex h-12 items-center justify-center rounded-full bg-white text-black">
            <Brand p={si.siApplepay} c="h-11 w-11" />
          </span>
          <span className="mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-white/10 text-[13.5px]">
            <Ico i={CreditCardIcon} s={16} />
            <Tx>Carta</Tx>
          </span>
          <span className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-white/50">
            <Ico i={LockKeyIcon} s={12} />
            <Tx>Pagamento protetto</Tx>
          </span>
        </Bead>
        <Note attr="data-paid">
          <Ok><Tx>Pagamento riuscito</Tx></Ok>
        </Note>
      </>
    ),
    play: (run, $, at) =>
      run.to($("[data-pay]"), { scale: 0.95, duration: 0.12, yoyo: true, repeat: 1 }, at + 1).fromTo($("[data-paid]"), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 1.4),
  },
  {
    node: (
      <Bead tint={GL} radius={26} className="block w-[440px] p-4 text-white">
        <span className="flex items-center justify-between px-1 pb-3 text-[13px] text-white/60">
          <span><Tx>Ordini di oggi</Tx></span>
          <span className="flex items-center gap-1.5">
            <Tx>Olio extravergine ·</Tx><span data-stock className="font-mono tabular-nums text-white">11</span> <Tx>disponibili</Tx>
          </span>
        </span>
        <span className="block space-y-2">
          <span data-new className="flex items-center gap-3 rounded-[14px] bg-[rgba(94,196,255,.16)] px-3.5 py-2.5 text-[13.5px]">
            <span className="font-mono text-white/60">#2048</span>
            <span className="flex-1"><Tx>Giulia R. · 2 articoli</Tx></span>
            <span className="rounded-full bg-[rgba(110,231,168,.18)] px-2.5 py-0.5 text-[11.5px] text-[#8ff0ad]"><Tx>Pagato</Tx></span>
          </span>
          {[
            ["#2047", "Marco B. · 1 articolo", "Spedito"],
            ["#2046", "Elena T. · 3 articoli", "Consegnato"],
          ].map(([n, c, s]) => (
            <span key={n} className="flex items-center gap-3 rounded-[14px] bg-white/[.06] px-3.5 py-2.5 text-[13.5px]">
              <span className="font-mono text-white/60">{n}</span>
              <span className="flex-1"><Tx>{c}</Tx></span>
              <span className="text-[11.5px] text-white/55"><Tx>{s}</Tx></span>
            </span>
          ))}
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      run.fromTo($("[data-new]"), { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, at + 0.4);
      count(run, $("[data-stock]")[0], 11, 10, at + 0.9, 0.2, (n) => String(Math.round(n)));
    },
  },
];
