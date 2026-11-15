import type { Locale } from "@/i18n/routing";

/**
 * La pagina GEO ha un racconto tutto suo, costruito come una pagina prodotto: una frase per schermata,
 * una scena che si svolge scorrendo, tessere di vetro per quello che ricevi. I testi comuni (garanzie,
 * domande, tappe) arrivano ancora da `stories.ts`; qui c'è solo quello che è proprio di questa pagina.
 */
export type GeoCopy = {
  hero: { eyebrow: string; l1: string; l2: string; on: string; and: string; sub: string; how: string; ask: string };
  shift: { kicker: string; text: string; accent: string };
  scene: { kicker: string; title: string; steps: { t: string; b: string }[]; ask: string; searching: string; answer: [string, string, string]; cites: string; sources: string };
  how: { kicker: string; title: string; lead: string; v1: string[]; v2: { k: string; v: string }[]; ready: string; v3: { title: string; mentions: string; soon: string } };
  gets: { kicker: string; title: string; assistants: string; assistantsLead: string };
  promise: { kicker: string };
  faq: { kicker: string };
  close: { title: string; lead: string };
};

const IT: GeoCopy = {
  hero: {
    eyebrow: "GEO · Visibilità nelle risposte AI",
    l1: "Quando chiedono all’AI,",
    l2: "rispondono con il tuo nome.",
    on: "Su",
    and: "e",
    sub: "Controllo cosa dicono di te gli assistenti, rendo il tuo sito la fonte più chiara da citare e misuro ogni mese come cambiano le risposte.",
    how: "Guarda come funziona",
    ask: "Mi consigli un buon dentista a Brescia?",
  },
  shift: {
    kicker: "Cosa è cambiato",
    text: "Le persone non sfogliano più dieci link. Fanno una domanda a un assistente e si fidano della risposta.",
    accent: "Una risposta che nomina pochi nomi.",
  },
  scene: {
    kicker: "Una domanda, una risposta",
    title: "E il nome che sceglie è il tuo.",
    steps: [
      { t: "Il cliente chiede.", b: "Niente parole chiave: una domanda, come la farebbe a un amico." },
      { t: "L’assistente cerca.", b: "Legge il web e sceglie le fonti più chiare e affidabili." },
      { t: "Risponde. Con te.", b: "Se il tuo sito spiega bene chi sei, cosa fai e dove, è più facile che il nome scelto sia il tuo." },
      { t: "E ti cita come fonte.", b: "Il link al tuo sito, proprio sotto la risposta. Chi legge è a un tocco da te." },
    ],
    ask: "Mi consigli un buon dentista a Brescia?",
    searching: "Sto leggendo le fonti",
    answer: ["Ti consiglio", "Studio Bianchi", ", in centro a Brescia: prenotazione online, orari estesi anche il sabato e recensioni molto positive."],
    cites: "Ti cita",
    sources: "Fonti",
  },
  how: {
    kicker: "Come funziona",
    title: "Non si comanda un’AI. Si diventa la sua fonte migliore.",
    lead: "Tre passaggi, ogni mese. Parto da cosa rispondono oggi, sistemo quello che leggono, misuro cosa cambia.",
    v1: ["Un buon dentista a Brescia?", "Dentista aperto il sabato vicino a me", "Quanto costa uno sbiancamento?"],
    v2: [
      { k: "Chi", v: "Studio Bianchi · odontoiatria" },
      { k: "Dove", v: "Via Roma 12, Brescia" },
      { k: "Orari", v: "Lun–Sab · 8:30–19:30" },
      { k: "Servizi", v: "Igiene, ortodonzia, impianti" },
    ],
    ready: "Pronta da citare",
    v3: { title: "Controllo mensile", mentions: "Ti nomina", soon: "In arrivo" },
  },
  gets: {
    kicker: "Cosa ricevi",
    title: "Tutto quello che serve perché un assistente parli bene di te.",
    assistants: "4 assistenti, un solo controllo.",
    assistantsLead: "Le stesse domande, fatte a tutti, ogni mese. Le risposte così come arrivano.",
  },
  promise: { kicker: "Patti chiari" },
  faq: { kicker: "Domande frequenti" },
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
    sub: "I check what assistants say about you, make your site the clearest source to quote and measure every month how the answers change.",
    how: "See how it works",
    ask: "Can you recommend a good dentist in Brescia?",
  },
  shift: {
    kicker: "What changed",
    text: "People no longer scroll through ten links. They ask an assistant a question and trust the answer.",
    accent: "An answer that names only a few businesses.",
  },
  scene: {
    kicker: "One question, one answer",
    title: "And the name it picks is yours.",
    steps: [
      { t: "The customer asks.", b: "No keywords: a question, the way they’d ask a friend." },
      { t: "The assistant searches.", b: "It reads the web and picks the clearest, most reliable sources." },
      { t: "It answers. With you.", b: "If your site explains clearly who you are, what you do and where, the name it picks is more likely to be yours." },
      { t: "And cites you as the source.", b: "A link to your site, right under the answer. The reader is one tap away from you." },
    ],
    ask: "Can you recommend a good dentist in Brescia?",
    searching: "Reading the sources",
    answer: ["I’d recommend", "Studio Bianchi", ", in central Brescia: online booking, long hours including Saturdays and excellent reviews."],
    cites: "Cites you",
    sources: "Sources",
  },
  how: {
    kicker: "How it works",
    title: "You can’t command an AI. You can become its best source.",
    lead: "Three steps, every month. I start from what they answer today, fix what they read, and measure what changes.",
    v1: ["A good dentist in Brescia?", "Dentist open on Saturdays near me", "How much does whitening cost?"],
    v2: [
      { k: "Who", v: "Studio Bianchi · dentistry" },
      { k: "Where", v: "Via Roma 12, Brescia" },
      { k: "Hours", v: "Mon–Sat · 8:30–19:30" },
      { k: "Services", v: "Hygiene, orthodontics, implants" },
    ],
    ready: "Ready to quote",
    v3: { title: "Monthly check", mentions: "Mentions you", soon: "On its way" },
  },
  gets: {
    kicker: "What you get",
    title: "Everything an assistant needs to speak well of you.",
    assistants: "4 assistants, one check.",
    assistantsLead: "The same questions, asked to all of them, every month. The answers exactly as they come.",
  },
  promise: { kicker: "Clear terms" },
  faq: { kicker: "Frequently asked" },
  close: {
    title: "The next question about your field is already on its way.",
    lead: "In 30 minutes we look together at what assistants say about you today. If I can’t help, I’ll tell you.",
  },
};

export const getGeoCopy = (l: Locale): GeoCopy => (l === "en" ? EN : IT);
