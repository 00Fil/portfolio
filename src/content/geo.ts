import type { Locale } from "@/i18n/routing";

/**
 * Copy della pagina GEO: essenziale, positivo e fattuale, in stile pagina prodotto Apple.
 */
export type GeoCopy = {
  hero: { eyebrow: string; l1: string; l2: string; on: string; and: string; sub: string; how: string };
  scene: {
    kicker: string;
    title: string;
    steps: { t: string; b: string }[];
    ask: string;
    searching: string;
    sourcesRead: string;
    answer: [string, string, string];
    sourceTitle: string;
    sourceSub: string;
    sourceUrl: string;
  };
  gets: { kicker: string; title: string; assistants: string; assistantsLead: string };
  faq: { kicker: string; title: string; items: { q: string; a: string }[] };
  close: { title: string; lead: string };
};

const IT: GeoCopy = {
  hero: {
    eyebrow: "GEO · Visibilità nelle risposte AI",
    l1: "Quando chiedono all’AI,",
    l2: "rispondono con il tuo nome.",
    on: "Su",
    and: "e",
    sub: "Strutturo il tuo sito perché ChatGPT, Gemini, Claude e Perplexity comprendano chi sei, citino le tue pagine e ti consiglino a chi cerca il tuo servizio.",
    how: "Guarda come funziona",
  },
  scene: {
    kicker: "Dalla domanda al tuo sito",
    title: "Una risposta chiara. Con te come fonte.",
    steps: [
      {
        t: "La domanda del cliente",
        b: "Chi cerca un professionista o un’azienda scrive una richiesta completa in linguaggio naturale.",
      },
      {
        t: "La risposta con i tuoi dati",
        b: "L’assistente legge le informazioni ordinate sul tuo sito e ti consiglia con orari, sede e punti di forza.",
      },
      {
        t: "Il collegamento diretto",
        b: "Subito sotto la risposta compare la scheda del tuo sito web, pronta per essere aperta in un clic.",
      },
    ],
    ask: "Mi consigli un buon dentista a Brescia?",
    searching: "Lettura delle fonti in corso",
    sourcesRead: "Fonte verificata · studiobianchi.it",
    answer: [
      "A Brescia puoi rivolgerti a",
      "Studio Bianchi",
      ", in centro città: offre igiene, ortodonzia e implantologia con orari estesi anche il sabato e prenotazione online.",
    ],
    sourceTitle: "Studio Bianchi — Studio Odontoiatrico a Brescia",
    sourceSub: "Orari, trattamenti, équipe e prenotazione online della prima visita.",
    sourceUrl: "studiobianchi.it",
  },
  gets: {
    kicker: "Cosa ricevi",
    title: "Tutto quello che serve perché un assistente parli bene di te.",
    assistants: "4 assistenti, un solo controllo.",
    assistantsLead: "Le stesse domande, fatte a tutti, ogni mese. Le risposte così come arrivano.",
  },
  faq: {
    kicker: "Domande frequenti",
    title: "Domande e risposte.",
    items: [
      {
        q: "Si integra con il sito che ho già?",
        a: "Sì. Lavoro direttamente sulle pagine esistenti, ordinando testi, struttura semantica e dati strutturati senza stravolgere il design del sito.",
      },
      {
        q: "Migliora anche la visibilità su Google?",
        a: "Sì. Un sito veloce, ben strutturato e con risposte chiare aiuta sia il posizionamento tradizionale su Google sia la lettura da parte degli assistenti AI.",
      },
      {
        q: "In quanto tempo si aggiornano le risposte?",
        a: "Gli assistenti collegati alla ricerca web (ChatGPT e Perplexity) leggono le nuove informazioni già nelle prime settimane; il report mensile traccia ogni variazione.",
      },
    ],
  },
  close: {
    title: "La prossima domanda sul tuo settore è già in arrivo.",
    lead: "In 30 minuti guardiamo insieme cosa rispondono oggi gli assistenti su di te.",
  },
};

const EN: GeoCopy = {
  hero: {
    eyebrow: "GEO · Visibility in AI answers",
    l1: "When people ask AI,",
    l2: "the answer is your name.",
    on: "On",
    and: "and",
    sub: "I structure your website so ChatGPT, Gemini, Claude and Perplexity understand what you do, cite your pages and recommend you.",
    how: "See how it works",
  },
  scene: {
    kicker: "From question to your site",
    title: "A clear answer. With you as the source.",
    steps: [
      {
        t: "The customer’s question",
        b: "People looking for a service ask a complete question in natural language.",
      },
      {
        t: "The answer with your facts",
        b: "The assistant reads the structured information on your site and recommends you with accurate details.",
      },
      {
        t: "The direct link",
        b: "Right below the answer sits your website preview card, ready to open in a single tap.",
      },
    ],
    ask: "Can you recommend a good dentist in Brescia?",
    searching: "Reading sources",
    sourcesRead: "Verified source · studiobianchi.it",
    answer: [
      "In Brescia you can visit",
      "Studio Bianchi",
      ", in the city centre: offering hygiene, orthodontics and implants with Saturday hours and online booking.",
    ],
    sourceTitle: "Studio Bianchi — Dental Practice in Brescia",
    sourceSub: "Opening hours, treatments, team and online appointment booking.",
    sourceUrl: "studiobianchi.it",
  },
  gets: {
    kicker: "What you get",
    title: "Everything an assistant needs to speak well of you.",
    assistants: "4 assistants, one check.",
    assistantsLead: "The same questions, asked to all of them, every month. The answers exactly as they come.",
  },
  faq: {
    kicker: "Frequently asked",
    title: "Questions and answers.",
    items: [
      {
        q: "Does it work with my existing website?",
        a: "Yes. I work directly on your current pages, refining copy structure, semantic markup and structured data without redoing your design.",
      },
      {
        q: "Does it also help on Google?",
        a: "Yes. A fast, well-structured site with clear answers improves both traditional Google rankings and how AI assistants read your content.",
      },
      {
        q: "How quickly do answers update?",
        a: "Web-connected assistants (ChatGPT and Perplexity) pick up updated pages within a few weeks; the monthly report tracks every change over time.",
      },
    ],
  },
  close: {
    title: "The next question about your field is already on its way.",
    lead: "In 30 minutes we look together at what assistants say about you today.",
  },
};

export const getGeoCopy = (l: Locale): GeoCopy => (l === "en" ? EN : IT);
