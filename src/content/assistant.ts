import type { Locale } from "@/i18n/routing";
import type { ServiceKey } from "./services";

type L = Record<Locale, string>;

/** Cosa può comparire dentro una risposta, oltre al testo. */
export type Widget = { kind: "book"; path?: string } | { kind: "service"; key: ServiceKey } | { kind: "project"; slug: string } | { kind: "projects" } | { kind: "area" } | { kind: "cv" } | { kind: "contact" } | { kind: "handoff" };

export type Intent = { id: string; kw: string[]; a: L; w?: Widget[]; chip?: L };

/*
 * Le risposte dell'assistente. Le parole chiave sono radici: "prezz" prende prezzo e prezzi.
 * Vale sempre la risposta con più corrispondenze; a parità, quella più in alto.
 */
export const INTENTS: Intent[] = [
  {
    id: "start",
    kw: ["avvi", "inizi", "partir", "comincia", "lanciar", "nuov", "start", "launch", "begin", "new"],
    a: {
      it: "Bene. Scrivimi in due righe di cosa si tratta e ti dico come lo imposterei, oppure prenota subito 30 minuti con Filippo.",
      en: "Great. Tell me in a couple of lines what it is about and I’ll tell you how I’d set it up, or book 30 minutes with Filippo straight away.",
    },
    w: [{ kind: "book" }],
  },
  {
    id: "agent",
    kw: ["persona", "umano", "operator", "agent", "consulen", "consigl", "parlare", "filippo", "human", "advice", "someone", "consult"],
    a: {
      it: "Ti metto in contatto con Filippo. Lasciami nome ed email: riceve questa conversazione e ti risponde entro 24 ore.",
      en: "I’ll put you in touch with Filippo. Leave your name and email: he gets this conversation and replies within 24 hours.",
    },
    w: [{ kind: "handoff" }],
  },
  {
    id: "support",
    kw: ["support", "assistenz", "problema", "errore", "bug", "funziona", "rotto", "bloccat", "down", "broken", "issue", "error"],
    a: {
      it: "Se sei già cliente, la via più rapida è una richiesta dall’area clienti: resta tracciata fino alla soluzione. Altrimenti descrivimi il problema e lo passo subito a Filippo.",
      en: "If you are already a client, the quickest route is a request from the client area: it stays tracked until it is solved. Otherwise describe the issue and I’ll pass it to Filippo right away.",
    },
    w: [{ kind: "area" }, { kind: "handoff" }],
  },
  {
    id: "cost",
    chip: { it: "Quanto costa?", en: "How much does it cost?" },
    kw: ["cost", "prezz", "preventiv", "budget", "quanto", "tariff", "spesa", "spend", "price", "quote", "euro", "€"],
    a: {
      it: "Dipende da cosa serve. Dopo una chiamata di 30 minuti ricevi un preventivo scritto con costi, tempi e cosa è incluso, diviso per milestone: sai fin dall’inizio quanto spenderai e quando.",
      en: "It depends on what you need. After a 30-minute call you get a written quote with costs, timing and what is included, split into milestones: you know from the start what you will spend and when.",
    },
    w: [{ kind: "book" }],
  },
  {
    id: "time",
    chip: { it: "In quanto tempo?", en: "How long does it take?" },
    kw: ["tempo", "tempi", "quando", "pront", "settiman", "mesi", "durat", "scadenz", "consegn", "time", "long", "deadline", "ready", "weeks", "months"],
    a: {
      it: "Un sito aziendale richiede di solito qualche settimana, un gestionale o un’app qualche mese. Il piano fissa milestone con date precise e ogni due settimane vedi una versione da provare.",
      en: "A company website usually takes a few weeks, a management tool or an app a few months. The plan sets milestones with fixed dates and every two weeks you see a build to try.",
    },
    w: [{ kind: "book" }],
  },
  {
    id: "method",
    chip: { it: "Come gestisci un progetto?", en: "How do you run a project?" },
    kw: ["metod", "process", "fasi", "gestion", "gestisc", "organizz", "lavori", "approcc", "milestone", "sprint", "manage", "run", "method", "approach", "steps"],
    a: {
      it: "In cinque fasi: analisi dei requisiti, pianificazione con tempi e costi, sviluppo a cicli di due settimane con demo, collaudo e rilascio approvato, assistenza con tempi di intervento garantiti. Un solo referente dall’inizio alla fine e l’avanzamento sempre visibile nell’area clienti.",
      en: "In five phases: requirements analysis, planning with time and cost, delivery in two-week cycles with demos, acceptance and approved release, support with guaranteed response times. One point of contact from start to finish, with progress always visible in the client area.",
    },
    w: [{ kind: "area" }],
  },
  {
    id: "own",
    kw: ["codice", "dati", "propriet", "intestat", "mio", "mia", "tuo", "own", "data", "code", "source", "lock"],
    a: {
      it: "Codice, dati e accessi sono tuoi. Alla consegna ricevi tutto con la documentazione; i dati restano su server o servizi intestati a te.",
      en: "Code, data and access are yours. At handover you get everything with documentation; data stays on servers or services in your name.",
    },
  },
  {
    id: "after",
    kw: ["dopo", "manutenz", "assistenz", "support", "aggiorn", "problema", "guast", "after", "maintenance", "updates", "broken", "help"],
    a: {
      it: "Dopo il lancio resto il riferimento: monitoraggio, aggiornamenti di sicurezza e nuove funzioni, con tempi di intervento scritti nel contratto.",
      en: "After launch I stay your point of contact: monitoring, security updates and new features, with response times written into the contract.",
    },
    w: [{ kind: "service", key: "ops" }],
  },
  {
    id: "where",
    kw: ["brescia", "remot", "distanz", "italia", "ester", "ingles", "dove", "zona", "persona", "where", "abroad", "english", "remote", "located"],
    a: {
      it: "Lavoro da Brescia con aziende in tutta Italia e all’estero, in italiano e in inglese. In zona possiamo anche vederci di persona.",
      en: "I work from Brescia with companies across Italy and abroad, in Italian and English. Locally we can also meet in person.",
    },
    w: [{ kind: "book" }],
  },
  {
    id: "existing",
    kw: ["esistent", "già", "gia", "vecchi", "rinnov", "migr", "rifar", "attuale", "existing", "legacy", "already", "old", "current"],
    a: {
      it: "Si può partire da quello che hai: analizzo cosa c’è, tengo quello che funziona e lo collego o lo rinnovo un pezzo alla volta, senza fermare il lavoro.",
      en: "We can start from what you have: I review it, keep what works and connect or renew it piece by piece, without stopping your work.",
    },
    w: [{ kind: "service", key: "api" }],
  },
  {
    id: "area",
    chip: { it: "Cos’è l’area clienti?", en: "What is the client area?" },
    kw: ["area", "clienti", "dashboard", "avanzament", "accesso", "accedi", "login", "richiest", "client", "progress", "portal"],
    a: {
      it: "Ogni progetto include l’area clienti: fase e avanzamento, versione da provare, richieste di modifica tracciate fino al rilascio, documenti e assistenza.",
      en: "Every project includes the client area: phase and progress, preview build, change requests tracked until release, documents and support.",
    },
    w: [{ kind: "area" }],
  },
  {
    id: "work",
    chip: { it: "Fammi vedere dei lavori", en: "Show me some work" },
    kw: ["lavor", "progett", "esempi", "portfolio", "casi", "realizzat", "fatto", "work", "projects", "examples", "case"],
    a: {
      it: "Ecco tre progetti, ognuno con la sua pagina: il problema, cosa ho costruito e le scelte tecniche.",
      en: "Here are three projects, each with its own page: the problem, what I built and the technical choices.",
    },
    w: [{ kind: "projects" }],
  },
  {
    id: "who",
    kw: ["chi", "filippo", "studi", "universit", "esperienz", "curricul", "cv", "who", "about", "experience", "background"],
    a: {
      it: "Sono Filippo Corsini, sviluppatore e studente di Ingegneria Informatica a Brescia. Seguo ogni progetto in prima persona, dall’analisi al rilascio.",
      en: "I am Filippo Corsini, a developer and Computer Engineering student in Brescia. I personally run every project, from analysis to release.",
    },
    w: [{ kind: "cv" }],
  },
  {
    id: "contact",
    chip: { it: "Prenota una chiamata", en: "Book a call" },
    kw: ["contatt", "email", "mail", "telefon", "chiamat", "parlar", "sentirc", "prenot", "appuntament", "call", "contact", "talk", "meet", "book", "phone"],
    a: {
      it: "Il modo più veloce è una chiamata di 30 minuti: scegli il giorno e l’ora tra quelli liberi e ti arriva subito l’invito.",
      en: "The quickest way is a 30-minute call: pick a free day and time and the invite arrives straight away.",
    },
    w: [{ kind: "book" }, { kind: "contact" }],
  },
];

/** Parole che portano a un servizio. */
export const SERVICE_KW: Record<ServiceKey, string[]> = {
  web: ["sito", "siti", "web", "landing", "pagin", "website", "gestional", "dashboard", "piattaform", "webapp"],
  seo: ["seo", "google", "posizion", "ricerc", "visibil", "trovar", "ranking", "search"],
  geo: ["chatgpt", "gemini", "perplexity", "assistent", "geo", "llm"],
  apps: ["app", "iphone", "android", "ios", "mac", "windows", "linux", "telefon", "mobile", "desktop", "smartphone"],
  design: ["design", "grafic", "interfacc", "ux", "ui", "figma", "prototip", "logo"],
  ai: ["ai", "ia", "intelligenz", "automat", "automazion", "chatbot", "bot", "agent", "artificial", "automation"],
  hw: ["hardware", "sensor", "arduino", "raspberry", "iot", "dispositiv", "frigo", "temperatur", "device"],
  api: ["integr", "api", "colleg", "crm", "stripe", "pagament", "whatsapp", "calendar", "sincron", "connect", "payments"],
  shop: ["ecommerce", "e-commerce", "negozio", "vender", "vendit", "shop", "prodott", "carrello", "store", "sell"],
  ops: ["hosting", "server", "dominio", "manutenz", "sicurezz", "backup", "ddos", "aggiornament", "uptime", "security"],
};

/** Parole che portano a un progetto. */
export const PROJECT_KW: Record<string, string[]> = {
  relay: ["relay", "ponte", "appunti", "clipboard"],
  creacloud: ["creacloud", "calendari", "lezion", "tutor", "doposcuola", "scuola", "school"],
  unispace: ["unispace", "studycut", "studykit", "trascri", "studio", "universit"],
};
