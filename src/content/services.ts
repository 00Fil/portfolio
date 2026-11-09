import * as si from "simple-icons";
import type { Locale } from "@/i18n/routing";

type L = Record<Locale, string>;
export type ServiceKey = "web" | "seo" | "geo" | "apps" | "design" | "ai" | "api" | "shop" | "ops";
type Tech = { name: string; path?: string };
const k = (name: string, icon?: { path: string }): Tech => ({ name, path: icon?.path });

export type Service = {
  slug: string;
  key: ServiceKey;
  label: L;
  title: L;
  short: L;
  lead: L;
  includes: { title: L; body: L }[];
  stack: Tech[];
  projects: string[];
  /** indice della voce corrispondente nella domanda "Cosa ti serve?" del modulo */
  need: number;
};

export const SERVICES: Service[] = [
  {
    slug: "siti-web-app",
    key: "web",
    need: 0,
    label: { it: "Full stack", en: "Full stack" },
    title: { it: "Siti e web app", en: "Websites and web apps" },
    short: { it: "Siti, piattaforme e gestionali su misura, dal database all’interfaccia.", en: "Custom websites, platforms and management tools, from database to interface." },
    lead: {
      it: "Dal sito aziendale al gestionale interno: progetto l’interfaccia, scrivo il codice e lo metto online, veloce e facile da aggiornare.",
      en: "From a company website to internal management software: I design the interface, write the code and put it online, fast and easy to update.",
    },
    includes: [
      { title: { it: "Siti aziendali e landing page", en: "Company sites and landing pages" }, body: { it: "Pagine veloci e multilingua, con testi e struttura pensati per Google e per chi deve contattarti.", en: "Fast, multilingual pages, with copy and structure built for Google and for whoever needs to reach you." } },
      { title: { it: "Web app e gestionali", en: "Web apps and management tools" }, body: { it: "Dashboard, aree riservate, prenotazioni e flussi di lavoro costruiti sui tuoi processi, non il contrario.", en: "Dashboards, private areas, bookings and workflows built around your processes, not the other way round." } },
      { title: { it: "Database e back-end", en: "Database and back end" }, body: { it: "Dati strutturati, API sicure, accessi e permessi per ruolo.", en: "Structured data, secure APIs, sign-in and role-based permissions." } },
      { title: { it: "Contenuti in autonomia", en: "Content you can edit" }, body: { it: "Testi, immagini e prodotti modificabili da te, senza toccare il codice.", en: "Text, images and products you can change yourself, without touching code." } },
    ],
    stack: [k("Next.js", si.siNextdotjs), k("React", si.siReact), k("TypeScript", si.siTypescript), k("Tailwind CSS", si.siTailwindcss), k("Node.js", si.siNodedotjs), k("Python", si.siPython), k("FastAPI", si.siFastapi), k("PostgreSQL", si.siPostgresql), k("Supabase", si.siSupabase)],
    projects: ["creacloud", "unispace"],
  },
  {
    slug: "seo",
    key: "seo",
    need: 4,
    label: { it: "SEO", en: "SEO" },
    title: { it: "SEO tecnica e prestazioni", en: "Technical SEO and performance" },
    short: { it: "Core Web Vitals entro le soglie di Google, dati strutturati e multilingua.", en: "Core Web Vitals within Google’s thresholds, structured data and multilingual pages." },
    lead: {
      it: "Un sito che si apre in un attimo e che Google capisce: struttura, velocità e contenuti pensati per farti trovare da chi cerca quello che fai.",
      en: "A site that opens instantly and that Google understands: structure, speed and content designed so people looking for what you do can find you.",
    },
    includes: [
      { title: { it: "Core Web Vitals", en: "Core Web Vitals" }, body: { it: "LCP sotto 2,5 s, INP sotto 200 ms, CLS sotto 0,1: le soglie con cui Google misura l’esperienza delle visite reali.", en: "LCP under 2.5 s, INP under 200 ms, CLS under 0.1: the thresholds Google uses to measure real visits." } },
      { title: { it: "SEO tecnica", en: "Technical SEO" }, body: { it: "Sitemap, URL puliti, canonical, hreflang per le lingue e indicizzazione controllata in Search Console.", en: "Sitemaps, clean URLs, canonicals, hreflang for languages and indexing monitored in Search Console." } },
      { title: { it: "Dati strutturati", en: "Structured data" }, body: { it: "Schema.org per attività, prodotti, articoli e domande frequenti, per risultati più ricchi.", en: "Schema.org for businesses, products, articles and FAQs, for richer results." } },
      { title: { it: "SEO locale", en: "Local SEO" }, body: { it: "Scheda Google Business, pagine per zona e dati coerenti ovunque, per chi ti cerca vicino.", en: "Google Business profile, area pages and consistent details everywhere, for people searching nearby." } },
    ],
    stack: [k("Lighthouse", si.siLighthouse), k("Search Console", si.siGooglesearchconsole), k("Next.js", si.siNextdotjs), k("Cloudflare", si.siCloudflare)],
    projects: [],
  },
  {
    slug: "geo",
    key: "geo",
    need: 4,
    label: { it: "GEO", en: "GEO" },
    title: { it: "Visibilità nelle risposte AI", en: "Visibility in AI answers" },
    short: { it: "Perché ChatGPT, Gemini e Perplexity citino il tuo sito quando rispondono.", en: "So ChatGPT, Gemini and Perplexity cite your site when they answer." },
    lead: {
      it: "Sempre più persone chiedono a un assistente invece di cercare su Google. Preparo il sito perché le AI lo leggano bene e lo citino come fonte.",
      en: "More and more people ask an assistant instead of searching Google. I prepare your site so AI models read it well and cite it as a source.",
    },
    includes: [
      { title: { it: "Contenuti chiari e citabili", en: "Clear, citable content" }, body: { it: "Risposte dirette in apertura, paragrafi brevi, dati con la loro fonte: il formato che le AI riprendono più spesso.", en: "Direct answers up front, short paragraphs, figures with their source: the format AI answers quote most." } },
      { title: { it: "Dati strutturati", en: "Structured data" }, body: { it: "Schema.org per attività, servizi e FAQ, perché i modelli estraggano le informazioni giuste.", en: "Schema.org for businesses, services and FAQs, so models extract the right facts." } },
      { title: { it: "llms.txt e crawler AI", en: "llms.txt and AI crawlers" }, body: { it: "Un indice del sito pensato per i modelli e regole chiare su quali crawler possono leggerlo.", en: "A site index written for models and clear rules on which crawlers may read it." } },
      { title: { it: "Monitoraggio", en: "Monitoring" }, body: { it: "Controllo periodico di come compare il tuo marchio nelle risposte di ChatGPT, Gemini e Perplexity.", en: "Regular checks on how your brand shows up in ChatGPT, Gemini and Perplexity answers." } },
    ],
    stack: [k("Claude", si.siClaude), k("Gemini", si.siGooglegemini), k("Perplexity", si.siPerplexity), k("Search Console", si.siGooglesearchconsole)],
    projects: [],
  },
  {
    slug: "app-multipiattaforma",
    key: "apps",
    need: 2,
    label: { it: "App", en: "Apps" },
    title: { it: "App multipiattaforma", en: "Cross-platform apps" },
    short: { it: "Android, iOS, macOS, Windows e Linux, collegate al tuo server.", en: "Android, iOS, macOS, Windows and Linux, connected to your server." },
    lead: {
      it: "Un’app che funziona su telefono e computer, nativa dove serve: stesso account, stessi dati, sincronizzati in tempo reale.",
      en: "One app that works on phone and computer, native where it matters: same account, same data, synced in real time.",
    },
    includes: [
      { title: { it: "Mobile: Android e iOS", en: "Mobile: Android and iOS" }, body: { it: "App native in Kotlin e Swift, o multipiattaforma quando conviene, pubblicate sugli store.", en: "Native apps in Kotlin and Swift, or cross-platform when it pays off, published on the stores." } },
      { title: { it: "Desktop: Windows, macOS e Linux", en: "Desktop: Windows, macOS and Linux" }, body: { it: "Applicazioni per il computer con funzioni di sistema: notifiche, file, avvio automatico, tray.", en: "Desktop applications with system features: notifications, files, launch at login, tray." } },
      { title: { it: "Sincronizzazione", en: "Sync" }, body: { it: "Dati allineati tra dispositivi e server, anche offline, con i conflitti risolti in automatico.", en: "Data kept in step across devices and server, offline too, with conflicts resolved automatically." } },
      { title: { it: "Rilasci e aggiornamenti", en: "Releases and updates" }, body: { it: "Build automatiche, versioni di prova per i tester e aggiornamenti distribuiti senza attrito.", en: "Automated builds, test versions for testers and updates delivered without friction." } },
    ],
    stack: [k("Kotlin", si.siKotlin), k("Swift", si.siSwift), k(".NET", si.siDotnet), k("Flutter", si.siFlutter), k("Tauri", si.siTauri), k("Android", si.siAndroid), k("iOS", si.siApple), k("Linux", si.siLinux)],
    projects: ["relay"],
  },
  {
    slug: "ui-ux",
    key: "design",
    need: 7,
    label: { it: "Design", en: "Design" },
    title: { it: "UI/UX e prototipi", en: "UI/UX and prototypes" },
    short: { it: "Dal wireframe all’interfaccia, con un prototipo da provare prima del codice.", en: "From wireframe to interface, with a prototype to try before any code." },
    lead: {
      it: "Interfacce chiare e coerenti, con un design system che tiene insieme sito, app e gestionale. Prima si prova il prototipo, poi si scrive il codice.",
      en: "Clear, consistent interfaces, with a design system that ties website, apps and back office together. First you try the prototype, then the code gets written.",
    },
    includes: [
      { title: { it: "Analisi e flussi", en: "Research and flows" }, body: { it: "Chi usa il prodotto, per fare cosa, in quanti passaggi: si parte da qui.", en: "Who uses the product, to do what, in how many steps: that is where it starts." } },
      { title: { it: "Prototipo interattivo", en: "Interactive prototype" }, body: { it: "Schermate cliccabili per provare il flusso e correggerlo prima dello sviluppo.", en: "Clickable screens to try the flow and fix it before development." } },
      { title: { it: "Design system", en: "Design system" }, body: { it: "Colori, testi, componenti e animazioni in un unico sistema, riusato ovunque.", en: "Colours, type, components and motion in one system, reused everywhere." } },
      { title: { it: "Accessibilità", en: "Accessibility" }, body: { it: "Contrasti, tastiera e lettori di schermo secondo le linee guida WCAG.", en: "Contrast, keyboard and screen readers following WCAG guidelines." } },
    ],
    stack: [k("Figma", si.siFigma), k("React", si.siReact), k("Tailwind CSS", si.siTailwindcss), k("GSAP", si.siGsap), k("Jetpack Compose", si.siJetpackcompose)],
    projects: ["relay", "unispace"],
  },
  {
    slug: "ai-automazioni",
    key: "ai",
    need: 5,
    label: { it: "AI", en: "AI" },
    title: { it: "AI e sistemi integrati", en: "AI and integrated systems" },
    short: { it: "Sistemi che automatizzano i processi complessi dell’azienda, assistenti compresi.", en: "Systems that automate complex business processes, assistants included." },
    lead: {
      it: "Collego l’AI ai tuoi strumenti per automatizzare procedure intere: documenti letti e controllati, gestionale aggiornato, clienti avvisati, con una persona che approva i passaggi critici.",
      en: "I connect AI to your tools to automate whole procedures: documents read and checked, records updated, customers notified, with a person approving the critical steps.",
    },
    includes: [
      { title: { it: "Processi complessi automatizzati", en: "Complex processes, automated" }, body: { it: "Procedure a più passaggi tra email, documenti, gestionale e clienti, eseguite da sole e tracciate passo per passo.", en: "Multi-step procedures across email, documents, back office and customers, run on their own and logged step by step." } },
      { title: { it: "Assistenti su WhatsApp e chat", en: "WhatsApp and chat assistants" }, body: { it: "Rispondono, registrano richieste e prenotano: in CreaCloud li usano più di 80 famiglie ogni giorno.", en: "They answer, log requests and book: in CreaCloud more than 80 families use one every day." } },
      { title: { it: "Dati dai documenti", en: "Data from documents" }, body: { it: "Fatture, ordini e moduli letti dall’AI e trasformati in dati puliti nel gestionale.", en: "Invoices, orders and forms read by AI and turned into clean records." } },
      { title: { it: "Controllo e sicurezza", en: "Control and safety" }, body: { it: "Le azioni critiche aspettano un’approvazione; i dati restano sui tuoi server quando serve.", en: "Critical actions wait for approval; data stays on your servers when needed." } },
    ],
    stack: [k("Claude", si.siClaude), k("Gemini", si.siGooglegemini), k("Python", si.siPython), k("FastAPI", si.siFastapi), k("n8n", si.siN8n), k("PostgreSQL", si.siPostgresql), k("WhatsApp", si.siWhatsapp)],
    projects: ["creacloud"],
  },
  {
    slug: "integrazioni-api",
    key: "api",
    need: 6,
    label: { it: "API", en: "API" },
    title: { it: "Integrazioni e API", en: "Integrations and APIs" },
    short: { it: "Gestionali, pagamenti, CRM e servizi esterni che parlano tra loro.", en: "Back office, payments, CRMs and external services talking to each other." },
    lead: {
      it: "Basta copiare dati a mano da un programma all’altro: collego i tuoi strumenti con API e webhook, in modo affidabile e monitorato.",
      en: "No more copying data by hand from one tool to another: I connect your tools through APIs and webhooks, reliably and monitored.",
    },
    includes: [
      { title: { it: "API su misura", en: "Custom APIs" }, body: { it: "REST documentate, autenticate e versionate, pronte per app e partner.", en: "Documented, authenticated, versioned REST APIs, ready for apps and partners." } },
      { title: { it: "Pagamenti", en: "Payments" }, body: { it: "Stripe, abbonamenti, fatture e rimborsi collegati al gestionale.", en: "Stripe, subscriptions, invoices and refunds linked to your records." } },
      { title: { it: "CRM, email e calendari", en: "CRM, email and calendars" }, body: { it: "HubSpot, Gmail e Google Calendar sincronizzati con i tuoi dati.", en: "HubSpot, Gmail and Google Calendar in sync with your data." } },
      { title: { it: "Webhook affidabili", en: "Reliable webhooks" }, body: { it: "Eventi in tempo reale con nuovi tentativi automatici e registro di ogni chiamata.", en: "Real-time events with automatic retries and a log of every call." } },
    ],
    stack: [k("Stripe", si.siStripe), k("HubSpot", si.siHubspot), k("Gmail", si.siGmail), k("Google Calendar", si.siGooglecalendar), k("WhatsApp", si.siWhatsapp), k("Node.js", si.siNodedotjs), k("FastAPI", si.siFastapi)],
    projects: ["creacloud"],
  },
  {
    slug: "e-commerce",
    key: "shop",
    need: 3,
    label: { it: "E-commerce", en: "E-commerce" },
    title: { it: "Negozi online", en: "Online stores" },
    short: { it: "Catalogo, pagamenti e ordini, veloci e facili da gestire.", en: "Catalogue, payments and orders, fast and easy to manage." },
    lead: {
      it: "Un negozio che si apre subito anche da telefono, con pagamenti sicuri e un pannello semplice per prodotti, ordini e spedizioni.",
      en: "A store that opens instantly on phones too, with secure payments and a simple panel for products, orders and shipping.",
    },
    includes: [
      { title: { it: "Catalogo e varianti", en: "Catalogue and variants" }, body: { it: "Prodotti, taglie, colori e disponibilità gestiti da un unico pannello.", en: "Products, sizes, colours and stock managed from one panel." } },
      { title: { it: "Checkout e pagamenti", en: "Checkout and payments" }, body: { it: "Carte, Apple Pay e Google Pay con Stripe, in pochi passaggi.", en: "Cards, Apple Pay and Google Pay through Stripe, in a few steps." } },
      { title: { it: "Ordini e spedizioni", en: "Orders and shipping" }, body: { it: "Stato dell’ordine, email al cliente e collegamento ai corrieri.", en: "Order status, customer emails and courier integration." } },
      { title: { it: "SEO dei prodotti", en: "Product SEO" }, body: { it: "Schede prodotto con dati strutturati, pronte per Google Shopping.", en: "Product pages with structured data, ready for Google Shopping." } },
    ],
    stack: [k("Shopify", si.siShopify), k("WooCommerce", si.siWoocommerce), k("Stripe", si.siStripe), k("Next.js", si.siNextdotjs)],
    projects: [],
  },
  {
    slug: "devops-manutenzione",
    key: "ops",
    need: 8,
    label: { it: "DevOps", en: "DevOps" },
    title: { it: "Hosting, rilasci e manutenzione", en: "Hosting, releases and maintenance" },
    short: { it: "Server, HTTPS, backup e rilasci automatici, e un referente dopo la consegna.", en: "Servers, HTTPS, backups and automated releases, and one contact after launch." },
    lead: {
      it: "Il progetto resta online, aggiornato e al sicuro. Mi occupo di server, rilasci e backup, e resto il riferimento anche dopo la consegna.",
      en: "Your project stays online, up to date and safe. I handle servers, releases and backups, and remain your contact after launch.",
    },
    includes: [
      { title: { it: "Hosting e server", en: "Hosting and servers" }, body: { it: "VPS e container Docker con HTTPS automatico, dimensionati sul progetto.", en: "VPS and Docker containers with automatic HTTPS, sized for the project." } },
      { title: { it: "Rilasci automatici", en: "Automated releases" }, body: { it: "Ogni modifica passa da build e test prima di andare online, con GitHub Actions.", en: "Every change goes through build and tests before going live, with GitHub Actions." } },
      { title: { it: "Backup e monitoraggio", en: "Backups and monitoring" }, body: { it: "Backup giornalieri e avvisi immediati se qualcosa smette di rispondere.", en: "Daily backups and instant alerts if something stops responding." } },
      { title: { it: "Manutenzione", en: "Maintenance" }, body: { it: "Aggiornamenti di sicurezza, nuove funzioni e assistenza da chi conosce il progetto.", en: "Security updates, new features and support from someone who knows the project." } },
    ],
    stack: [k("Docker", si.siDocker), k("Linux", si.siLinux), k("GitHub Actions", si.siGithubactions), k("Caddy", si.siCaddy), k("Nginx", si.siNginx), k("Cloudflare", si.siCloudflare)],
    projects: ["unispace", "creacloud"],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
