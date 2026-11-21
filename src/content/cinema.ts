import type { Locale } from "@/i18n/routing";

/**
 * Il racconto a scorrimento del servizio "Siti web e app": un capitolo alla volta, ognuno parte da una domanda
 * di chi compra e risponde con una frase sola. Parole semplici, niente sigle: deve capirlo chi non ha mai visto un sito "da dentro".
 */
export type Cinema = {
  cue: string;
  end: { t: string; more: string; cta: string };
  cap: string[];
  /** le scritte del film, nell'ordine in cui la voce le dice */
  say: string[];
  title: string[];
  ctl: { play: string; pause: string; replay: string; on: string; off: string; gateT: string; gateS: string; gateOn: string; gateOff: string };
  find: { q: string; typed: string; loading: string; a: string; me: [string, string]; others: [string, string][] };
  listen: { q: string; asks: string[]; a: string };
  draw: { q: string; a: string };
  screens: { q: string; a: string };
  online: { q: string; a: string; live: string };
  clients: { q: string; a: string; items: [string, string][] };
  edit: { q: string; a: string; label: string; from: string; to: string; saved: string };
  gets: { q: string; items: [string, string][] };
  promise: { q: string; items: [string, string][] };
  site: { nav: string[]; book: string; title: string[]; badge: string; stars: string; since: string };
  /** il sito di prima: vecchio, lento */
  old: { brand: string; menu: string[]; hello: string; text: string[]; visits: string };
  ba: [string, string];
  /** il cliente torna alla ricerca e sceglie il concorrente */
  rival: { open: string; lost: string };
  /** chi lavora al prototipo, con il proprio cursore */
  team: string[];
  seo: { cap: string; more: [string, string][] };
  /** prima: il cliente deve scorrere tra mille risultati per trovarti */
  far: { cap: string; count: string; list: [string, string][]; lost: string; open: string; mine: string; title: string; snip: string; tired: string; stays: string };
  geo: { cap: string; q: string; a: string; who: string; reply: string; hello: string; title: string };
  /** l'assistente su WhatsApp: modifiche, andamento del sito, chi chiede di essere ricontattato */
  wa: { cap: string; us: string; name: string; on: string; type: string; chat: [string, string][]; week: string; n: string; up: string; days: string[] };
};

const IT: Cinema = {
  cue: "Scorri",
  end: { t: "Merita un sito *come si deve*.", more: "Scopri i dettagli", cta: "Parliamone" },
  say: ["C’è una persona", "Una fra *tante*.", "Hai perso un *!cliente*, per due secondi di troppo.", "Ora immagina *il contrario*.", "Lo disegniamo *su misura*.", "*Ovunque* ti cerchino.", "Lo *fai tu*.", "Oppure, chiedilo a *~Sofia*, su WhatsApp.", "Per tutto il resto, *ci siamo noi*.", "Quando qualcuno chiederà all'*intelligenza* *artificiale*", "che in questo momento", "ha *bisogno proprio di te*", "e dei tuoi servizi.", "Puoi chiederle *~tutto sul tuo sito*."],
  cap: ["Qualcuno ha *bisogno di te*.", "Ti trova, ma è *lento*.", "Si apre *all'istante*.", "Disegnato *intorno a te*.", "Poi lo *costruiremo*.", "Perfetto, *ovunque*.", "Arriveranno i *clienti*.", "Online, *al sicuro*.", "Lo *cambi tu*.", "Tutto *compreso*.", "Senza *sorprese*."],
  title: ["Il tuo lavoro,", "sempre aggiornato"],
  ctl: { play: "Riproduci", pause: "Pausa", replay: "Rivedi", on: "Audio attivo", off: "Audio spento", gateT: "Attiva l’*audio*", gateS: "per un’esperienza migliore", gateOn: "Attiva audio", gateOff: "Senza audio" },
  find: { q: "Un nuovo cliente ti cerca. Cosa trova?", typed: "chi può aiutarmi qui vicino", loading: "Sta caricando…", a: "Se il sito è lento o confuso, ne sceglie un altro.", me: ["La tua attività", "latuaattivita.it"], others: [["Un’altra attività", "unaltra.it"], ["Un’altra ancora", "unaltraancora.it"]] },
  listen: { q: "Da dove si parte?", asks: ["Chi sono i tuoi clienti?", "Cosa vogliono sapere?", "Cosa devono fare sul sito?"], a: "Da te. Prima di tutto ti ascoltiamo." },
  draw: { q: "Come sai cosa stai comprando?", a: "Vedi le pagine vere, prima che esistano." },
  screens: { q: "E se lo apro dal telefono?", a: "Si adatta da solo a ogni schermo." },
  online: { q: "Quando è pronto?", a: "Va online sul tuo indirizzo, al sicuro, in pochi secondi.", live: "Online" },
  clients: {
    q: "E i clienti?",
    a: "Chi ti cerca ti trova e prenota da solo.",
    items: [
      ["Nuova richiesta", "Giulia R. · preventivo"],
      ["Nuovo messaggio", "Marco B. · informazioni"],
      ["Nuova prenotazione", "Elena T. · giovedì alle 14:30"],
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
  site: { nav: ["Servizi", "Progetti"], book: "Contattaci", title: ["Il tuo lavoro,", "ben visibile."], badge: "SCOPRI DI PIÙ · SCOPRI DI PIÙ · ", stars: "4,9 · recensioni", since: "Dal 2009" },
  old: { brand: "Marchio s.r.l.", menu: ["Home", "Chi siamo", "Servizi", "Contatti"], hello: "Benvenuti nel nostro sito!", text: ["Siamo leader nel settore dal 2009.", "Sito ottimizzato per Internet Explorer."], visits: "Visitatori: 004127" },
  ba: ["Prima", "Dopo"],
  rival: { open: "Aperto ora", lost: "Cliente perso" },
  team: ["Filippo", "Design", "Sviluppo"],
  far: { cap: "Sei *una fra tante*.", count: "Circa 1.240.000 risultati (0,42 secondi)", list: [["Rossi Impianti", "rossimpianti.it"], ["Ferri & Co.", "ferrieco.it"], ["Casa Nova", "casanova.it"], ["Punto Servizi", "puntoservizi.it"], ["Gallo Group", "gallogroup.it"], ["Moretti Lab", "morettilab.it"], ["Studio Conti", "studioconti.it"], ["Officina Riva", "officinariva.it"]], lost: "Hai perso un *!cliente*.", open: "Si apre all'*istante*.", tired: "Si *!stanca*.", stays: "Ha tutti i motivi per *scegliere te*.", mine: "La tua attività · Sito ufficiale", title: "Servizi e preventivi", snip: "Professionisti in zona, preventivi gratuiti e assistenza rapida. Scopri i servizi." },
  seo: { cap: "Con il nuovo sito, *tra i primi*.", more: [["Studio Bianchi", "studiobianchi.it"], ["Centro Verdi", "centroverdi.it"]] },
  geo: { cap: "Pronto anche per l'*intelligenza* *artificiale*.", q: "Chi mi consigli qui vicino?", a: "Ti consiglio La tua attività: risponde subito e ha ottime recensioni.", who: "Assistente", reply: "Scrivi a ChatGPT…", hello: "Come posso aiutarti oggi?", title: "Consiglio in zona" },
  wa: { cap: "Oppure, chiedilo a *~Sofia*, su WhatsApp.", us: "Per tutto il resto, *ci siamo noi*.", name: "Sofia", on: "online", type: "Messaggio", chat: [["Sabato apriamo alle 9, aggiorna il sito", "Fatto, il sito è aggiornato."], ["Come sta andando il sito?", "Bene, ecco la settimana:"], ["Chi ha chiesto di essere ricontattato?", "Due persone, oggi:"]], week: "Visite questa settimana", n: "1.284", up: "+18%", days: ["L", "M", "M", "G", "V", "S", "D"] },
};

const EN: Cinema = {
  cue: "Scroll",
  end: { t: "A site *done right*.", more: "See the details", cta: "Let’s talk" },
  say: ["Someone", "One of *many*.", "You lost a *!customer* over two seconds.", "Now imagine *the opposite*.", "Made *to measure*.", "*Everywhere* they look.", "You *do it*.", "Or just ask *on WhatsApp*.", "For everything else, *we’re here*.", "When someone asks *^AI* for advice", "out there right now", "*needs you*", "and your services.", "Ask her *~anything about your site*."],
  cap: ["A customer is *looking* for you.", "They find you, but it’s *slow*.", "And it will open in *0.8 seconds*.", "We’ll build it *just for you*.", "Then, we’ll *build* it.", "Perfect, *everywhere*.", "*Customers* will arrive.", "Online, and *safe*.", "*You’ll* change it.", "Everything *included*.", "No *surprises*."],
  title: ["Your work,", "always current"],
  ctl: { play: "Play", pause: "Pause", replay: "Replay", on: "Sound on", off: "Sound off", gateT: "Turn on the *sound*", gateS: "for a better experience", gateOn: "Turn on sound", gateOff: "Without sound" },
  find: { q: "A new customer is looking for you. What do they find?", typed: "who can help me nearby", loading: "Loading…", a: "If the site is slow or confusing, they pick another one.", me: ["Your business", "yourbusiness.com"], others: [["Another business", "another.com"], ["One more", "onemore.com"]] },
  listen: { q: "Where do we start?", asks: ["Who are your customers?", "What do they want to know?", "What should they do on the site?"], a: "With you. First of all, we listen." },
  draw: { q: "How do you know what you’re buying?", a: "You see the real pages before they exist." },
  screens: { q: "What if I open it on my phone?", a: "It adapts to every screen on its own." },
  online: { q: "When is it ready?", a: "It goes live on your address, safely, in seconds.", live: "Online" },
  clients: {
    q: "And the customers?",
    a: "Whoever looks for you finds you, and books alone.",
    items: [
      ["New request", "Giulia R. · quote"],
      ["New message", "Marco B. · information"],
      ["New booking", "Elena T. · Thursday at 2:30 pm"],
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
  site: { nav: ["Services", "Projects"], book: "Contact us", title: ["Your work,", "well seen."], badge: "DISCOVER MORE · DISCOVER MORE · ", stars: "4.9 · reviews", since: "Since 2009" },
  old: { brand: "Marchio Ltd.", menu: ["Home", "About us", "Services", "Contact"], hello: "Welcome to our website!", text: ["Industry leaders since 2009.", "Best viewed in Internet Explorer."], visits: "Visitors: 004127" },
  ba: ["Before", "After"],
  rival: { open: "Open now", lost: "Customer lost" },
  team: ["Filippo", "Design", "Development"],
  far: { cap: "But you’re *buried*.", count: "About 1,240,000 results (0.42 seconds)", list: [["Rossi Impianti", "rossimpianti.com"], ["Ferri & Co.", "ferrieco.com"], ["Casa Nova", "casanova.com"], ["Punto Servizi", "puntoservizi.com"], ["Gallo Group", "gallogroup.com"], ["Moretti Lab", "morettilab.com"], ["Studio Conti", "studioconti.com"], ["Officina Riva", "officinariva.com"]], lost: "Customer *!lost*.", open: "It opens *instantly*.", tired: "They *!give up*.", stays: "Every reason to *choose you*.", mine: "Your business · Official site", title: "Services and quotes", snip: "Local professionals, free quotes and quick support. See our services." },
  seo: { cap: "With the new site, you’ll be *on top*.", more: [["Bianchi Studio", "bianchistudio.com"], ["Verdi Centre", "verdicentre.com"]] },
  geo: { cap: "And *^AI* will talk about you.", q: "Who do you recommend nearby?", a: "I recommend Your business: quick to reply, with great reviews.", who: "AI assistant", reply: "Message ChatGPT…", hello: "How can I help you today?", title: "Local recommendation" },
  wa: { cap: "Or ask *~Sofia* on WhatsApp.", us: "For everything else, *we're here*.", name: "Sofia", on: "online", type: "Message", chat: [["We open at 9 on Saturday, update the site", "Done, the site is updated."], ["How is the site doing?", "Good, here’s your week:"], ["Who asked to be called back?", "Two people, today:"]], week: "Visits this week", n: "1,284", up: "+18%", days: ["M", "T", "W", "T", "F", "S", "S"] },
};

export const getCinema = (l: Locale): Cinema => (l === "en" ? EN : IT);
