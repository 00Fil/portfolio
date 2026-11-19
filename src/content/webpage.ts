import type { Locale } from "@/i18n/routing";

/** La pagina di vendita del servizio «siti e web app», dopo il video. Le parole tra asterischi vanno nel font del marchio. */
export type WebCopy = {
  offer: { title: string; lead: string; cta: string; more: string; facts: [string, string][] };
  bento: { title: string; lead: string; cells: Record<"speed" | "screens" | "edit" | "leads" | "found" | "safe" | "dash", [string, string]>; mock: Record<string, string> };
  steps: { title: string; lead: string; items: [string, string][] };
  proof: { title: string };
  promise: { title: string };
  faq: { title: string };
};

const IT: WebCopy = {
  offer: {
    title: "Un sito che *lavora* per te, ogni giorno.",
    lead: "Ti costruisco un sito veloce, chiaro e fatto sul tuo modo di lavorare. Chi ti cerca ti trova, capisce subito cosa offri e ti contatta. Tu lo aggiorni da solo; a tutto il resto penso io.",
    cta: "Richiedi il preventivo",
    more: "Guarda i progetti",
    facts: [
      ["2 settimane", "Ogni due settimane provi una versione vera, non un documento."],
      ["1 referente", "Parli sempre con chi lo progetta e lo costruisce."],
      ["100% tuo", "Dominio, codice e contenuti restano intestati a te."],
    ],
  },
  bento: {
    title: "Tutto quello che ti serve, *già dentro*.",
    lead: "Niente pezzi da mettere insieme: ricevi un sito completo, pronto a portarti clienti.",
    cells: {
      speed: ["Si apre in meno di un secondo", "Chi aspetta se ne va. Il tuo sito carica subito, anche con il telefono in campagna."],
      screens: ["Perfetto su ogni schermo", "Telefono, tablet e computer: sempre leggibile e comodo da usare."],
      edit: ["Lo modifichi tu", "Cambi testi, foto e prezzi da un pannello semplice, senza chiamare nessuno."],
      leads: ["Le richieste arrivano ordinate", "Prenotazioni e messaggi ti arrivano con una notifica, già con i dati al loro posto."],
      found: ["Ti trovano su Google", "Pagine pensate per essere trovate: titoli chiari, mappa e recensioni in vista."],
      safe: ["Online e al sicuro", "Connessione protetta, copie di sicurezza e aggiornamenti. Se qualcosa non va, si torna indietro subito."],
      dash: ["Un’area per i tuoi clienti", "Ognuno entra con il suo accesso e vede solo quello che gli serve."],
    },
    mock: {
      yours: "Il tuo sito",
      slow: "Un sito lento",
      score: "Velocità",
      address: "latuaattivita.it",
      field: "Orari",
      typed: "Aperti anche il sabato",
      before: "Aperti dal lunedì al venerdì",
      save: "Salva",
      saved: "Salvato",
      request: "Nuova richiesta",
      booking: "Prenotazione",
      message: "Messaggio",
      now: "ora",
      query: "idraulico vicino a me",
      you: "La tua attività",
      other1: "Altra attività",
      other2: "Un’altra ancora",
      open: "Aperto ora",
      reviews: "recensioni",
      https: "Connessione protetta",
      backup: "Copia di sicurezza",
      online: "Online",
      project: "Il tuo progetto",
      progress: "Avanzamento",
    },
  },
  steps: {
    title: "Come si lavora, *passo passo*.",
    lead: "Sempre nello stesso ordine. A ogni passo vedi qualcosa di concreto e decidi tu se va bene.",
    items: [
      ["Mi racconti il tuo lavoro", "Una chiamata di 30 minuti. Pochi giorni dopo ricevi un preventivo scritto, con tempi e costi di ogni parte."],
      ["Vedi le schermate vere", "Disegno le pagine e le rivediamo insieme: correggere un disegno costa minuti, non settimane."],
      ["Lo provi ogni due settimane", "Una versione che funziona, da usare davvero. Dall’area clienti segui l’avanzamento."],
      ["Va online, e resta tuo", "Controllo finale insieme, pubblico sul tuo dominio e ti spiego come usarlo."],
    ],
  },
  proof: { title: "Già fatto, *davvero*." },
  promise: { title: "Cosa ti *garantisco*." },
  faq: { title: "Le *domande* di chi sceglie." },
};

const EN: WebCopy = {
  offer: {
    title: "A website that *works* for you, every day.",
    lead: "I build you a fast, clear website shaped around how you work. People find you, understand what you offer at once and get in touch. You update it yourself; I take care of the rest.",
    cta: "Get a quote",
    more: "See the projects",
    facts: [
      ["2 weeks", "Every two weeks you try a real version, not a document."],
      ["1 contact", "You always talk to the person who designs and builds it."],
      ["100% yours", "Domain, code and content stay in your name."],
    ],
  },
  bento: {
    title: "Everything you need, *built in*.",
    lead: "No parts to put together: you get a complete website, ready to bring in customers.",
    cells: {
      speed: ["Opens in under a second", "People who wait, leave. Your site loads at once, even on a phone out in the countryside."],
      screens: ["Perfect on every screen", "Phone, tablet and computer: always readable and easy to use."],
      edit: ["You edit it yourself", "Change text, photos and prices from a simple panel, without calling anyone."],
      leads: ["Requests arrive in order", "Bookings and messages reach you with a notification, details already in place."],
      found: ["Found on Google", "Pages built to be found: clear titles, a map and reviews in sight."],
      safe: ["Online and safe", "Protected connection, backups and updates. If something goes wrong, we roll back at once."],
      dash: ["An area for your customers", "Everyone signs in with their own access and sees only what they need."],
    },
    mock: {
      yours: "Your site",
      slow: "A slow site",
      score: "Speed",
      address: "yourbusiness.com",
      field: "Hours",
      typed: "Open on Saturdays too",
      before: "Open Monday to Friday",
      save: "Save",
      saved: "Saved",
      request: "New request",
      booking: "Booking",
      message: "Message",
      now: "now",
      query: "plumber near me",
      you: "Your business",
      other1: "Another business",
      other2: "One more",
      open: "Open now",
      reviews: "reviews",
      https: "Protected connection",
      backup: "Backup",
      online: "Online",
      project: "Your project",
      progress: "Progress",
    },
  },
  steps: {
    title: "How we work, *step by step*.",
    lead: "Always in the same order. At every step you see something concrete and decide if it’s right.",
    items: [
      ["You tell me about your work", "A 30-minute call. A few days later you get a written quote, with time and cost for every part."],
      ["You see the real screens", "I design the pages and we review them together: fixing a drawing takes minutes, not weeks."],
      ["You try it every two weeks", "A working version to really use. You follow progress from the client area."],
      ["It goes live, and stays yours", "Final check together, I publish on your domain and show you how to use it."],
    ],
  },
  proof: { title: "Already done, *for real*." },
  promise: { title: "What I *guarantee*." },
  faq: { title: "The *questions* people ask." },
};

export const getWebCopy = (l: Locale): WebCopy => (l === "en" ? EN : IT);
