import type { Locale } from "@/i18n/routing";

/**
 * Il racconto a scorrimento del servizio "Siti web e app": un capitolo alla volta, ognuno parte da una domanda
 * di chi compra e risponde con una frase sola. Parole semplici, niente sigle: deve capirlo chi non ha mai visto un sito "da dentro".
 */
export type Cinema = {
  cue: string;
  find: { q: string; typed: string; loading: string; a: string };
  listen: { q: string; asks: string[]; a: string };
  draw: { q: string; a: string };
  screens: { q: string; a: string };
  online: { q: string; a: string; live: string };
  clients: { q: string; a: string; items: [string, string][] };
  edit: { q: string; a: string; label: string; from: string; to: string; saved: string };
  gets: { q: string; items: [string, string][] };
  promise: { q: string; items: [string, string][] };
  site: { nav: string[]; book: string; title: string[]; badge: string; stars: string; since: string };
};

const IT: Cinema = {
  cue: "Scorri",
  find: { q: "Un nuovo cliente ti cerca. Cosa trova?", typed: "dentista a Brescia", loading: "Sta caricando…", a: "Se il sito è lento o confuso, ne sceglie un altro." },
  listen: { q: "Da dove si parte?", asks: ["Chi sono i tuoi clienti?", "Cosa vogliono sapere?", "Cosa devono fare sul sito?"], a: "Da te. Prima di tutto ti ascoltiamo." },
  draw: { q: "Come sai cosa stai comprando?", a: "Vedi le pagine vere, prima che esistano." },
  screens: { q: "E se lo apro dal telefono?", a: "Si adatta da solo a ogni schermo." },
  online: { q: "Quando è pronto?", a: "Va online sul tuo indirizzo, al sicuro, in pochi secondi.", live: "Online" },
  clients: {
    q: "E i clienti?",
    a: "Chi ti cerca ti trova e prenota da solo.",
    items: [
      ["Nuova prenotazione", "Giulia R. · giovedì alle 14:30"],
      ["Nuova richiesta", "Marco B. · preventivo ortodonzia"],
      ["Nuova prenotazione", "Elena T. · venerdì alle 9:00"],
    ],
  },
  edit: { q: "E se poi qualcosa cambia?", a: "I testi li cambi tu. Per tutto il resto ci siamo noi.", label: "Orari di apertura", from: "Lun–Ven 9–18", to: "Lun–Sab 9–19", saved: "Salvato" },
  gets: {
    q: "Cosa ricevi?",
    items: [
      ["Il sito", "Pagine chiare, pensate per chi ti cerca."],
      ["Il tuo indirizzo", "Il nome del sito è tuo, per sempre."],
      ["La sicurezza", "Connessione protetta e copie di riserva."],
      ["Le modifiche", "Cambi testi e foto da solo, in pochi minuti."],
      ["Le richieste", "Prenotazioni e messaggi arrivano in ordine."],
      ["L’assistenza", "Un solo referente, sempre lo stesso."],
    ],
  },
  promise: {
    q: "Cosa ti garantisco?",
    items: [
      ["Un preventivo scritto", "Sai cosa si fa e quanto costa, prima di iniziare."],
      ["Un solo referente", "Parli sempre con chi lo costruisce."],
      ["Tutto a tuo nome", "Dominio, codice e dati restano tuoi."],
      ["Nessun vincolo", "Se un giorno vuoi cambiare, ti passo tutto."],
    ],
  },
  site: { nav: ["Servizi", "Lo studio"], book: "Prenota", title: ["Il tuo sorriso,", "in buone mani."], badge: "PRENOTA ORA · PRENOTA ORA · ", stars: "4,9 · 312 recensioni", since: "Brescia · dal 2009" },
};

const EN: Cinema = {
  cue: "Scroll",
  find: { q: "A new customer is looking for you. What do they find?", typed: "dentist in Brescia", loading: "Loading…", a: "If the site is slow or confusing, they pick another one." },
  listen: { q: "Where do we start?", asks: ["Who are your customers?", "What do they want to know?", "What should they do on the site?"], a: "With you. First of all, we listen." },
  draw: { q: "How do you know what you’re buying?", a: "You see the real pages before they exist." },
  screens: { q: "What if I open it on my phone?", a: "It adapts to every screen on its own." },
  online: { q: "When is it ready?", a: "It goes live on your address, safely, in seconds.", live: "Online" },
  clients: {
    q: "And the customers?",
    a: "Whoever looks for you finds you, and books alone.",
    items: [
      ["New booking", "Giulia R. · Thursday at 2:30 pm"],
      ["New request", "Marco B. · orthodontics quote"],
      ["New booking", "Elena T. · Friday at 9:00 am"],
    ],
  },
  edit: { q: "And if something changes later?", a: "You change the text. For everything else, we’re here.", label: "Opening hours", from: "Mon–Fri 9–6", to: "Mon–Sat 9–7", saved: "Saved" },
  gets: {
    q: "What do you get?",
    items: [
      ["The site", "Clear pages, made for people looking for you."],
      ["Your address", "The site’s name is yours, for good."],
      ["Security", "A protected connection and backup copies."],
      ["Changes", "Edit text and photos yourself, in minutes."],
      ["Requests", "Bookings and messages arrive in order."],
      ["Support", "One contact, always the same."],
    ],
  },
  promise: {
    q: "What do I guarantee?",
    items: [
      ["A written quote", "You know what’s done and what it costs, before we start."],
      ["One contact", "You always talk to whoever builds it."],
      ["Everything in your name", "Domain, code and data stay yours."],
      ["No lock-in", "If you ever want to switch, I hand everything over."],
    ],
  },
  site: { nav: ["Services", "The practice"], book: "Book", title: ["Your smile,", "in good hands."], badge: "BOOK NOW · BOOK NOW · ", stars: "4.9 · 312 reviews", since: "Brescia · since 2009" },
};

export const getCinema = (l: Locale): Cinema => (l === "en" ? EN : IT);
