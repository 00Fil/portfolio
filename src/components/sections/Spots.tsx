"use client";

/*
 * Gli spot dei servizi, stile app Apple: per ogni passo di quello che facciamo un commento a tutto quadro e poi
 * una sola inquadratura, pulita, con un oggetto al centro e un movimento che racconta il passo.
 * In chiusura il marchio e il tasto. Il motore è uno solo; ogni servizio dichiara le sue inquadrature.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { prefersReducedMotion } from "@/lib/env";
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
  Home01Icon,
  Invoice01Icon,
  LockKeyIcon,
  Mail01Icon,
  Notification01Icon,
  Package01Icon,
  Search01Icon,
  StarIcon,
  Shield01Icon,
  ShoppingCart01Icon,
  SparklesIcon,
  ThermometerWarmIcon,
  Tick02Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons";
import { Bead } from "@/components/glass/Bead";
import { Canvas, addEnd, addSay } from "./ServiceWidgets";
import { play as sfx, type Sfx } from "@/lib/sound";

type Q = (s: string) => Element[];
export type Shot = { node: ReactNode; play?: (run: gsap.core.Timeline, $: Q, at: number) => void; dur?: number; say?: boolean };
/** Un suono nella timeline, nell'istante preciso dell'azione. */
const snd = (run: gsap.core.Timeline, name: Sfx, at: number, pitch = 1) => run.call(() => sfx(name, pitch), undefined, at);

const W = 620;
const EN: Record<string, string> = {"PRENOTA ORA · PRENOTA ORA · ": "BOOK NOW · BOOK NOW · ", "recensioni": "reviews", "Brescia · dal 2009": "Brescia · since 2009", "Pulizia profonda, senza fastidio": "Deep cleaning, no discomfort", "Allineatori quasi invisibili": "Almost invisible aligners", "Un tono più chiaro in un’ora": "A shade lighter in an hour", "In un minuto": "In a minute", "Risposta in giornata": "Same-day reply", "Pagine": "Pages", "Sezioni": "Sections", "Lo studio": "The practice", "Studio dentistico · Brescia": "Dental practice · Brescia", "Il tuo sorriso,": "Your smile,", "in buone": "in good", "mani.": "hands.", "Igiene, ortodonzia e sbiancamento nel centro di Brescia. Prenoti online in un minuto.": "Hygiene, orthodontics and whitening in central Brescia. Book online in a minute.", "valutazione su 312 recensioni": "rating from 312 reviews", "anni nel centro di Brescia": "years in central Brescia", "per prenotare online": "to book online", "Cosa facciamo": "What we do", "Pulizia e prevenzione": "Cleaning and prevention", "Allineatori invisibili": "Invisible aligners", "Un tono, in un’ora": "A shade lighter, in an hour", "Una visita,": "One visit,", "in un minuto.": "in a minute.", "Lun–Ven 9–19 · Sab 9–13": "Mon–Fri 9–7 · Sat 9–1", "42 pagine · 0 errori": "42 pages · 0 errors", "Immagini da 4,8 a 0,6 MB": "Images from 4.8 to 0.6 MB", "Europa · certificato attivo": "Europe · certificate active", "Home": "Home", "Intestazione": "Header", "Prenotazione": "Booking", "Igiene": "Hygiene", "Ortodonzia": "Orthodontics", "Sbiancamento": "Whitening", "Bozza": "Draft", "Ottimizzazione": "Optimisation", "Agenda": "Agenda", "Visite di oggi": "Today’s visits", "Libero": "Free", "Nuova": "New", "Prima visita": "First visit", "Controllo": "Check-up", "Pubblicazione": "Going live", "Prenota": "Book", "Caricamento": "Load time", "Avviso in homepage": "Homepage notice", "Modifica · bozza": "Edit · draft", "Chiusi il 25 e 26 dicembre": "Closed on 25 and 26 December", "Pubblica sul sito": "Publish on the site", "Online in tutto il sito": "Live across the site", "dentista a brescia": "dentist in brescia", "Prestazioni": "Performance", "Accessibilità": "Accessibility", "Visite dalla ricerca": "Visits from search", "Un buon dentista a Brescia?": "A good dentist in Brescia?", "Sto cercando le fonti migliori…": "Looking for the best sources…", "Risposta": "Answer", "Ti consiglio": "I’d recommend", ", in centro a Brescia:": ", in central Brescia:", "orari estesi, prenotazione online e recensioni molto positive.": "long opening hours, online booking and great reviews.", "Ti cita": "Cites you", "Ordine fornitore": "Supplier order", "da confermare": "to confirm", "Sincronizzato su tutti i dispositivi": "Synced on every device", "Prenota la visita": "Book a visit", "Scegli giorno e ora, ti confermiamo subito.": "Pick a day and time, confirmed instantly.", "Continua": "Continue", "Test con 5 persone": "Tested with 5 people", "Riescono a prenotare da sole?": "Can they book on their own?", "Trova il servizio": "Finds the service", "Sceglie giorno e ora": "Picks a day and time", "Conferma la visita": "Confirms the visit", "Colori": "Colour", "Testo": "Type", "Titolo · Corpo · Nota": "Title · Body · Note", "Componenti": "Components", "Annulla": "Cancel", "Posta in arrivo": "Inbox", "Ordine 40 pz. articolo 118": "Order: 40 pcs of item 118", "Fattura di ottobre": "October invoice", "Non riesco ad accedere": "I can’t log in", "Disponibilità per martedì?": "Available on Tuesday?", "Ordini": "Orders", "Fatture": "Invoices", "Assistenza": "Support", "Letto e smistato": "Read and sorted", "bozza pronta": "draft ready", "4 risposte pronte": "4 replies ready", "Le invio?": "Send them?", "Rivedi": "Review", "Approva": "Approve", "Inviate · 2 ore risparmiate oggi": "Sent · 2 hours saved today", "Cella frigo 2": "Cold room 2", "Laboratorio · dal vivo": "Kitchen · live", "Temperatura in aumento": "Temperature rising", "Cella frigo 2 · porta aperta da 6 min": "Cold room 2 · door open for 6 min", "Impianti": "Equipment", "Tutto regolare": "All normal", "Cella frigo 1": "Cold room 1", "Forno": "Oven", "Compressore": "Compressor", "Negozio": "Shop", "Gestionale": "ERP", "Pagato · 3 articoli": "Paid · 3 items", "Fattura FT-1042": "Invoice FT-1042", "Emessa e inviata": "Issued and sent", "Magazzino": "Stock", "Scorte aggiornate": "Stock updated", "Ordine #1042": "Order #1042", "Ore risparmiate ogni mese": "Hours saved every month", "Nessun dato ricopiato a mano": "No data retyped by hand", "Olio extravergine": "Extra virgin olive oil", "Aggiungi al carrello": "Add to cart", "Totale": "Total", "Spedizione inclusa · arriva giovedì": "Shipping included · arrives Thursday", "Paga": "Pay", "Pagamento protetto": "Secure payment", "Pagamento riuscito": "Payment successful", "Ordini di oggi": "Today’s orders", "disponibili": "in stock", "Giulia R. · 2 articoli": "Giulia R. · 2 items", "Spedito": "Shipped", "Consegnato": "Delivered", "Marco B. · 1 articolo": "Marco B. · 1 item", "Elena T. · 3 articoli": "Elena T. · 3 items", "Pagato": "Paid", "Olio extravergine ·": "Extra virgin olive oil ·", "Carta": "Card", "Igiene, ortodonzia e implantologia in centro città.": "Hygiene, orthodontics and implants in the city centre.", "Prenota online, orari estesi, anche il sabato.": "Book online, long hours, Saturdays too.", "Visite e preventivi su appuntamento.": "Visits and quotes by appointment.", "Cerca con Google": "Google Search", "Mi sento fortunato": "I'm Feeling Lucky", "dentista brescia": "dentist brescia", "Prenota online in 1 minuto. Orari estesi, anche il sabato.": "Book online in 1 minute. Long hours, Saturdays too.", "Livelli": "Layers", "Desktop": "Desktop", "Hero": "Hero", "Titolo": "Title", "Servizi": "Services", "Prenota una visita": "Book a visit", "Perfetto così!": "Love it!", "Riempimento": "Fill", "Angoli": "Corners", "Il tuo sorriso, in buone mani": "Your smile, in good hands", "Pubblica": "Deploy", "Compilato in 9 s": "Built in 9 s", "24 pagine generate": "24 pages generated", "Immagini ottimizzate": "Images optimised", "Online su studiobianchi.it": "Live on studiobianchi.it", "Online": "Live", "Chi siamo": "About", "Contatti": "Contact", "Giovedì 14 novembre": "Thursday 14 November", "Conferma": "Confirm", "Nuova prenotazione": "New booking", "Giulia R. · giovedì alle 14:30": "Giulia R. · Thursday at 2:30 pm", "ora": "now", "Buonasera, Marco": "Good evening, Marco", "Come posso aiutarti oggi?": "How can I help you today?", "Mi consigli un buon dentista a Brescia?": "Can you recommend a good dentist in Brescia?", ", in centro a Brescia: prenotazione online, orari estesi e recensioni molto positive.": ", in central Brescia: online booking, long hours and excellent reviews.", "e": "and", "Sei la loro": "You’re their", "prima scelta,": "first choice,", "quando si parla del tuo settore.": "whenever your field comes up.", "Nuova attività": "New task", "Recenti": "Recent", "Report vendite": "Sales report", "Fatture ottobre": "October invoices", "Listino 2026": "2026 price list", "Cosa facciamo oggi?": "What shall we do today?", "Smista le email di oggi, inserisci gli ordini e prepara le risposte": "Sort today’s emails, enter the orders and draft the replies", "Al lavoro sulle email di oggi": "Working on today’s emails", "Lette 24 email": "Read 24 emails", "12 ordini inseriti nel gestionale": "12 orders entered in the ERP", "9 risposte preparate": "9 replies drafted", "3 da controllare a mano": "3 to check by hand", "File": "Files", "ordini.xlsx": "orders.xlsx", "risposte (9)": "replies (9)", "Fatto. 9 risposte pronte": "Done. 9 replies ready", "12 ordini già nel gestionale · 3 da guardare tu": "12 orders already in the ERP · 3 for you to check", "Approva e invia": "Approve and send", "Prenotazione — Prototipo": "Booking — Prototype", "Presenta": "Present", "Scegli l'orario": "Pick a time", "Confermato": "Confirmed", "Ci vediamo giovedì": "See you Thursday", "Test con 5 persone vere": "Tested with 5 real people", "prenotare una visita": "book a visit", "Tempo medio": "Average time", "Completano la prenotazione": "Complete the booking", "Prima": "Before", "Dopo": "After", "2,5 volte più prenotazioni": "2.5× more bookings", "Il tuo gestionale": "Your ERP", "Nuovo ordine #1042 · 89,00 €": "New order #1042 · €89.00", "Pagamento ricevuto": "Payment received", "Fattura FT-1042 creata e scorte aggiornate": "Invoice FT-1042 created, stock updated", "Conferma inviata al cliente": "Confirmation sent to the customer", "Richiesta del cliente chiusa": "Customer request closed", "Prenota e gestisci le visite": "Book and manage visits", "Ottieni": "Get", "Apri": "Open", "Salute": "Health", "Età": "Age", "Attacchi fermati oggi": "Attacks stopped today", "Pagine già pronte": "Pages served ready", "Connessione protetta": "Secure connection", "Server": "Server", "Europa · Francia": "Europe · France", "Certificato": "Certificate", "Si rinnova da solo": "Renews itself", "Dominio": "Domain", "Intestato a te": "In your name", "Versione online": "Live version", "Torna alla precedente": "Roll back", "Modifica": "Change", "Controlli": "Checks", "Prova": "Staging", "Ripristinata in 4 secondi": "Restored in 4 seconds", "Copie di sicurezza · ultime due settimane": "Backups · last two weeks", "Il sito non risponde": "The site is down", "Di nuovo online in 41 secondi": "Back online in 41 seconds", "studiobianchi.it non risponde": "studiobianchi.it is down", "Avviso a Filippo · 03:12": "Filippo alerted · 3:12 am", "Online negli ultimi 90 giorni": "Uptime, last 90 days", "1 avviso": "1 alert", "Porta chiusa · temperatura in discesa": "Door closed · temperature falling", "Sbiancamento e igiene, prima visita gratuita.": "Whitening and hygiene, free first visit.", "Punteggio": "Score", "Tempo di apertura": "Load time", "Peso delle immagini": "Image weight", "Titoli delle pagine": "Page titles", "Scheda Google": "Google profile", "incompleta": "incomplete", "completa": "complete", "3 su 24": "3 of 24", "24 su 24": "24 of 24", "6,2 s": "6.2 s", "0,9 s": "0.9 s", "4,8 MB": "4.8 MB", "Senza rete": "Offline", "In attesa": "Queued", "Consegna alle 15": "Delivery at 3 pm", "Avvisa": "Notify", "Avvisato": "Notified", "In compilazione": "Building", "Codice scaricato": "Code fetched", "Dipendenze installate": "Dependencies installed", "Novembre 2026": "November 2026", "Giovedì 12 novembre": "Thursday 12 November"};
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
          const full = !!inner.querySelector(":scope > div > [data-full]");
          // le azioni vivono in una timeline a parte: la scena dura quanto servono, più un respiro per leggere
          const sub = gsap.timeline();
          s.play?.(sub, $, 0.35);
          const dur = Math.max(sub.duration() + 1, (s.dur ?? 3) * 0.7);
          run
            .set(el, { scale: 1, x: 0, y: 0 }, st)
            .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, st)
            .call(() => sfx("whoosh"), undefined, st);
          if (full) {
            // le schermate a tutto riquadro non si rimpiccioliscono: entrano di lato, un filo più grandi, e si assestano
            run.fromTo(inner, { scale: 1.05, x: 44 }, { scale: 1, x: 0, duration: 0.9, ease: "expo.out" }, st);
          } else {
            // entra dal basso, leggermente più piccola, e poi continua a muoversi piano finché resta in scena
            run.fromTo(inner, { y: 40, scale: 0.92 }, { y: 0, scale: 1, duration: 0.8, ease: "expo.out" }, st).to(inner, { y: -6, duration: Math.max(0.1, dur - 0.8), ease: "sine.inOut" }, st + 0.8);
          }
          run.add(sub, st);
          // a fine scena la camera torna larga sul risultato, poi si passa oltre
          run.to(el, { scale: 1, x: 0, y: 0, duration: 0.7, ease: "power2.inOut" }, st + dur - 0.75);
          run.to(el, { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, st + dur);
          if (full) run.to(inner, { x: -44, duration: 0.4, ease: "power2.in" }, st + dur);
          else run.to(inner, { y: -26, scale: 0.98, duration: 0.4, ease: "power2.in" }, st + dur);
          at = st + dur + 0.15;
        });
        const end = addEnd(run, q, at);
        run.to({}, { duration: 0.01 }, end + 0.4);
        return tl.add(run, 0.2);
      }}
    >
      {shots.map((s, i) => (
        <ShotFrame key={i} node={s.node} hidden />
      ))}
    </Canvas>
  );
}

/** Un'inquadratura: la scena e, sopra, il cursore che tocca i pulsanti (micro interazioni vere, non solo cose che compaiono). */
function ShotFrame({ node, hidden = false }: { node: ReactNode; hidden?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  // Le scene "appoggiate" (un telefono, una tessera) sono disegnate per la tela minima: quando la scheda è più grande
  // si ingrandiscono per occupare bene lo spazio, invece di restare piccole al centro. Le schermate piene no: riempiono già.
  useEffect(() => {
    const el = fit.current!;
    if (el.querySelector("[data-full]")) return;
    const size = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const box = root.current!;
      if (!w || !h) return;
      const k = Math.min((box.offsetWidth * 0.86) / w, (box.offsetHeight * 0.76) / h, 1.9);
      el.style.transform = `scale(${Math.max(1, k)})`;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(root.current!);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={root} data-shot className={`absolute inset-0 ${hidden ? "invisible" : ""}`}>
      <div className="flex h-full w-full flex-col items-center justify-center will-change-transform">
        <div ref={fit} className="flex max-h-full max-w-full flex-col items-center justify-center has-[[data-full]]:h-full has-[[data-full]]:w-full">
          {node}
        </div>
      </div>
      <svg data-cursor viewBox="0 0 24 24" className="pointer-events-none absolute left-0 top-0 z-30 h-6 w-6 opacity-0 drop-shadow-[0_3px_6px_rgba(0,0,0,.45)]" style={{ marginLeft: -5, marginTop: -3.5, transformOrigin: "5px 3.5px" }} aria-hidden>
        <path d="M5 3.5 19 11l-6.2 1.7L10 19z" fill="#fff" stroke="#0b1620" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Una sola inquadratura, fuori dallo spot: nelle pagine dei servizi illustra un passo di "Come funziona".
 * Parte da capo ogni volta che diventa attiva, arriva in fondo e resta sul risultato.
 */
export function ShotView({ shots, i, on }: { shots: Shot[]; i: number; on: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  // esiste solo mentre serve: si monta quando diventa attiva e si smonta a dissolvenza finita
  const [live, setLive] = useState(on);
  useEffect(() => {
    if (on) return void setLive(true);
    const id = window.setTimeout(() => setLive(false), 700);
    return () => window.clearTimeout(id);
  }, [on]);
  useEffect(() => {
    if (!live) return;
    const o = box.current!;
    const fit = () => {
      if (!stage.current) return;
      const k = Math.max(Math.min(o.clientWidth / W, o.clientHeight / H), 0.2);
      const st = stage.current.style;
      st.width = `${o.clientWidth / k}px`;
      st.height = `${o.clientHeight / k}px`;
      st.transform = `translate(-50%, -50%) scale(${k})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(o);
    return () => ro.disconnect();
  }, [live]);
  useGSAP(
    () => {
      if (!live) return;
      const el = box.current!.querySelector("[data-shot]") as HTMLElement;
      const $: Q = (sel) => Array.from(el.querySelectorAll(sel));
      const run = gsap.timeline({ paused: true });
      shots[i].play?.(run, $, 0.35);
      run.to(el, { scale: 1, x: 0, y: 0, duration: 0.7, ease: "power2.inOut" }, run.duration() + 0.1);
      tl.current = run;
      if (prefersReducedMotion()) run.progress(1);
      else if (on) run.play(0);
      return () => void (tl.current = null);
    },
    { dependencies: [live], scope: box },
  );
  useEffect(() => {
    const run = tl.current;
    if (!run || prefersReducedMotion()) return;
    if (on) run.restart();
    else run.pause();
  }, [on]);
  return (
    <div ref={box} aria-hidden className={`pointer-events-none absolute inset-0 select-none overflow-hidden transition-opacity duration-700 ease-[var(--ease-out)] ${on ? "opacity-100" : "opacity-0"}`}>
      {live && (
        <div ref={stage} className="absolute left-1/2 top-1/2" style={{ width: W, height: H }}>
          <ShotFrame node={shots[i].node} />
        </div>
      )}
    </div>
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
  // l'onda nasce nel punto esatto del tocco e il bersaglio cede come una molla, nello stesso istante del suono
  run.call(
    () => {
      const host = cur.parentElement;
      if (!host) return;
      let r = host.querySelector<HTMLElement>("[data-ripple]");
      if (!r) {
        r = document.createElement("span");
        r.setAttribute("data-ripple", "");
        r.className = "pointer-events-none absolute left-0 top-0 z-20 h-12 w-12 rounded-full border border-white/70 bg-white/25";
        r.style.marginLeft = "-24px";
        r.style.marginTop = "-24px";
        host.appendChild(r);
      }
      gsap.killTweensOf(r);
      gsap.fromTo(r, { x: gsap.getProperty(cur, "x"), y: gsap.getProperty(cur, "y"), scale: 0.2, opacity: 0.9 }, { scale: 1.1, opacity: 0, duration: 0.55, ease: "expo.out" });
    },
    undefined,
    at,
  );
  // un campo largo non si molla come un tasto: cede appena e torna, senza rimbalzo né deformarsi
  const big = (btn as HTMLElement).offsetWidth > 140 || (btn as HTMLElement).offsetHeight > 56;
  return run
    .to(cur, { scale: 0.8, duration: 0.08, ease: "power2.out" }, at)
    .to(cur, { scale: 1, duration: 0.45, ease: "elastic.out(1,0.5)" }, at + 0.08)
    .to(btn, { scale: big ? 0.992 : 0.95, duration: 0.08, ease: "power2.out" }, at)
    .to(btn, { scale: 1, duration: big ? 0.3 : 0.5, ease: big ? "power2.out" : "elastic.out(1,0.45)" }, at + 0.08);
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
  cam(run, c.shot, el, at);
  press(run, c.cur, el, t);
  return t;
};
/** La camera segue l'azione: mentre il cursore va verso un punto l'inquadratura si stringe appena su quel punto.
 *  Lo spostamento è calcolato perché i bordi non si scoprano mai. Solo sulle schermate a tutto riquadro. */
const CAM = 1.045;
const cam = (run: gsap.core.Timeline, shot: HTMLElement, el: Element, at: number) => {
  if (!shot.querySelector("[data-full]")) return;
  // sui campi larghi lo zoom si legge come se il campo cambiasse misura: lì la camera resta ferma
  if ((el as HTMLElement).offsetWidth > 140) return;
  const to = (axis: "x" | "y") => () => {
    const p = spot(shot, el);
    return axis === "x" ? (shot.offsetWidth / 2 - p.x) * (CAM - 1) : (shot.offsetHeight / 2 - p.y) * (CAM - 1);
  };
  run.to(shot, { scale: CAM, x: to("x"), y: to("y"), duration: 0.9, ease: "power2.out" }, at);
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

/** Camera: si stringe su un punto per dargli enfasi. Lo spostamento è limitato perché i bordi non si scoprano mai. */
const zoomTo = (run: gsap.core.Timeline, shot: HTMLElement, el: Element, k: number, at: number, dur = 0.9, fx = 0.5, fy = 0.5) => {
  const to = (axis: "x" | "y") => () => {
    const p = spot(shot, el, fx, fy);
    const half = axis === "x" ? shot.offsetWidth / 2 : shot.offsetHeight / 2;
    const raw = k * (half - (axis === "x" ? p.x : p.y));
    return Math.max(-(k - 1) * half, Math.min((k - 1) * half, raw));
  };
  return run.to(shot, { scale: k, x: to("x"), y: to("y"), duration: dur, ease: "power3.inOut" }, at);
};
/** Camera: torna alla vista ampia. */
const wideTo = (run: gsap.core.Timeline, shot: HTMLElement, at: number, dur = 0.9) => run.to(shot, { scale: 1, x: 0, y: 0, duration: dur, ease: "power3.inOut" }, at);

/** L'ambiente di lavoro: vetro a tutto riquadro, con titolo e stato nella riga in alto, come la barra del sito. */
const Shell = ({ title, right, children }: { title: ReactNode; right?: ReactNode; children: ReactNode }) => (
  <Bead data-full="" tint={GL} radius={0} className="relative flex h-full w-full flex-col overflow-hidden text-white">
    <span className="flex h-12 shrink-0 items-center gap-3 px-6">
      <Bead tint="rgba(94,196,255,.22)" radius={9} className="flex h-6 w-6 items-center justify-center">
        <span className="h-2 w-2 rounded-full bg-[#5ec4ff]" />
      </Bead>
      <span className="text-[13px] font-medium tracking-[-0.01em] text-white/90">{title}</span>
      <span className="ml-auto flex items-center gap-2">{right}</span>
    </span>
    <span className="mx-6 block h-px shrink-0 bg-white/[.08]" />
    <span className="relative block min-h-0 flex-1">{children}</span>
  </Bead>
);
const INK = "#0d1115";
const ACC = "#8fd8ff";
const DISP = { fontFamily: "var(--font-anton), Impact, sans-serif", textTransform: "uppercase" as const, letterSpacing: "0.005em" };
const stock = (n: string) => `/visual/studio/${n}.webp`;
/** Fotografia a tutto campo: riempie sempre il riquadro, qualunque sia il rapporto della card. */
const Ph = ({ n, pos = "50% 50%", ...r }: { n: string; pos?: string; [k: string]: unknown }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={stock(n)} alt="" draggable={false} decoding="async" className="absolute inset-0 block h-full w-full object-cover" style={{ objectPosition: pos }} {...r} />
);
const SVC: [string, string, string, string][] = [
  ["igiene", "Igiene", "Pulizia profonda, senza fastidio", "50% 40%"],
  ["orto", "Ortodonzia", "Allineatori quasi invisibili", "50% 50%"],
  ["bianco", "Sbiancamento", "Un tono più chiaro in un’ora", "50% 30%"],
];
function DayPills() {
  const d = useLocale() === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri"] : ["Lun", "Mar", "Mer", "Gio", "Ven"];
  return (
    <span className="flex gap-[1.4cqmin]">
      {d.map((x, i) => (
        <span key={x} data-day={i} className="flex flex-1 flex-col items-center justify-center rounded-[2.4cqmin] text-white" style={{ height: "11cqmin", background: "rgba(255,255,255,.1)" }}>
          <span style={{ fontSize: "1.9cqmin", opacity: 0.65 }}>{x}</span>
          <span style={{ fontSize: "3.3cqmin", fontWeight: 600, lineHeight: 1.1 }}>{9 + i}</span>
        </span>
      ))}
    </span>
  );
}
/** La giornata come una pista: ogni visita è un blocco, e quello nuovo si accende dove era libero. */
const TRACK: [string, number, number][] = [
  ["MB", 0, 11.1],
  ["ET", 27.8, 11.1],
  ["LF", 88.9, 11.1],
];
const RING = (v: number | string, l: string) => (
  <Bead tint="rgba(255,255,255,.12)" radius={26} className="flex flex-1 flex-col items-center justify-center gap-[1cqmin]" style={{ paddingTop: "2.4cqmin", paddingBottom: "2.2cqmin" }}>
    <span className="relative block" style={{ width: "9cqmin", height: "9cqmin" }}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
        <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="3.2" />
        <circle data-ring={v} cx="20" cy="20" r="17" fill="none" stroke={GREEN} strokeWidth="3.2" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
      </svg>
      <span data-score className="absolute inset-0 flex items-center justify-center font-mono tabular-nums text-white" style={{ fontSize: "2.5cqmin" }}>
        0
      </span>
    </span>
    <span className="text-white/75" style={{ fontSize: "1.9cqmin" }}>
      <Tx>{l}</Tx>
    </span>
  </Bead>
);
const LOG: [string, string][] = [
  ["Controlli", "42 pagine · 0 errori"],
  ["Ottimizzazione", "Immagini da 4,8 a 0,6 MB"],
  ["Pubblicazione", "Europa · certificato attivo"],
  ["Online", "studiobianchi.it"],
];

export const WEB: Shot[] = [
  /* 1 · Il sito: apertura a tutto schermo, poi i servizi che si aprono come pannelli, poi la prenotazione */
  {
    dur: 12.5,
    node: (
      <Bead data-full="" tint={INK} radius={0} className="wsx relative block h-full w-full overflow-hidden text-white">
        {/* apertura */}
        <span data-scr="0" className="absolute inset-0 block overflow-hidden">
          <Ph n="hero" pos="50% 60%" data-himg="" />
          <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.5) 0%, rgba(8,12,16,0) 26%, rgba(8,12,16,.1) 46%, rgba(8,12,16,.86) 100%)" }} />
          <Bead data-nav="" tint="rgba(10,14,18,.34)" radius={999} className="absolute flex items-center justify-between" style={{ left: "3cqw", right: "3cqw", top: "3cqw", height: "9cqmin", paddingLeft: "3.4cqmin", paddingRight: "1.5cqmin" }}>
            <span className="flex items-center gap-[1.4cqmin] font-semibold tracking-[-0.01em]" style={{ fontSize: "2.8cqmin" }}>
              <span className="rounded-full" style={{ width: "1.6cqmin", height: "1.6cqmin", background: ACC }} />
              Bianchi
            </span>
            <span className="flex items-center text-white/80" style={{ gap: "3cqmin", fontSize: "2cqmin" }}>
              <span><Tx>Servizi</Tx></span>
              <span><Tx>Lo studio</Tx></span>
              <span className="flex items-center rounded-full bg-white font-semibold text-black" style={{ height: "6cqmin", paddingInline: "3cqmin" }}>
                <Tx>Prenota</Tx>
              </span>
            </span>
          </Bead>
          <span data-h1="" className="absolute block text-white" style={{ ...DISP, left: "4cqw", bottom: "14cqmin", fontSize: "min(13cqw, 17cqh)", lineHeight: 0.98 }}>
            <span className="block overflow-hidden" style={{ paddingTop: "0.06em" }}>
              <span data-ln="" className="block">
                <Tx>Il tuo sorriso,</Tx>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-ln="" className="block">
                <Tx>in buone</Tx> <span style={{ color: ACC }}><Tx>mani.</Tx></span>
              </span>
            </span>
          </span>
          <Bead data-badge="" tint="rgba(255,255,255,.16)" radius={999} className="absolute flex items-center justify-center" style={{ right: "4cqw", top: "16cqmin", width: "19cqmin", height: "19cqmin" }}>
            <svg data-spin2="" viewBox="0 0 100 100" className="absolute inset-0" aria-hidden>
              <defs>
                <path id="wcirc" d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
              </defs>
              <text fontSize="9.4" fontWeight="600" letterSpacing="1.8" fill="#fff">
                <textPath href="#wcirc">
                  <Tx>PRENOTA ORA · PRENOTA ORA · </Tx>
                </textPath>
              </text>
            </svg>
            <span data-barr="" className="flex items-center justify-center rounded-full bg-white text-black" style={{ width: "7cqmin", height: "7cqmin" }}>
              <Ico i={ArrowUp01Icon} s={16} c="rotate-45" />
            </span>
          </Bead>
          <span className="absolute flex" style={{ left: "4cqw", bottom: "4.4cqmin", gap: "1.6cqmin" }}>
            <Bead data-chip="" tint="rgba(255,255,255,.14)" radius={999} className="flex items-center" style={{ height: "6cqmin", paddingInline: "2.6cqmin", gap: "1cqmin", fontSize: "2cqmin" }}>
              <Ico i={StarIcon} s={12} c="text-[#ffd479]" />
              4,9 · 312 <Tx>recensioni</Tx>
            </Bead>
            <Bead data-chip="" tint="rgba(255,255,255,.14)" radius={999} className="flex items-center" style={{ height: "6cqmin", paddingInline: "2.6cqmin", fontSize: "2cqmin" }}>
              <Tx>Brescia · dal 2009</Tx>
            </Bead>
          </span>
        </span>
        {/* servizi: pannelli che si aprono */}
        <span data-scr="1" className="absolute inset-0 block" style={{ background: INK, clipPath: "inset(100% 0 0 0)" }}>
          <span className="absolute flex flex-col" style={{ inset: "2.4cqmin", gap: "1.6cqmin" }}>
            <span className="flex items-center justify-between px-[1cqmin] uppercase text-white/55" style={{ fontSize: "1.9cqmin", letterSpacing: "0.2em" }}>
              <Tx>Cosa facciamo</Tx>
              <span>03</span>
            </span>
            <span className="w-acc min-h-0 flex-1" style={{ gap: "1.6cqmin" }}>
              {SVC.map(([n, t, d, pos], i) => (
                <span key={n} data-pn={i} className="relative block min-h-0 min-w-0 overflow-hidden" style={{ flex: i === 0 ? "3.4 1 0" : "1 1 0", borderRadius: "3cqmin", containerType: "size" }}>
                  <Ph n={n} pos={pos} data-pimg="" />
                  <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.05) 30%, rgba(8,12,16,.82) 100%)" }} />
                  <span data-pshade="" className="absolute inset-0 block" style={{ background: "rgba(8,12,16,.38)", opacity: i === 0 ? 0 : 1 }} />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col" style={{ padding: "min(4cqi, 3.2cqb)", gap: "min(1.4cqi, 1cqb)" }}>
                    <span className="font-mono text-white/70" style={{ fontSize: "min(3.4cqi, 7cqb)" }}>
                      0{i + 1}
                    </span>
                    <span className="block text-white" style={{ ...DISP, fontSize: "min(10cqi, 26cqb)", lineHeight: 1 }}>
                      <Tx>{t}</Tx>
                    </span>
                    <span data-pd="" className="flex items-end justify-between" style={{ opacity: i === 0 ? 1 : 0 }}>
                      <span className="text-white/80" style={{ fontSize: "min(3.6cqi, 8cqb)" }}>
                        <Tx>{d}</Tx>
                      </span>
                      <span className="flex items-center justify-center rounded-full bg-white text-black" style={{ width: "min(8cqi, 16cqb)", height: "min(8cqi, 16cqb)" }}>
                        <Ico i={ArrowUp01Icon} s={14} c="rotate-45" />
                      </span>
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </span>
        </span>
        {/* prenotazione */}
        <span data-scr="2" className="absolute inset-0 block overflow-hidden" style={{ clipPath: "circle(0% at 50% 100%)" }}>
          <Ph n="visita" pos="50% 40%" data-cimg="" />
          <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(6,10,14,.55), rgba(6,10,14,.72))" }} />
          {[0, 1].map((r) => (
            <span key={r} className="absolute left-0 block overflow-hidden whitespace-nowrap" style={{ top: r ? "47%" : "17%", width: "100%" }}>
              <span data-mq={r} className="inline-flex" style={{ ...DISP, fontSize: "min(17cqw, 22cqh)", lineHeight: 1.02, color: r ? "transparent" : "#fff", WebkitTextStroke: r ? "1.5px rgba(255,255,255,.85)" : undefined }}>
                {[0, 1, 2, 3, 4, 5].map((k) => (
                  <span key={k} className="px-[2.4cqmin]">
                    <Tx>{r ? "In un minuto" : "Prenota una visita"}</Tx> ·
                  </span>
                ))}
              </span>
            </span>
          ))}
          <span className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: "9cqmin", gap: "2.4cqmin" }}>
            <span data-cta="" className="flex items-center rounded-full bg-white font-semibold text-black" style={{ height: "12cqmin", paddingLeft: "5cqmin", paddingRight: "1.4cqmin", gap: "3cqmin", fontSize: "3cqmin" }}>
              <Tx>Prenota una visita</Tx>
              <span data-carr="" className="flex items-center justify-center rounded-full bg-black text-white" style={{ width: "9.2cqmin", height: "9.2cqmin" }}>
                <Ico i={ArrowUp01Icon} s={20} c="rotate-45" />
              </span>
            </span>
            <Bead tint="rgba(255,255,255,.14)" radius={999} className="flex items-center text-white/85" style={{ height: "6cqmin", paddingInline: "3cqmin", fontSize: "2cqmin" }}>
              <Tx>Lun–Ven 9–19 · Sab 9–13</Tx>
            </Bead>
          </span>
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      const shot = $("[data-cursor]")[0].parentElement as HTMLElement;
      const [s0, s1, s2] = $("[data-scr]");
      const pn = $("[data-pn]");
      const focus = (i: number, a: number) => {
        pn.forEach((p, k) => {
          run.to(p, { flexGrow: k === i ? 3.4 : 1, duration: 0.95, ease: "power3.inOut" }, a);
          run.to($("[data-pd]")[k], { opacity: k === i ? 1 : 0, duration: 0.4 }, a + (k === i ? 0.35 : 0));
          run.to($("[data-pshade]")[k], { opacity: k === i ? 0 : 1, duration: 0.6 }, a);
          run.to($("[data-pimg]")[k], { scale: k === i ? 1.06 : 1.0, duration: 1.2, ease: "power3.out" }, a);
        });
        snd(run, "tick", a, 1 + i * 0.12);
      };
      run
        .set(s1, { clipPath: "inset(100% 0 0 0)" }, at)
        .set(s2, { clipPath: "circle(0% at 50% 100%)" }, at)
        .set(s0, { autoAlpha: 1 }, at)
        .set(pn[0], { flexGrow: 3.4 }, at)
        .set([pn[1], pn[2]], { flexGrow: 1 }, at)
        .set($("[data-pd]"), { opacity: (i: number) => (i === 0 ? 1 : 0) }, at)
        .set($("[data-pshade]"), { opacity: (i: number) => (i === 0 ? 0 : 1) }, at);
      // apertura: la foto si scopre e si assesta, le righe salgono da sotto la maschera, il disco si accende
      run.fromTo(s0, { clipPath: "inset(7% 7% 7% 7% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1.5, ease: "expo.inOut" }, at);
      run.fromTo($("[data-himg]"), { scale: 1.32 }, { scale: 1.03, duration: 2.8, ease: "expo.out" }, at);
      run.fromTo($("[data-nav]"), { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" }, at + 0.7);
      run.fromTo($("[data-ln]"), { yPercent: 112 }, { yPercent: 0, duration: 1.15, stagger: 0.12, ease: "expo.out" }, at + 0.65);
      run.fromTo($("[data-badge]"), { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 1.1, ease: "expo.out" }, at + 1.1);
      run.fromTo($("[data-chip]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" }, at + 1.3);
      run.fromTo($("[data-spin2]"), { rotation: 0 }, { rotation: 360, duration: 9, ease: "none", transformOrigin: "50% 50%" }, at + 1.1);
      snd(run, "open", at + 0.3);
      // camera: prima il titolo, poi il disco, che si preme
      const h1 = $("[data-h1]")[0];
      const badge = $("[data-badge]")[0];
      zoomTo(run, shot, h1, 1.22, at + 2.1, 1.1, 0.35, 0.55);
      const c = cursorIn(run, $, badge, at + 3.0);
      zoomTo(run, shot, badge, 1.55, at + 3.1, 1.0, 0.5, 0.5);
      let t = human(run, c.cur, () => spot(shot, badge, 0.5, 0.5), at + 3.2, 0.75);
      run.to(badge, { scale: 1.12, duration: 0.4, ease: "expo.out" }, t - 0.25);
      press(run, c.cur, badge, t);
      run.to($("[data-barr]"), { rotation: 45, duration: 0.5, ease: "expo.out" }, t);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.25);
      // transizione: la foto avanza, i servizi salgono a tendina
      const tA = t + 0.45;
      wideTo(run, shot, tA, 1.1);
      run.to($("[data-himg]"), { scale: 1.16, duration: 1.3, ease: "power3.in" }, tA);
      run.to([$("[data-nav]")[0], $("[data-h1]")[0], badge], { autoAlpha: 0, y: -18, duration: 0.6, ease: "power2.in" }, tA);
      run.to(s1, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power4.inOut" }, tA + 0.1);
      run.fromTo($("[data-pimg]"), { scale: 1.35 }, { scale: (i: number) => (i === 0 ? 1.06 : 1), duration: 1.8, ease: "expo.out" }, tA + 0.35);
      run.fromTo(pn, { y: 70 }, { y: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, tA + 0.3);
      snd(run, "whoosh", tA + 0.1);
      run.set(s0, { autoAlpha: 0 }, tA + 1.4);
      // si provano i pannelli: il cursore passa e il pannello si apre
      t = tA + 1.9;
      run.to(c.cur, { opacity: 1, duration: 0.2 }, t - 0.2);
      gsap.set(c.cur, { x: shot.offsetWidth * 0.5, y: shot.offsetHeight * 0.3 });
      t = human(run, c.cur, () => spot(shot, pn[1], 0.5, 0.45), t, 0.8);
      focus(1, t - 0.2);
      zoomTo(run, shot, pn[1], 1.1, t, 1.0, 0.5, 0.5);
      t = human(run, c.cur, () => spot(shot, pn[2], 0.5, 0.45), t + 1.2, 0.8);
      focus(2, t - 0.2);
      zoomTo(run, shot, pn[2], 1.1, t, 1.0, 0.5, 0.5);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.9);
      // ultima schermata: il cerchio si apre dal basso, le parole scorrono
      const tB = t + 1.3;
      wideTo(run, shot, tB, 0.9);
      run.to(s2, { clipPath: "circle(150% at 50% 100%)", duration: 1.3, ease: "power3.inOut" }, tB);
      run.fromTo($("[data-cimg]"), { scale: 1.3 }, { scale: 1.04, duration: 2.4, ease: "expo.out" }, tB);
      snd(run, "whoosh", tB, 0.9);
      $("[data-mq]").forEach((m, r) => run.fromTo(m, { xPercent: r ? -33 : 0 }, { xPercent: r ? 0 : -33, duration: 6, ease: "none" }, tB));
      run.fromTo($("[data-cta]"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" }, tB + 0.9);
      // il cursore raggiunge il pulsante, la camera lo stringe, si preme
      const cta = $("[data-cta]")[0];
      t = tB + 1.9;
      gsap.set(c.cur, { x: shot.offsetWidth * 0.2, y: shot.offsetHeight * 0.55 });
      run.to(c.cur, { opacity: 1, duration: 0.2 }, t - 0.2);
      t = human(run, c.cur, () => spot(shot, cta, 0.8, 0.5), t, 0.8);
      zoomTo(run, shot, cta, 1.25, t - 0.8, 1.0, 0.5, 0.5);
      press(run, c.cur, cta, t);
      run.to($("[data-carr]"), { rotation: 45, x: 2, duration: 0.45, ease: "expo.out" }, t);
      run.to(cta, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }, t + 0.05);
      snd(run, "success", t + 0.1);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.5);
    },
  },
  /* 2 · Online, senza sorprese: quattro parole a tutto schermo, una dopo l'altra, poi il sito si apre sul risultato */
  {
    dur: 8,
    node: (
      <Bead data-full="" tint={INK} radius={0} className="wsx relative block h-full w-full overflow-hidden text-white">
        <Ph n="sala" data-bg2="" style={{ filter: "brightness(.28) saturate(.8)" }} />
        <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.2), rgba(8,12,16,.7))" }} />
        <span className="absolute flex items-center justify-between" style={{ left: "3cqw", right: "3cqw", top: "3cqw" }}>
          <Bead tint="rgba(255,255,255,.12)" radius={999} className="flex items-center" style={{ height: "7cqmin", paddingInline: "3cqmin", gap: "1.4cqmin", fontSize: "2.1cqmin" }}>
            <Ico i={LockKeyIcon} s={12} c="text-white/70" />
            studiobianchi.it
          </Bead>
          <span className="flex items-center" style={{ gap: "2cqmin", fontSize: "2.1cqmin" }}>
            <span className="relative flex items-center">
              <span data-building="" className="flex items-center gap-[1cqmin] whitespace-nowrap text-white/70">
                <span className="rounded-full bg-[#f5c46b]" style={{ width: "1.3cqmin", height: "1.3cqmin" }} />
                <Tx>Bozza</Tx>
              </span>
              <span data-live="" className="absolute right-0 flex items-center gap-[1cqmin] whitespace-nowrap text-white opacity-0">
                <span className="rounded-full bg-[#30d158]" style={{ width: "1.3cqmin", height: "1.3cqmin" }} />
                <Tx>Online</Tx>
              </span>
            </span>
            <span data-deploy="" className="flex items-center rounded-full bg-white font-semibold text-black" style={{ height: "7cqmin", paddingInline: "3.6cqmin", fontSize: "2.2cqmin" }}>
              <Tx>Pubblica</Tx>
            </span>
          </span>
        </span>
        <span data-reel="" className="absolute flex flex-col justify-center" style={{ left: "4cqw", right: "4cqw", top: "14cqmin", bottom: "22cqmin" }}>
          {LOG.map(([t]) => (
            <span key={t} data-wd="" className="relative flex items-center justify-between">
              <span data-wt="" className="block" style={{ ...DISP, fontSize: "min(12cqw, 13.5cqh)", lineHeight: 0.98, color: "rgba(255,255,255,.14)" }}>
                <Tx>{t}</Tx>
              </span>
              <span className="flex shrink-0 items-center" style={{ gap: "2cqmin" }}>
                <Bead tint="rgba(255,255,255,.1)" radius={999} className="relative flex shrink-0 items-center justify-center" style={{ width: "6.4cqmin", height: "6.4cqmin" }}>
                  <svg data-spin="" viewBox="0 0 24 24" className="absolute opacity-0" style={{ width: "58%", height: "58%" }} aria-hidden>
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="2.4" />
                    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={ACC} strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                  <span data-tk="" className="absolute flex items-center justify-center rounded-full opacity-0" style={{ inset: "18%", background: ACC, color: "#04121c" }}>
                    <Ico i={Tick02Icon} s={14} />
                  </span>
                </Bead>
              </span>
            </span>
          ))}
        </span>
        <span data-pct="" className="absolute flex items-end text-white" style={{ ...DISP, left: "4cqw", bottom: "3.6cqmin", fontSize: "13cqmin", lineHeight: 0.9 }}>
          <span data-pn2="">0</span>
          <span style={{ fontSize: "5cqmin", paddingBottom: "1.2cqmin", paddingLeft: "0.8cqmin", opacity: 0.6 }}>%</span>
        </span>
        {/* il sito, online */}
        <span data-open="" className="absolute inset-0 block overflow-hidden" style={{ clipPath: "circle(0% at 50% 62%)" }}>
          <Ph n="hero" pos="50% 60%" data-oimg="" />
          <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.55) 0%, rgba(8,12,16,.05) 34%, rgba(8,12,16,.2) 55%, rgba(8,12,16,.88) 100%)" }} />
          <span className="absolute flex items-center text-white" style={{ ...DISP, left: "4cqw", top: "4cqmin", fontSize: "min(20cqw, 22cqh)", lineHeight: 0.95, gap: "2cqmin" }}>
            <span data-ow="" className="block overflow-hidden">
              <span data-ow2="" className="block">
                <Tx>Online</Tx>.
              </span>
            </span>
            <span className="rounded-full bg-[#30d158]" style={{ width: "2.6cqmin", height: "2.6cqmin", boxShadow: "0 0 0 1.2cqmin rgba(48,209,88,.28)" }} />
          </span>
          <span className="absolute flex flex-col items-center" style={{ left: "3cqw", right: "3cqw", bottom: "3cqw", gap: "2cqmin" }}>
            <Bead data-url="" tint="rgba(255,255,255,.16)" radius={999} className="flex items-center text-white" style={{ height: "9cqmin", paddingInline: "4cqmin", gap: "1.6cqmin", fontSize: "3cqmin", fontWeight: 500 }}>
              <Ico i={LockKeyIcon} s={15} c="text-[#6ee7a8]" />
              studiobianchi.it
              <span className="font-mono text-white/60" style={{ fontSize: "2cqmin", paddingLeft: "1cqmin" }}>0,8 s</span>
            </Bead>
            <span data-scores="" className="flex w-full" style={{ gap: "1.6cqmin" }}>
              {RING(100, "Prestazioni")}
              {RING(100, "SEO")}
              {RING(100, "Accessibilità")}
            </span>
          </span>
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      const dep = $("[data-deploy]")[0];
      const c = cursorIn(run, $, dep, at);
      const shot = c.shot;
      run.set($("[data-open]"), { clipPath: "circle(0% at 50% 62%)" }, at);
      run.fromTo($("[data-bg2]"), { scale: 1.25 }, { scale: 1.05, duration: 6, ease: "power2.out" }, at);
      let t = human(run, c.cur, () => spot(shot, dep), at + 0.05, 0.6);
      press(run, c.cur, dep, t);
      run.to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.3);
      const words = $("[data-wt]");
      const spins = $("[data-spin]");
      const ticks = $("[data-tk]");
      const pct = { v: 0 };
      const pn2 = $("[data-pn2]")[0];
      let a = t + 0.35;
      LOG.forEach((_, i) => {
        const dur = [0.6, 0.85, 0.75, 0.45][i];
        // la camera segue la parola attiva: più vicina, mai un salto
        zoomTo(run, shot, words[i], 1.18, a - 0.15, 0.7, 0.3, 0.5);
        run.to(words[i], { color: "#ffffff", duration: 0.3 }, a);
        run.set(spins[i], { opacity: 1 }, a);
        run.fromTo(spins[i], { rotation: 0 }, { rotation: 360 * (1 + dur), duration: dur, ease: "none", transformOrigin: "50% 50%" }, a);
        run.to(pct, { v: (i + 1) * 25, duration: dur, ease: "power1.inOut", onUpdate: () => void (pn2.textContent = String(Math.round(pct.v))) }, a);
        run.set(spins[i], { opacity: 0 }, a + dur);
        run.fromTo(ticks[i], { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, a + dur);
        run.to(words[i], { color: "rgba(255,255,255,.34)", duration: 0.5 }, a + dur);
        snd(run, "tick", a + dur, 1 + i * 0.16);
        a += dur + 0.1;
      });
      const done = a + 0.1;
      wideTo(run, shot, done, 0.7);
      run
        .to($("[data-building]"), { opacity: 0, duration: 0.2 }, done)
        .to($("[data-live]"), { opacity: 1, duration: 0.3 }, done + 0.05);
      snd(run, "success", done + 0.2);
      // il sito si apre dal centro, a tutto schermo
      run.to($("[data-open]"), { clipPath: "circle(95% at 50% 62%)", duration: 1.4, ease: "power3.inOut" }, done + 0.15);
      run.fromTo($("[data-oimg]"), { scale: 1.3 }, { scale: 1.02, duration: 2.4, ease: "expo.out" }, done + 0.15);
      run.fromTo($("[data-ow2]"), { yPercent: 110 }, { yPercent: 0, duration: 1.0, ease: "expo.out" }, done + 0.9);
      run.fromTo($("[data-url]"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, done + 1.1);
      run.fromTo($("[data-scores]"), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, done + 1.25);
      zoomTo(run, shot, $("[data-scores]")[0], 1.08, done + 1.6, 1.0, 0.5, 0.5);
      $("[data-ring]").forEach((r, i) => {
        run.fromTo(r, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, done + 1.5 + i * 0.12);
        count(run, $("[data-score]")[i], 0, 100, done + 1.5 + i * 0.12, 0.9, (n) => String(Math.round(n)));
      });
    },
  },
  /* 3 · Ti porta prenotazioni: la prenotazione e, nello stesso istante, la giornata dello studio che si riempie */
  {
    dur: 7.5,
    node: (
      <Bead data-full="" tint={INK} radius={0} className="wsx relative block h-full w-full overflow-hidden text-white">
        <Ph n="visita" pos="50% 35%" data-bg3="" style={{ filter: "brightness(.5)" }} />
        <span className="absolute inset-0 block" style={{ background: "linear-gradient(180deg, rgba(8,12,16,.35), rgba(8,12,16,.78))" }} />
        {/* la giornata dello studio */}
        <Bead data-trk="" tint="rgba(255,255,255,.1)" radius={34} className="w-tr absolute block" style={{ padding: "3cqmin" }}>
          <span className="flex items-end justify-between">
            <span className="text-white/70" style={{ fontSize: "2cqmin" }}>
              <Tx>Agenda</Tx> · <Tx>Giovedì 12 novembre</Tx>
            </span>
            <span className="flex items-end gap-[1.2cqmin]">
              <span className="text-white/60" style={{ fontSize: "1.9cqmin", paddingBottom: "0.8cqmin" }}>
                <Tx>Visite di oggi</Tx>
              </span>
              <span data-cnt="" style={{ ...DISP, fontSize: "9cqmin", lineHeight: 0.9 }}>
                3
              </span>
            </span>
          </span>
          <span className="relative mt-[2.4cqmin] block" style={{ height: "10cqmin" }}>
            {TRACK.map(([n, l, w]) => (
              <span key={n} className="absolute top-0 flex items-center justify-center rounded-[1.6cqmin] font-medium text-white/85" style={{ left: `${l}%`, width: `${w}%`, height: "100%", background: "rgba(255,255,255,.16)", fontSize: "2cqmin" }}>
                {n}
              </span>
            ))}
            <span className="absolute top-0 rounded-[1.6cqmin]" style={{ left: "61.1%", width: "11.1%", height: "100%", border: "1.5px dashed rgba(255,255,255,.35)" }} />
            <span data-new="" className="absolute top-0 flex items-center justify-center rounded-[1.6cqmin] font-semibold opacity-0" style={{ left: "61.1%", width: "11.1%", height: "100%", background: ACC, color: "#04121c", fontSize: "2cqmin", boxShadow: "0 0 0 0 rgba(143,216,255,.6)" }}>
              GR
            </span>
          </span>
          <span className="mt-[1.2cqmin] flex justify-between font-mono text-white/45" style={{ fontSize: "1.6cqmin" }}>
            {["9", "11", "13", "15", "17"].map((h) => (
              <span key={h}>{h}:00</span>
            ))}
          </span>
        </Bead>
        {/* la notifica */}
        <Bead data-toast="" tint="rgba(255,255,255,.2)" radius={999} className="w-ts absolute flex items-center opacity-0" style={{ height: "11cqmin", paddingLeft: "1.6cqmin", paddingRight: "4cqmin", gap: "2.2cqmin" }}>
          <span className="flex items-center justify-center rounded-full" style={{ width: "8cqmin", height: "8cqmin", background: ACC, color: "#04121c" }}>
            <Ico i={Notification01Icon} s={16} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-semibold" style={{ fontSize: "2.4cqmin" }}>
              <Tx>Nuova prenotazione</Tx>
            </span>
            <span className="text-white/75" style={{ fontSize: "2cqmin" }}>
              <Tx>Giulia R. · giovedì alle 14:30</Tx>
            </span>
          </span>
        </Bead>
        {/* la prenotazione */}
        <Bead data-book="" tint="rgba(10,14,18,.5)" radius={40} className="w-bk absolute flex flex-col justify-between" style={{ padding: "3.4cqmin" }}>
          <span className="block">
            <span className="flex items-center text-white/65" style={{ gap: "1.2cqmin", fontSize: "1.9cqmin" }}>
              <span className="rounded-full" style={{ width: "1.2cqmin", height: "1.2cqmin", background: ACC }} />
              Studio Bianchi
            </span>
            <span className="mt-[1cqmin] block" style={{ ...DISP, fontSize: "min(8.4cqw, 10cqh)", lineHeight: 1 }}>
              <Tx>Prenota la visita</Tx>
            </span>
          </span>
          <span className="block">
            <DayPills />
            <span className="mt-[1.6cqmin] grid grid-cols-4" style={{ gap: "1.4cqmin" }}>
              {["9:00", "11:30", "14:30", "17:00"].map((h) => (
                <span key={h} data-slot={h} className="flex items-center justify-center rounded-full opacity-0" style={{ height: "8cqmin", fontSize: "2.3cqmin", border: "1.5px solid rgba(255,255,255,.28)" }}>
                  {h}
                </span>
              ))}
            </span>
          </span>
          <span data-confirm="" className="relative block overflow-hidden rounded-full bg-white font-semibold text-black opacity-40" style={{ height: "11cqmin", fontSize: "2.8cqmin" }}>
            <span data-ct="" className="flex h-full items-center justify-center">
              <Tx>Conferma</Tx>
            </span>
            <span data-cd="" className="absolute inset-0 flex items-center justify-center gap-[1cqmin] opacity-0">
              <Ico i={Tick02Icon} s={18} />
              <Tx>Confermato</Tx>
            </span>
          </span>
        </Bead>
      </Bead>
    ),
    play: (run, $, at) => {
      const book = $("[data-book]")[0];
      const day = $('[data-day="3"]')[0];
      const c = cursorIn(run, $, day, at);
      const shot = c.shot;
      run.set($("[data-toast]"), { autoAlpha: 0, y: -30 }, at).set($("[data-new]"), { opacity: 0 }, at);
      run.fromTo($("[data-bg3]"), { scale: 1.2 }, { scale: 1.04, duration: 5.5, ease: "power2.out" }, at);
      run.fromTo($("[data-trk]"), { autoAlpha: 0, y: -40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, at + 0.1);
      run.fromTo(book, { autoAlpha: 0, y: 80 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out" }, at + 0.25);
      zoomTo(run, shot, book, 1.07, at + 0.9, 1.0, 0.5, 0.5);
      let t = human(run, c.cur, () => spot(shot, day), at + 1.1, 0.7);
      press(run, c.cur, day, t);
      run
        .to(day, { backgroundColor: "#ffffff", color: "#0d1115", duration: 0.25 }, t)
        .fromTo($("[data-slot]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "expo.out" }, t + 0.12);
      const slot = $('[data-slot="14:30"]')[0];
      t = human(run, c.cur, () => spot(shot, slot), t + 0.7, 0.55);
      press(run, c.cur, slot, t);
      run.to(slot, { backgroundColor: "#ffffff", color: "#0d1115", borderColor: "#ffffff", duration: 0.25 }, t).to($("[data-confirm]"), { opacity: 1, duration: 0.3 }, t);
      const conf = $("[data-confirm]")[0];
      t = human(run, c.cur, () => spot(shot, conf), t + 0.45, 0.55);
      press(run, c.cur, conf, t);
      run
        .to($("[data-ct]"), { opacity: 0, duration: 0.15 }, t)
        .to($("[data-cd]"), { opacity: 1, duration: 0.25 }, t + 0.05)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.3);
      // nello stesso istante: la camera passa alla giornata, il blocco si accende, arriva la notifica
      const a = t + 0.4;
      const trk = $("[data-trk]")[0];
      wideTo(run, shot, a, 0.9);
      run
        .fromTo($("[data-new]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, a + 0.3)
        .fromTo($("[data-new]"), { boxShadow: "0 0 0 0 rgba(143,216,255,.7)" }, { boxShadow: "0 0 0 2.4cqmin rgba(143,216,255,0)", duration: 1.0, ease: "power2.out" }, a + 0.35)
        .to($("[data-toast]"), { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out" }, a + 0.55);
      count(run, $("[data-cnt]")[0], 3, 4, a + 0.45, 0.4, (n) => String(Math.round(n)));
      snd(run, "notify", a + 0.35);
    },
  },
];


/* ───────────── SEO: ti cercano e trovano gli altri → si sistema il sito → ora trovano te ───────────── */

const US = 3;
const RESULTS = [
  ["clinicarossi.it", "Clinica Dentale Rossi", "Igiene, ortodonzia e implantologia in centro città."],
  ["dentistiassociati.it", "Dentisti Associati", "Visite e preventivi su appuntamento."],
  ["centrosorriso.it", "Centro Sorriso", "Sbiancamento e igiene, prima visita gratuita."],
  ["studiobianchi.it", "Studio Bianchi · Dentista a Brescia", "Prenota online in 1 minuto. Orari estesi, anche il sabato."],
];
const ROW = 70;
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
/** La pagina dei risultati: quattro righe alte uguali, così una può scalare la classifica scorrendo sulle altre. */
const Serp = () => (
  <span data-serp className="absolute inset-0 block px-8 pt-6">
    <span className="flex items-center gap-4 border-b border-white/10 pb-4">
      <GoogleWord size={22} />
      <span className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#303134] px-4 text-[13.5px]">
        <Tx>{QUERY}</Tx>
        <Ico i={Search01Icon} s={15} c="ml-auto text-[#8ab4f8]" />
      </span>
    </span>
    <span className="relative mt-3 block" style={{ height: ROW * RESULTS.length }}>
      {RESULTS.map(([d, t, sn], i) => (
        <span key={d} data-r {...(i === US ? { "data-us": "" } : {})} className="absolute inset-x-0 flex items-center gap-3 rounded-[14px] px-3" style={{ top: i * ROW, height: ROW - 8 }}>
          <span data-rank className="w-5 shrink-0 text-center font-mono text-[13px] tabular-nums text-white/35">
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-[11.5px] text-[#bdc1c6]">
              <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-semibold ${i === US ? "bg-[#5ec4ff] text-[#04121c]" : "bg-white/15"}`}>{t[0]}</span>
              {d}
            </span>
            <span data-t className="block truncate text-[16px] leading-tight text-[#8ab4f8]">{t}</span>
            <span className="block truncate text-[12px] text-[#bdc1c6]">
              <Tx>{sn}</Tx>
            </span>
          </span>
        </span>
      ))}
    </span>
  </span>
);
const FIXES: [string, string, string][] = [
  ["Tempo di apertura", "6,2 s", "0,9 s"],
  ["Peso delle immagini", "4,8 MB", "310 KB"],
  ["Titoli delle pagine", "3 su 24", "24 su 24"],
  ["Scheda Google", "incompleta", "completa"],
];
const SCORES = [41, 58, 74, 89, 98];
const tone = (v: number) => (v < 50 ? "#ff6b5e" : v < 85 ? AMBER : GREEN);

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
          <span data-sbar className="mt-7 flex h-[46px] w-[min(440px,72%)] items-center gap-3 rounded-full bg-[#303134] px-4 text-[15px] shadow-[inset_0_0_0_1px_#5f6368]">
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
        <span data-serpbox className="absolute inset-0 block opacity-0">
          <Serp />
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      const cur = $("[data-cursor]")[0];
      const shot = cur.parentElement as HTMLElement;
      const bar = $("[data-sbar]")[0];
      const go = $("[data-go]")[0];
      const q = $("[data-q]")[0] as HTMLElement;
      const caret = $("[data-caret]")[0];
      const rows = $("[data-r]");
      const us = $("[data-us]")[0];
      const first = rows[0].querySelector("[data-t]") as Element;
      const word = (document.documentElement.lang === "en" ? EN[QUERY] : undefined) ?? QUERY;
      // stato iniziale, a ogni giro
      run
        .call(() => void (q.textContent = ""), undefined, at - 0.35)
        .set($("[data-home]"), { autoAlpha: 1, y: 0 }, at - 0.35)
        .set($("[data-word]"), { scale: 1, x: 0, y: 0 }, at - 0.35)
        .set($("[data-serpbox]"), { autoAlpha: 0 }, at - 0.35)
        .set(bar, { boxShadow: "inset 0 0 0 1px #5f6368" }, at - 0.35)
        .set(first, { color: "#8ab4f8", textDecoration: "none" }, at - 0.35)
        .set(us, { opacity: 1 }, at - 0.35)
        .set(cur, { x: () => spot(shot, bar).x + 170, y: () => spot(shot, bar).y + 150, opacity: 0, scale: 1 }, at - 0.35)
        .to(cur, { opacity: 1, duration: 0.2 }, at);
      // 1 · sulla barra, clic
      human(run, cur, () => spot(shot, bar, 0.3, 0.55), at + 0.05, 0.6);
      press(run, cur, bar, at + 0.8);
      run.to(bar, { boxShadow: "inset 0 0 0 1px #8ab4f8, 0 0 0 4px rgba(138,180,248,.18)", duration: 0.2 }, at + 0.8).to(caret, { opacity: 1, duration: 0.01 }, at + 0.85);
      // 2 · scrive, con il ritmo irregolare di una persona
      let t = at + 0.95;
      for (let i = 1; i <= word.length; i++) {
        const sub = word.slice(0, i);
        run.call(() => {
          q.textContent = sub;
          sfx("key");
        }, undefined, t);
        t += word[i - 1] === " " ? 0.1 : 0.04 + ((i * 37) % 5) * 0.01;
      }
      // 3 · al pulsante, clic
      human(run, cur, () => spot(shot, go, 0.55, 0.6), t + 0.1, 0.45);
      press(run, cur, go, t + 0.6);
      snd(run, "send", t + 0.65);
      run.to(caret, { opacity: 0, duration: 0.01 }, t + 0.6);
      // 4 · la pagina dei risultati: il logo vola in alto a sinistra, i risultati arrivano a raffica
      const sw = t + 0.7;
      const small = () => shot.querySelector("[data-serp] .font-medium") as Element;
      run
        .to($("[data-btns]"), { autoAlpha: 0, y: 6, duration: 0.2 }, sw)
        .to(bar, { autoAlpha: 0, y: -40, duration: 0.35, ease: "power3.in" }, sw)
        .to($("[data-word]"), { x: () => -spot(shot, $("[data-word]")[0]).x + spot(shot, small()).x, y: () => -spot(shot, $("[data-word]")[0]).y + spot(shot, small()).y, scale: 0.38, duration: 0.5, ease: "expo.inOut" }, sw)
        .set($("[data-home]"), { autoAlpha: 0 }, sw + 0.5)
        .to($("[data-serpbox]"), { autoAlpha: 1, duration: 0.2 }, sw + 0.42)
        .fromTo(rows, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "expo.out" }, sw + 0.48)
        // il nostro sito c'è, ma in fondo: resta in ombra
        .to(us, { opacity: 0.38, duration: 0.5 }, sw + 1);
      // 5 · chi cerca non scorre: preme il primo, che è un concorrente
      human(run, cur, () => spot(shot, first, 0.35, 0.6), sw + 0.8, 0.5);
      run.to(first, { textDecoration: "underline", duration: 0.01 }, sw + 1.3);
      press(run, cur, first, sw + 1.45);
      run.to(first, { color: "#c58af9", duration: 0.2 }, sw + 1.5).to(cur, { opacity: 0, duration: 0.3 }, sw + 2);
    },
  },
  {
    dur: 5,
    node: (
      <Win title={<span>studiobianchi.it</span>} logo={<Ours size={15} />}>
        <span className="absolute inset-0 grid grid-cols-[38%_1fr] items-center gap-2 p-6">
          <span className="flex flex-col items-center gap-3">
            <span className="relative h-[150px] w-[150px]">
              <svg viewBox="0 0 110 110" className="absolute inset-0 -rotate-90">
                <circle cx="55" cy="55" r="48" fill="rgba(0,0,0,.25)" stroke="rgba(255,255,255,.1)" strokeWidth="7" />
                <circle data-ring cx="55" cy="55" r="48" fill="none" stroke="#ff6b5e" strokeWidth="7" strokeLinecap="round" pathLength={100} strokeDasharray="100" strokeDashoffset="59" />
              </svg>
              <span data-score className="absolute inset-0 flex items-center justify-center font-mono text-[44px] tabular-nums text-white">
                41
              </span>
            </span>
            <span className="text-[12.5px] text-white/60"><Tx>Punteggio</Tx></span>
          </span>
          <span className="flex flex-col gap-2">
            {FIXES.map(([l, a, b]) => (
              <span key={l} data-fix className="flex items-center gap-3 rounded-[14px] bg-white/[.05] px-3.5 py-3 text-[13px]">
                <span className="relative block h-4 w-4 shrink-0">
                  <span data-dot className="absolute inset-[3px] block rounded-full bg-[#ff6b5e]" />
                  <span data-chk className="absolute inset-0 opacity-0">
                    <Ico i={CheckmarkCircle02Icon} s={16} c="text-[#6ee7a8]" />
                  </span>
                </span>
                <span className="flex-1"><Tx>{l}</Tx></span>
                <span className="relative block text-right font-mono text-[12px]">
                  <span data-old className="block text-[#ffb4ae]"><Tx>{a}</Tx></span>
                  <span data-new className="absolute right-0 top-0 block whitespace-nowrap text-[#8ff0ad] opacity-0"><Tx>{b}</Tx></span>
                </span>
              </span>
            ))}
          </span>
        </span>
      </Win>
    ),
    play: (run, $, at) => {
      const ring = $("[data-ring]")[0];
      const score = $("[data-score]")[0];
      run.set(ring, { strokeDashoffset: 100 - SCORES[0], stroke: tone(SCORES[0]) }, at - 0.3).call(() => void (score.textContent = String(SCORES[0])), undefined, at - 0.3);
      run.fromTo($("[data-fix]"), { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.07, ease: "expo.out" }, at);
      // un intervento alla volta: la riga passa al verde, il valore cambia e il punteggio sale di conseguenza
      $("[data-fix]").forEach((row, i) => {
        const a = at + 0.9 + i * 0.6;
        const v = SCORES[i + 1];
        run
          .to(row, { backgroundColor: "rgba(110,231,168,.1)", duration: 0.3 }, a)
          .to($("[data-dot]")[i], { scale: 0, duration: 0.2 }, a)
          .fromTo($("[data-chk]")[i], { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.6)" }, a + 0.05)
          .to($("[data-old]")[i], { opacity: 0, y: -8, duration: 0.2 }, a)
          .fromTo($("[data-new]")[i], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, a + 0.1)
          .to(ring, { strokeDashoffset: 100 - v, stroke: tone(v), duration: 0.5, ease: "power2.out" }, a);
        count(run, score, SCORES[i], v, a, 0.5, (n) => String(Math.round(n)));
        snd(run, "tick", a);
      });
      const end = at + 0.9 + FIXES.length * 0.6;
      run.fromTo(score, { scale: 1 }, { scale: 1.14, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, end);
      snd(run, "success", end);
    },
  },
  {
    dur: 5,
    node: (
      <Bead data-full="" tint="rgba(32,33,36,.99)" radius={0} className="relative block h-full w-full overflow-hidden text-[#e8eaed]">
        <Serp />
        <span data-gain className="absolute right-8 top-[158px] z-10 block opacity-0">
          <Bead tint="rgba(20,32,26,.9)" radius={18} className="flex items-center gap-3 px-4 py-3 text-white">
            <svg viewBox="0 0 60 24" className="h-6 w-[60px]" aria-hidden>
              <path data-trend d="M2 21 L14 18 L26 16 L38 10 L48 7 L58 2" fill="none" stroke={GREEN} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
            </svg>
            <span className="leading-tight">
              <span data-pct className="block font-mono text-[18px] tabular-nums text-[#8ff0ad]">+0%</span>
              <span className="block text-[11px] text-white/60"><Tx>Visite dalla ricerca</Tx></span>
            </span>
          </Bead>
        </span>
      </Bead>
    ),
    play: (run, $, at) => {
      const rows = $("[data-r]");
      const us = $("[data-us]")[0];
      const ranks = $("[data-rank]");
      const title = us.querySelector("[data-t]") as Element;
      const c = cursorIn(run, $, us, at + 2);
      run
        .set(rows, { y: 0 }, at - 0.3)
        .set(us, { backgroundColor: "rgba(138,180,248,0)", boxShadow: "inset 0 0 0 1px rgba(138,180,248,0)", zIndex: 2 }, at - 0.3)
        .set(title, { color: "#8ab4f8", textDecoration: "none" }, at - 0.3)
        .call(() => ranks.forEach((r, i) => void (r.textContent = String(i + 1))), undefined, at - 0.3);
      // la nostra riga si accende e sale, una posizione alla volta, mentre le altre scendono
      run.to(us, { backgroundColor: "rgba(138,180,248,.12)", boxShadow: "inset 0 0 0 1px rgba(138,180,248,.35)", duration: 0.3 }, at + 0.3);
      for (let k = 1; k <= US; k++) {
        const a = at + 0.55 + (k - 1) * 0.42;
        run
          .to(us, { y: -ROW * k, duration: 0.4, ease: "back.out(1.5)" }, a)
          .to(rows[US - k], { y: ROW, duration: 0.4, ease: "power3.inOut" }, a)
          .call(
            () => {
              ranks[US].textContent = String(US - k + 1);
              ranks[US - k].textContent = String(US - k + 2);
            },
            undefined,
            a + 0.2,
          );
        snd(run, "tick", a + 0.2);
      }
      const top = at + 0.55 + US * 0.42;
      run.to(ranks[US], { color: "#8ff0ad", scale: 1.3, duration: 0.2, yoyo: true, repeat: 1 }, top);
      snd(run, "success", top);
      // adesso chi cerca preme noi
      const t = click(run, c, title, at + 2.05, 0.5, 0.35, 0.6);
      run
        .to(title, { textDecoration: "underline", color: "#c58af9", duration: 0.15 }, t)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.4)
        .fromTo($("[data-gain]"), { opacity: 0, y: 14, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }, t + 0.25)
        .fromTo($("[data-trend]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, t + 0.4);
      count(run, $("[data-pct]")[0], 0, 142, t + 0.4, 0.9, (n) => `+${Math.round(n)}%`);
      snd(run, "notify", t + 0.3);
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
        <span data-chat className="absolute inset-0 flex flex-col justify-center px-8 opacity-0 sm:px-12">
          <span className="mx-auto block w-full max-w-[560px]">
          <span className="flex justify-end">
            <span className="rounded-[16px] bg-[#30302e] px-4 py-2.5 text-[15px] text-[#ece9e1]">
              <Tx>{ASK}</Tx>
            </span>
          </span>
          <span className="mt-6 grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3.5">
            <span data-think className="mt-1 block">
              <Img src={claudeLogo} s={28} />
            </span>
            <span className="block text-[18px] leading-[1.6] text-[#ece9e1]">
              <Words s="Ti consiglio" />
              <span data-wd className="relative inline-block font-semibold text-white">
                Studio Bianchi
                <span data-mark className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[#5ec4ff]" style={{ transform: "scaleX(0)" }} />
              </span>
              <Words s=", in centro a Brescia: prenotazione online, orari estesi e recensioni molto positive." />
              <span data-wd className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-white/[.07] px-2.5 py-1 text-[13px] text-white/70">
                <Ico i={LockKeyIcon} s={11} />
                studiobianchi.it
              </span>
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
      snd(run, "send", t + 0.1);
      snd(run, "open", t + 0.3);
      stream(run, $("[data-wd]"), t + 0.85, 0.035);
      run.to($("[data-mark]"), { scaleX: 1, duration: 0.45, ease: "expo.out" }, t + 1.15);
      snd(run, "tick", t + 1.2, 0.8);
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
    play: (run, $, at) => {
      run
        .fromTo($("[data-n]"), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.16, ease: "expo.out" }, at - 0.3)
        .fromTo($("[data-lg]"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, stagger: 0.16, ease: "expo.out" }, at - 0.1);
      // un tocco di vetro per ogni logo, nell'istante in cui compare, in salita
      [1, 1.12, 1.26, 1.5].forEach((p, i) => snd(run, "copy", at - 0.1 + i * 0.16, p));
    },
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
        .fromTo($("[data-big]"), { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "expo.out" }, at - 0.3)
        .fromTo($("[data-ul]"), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "expo.out" }, at + 0.5)
        .call(() => sfx("success"), undefined, at + 0.55),
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
    dur: 4.6,
    node: (
      <span className="relative flex flex-col items-center">
        <span className="relative block h-[244px] w-[540px]">
          {/* la stessa app sul computer: nasce dal telefono e si allarga */}
          <span data-desk className="absolute left-[18px] top-0 block origin-[78%_55%] opacity-0">
            <Win w={404} h={240} title={<span>Studio Bianchi</span>} logo={<Ours size={15} />}>
              <span className="absolute inset-0 grid grid-cols-[104px_1fr]">
                <span className="flex flex-col gap-2 border-r border-white/[.07] p-3">
                  <Bar w="70%" h={7} c="bg-white/70" />
                  {[0, 1, 2, 3].map((k) => (
                    <span key={k} className={`flex items-center gap-2 rounded-[8px] p-1.5 ${k === 0 ? "bg-[rgba(94,196,255,.2)]" : ""}`}>
                      <span className="h-3.5 w-3.5 rounded-[4px] bg-white/25" />
                      <Bar w="55%" h={5} />
                    </span>
                  ))}
                </span>
                <span className="flex flex-col gap-2 p-3">
                  <span className="h-[62px] rounded-[12px] bg-[linear-gradient(135deg,rgba(94,196,255,.45),rgba(31,127,184,.25))]" />
                  <span className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} className="flex items-center gap-2 rounded-[10px] bg-white/[.06] p-2">
                        <span className="h-5 w-5 rounded-[6px] bg-white/20" />
                        <Bar w="60%" h={6} />
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            </Win>
          </span>
          <span data-ph className="absolute left-[400px] top-[16px] block">
            <Phone w={122} h={236}>
              <AppUI />
            </Phone>
          </span>
        </span>
        <span className="mt-6 flex gap-2">
          {(
            [
              ["iPhone", <Brand key="i" p={si.siApple} c="h-3.5 w-3.5" />],
              ["Android", <Img key="a" src="/visual/brands/android.svg" s={15} />],
              ["Mac", <Brand key="m" p={si.siApple} c="h-3.5 w-3.5" />],
              ["Windows", <Img key="w" src="/visual/brands/windows.svg" s={13} />],
              ["Linux", <Img key="l" src="/visual/brands/linux.svg" s={15} />],
            ] as [string, ReactNode][]
          ).map(([n, ic]) => (
            <span key={n} data-os className="opacity-0">
              <Bead tint={GL} radius={17} className="flex h-[34px] items-center gap-2 px-3.5 text-[12.5px] font-medium text-white">
                {ic}
                {n}
              </Bead>
            </span>
          ))}
        </span>
      </span>
    ),
    play: (run, $, at) => {
      const ph = $("[data-ph]")[0];
      const desk = $("[data-desk]")[0];
      const os = $("[data-os]");
      // il telefono parte al centro, grande; poi scivola di lato mentre dallo stesso punto si apre la versione per computer
      run
        .fromTo(ph, { x: -190, scale: 1.18 }, { x: 0, scale: 1, duration: 0.9, ease: "expo.inOut" }, at + 0.7)
        .fromTo(desk, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.9, ease: "expo.inOut" }, at + 0.7);
      snd(run, "whoosh", at + 0.8);
      // i sistemi si accendono uno dopo l'altro; il dispositivo che li riguarda risponde con un piccolo colpo
      os.forEach((o, i) => {
        const a = at + (i < 2 ? 0.1 + i * 0.22 : 1.55 + (i - 2) * 0.22);
        run.fromTo(o, { opacity: 0, y: 12, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(2.2)" }, a);
        run.to(i < 2 ? ph : desk, { y: -5, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, a);
        snd(run, "tick", a);
      });
    },
  },
  {
    dur: 6,
    node: (
      <span className="relative flex items-center gap-[108px]">
        <Phone w={156} h={300}>
          <span className="flex items-center justify-between">
            <span className="text-[11px] font-semibold"><Tx>Ordini</Tx></span>
            <span className="relative flex h-4 items-center text-[8.5px]">
              <span data-on className="flex items-center gap-1 whitespace-nowrap text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
                <Tx>Online</Tx>
              </span>
              <span data-off className="absolute right-0 flex items-center gap-1 whitespace-nowrap text-[#f5c46b] opacity-0">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f5c46b]" />
                <Tx>Senza rete</Tx>
              </span>
            </span>
          </span>
          <span className="mt-3 flex flex-col gap-1.5 text-[10.5px]">
            <span className="rounded-[10px] bg-white/[.06] p-2">Marco B.</span>
            <span data-r1 className="rounded-[10px] bg-[rgba(94,196,255,.24)] p-2 opacity-0">
              <span data-t1 className="block h-[14px]" />
            </span>
            <span data-r2 className="relative flex items-center justify-between rounded-[10px] border border-dashed border-[#f5c46b]/60 p-2 opacity-0">
              <span className="whitespace-nowrap text-[9.5px]"><Tx>Consegna alle 15</Tx></span>
              <span data-wait className="h-1.5 w-1.5 rounded-full bg-[#f5c46b]" />
              <span data-sent className="absolute right-2 opacity-0">
                <Ico i={CheckmarkCircle02Icon} s={12} c="text-[#6ee7a8]" />
              </span>
            </span>
          </span>
        </Phone>
        {/* il filo tra i due dispositivi: un punto di luce porta ogni modifica dall'altra parte */}
        <svg viewBox="0 0 108 20" className="absolute left-[156px] top-1/2 h-5 w-[108px] -translate-y-1/2 overflow-visible" aria-hidden>
          <path data-wire d="M6 10H102" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" strokeDasharray="3 5" strokeLinecap="round" />
          <circle data-pulse cx="6" cy="10" r="4" fill="#8fd8ff" opacity="0" />
        </svg>
        <Win w={300} h={220} title={<span><Tx>Ordini di oggi</Tx></span>} logo={<Ours size={15} />}>
          <span className="absolute inset-0 flex flex-col gap-2 p-3.5 text-[12px]">
            <span className="rounded-[10px] bg-white/[.06] px-3 py-2.5">Marco B.</span>
            <span data-d1 className="rounded-[10px] bg-[rgba(94,196,255,.24)] px-3 py-2.5 opacity-0">
              <span data-dt1 className="block h-[16px]" />
            </span>
            <span data-d2 className="flex items-center justify-between rounded-[10px] bg-[rgba(94,196,255,.24)] px-3 py-2.5 opacity-0">
              <Tx>Consegna alle 15</Tx>
              <Ico i={CheckmarkCircle02Icon} s={14} c="text-[#6ee7a8]" />
            </span>
          </span>
        </Win>
      </span>
    ),
    play: (run, $, at) => {
      const pulse = $("[data-pulse]")[0];
      const fly = (a: number) => {
        run.fromTo(pulse, { attr: { cx: 6 }, opacity: 0 }, { opacity: 1, duration: 0.1 }, a).to(pulse, { attr: { cx: 102 }, duration: 0.45, ease: "power2.inOut" }, a).to(pulse, { opacity: 0, duration: 0.15 }, a + 0.4);
        snd(run, "send", a);
      };
      const name = "Giulia R. · 2";
      // 1 · scrivi sul telefono: il computer si aggiorna mentre scrivi
      run.fromTo($("[data-r1]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, at);
      let t = typeText(run, $("[data-t1]")[0], name, at + 0.2, 1.4);
      fly(at + 0.35);
      run.fromTo($("[data-d1]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out" }, at + 0.7);
      typeText(run, $("[data-dt1]")[0], name, at + 0.75, 1.9);
      // 2 · cade la rete: l'app continua a funzionare e tiene da parte la modifica
      t += 0.5;
      run
        .to($("[data-on]"), { opacity: 0, duration: 0.2 }, t)
        .to($("[data-off]"), { opacity: 1, duration: 0.2 }, t)
        .to($("[data-wire]"), { opacity: 0.25, duration: 0.3 }, t)
        .fromTo($("[data-r2]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, t + 0.45);
      snd(run, "tick", t + 0.45);
      // 3 · torna la rete: tutto si riallinea da solo
      t += 1.5;
      run
        .to($("[data-off]"), { opacity: 0, duration: 0.2 }, t)
        .to($("[data-on]"), { opacity: 1, duration: 0.2 }, t)
        .to($("[data-wire]"), { opacity: 1, duration: 0.3 }, t);
      fly(t + 0.15);
      run
        .to($("[data-wait]"), { opacity: 0, duration: 0.2 }, t + 0.5)
        .to($("[data-r2]"), { borderColor: "rgba(94,196,255,0)", backgroundColor: "rgba(94,196,255,.24)", duration: 0.3 }, t + 0.5)
        .fromTo($("[data-sent]"), { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2.5)" }, t + 0.55)
        .fromTo($("[data-d2]"), { opacity: 0, y: 8, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, t + 0.6);
      snd(run, "success", t + 0.6);
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
          <span data-frames className="absolute inset-0 flex items-center justify-center gap-[72px]">
            {[0, 1, 2].map((i) => (
              <span key={i} data-fr className="relative block h-[236px] w-[118px] shrink-0 overflow-hidden rounded-[14px] shadow-[0_0_0_1px_rgba(255,255,255,.12),0_10px_30px_-10px_rgba(0,0,0,.6)]" style={{ transform: `translateY(${i === 1 ? -22 : 0}px)` }}>
                <Screen i={i} />
              </span>
            ))}
            {/* i collegamenti partono dal bordo di una schermata e arrivano al bordo della successiva */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
              {[0, 1].map((k) => (
                <g key={k}>
                  <path data-noodle d="" fill="none" stroke="#0d99ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
                  <circle data-wdot r="4" fill="#fff" stroke="#0d99ff" strokeWidth="1.8" opacity="0" />
                </g>
              ))}
            </svg>
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
      const frs = $("[data-fr]") as HTMLElement[];
      const wires = () => {
        // il layout è già pronto: i punti si leggono dalle schermate vere
        const g = (el: HTMLElement, k: number) => ({ l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth, y: el.offsetTop + el.offsetHeight / 2 + (k === 1 ? -22 : 0) });
        [0, 1].forEach((k) => {
          const a = g(frs[k], k);
          const b = g(frs[k + 1], k + 1);
          const dx = (b.l - a.r) * 0.5;
          $("[data-noodle]")[k].setAttribute("d", `M${a.r} ${a.y} C${a.r + dx} ${a.y} ${b.l - dx} ${b.y} ${b.l} ${b.y} M${b.l - 8} ${b.y - 5} L${b.l} ${b.y} L${b.l - 8} ${b.y + 5}`);
          $("[data-wdot]")[k].setAttribute("cx", String(a.r));
          $("[data-wdot]")[k].setAttribute("cy", String(a.y));
        });
      };
      run.call(wires, undefined, at - 0.35);
      run
        .fromTo($("[data-noodle]"), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.55, stagger: 0.3, ease: "power2.inOut" }, at)
        .fromTo($("[data-wdot]"), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.3 }, at - 0.05);
      let t = click(run, c, $("[data-play]")[0], at + 0.95, 0.45);
      // modalità presentazione: le tavole spariscono, il prototipo si apre al centro e si usa davvero
      const player = $("[data-player]")[0];
      const track = $("[data-track]")[0];
      run
        .set(track, { x: 0 }, at - 0.3)
        .set(player, { autoAlpha: 0, scale: 0.8 }, at - 0.3)
        .set($("[data-frames]"), { autoAlpha: 1, scale: 1 }, at - 0.3)
        .to($("[data-frames]"), { autoAlpha: 0, scale: 0.92, duration: 0.35, ease: "power2.in" }, t + 0.1)
        .to([...$("[data-noodle]"), ...$("[data-wdot]")], { opacity: 0, duration: 0.2 }, t + 0.1)
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
          {["Giulia", "Marco", "Laura", "Sergio", "Anna"].map((n, i) => (
            <span key={n} data-who className="flex flex-col items-center gap-1.5">
              <span className="relative block h-14 w-14">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/visual/people/p${i + 1}.jpg`} alt="" draggable={false} className="h-full w-full rounded-full object-cover shadow-[0_0_0_2px_rgba(255,255,255,.18)]" />
                <span data-tick className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#30d158] text-white opacity-0 shadow-[0_0_0_2px_rgba(12,18,26,.9)]">
                  <Ico i={CheckmarkCircle02Icon} s={12} />
                </span>
              </span>
              <span className="text-[11px] text-white/70">{n}</span>
              <span data-sec className="font-mono text-[11px] text-white/45">{[34, 41, 29, 38, 45][i]} s</span>
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
              <span data-sbar className="block h-full w-full origin-left rounded-full bg-[#d97757]" style={{ transform: "scaleX(0)" }} />
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
        .fromTo($("[data-sbar]"), { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: "power1.inOut" }, at - 0.2)
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
    dur: 5,
    node: (
      <Phone w={216} h={372}>
        {/* la notifica arriva sul telefono: un tocco e si è dentro l'app */}
        <span data-push className="absolute inset-x-2 top-8 z-10 block opacity-0">
          <Bead tint="rgba(40,44,52,.96)" radius={16} className="flex items-center gap-2.5 p-2.5 text-white">
            <Tile size={30} tone="amber">
              <Ico i={Notification01Icon} s={14} />
            </Tile>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[11px] font-semibold"><Tx>Temperatura in aumento</Tx></span>
              <span className="block truncate text-[9.5px] text-white/60"><Tx>Cella frigo 2 · porta aperta da 6 min</Tx></span>
            </span>
          </Bead>
        </span>
        <span data-app className="block">
          <span className="block text-[15px] font-semibold"><Tx>Impianti</Tx></span>
          <span className="relative mb-3 block h-4 text-[11px]">
            <span data-warn className="absolute left-0 whitespace-nowrap text-[#f5c46b]"><Tx>1 avviso</Tx></span>
            <span data-fine className="absolute left-0 flex items-center gap-1 whitespace-nowrap text-[#8ff0ad] opacity-0">
              <Ok><Tx>Tutto regolare</Tx></Ok>
            </span>
          </span>
          <span className="block space-y-2">
            {[
              ["Cella frigo 1", "3,8°"],
              ["Cella frigo 2", "7,8°"],
              ["Forno", "180°"],
              ["Compressore", "On"],
            ].map(([n, v], i) => (
              <span key={n} data-row {...(i === 1 ? { "data-hot": "" } : {})} className="flex items-center gap-2 rounded-[12px] bg-white/[.07] px-3 py-2.5 text-[12px]">
                <span {...(i === 1 ? { "data-hdot": "" } : {})} className={`h-2 w-2 rounded-full ${i === 1 ? "bg-[#f5c46b]" : "bg-[#34d399]"}`} />
                <span className="flex-1"><Tx>{n}</Tx></span>
                <span {...(i === 1 ? { "data-hval": "" } : {})} className="font-mono text-white/70">{v}</span>
              </span>
            ))}
          </span>
          <span data-door className="mt-3 flex items-center gap-2 rounded-[12px] bg-[rgba(110,231,168,.12)] px-3 py-2.5 text-[11px] text-[#8ff0ad] opacity-0">
            <Ok><span className="whitespace-nowrap text-[10px]"><Tx>Porta chiusa · temperatura in discesa</Tx></span></Ok>
          </span>
        </span>
      </Phone>
    ),
    play: (run, $, at) => {
      const push = $("[data-push]")[0];
      const hot = $("[data-hot]")[0];
      const val = $("[data-hval]")[0];
      run
        .set($("[data-app]"), { opacity: 0.25 }, at - 0.3)
        .set(hot, { backgroundColor: "rgba(245,196,107,.16)" }, at - 0.3)
        .set($("[data-hdot]"), { backgroundColor: "#f5c46b" }, at - 0.3)
        .set($("[data-warn]"), { opacity: 1 }, at - 0.3)
        .set($("[data-fine]"), { opacity: 0 }, at - 0.3)
        .call(() => void (val.textContent = "7,8°"), undefined, at - 0.3)
        .fromTo(push, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }, at);
      snd(run, "notify", at + 0.05);
      const c = cursorIn(run, $, push, at + 0.5);
      const t = click(run, c, push, at + 0.55, 0.5);
      run
        .to(push, { opacity: 0, y: -30, scale: 0.94, duration: 0.3, ease: "power2.in" }, t + 0.05)
        .to($("[data-app]"), { opacity: 1, duration: 0.35 }, t + 0.1)
        .fromTo($("[data-row]"), { y: 10 }, { y: 0, duration: 0.45, stagger: 0.05, ease: "expo.out" }, t + 0.1)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.5)
        // qualcuno chiude la porta: il valore scende sotto gli occhi e la riga torna verde
        .fromTo($("[data-door]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, t + 0.9)
        .to(hot, { backgroundColor: "rgba(255,255,255,.07)", duration: 0.5 }, t + 1.9)
        .to($("[data-hdot]"), { backgroundColor: "#34d399", duration: 0.4 }, t + 1.9)
        .to($("[data-warn]"), { opacity: 0, duration: 0.2 }, t + 1.9)
        .to($("[data-fine]"), { opacity: 1, duration: 0.3 }, t + 2);
      count(run, val, 7.8, 4, t + 1, 1.1, (n) => `${it(n, 1)}°`);
      snd(run, "tick", t + 0.9);
      snd(run, "success", t + 2);
    },
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
          <span data-drawer className="absolute bottom-0 right-0 top-0 flex w-[260px] flex-col bg-white p-4 shadow-[-20px_0_50px_-20px_rgba(0,0,0,.35)]">
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

/* ───────────── Hosting: uno scudo, un indirizzo protetto, aggiornamenti che non rompono, copie e allarmi di notte ───────────── */

/** Il fondo delle scene di hosting: un velo scuro steso su tutta la tela, il colore del servizio resta a filo. */
const Night = ({ children }: { children: ReactNode }) => (
  <span data-full="" className="relative block h-full w-full overflow-hidden bg-[linear-gradient(160deg,rgba(4,9,15,.78),rgba(4,9,15,.42))] text-white">
    {children}
  </span>
);
const Kicker = ({ children }: { children: ReactNode }) => <span className="block font-mono text-[12px] uppercase tracking-[0.14em] text-white/50">{children}</span>;
/** Le richieste che arrivano allo scudo: alcune sono attacchi e si fermano, le altre passano. */
const REQ = Array.from({ length: 30 }, (_, i) => ({ bad: [1, 3, 4, 7, 9, 10, 13, 15, 16, 19, 21, 24, 26, 28].includes(i), y: 8 + ((i * 37) % 84), d: (i * 0.17) % 2.6 }));
const PIPE = ["Modifica", "Controlli", "Prova", "Online"];
const NIGHTS = [64, 72, 58, 80, 76, 70, 88, 62, 74, 84, 79, 68, 90, 86];

export const OPS: Shot[] = [
  {
    dur: 5,
    node: (
      <Night>
        {/* lo scudo: una linea di luce verticale, il sito dietro */}
        <span data-wall className="absolute bottom-[18%] left-[60%] top-[12%] block w-[3px] origin-center rounded-full bg-[linear-gradient(#8fd8ff00,#8fd8ff,#8fd8ff00)] shadow-[0_0_24px_4px_rgba(94,196,255,.45)]" />
        <span className="absolute left-[60%] top-[12%] -translate-x-1/2 -translate-y-[130%]">
          <Ico i={Shield01Icon} s={30} c="text-[#8fd8ff]" />
        </span>
        <span className="absolute right-[7%] top-1/2 flex -translate-y-[70%] flex-col items-end gap-2 text-right">
          <span className="text-[28px] font-medium tracking-[-0.035em]">studiobianchi.it</span>
          <span className="flex items-center gap-1.5 text-[14px] text-[#8ff0ad]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#30d158]" />
            <Tx>Online</Tx>
          </span>
        </span>
        <span className="absolute inset-y-[12%] left-0 right-[40%] block">
          {REQ.map((r, i) => (
            <span key={i} data-req={r.bad ? "bad" : "ok"} className={`absolute left-0 block h-[4px] w-9 rounded-full opacity-0 ${r.bad ? "bg-[#ff6b5e]" : "bg-[#8fd8ff]"}`} style={{ top: `${r.y}%` }} />
          ))}
        </span>
        <span className="absolute bottom-[8%] left-[7%] right-[7%] flex items-end justify-between gap-6">
          <span className="block">
            <span data-blocked className="block font-mono text-[64px] leading-none tracking-[-0.05em] tabular-nums">0</span>
            <span className="mt-2 block"><Kicker><Tx>Attacchi fermati oggi</Tx></Kicker></span>
          </span>
          <span className="block">
            <span data-cache className="block font-mono text-[34px] leading-none tabular-nums text-white/85">0%</span>
            <span className="mt-2 block"><Kicker><Tx>Pagine già pronte</Tx></Kicker></span>
          </span>
          <span className="block">
            <span className="block font-mono text-[34px] leading-none tabular-nums text-white/85">38 ms</span>
            <span className="mt-2 block"><Kicker><Tx>Risposta</Tx></Kicker></span>
          </span>
        </span>
      </Night>
    ),
    play: (run, $, at) => {
      const reqs = $("[data-req]");
      const wall = $("[data-wall]")[0];
      run.fromTo(wall, { scaleY: 0 }, { scaleY: 1, duration: 0.7, ease: "expo.out" }, at - 0.2);
      // due ondate di richieste: gli attacchi si schiantano sullo scudo, le visite vere lo attraversano
      [0, 1.3].forEach((wave) =>
        reqs.forEach((r, i) => {
          const bad = (r as HTMLElement).dataset.req === "bad";
          const a = at + wave + REQ[i].d * 0.55;
          const box = r.parentElement as HTMLElement;
          if (bad)
            run
              .fromTo(r, { x: -30, opacity: 0, scaleX: 1 }, { x: () => box.offsetWidth - 36, opacity: 1, duration: 0.55, ease: "power1.in" }, a)
              .to(r, { scaleX: 0.1, opacity: 0, duration: 0.18, ease: "power2.out" }, a + 0.55)
              .to(wall, { boxShadow: "0 0 34px 8px rgba(255,107,94,.45)", duration: 0.08, yoyo: true, repeat: 1 }, a + 0.55);
          else run.fromTo(r, { x: -30, opacity: 0 }, { x: () => box.offsetWidth * 1.45, opacity: 1, duration: 0.85, ease: "none" }, a).to(r, { opacity: 0, duration: 0.15 }, a + 0.75);
        }),
      );
      count(run, $("[data-blocked]")[0], 0, 12480, at + 0.3, 2.6, (n) => it(n));
      count(run, $("[data-cache]")[0], 0, 94, at + 0.3, 2.6, (n) => `${Math.round(n)}%`);
      snd(run, "whoosh", at + 0.3);
    },
  },
  {
    dur: 5,
    node: (
      <Night>
        <span className="absolute inset-x-[9%] top-1/2 block -translate-y-1/2">
          <span data-addr className="flex h-[70px] items-center gap-3 border-b-2 border-white/15 pb-1 text-[34px] tracking-[-0.03em]">
            <span className="relative block h-9 w-9 shrink-0">
              <span data-lock0 className="absolute inset-0 text-white/35">
                <Ico i={LockKeyIcon} s={34} />
              </span>
              <span data-lock1 className="absolute inset-0 text-[#6ee7a8] opacity-0">
                <Ico i={LockKeyIcon} s={34} />
              </span>
              <span data-ring className="absolute -inset-2 block rounded-full border border-[#6ee7a8] opacity-0" />
            </span>
            <span className="text-white/35">https://</span>
            <span data-host className="-ml-3 whitespace-pre" />
            <span data-caret className="-ml-2 h-9 w-[2px] bg-[#8fd8ff]" />
          </span>
          <span data-safe className="mt-8 block text-[52px] font-medium leading-[0.95] tracking-[-0.05em] opacity-0">
            <Tx>Connessione protetta</Tx>
          </span>
          <span className="mt-6 block">
            {[
              ["Server", "Europa · Francia"],
              ["Certificato", "Si rinnova da solo"],
              ["Dominio", "Intestato a te"],
            ].map(([k, v]) => (
              <span key={k} data-spec className="flex items-baseline justify-between border-t border-white/12 py-3.5 text-[16px] opacity-0">
                <span className="text-white/50"><Tx>{k}</Tx></span>
                <span><Tx>{v}</Tx></span>
              </span>
            ))}
          </span>
        </span>
      </Night>
    ),
    play: (run, $, at) => {
      run.set($("[data-caret]"), { opacity: 1 }, at - 0.3);
      const t = typeText(run, $("[data-host]")[0], "studiobianchi.it", at + 0.1, 1.7);
      run
        .to($("[data-caret]"), { opacity: 0, duration: 0.01 }, t + 0.1)
        .to($("[data-lock0]"), { opacity: 0, duration: 0.2 }, t + 0.25)
        .fromTo($("[data-lock1]"), { opacity: 0, scale: 0.4, rotate: -20 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.6)" }, t + 0.25)
        .fromTo($("[data-ring]"), { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.8, duration: 0.8, ease: "power2.out" }, t + 0.3)
        .to($("[data-addr]"), { borderColor: "rgba(110,231,168,.55)", duration: 0.4 }, t + 0.3)
        .fromTo($("[data-safe]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, t + 0.45)
        .fromTo($("[data-spec]"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "expo.out" }, t + 0.7);
      snd(run, "success", t + 0.3);
    },
  },
  {
    dur: 5.4,
    node: (
      <Night>
        <span className="absolute left-[8%] top-[13%] block">
          <Kicker><Tx>Versione online</Tx></Kicker>
          <span className="mt-2 flex h-[96px] items-baseline overflow-hidden font-mono text-[88px] leading-[96px] tracking-[-0.05em]">
            v
            <span className="relative block h-[96px] overflow-hidden">
              <span data-ver className="block">
                <span className="block">23</span>
                <span className="block">24</span>
              </span>
            </span>
          </span>
        </span>
        <span data-rb className="absolute right-[8%] top-[17%] flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-[15px] opacity-0">
          <Ico i={ArrowUp01Icon} s={13} c="-rotate-90" />
          <Tx>Torna alla precedente</Tx>
        </span>
        {/* la strada di ogni modifica: si accende tappa dopo tappa */}
        <span className="absolute inset-x-[8%] top-[56%] block">
          <span className="absolute left-0 right-0 top-[10px] block h-[3px] rounded-full bg-white/12" />
          <span data-fill className="absolute left-0 right-0 top-[10px] block h-[3px] origin-left rounded-full bg-[linear-gradient(90deg,#5ec4ff,#6ee7a8)]" />
          <span className="relative flex justify-between">
            {PIPE.map((p) => (
              <span key={p} data-node className="flex w-0 flex-col items-center">
                <span data-dot className="block h-[23px] w-[23px] shrink-0 rounded-full border-[3px] border-white/30 bg-[#0b141d]" />
                <span className="mt-4 whitespace-nowrap text-[15px] text-white/50"><Tx>{p}</Tx></span>
              </span>
            ))}
          </span>
        </span>
        <span data-back className="absolute bottom-[12%] left-[8%] flex items-center gap-2 text-[16px] text-[#8ff0ad] opacity-0">
          <Ok><Tx>Ripristinata in 4 secondi</Tx></Ok>
        </span>
      </Night>
    ),
    play: (run, $, at) => {
      const dots = $("[data-dot]");
      const labels = $("[data-node] > span:last-child");
      const ver = $("[data-ver]")[0];
      run.set(ver, { yPercent: 0 }, at - 0.3);
      run.fromTo($("[data-fill]"), { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: "power1.inOut" }, at);
      dots.forEach((d, i) => {
        const a = at + (i / (dots.length - 1)) * 1.8;
        run
          .to(d, { borderColor: i === dots.length - 1 ? GREEN : "#5ec4ff", backgroundColor: i === dots.length - 1 ? GREEN : "#5ec4ff", scale: 1.25, duration: 0.18, ease: "power2.out" }, a)
          .to(d, { scale: 1, duration: 0.3 }, a + 0.18)
          .to(labels[i], { color: "#fff", duration: 0.2 }, a);
        snd(run, "tick", a);
      });
      // arrivata online, il numero di versione sale
      run.to(ver, { yPercent: -50, duration: 0.5, ease: "back.out(1.8)" }, at + 1.85);
      snd(run, "success", at + 1.85);
      // e se qualcosa non convince, si torna indietro con un clic
      run.fromTo($("[data-rb]"), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out" }, at + 2.2);
      const c = cursorIn(run, $, $("[data-rb]")[0], at + 2.4);
      const t = click(run, c, $("[data-rb]")[0], at + 2.45, 0.5);
      run
        .to(ver, { yPercent: 0, duration: 0.5, ease: "back.out(1.8)" }, t + 0.1)
        .fromTo($("[data-back]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: "expo.out" }, t + 0.3)
        .to(c.cur, { opacity: 0, duration: 0.25 }, t + 0.5);
    },
  },
  {
    dur: 6,
    node: (
      <Night>
        <span className="absolute left-[8%] top-[11%] block">
          <span className="relative block h-[92px] overflow-hidden font-mono text-[84px] leading-[92px] tracking-[-0.05em] tabular-nums">
            <span data-clock className="block">
              <span className="block">03:00</span>
              <span className="block text-[#ffb4ae]">03:12</span>
            </span>
          </span>
          <span className="mt-1 block"><Kicker><Tx>Copie di sicurezza · ultime due settimane</Tx></Kicker></span>
        </span>
        <span className="absolute right-[8%] top-[11%] flex h-[92px] w-[38%] items-end justify-between">
          {NIGHTS.map((h, i) => (
            <span key={i} data-night className="block w-[5.5%] origin-bottom rounded-full bg-[#5ec4ff]" style={{ height: `${h}%`, opacity: 0.35 + (i / NIGHTS.length) * 0.65 }} />
          ))}
        </span>
        {/* il battito del sito: piatto e rosso quando non risponde, di nuovo vivo dopo pochi secondi */}
        <svg viewBox="0 0 600 80" preserveAspectRatio="none" className="absolute inset-x-0 top-[40%] h-[80px] w-full overflow-visible" aria-hidden>
          <path data-pulse d="M0 40 H140 L152 22 L164 58 L176 40 H300 L312 22 L324 58 L336 40 H600" fill="none" stroke={GREEN} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength={100} strokeDasharray="100" strokeDashoffset="100" />
        </svg>
        <span data-down className="absolute bottom-[9%] left-[8%] flex items-center gap-2 text-[16px] text-[#ffb4ae] opacity-0">
          <span className="h-2 w-2 rounded-full bg-[#ff6b5e]" />
          <Tx>Il sito non risponde</Tx>
        </span>
        <span data-up className="absolute bottom-[9%] left-[8%] flex items-center gap-2 text-[16px] text-[#8ff0ad] opacity-0">
          <Ok><Tx>Di nuovo online in 41 secondi</Tx></Ok>
        </span>
        <span data-alert className="absolute right-[6%] top-[56%] block w-[300px] opacity-0">
          <Bead tint="rgba(30,34,40,.92)" radius={18} className="flex items-center gap-3 p-3 pr-4 text-white">
            <Ours size={32} />
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[12.5px] font-semibold"><Tx>studiobianchi.it non risponde</Tx></span>
              <span className="block truncate text-[11.5px] text-white/60"><Tx>Avviso a Filippo · 03:12</Tx></span>
            </span>
          </Bead>
        </span>
        <span data-uptime className="absolute bottom-[9%] right-[8%] text-right opacity-0">
          <span className="block font-mono text-[48px] leading-none tracking-[-0.05em]">99,98%</span>
          <span className="mt-2 block"><Kicker><Tx>Online negli ultimi 90 giorni</Tx></Kicker></span>
        </span>
      </Night>
    ),
    play: (run, $, at) => {
      const pulse = $("[data-pulse]")[0];
      const clock = $("[data-clock]")[0];
      run.set(clock, { yPercent: 0 }, at - 0.3).set(pulse, { stroke: GREEN, attr: { d: "M0 40 H140 L152 22 L164 58 L176 40 H300 L312 22 L324 58 L336 40 H600" } }, at - 0.3);
      // ore 03:00: le copie della notte, una barra per notte
      run.fromTo($("[data-night]"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.05, ease: "back.out(1.6)" }, at);
      run.fromTo(pulse, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 1.2, ease: "none" }, at + 0.1);
      // ore 03:12: il battito si appiattisce, parte l'avviso
      const t = at + 1.5;
      run
        .to(clock, { yPercent: -50, duration: 0.45, ease: "back.out(1.8)" }, t)
        .to(pulse, { stroke: "#ff6b5e", attr: { d: "M0 40 H140 L152 22 L164 58 L176 40 H300 L312 40 L324 40 L336 40 H600" }, duration: 0.35 }, t)
        .fromTo($("[data-down]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, t + 0.1)
        .fromTo($("[data-alert]"), { opacity: 0, y: -18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, t + 0.35);
      snd(run, "notify", t + 0.35);
      // pochi secondi dopo: di nuovo vivo
      const u = t + 1.7;
      run
        .to(pulse, { stroke: GREEN, attr: { d: "M0 40 H140 L152 22 L164 58 L176 40 H300 L312 22 L324 58 L336 40 H600" }, duration: 0.4 }, u)
        .to($("[data-down]"), { opacity: 0, duration: 0.2 }, u)
        .fromTo($("[data-up]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }, u + 0.1)
        .to($("[data-alert]"), { opacity: 0, y: -10, duration: 0.35 }, u + 0.2)
        .fromTo($("[data-uptime]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out" }, u + 0.4);
      snd(run, "success", u);
    },
  },
];

/** Le inquadrature di ogni servizio, per chi le usa una alla volta (i passi di "Come funziona" nelle pagine). */
export const SHOTS = { ops: OPS, web: WEB, seo: SEO, geo: GEO, apps: APPS, design: DESIGN, ai: AI, hw: HW, api: API, shop: SHOP };
