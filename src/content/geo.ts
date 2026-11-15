import type { Locale } from "@/i18n/routing";

/**
 * Copy della pagina GEO: frasi brevi, concrete e orientate al risultato commerciale.
 * Mantiene intatti i testi che funzionano nelle sezioni approvate (Bento "Cosa ricevi" e Chiusura).
 */
export type GeoCopy = {
  hero: { eyebrow: string; l1: string; l2: string; on: string; and: string; sub: string; how: string; ask: string };
  shift: {
    kicker: string;
    text: string;
    accent: string;
    stats: { v: string; l: string }[];
  };
  scene: {
    kicker: string;
    title: string;
    steps: { t: string; b: string }[];
    ask: string;
    searching: string;
    answer: [string, string, string];
    sourceTitle: string;
    sourceUrl: string;
    sources: string;
  };
  compare: {
    kicker: string;
    title: string;
    beforeLabel: string;
    afterLabel: string;
    before: string[];
    after: string[];
  };
  how: {
    kicker: string;
    title: string;
    lead: string;
    steps: { t: string; b: string }[];
    v1: { q: string; res: string }[];
    v2: { k: string; v: string }[];
    v3: { title: string; badge: string; rows: { name: string; pct: number }[] };
  };
  gets: { kicker: string; title: string; assistants: string; assistantsLead: string };
  promise: { kicker: string; title: string; yes: string[]; noTitle: string; no: string[] };
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
    sub: "Faccio in modo che ChatGPT, Gemini, Claude e Perplexity consiglino la tua azienda al posto dei concorrenti, portandoti clienti pronti a scegliere.",
    how: "Guarda come funziona",
    ask: "Mi consigli un buon dentista a Brescia?",
  },
  shift: {
    kicker: "Perché adesso",
    text: "Chi cerca su un assistente non confronta dieci siti.",
    accent: "Chiama il primo nome nella risposta.",
    stats: [
      { v: "1 risposta", l: "Niente seconda pagina: gli assistenti fanno 2 o 3 nomi. O ci sei, o il cliente va altrove." },
      { v: "4 piattaforme", l: "ChatGPT, Gemini, Claude e Perplexity presidiati insieme con un unico intervento." },
      { v: "Ogni mese", l: "Report con le risposte reali alle domande dei tuoi clienti, prima e dopo il lavoro." },
    ],
  },
  scene: {
    kicker: "Come appare al cliente",
    title: "La risposta consiglia te. Con il link al tuo sito.",
    steps: [
      { t: "Il cliente fa una domanda.", b: "Cerca una soluzione reale, con linguaggio naturale." },
      { t: "L’assistente verifica le fonti.", b: "Scarta le pagine confuse e sceglie chi dà risposte chiare e verificabili." },
      { t: "Ti consiglia nella risposta.", b: "Il tuo nome compare per primo, motivato dai tuoi punti di forza." },
      { t: "E porta al tuo sito.", b: "La fonte è linkata subito sotto: un clic e il cliente è da te." },
    ],
    ask: "Mi consigli un buon dentista a Brescia?",
    searching: "Verifica delle fonti in corso",
    answer: ["Ti consiglio", "Studio Bianchi", ", in centro a Brescia: prenotazione online, orari estesi anche il sabato e recensioni molto positive."],
    sourceTitle: "Studio Bianchi · Odontoiatria e prenotazioni a Brescia",
    sourceUrl: "studiobianchi.it",
    sources: "Fonti citate",
  },
  compare: {
    kicker: "Cosa cambia per te",
    title: "Smetti di perdere clienti che non ti vedono nemmeno.",
    beforeLabel: "Oggi",
    afterLabel: "Con il lavoro GEO",
    before: [
      "Chiedono del tuo settore e l’AI consiglia un concorrente",
      "Riporta orari, servizi o prezzi vecchi e sbagliati",
      "Il sito ha testi lunghi ma nessuna risposta diretta",
      "Non sai cosa rispondono su di te i principali assistenti",
    ],
    after: [
      "Compari tra i nomi consigliati quando cercano ciò che vendi",
      "Le AI leggono dati aggiornati, chiari e coerenti dal tuo sito",
      "Ogni servizio risponde alle domande reali dei clienti",
      "Ricevi ogni mese le schermate delle risposte e i progressi",
    ],
  },
  how: {
    kicker: "Il metodo",
    title: "Tre passi concreti, zero fuffa.",
    lead: "Parto da cosa dicono oggi su di te, rendo il sito leggibile per gli assistenti e misuro ogni mese.",
    steps: [
      { t: "Audit delle risposte reali", b: "Interrogo i 4 assistenti con le domande dei tuoi clienti e fotografo chi consigliano oggi." },
      { t: "Struttura pronta da citare", b: "Sistemo pagine, dati strutturati e risposte dirette così le AI non possono fraintenderti." },
      { t: "Controllo e crescita mensile", b: "Rifaccio le stesse domande ogni mese e intervengo dove i concorrenti provano a superarti." },
    ],
    v1: [
      { q: "Miglior dentista a Brescia?", res: "2 concorrenti" },
      { q: "Dentista aperto il sabato?", res: "Non citato" },
      { q: "Quanto costa uno sbiancamento?", res: "Dati errati" },
    ],
    v2: [
      { k: "Chi", v: "Studio Bianchi · Brescia" },
      { k: "Servizi", v: "Igiene, ortodonzia, impianti" },
      { k: "Orari", v: "Lun–Sab · 8:30–19:30" },
      { k: "Schema", v: "Dati verificati per AI" },
    ],
    v3: {
      title: "Quota di citazioni · Mese 3",
      badge: "In crescita",
      rows: [
        { name: "ChatGPT", pct: 88 },
        { name: "Perplexity", pct: 84 },
        { name: "Claude", pct: 76 },
        { name: "Gemini", pct: 72 },
      ],
    },
  },
  gets: {
    kicker: "Cosa ricevi",
    title: "Tutto quello che serve perché un assistente parli bene di te.",
    assistants: "4 assistenti, un solo controllo.",
    assistantsLead: "Le stesse domande, fatte a tutti, ogni mese. Le risposte così come arrivano.",
  },
  promise: {
    kicker: "Zero sorprese",
    title: "Cosa garantisco. E cosa no.",
    yes: [
      "Audit iniziale gratuito: in chiamata vediamo subito cosa rispondono su di te",
      "Preventivo scritto e chiuso prima di partire, senza costi nascosti",
      "Modifiche reali sul tuo sito, non solo PDF di consigli",
      "Nessun vincolo annuale: resti finché vedi valore",
    ],
    noTitle: "Cosa non prometto",
    no: [
      "Citazioni garantite per contratto: nessuno controlla gli algoritmi di OpenAI o Google",
      "Trucchi o testo nascosto che domani vengono penalizzati",
    ],
  },
  faq: {
    kicker: "Domande frequenti",
    title: "Tutto quello che serve sapere.",
    items: [
      { q: "In quanto tempo si vedono i risultati?", a: "Gli assistenti con ricerca web (ChatGPT Search e Perplexity) recepiscono le modifiche in 2–4 settimane; i modelli base si aggiornano nei cicli successivi." },
      { q: "Serve rifare tutto il sito?", a: "Quasi mai. Lavoro sul sito che hai già, sistemando struttura, pagine chiave e dati leggibili dalle AI." },
      { q: "Aiuta anche su Google (SEO)?", a: "Sì: un sito veloce, chiaro e strutturato per rispondere alle domande dei clienti migliora anche il posizionamento su Google." },
      { q: "Quanto costa?", a: "Dipende da quante pagine e servizi hai. Dopo una chiamata di 30 minuti ricevi un preventivo scritto voce per voce." },
    ],
  },
  close: {
    title: "La prossima domanda sul tuo settore è già in arrivo.",
    lead: "In 30 minuti guardiamo insieme cosa rispondono oggi gli assistenti su di te. Se non posso aiutarti, te lo dico.",
  },
};

const EN: GeoCopy = {
  hero: {
    eyebrow: "GEO · Visibility in AI answers",
    l1: "When people ask AI,",
    l2: "the answer is your name.",
    on: "On",
    and: "and",
    sub: "I make sure ChatGPT, Gemini, Claude and Perplexity recommend your business instead of competitors, bringing you customers ready to buy.",
    how: "See how it works",
    ask: "Can you recommend a good dentist in Brescia?",
  },
  shift: {
    kicker: "Why now",
    text: "People asking an assistant don’t compare ten websites.",
    accent: "They call the first name in the answer.",
    stats: [
      { v: "1 answer", l: "No second page: assistants name 2 or 3 businesses. Either you’re in, or the customer goes elsewhere." },
      { v: "4 platforms", l: "ChatGPT, Gemini, Claude and Perplexity covered together in a single workflow." },
      { v: "Every month", l: "A clear report with the real answers to your customers’ questions, before and after." },
    ],
  },
  scene: {
    kicker: "What the customer sees",
    title: "The answer recommends you. With a direct link.",
    steps: [
      { t: "The customer asks.", b: "They look for a real solution, in plain language." },
      { t: "The assistant checks sources.", b: "It skips vague pages and picks clear, verifiable businesses." },
      { t: "It recommends you.", b: "Your name appears first, backed by your strengths." },
      { t: "And links to your site.", b: "Your source sits right below the answer: one tap away from you." },
    ],
    ask: "Can you recommend a good dentist in Brescia?",
    searching: "Checking sources",
    answer: ["I’d recommend", "Studio Bianchi", ", in central Brescia: online booking, long hours including Saturdays and excellent reviews."],
    sourceTitle: "Studio Bianchi · Dentistry & online booking in Brescia",
    sourceUrl: "studiobianchi.it",
    sources: "Sources",
  },
  compare: {
    kicker: "What changes",
    title: "Stop losing customers who never even see you.",
    beforeLabel: "Today",
    afterLabel: "With GEO",
    before: [
      "People ask about your field and AI recommends a competitor",
      "Assistants quote wrong hours, services or outdated prices",
      "Long pages that never give a direct, quotable answer",
      "No idea what the main AI assistants say about you",
    ],
    after: [
      "You appear among the recommended names when people ask",
      "AI reads accurate, up-to-date facts straight from your site",
      "Every service answers real customer questions up front",
      "Monthly screenshots of real AI answers and progress",
    ],
  },
  how: {
    kicker: "How it works",
    title: "Three concrete steps, zero fluff.",
    lead: "I start from what they say about you today, make your site readable for assistants and measure every month.",
    steps: [
      { t: "Audit of real answers", b: "I ask all 4 assistants your customers’ questions and map who they recommend today." },
      { t: "Source-ready structure", b: "I fix pages, structured data and direct answers so AI can’t get you wrong." },
      { t: "Monthly tracking", b: "I repeat the same prompts every month and step in wherever competitors gain ground." },
    ],
    v1: [
      { q: "Best dentist in Brescia?", res: "2 competitors" },
      { q: "Dentist open on Saturdays?", res: "Not mentioned" },
      { q: "How much is whitening?", res: "Wrong info" },
    ],
    v2: [
      { k: "Who", v: "Studio Bianchi · Brescia" },
      { k: "Services", v: "Hygiene, orthodontics, implants" },
      { k: "Hours", v: "Mon–Sat · 8:30–19:30" },
      { k: "Schema", v: "AI-verified data" },
    ],
    v3: {
      title: "Citation share · Month 3",
      badge: "Growing",
      rows: [
        { name: "ChatGPT", pct: 88 },
        { name: "Perplexity", pct: 84 },
        { name: "Claude", pct: 76 },
        { name: "Gemini", pct: 72 },
      ],
    },
  },
  gets: {
    kicker: "What you get",
    title: "Everything an assistant needs to speak well of you.",
    assistants: "4 assistants, one check.",
    assistantsLead: "The same questions, asked to all of them, every month. The answers exactly as they come.",
  },
  promise: {
    kicker: "No surprises",
    title: "What I guarantee. And what I don’t.",
    yes: [
      "Free initial check: on our call we see what assistants say about you today",
      "Fixed written quote before starting, no hidden fees",
      "Hands-on implementation on your site, not just a PDF of tips",
      "No annual lock-in: you stay as long as you see value",
    ],
    noTitle: "What I won’t promise",
    no: [
      "Contractually guaranteed mentions: nobody owns OpenAI’s or Google’s models",
      "Hidden text or tricks that get penalised tomorrow",
    ],
  },
  faq: {
    kicker: "Frequently asked",
    title: "Everything you need to know.",
    items: [
      { q: "How fast do results show up?", a: "Web-connected assistants (ChatGPT Search and Perplexity) pick up changes in 2–4 weeks; base models update on their next cycle." },
      { q: "Do I need a brand new website?", a: "Rarely. I work on your existing site, fixing structure, key pages and machine-readable data." },
      { q: "Does it help with Google (SEO) too?", a: "Yes: a fast, clear site built around real customer questions improves Google rankings as well." },
      { q: "How much does it cost?", a: "It depends on how many pages and services you have. After a 30-minute call you get a clear written quote." },
    ],
  },
  close: {
    title: "The next question about your field is already on its way.",
    lead: "In 30 minutes we look together at what assistants say about you today. If I can’t help, I’ll tell you.",
  },
};

export const getGeoCopy = (l: Locale): GeoCopy => (l === "en" ? EN : IT);
