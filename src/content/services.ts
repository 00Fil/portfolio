import * as si from "simple-icons";
import type { Locale } from "@/i18n/routing";

type L = Record<Locale, string>;
export type ServiceKey = "web" | "seo" | "geo" | "apps" | "design" | "ai" | "hw" | "api" | "shop" | "ops";
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
    short: { it: "Siti e applicazioni web su misura che lavorano per la tua attività: veloci, sicuri e facili da aggiornare.", en: "Custom websites and web apps that work for your business: fast, secure and easy to update." },
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
    short: { it: "Un sito veloce e tecnicamente impeccabile, che Google capisce e mette davanti ai concorrenti.", en: "A fast, technically flawless site that Google understands and ranks ahead of competitors." },
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
    short: { it: "Fai in modo che ChatGPT, Gemini e Perplexity citino la tua azienda quando i clienti chiedono.", en: "Make sure ChatGPT, Gemini and Perplexity cite your business when customers ask." },
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
    short: { it: "Interfacce chiare e coerenti, provate con un prototipo prima di investire nello sviluppo.", en: "Clear, consistent interfaces, tested with a prototype before investing in development." },
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
    short: { it: "Agenti AI che svolgono i lavori ripetitivi al posto tuo: leggono, compilano, rispondono. Tu approvi.", en: "AI agents that take over repetitive work: they read, fill in and reply. You approve." },
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
    slug: "soluzioni-hardware",
    key: "hw",
    need: 9,
    label: { it: "Hardware", en: "Hardware" },
    title: { it: "Soluzioni hardware", en: "Hardware solutions" },
    short: { it: "Dispositivi, sensori e macchine collegati al tuo software, con i dati in tempo reale.", en: "Devices, sensors and machines connected to your software, with live data." },
    lead: {
      it: "Quando il software da solo non basta: progetto dispositivi su misura con microcontrollori e sensori, li collego al gestionale e porto i loro dati su una dashboard in tempo reale.",
      en: "When software alone is not enough: I design custom devices with microcontrollers and sensors, connect them to your systems and bring their data to a live dashboard.",
    },
    includes: [
      { title: { it: "Prototipi e dispositivi su misura", en: "Prototypes and custom devices" }, body: { it: "Schede con ESP32, Arduino o Raspberry Pi, firmware e involucro, dal prototipo al pezzo installato.", en: "Boards with ESP32, Arduino or Raspberry Pi, firmware and enclosure, from prototype to installed unit." } },
      { title: { it: "Sensori e IoT", en: "Sensors and IoT" }, body: { it: "Temperatura, presenza, consumi, accessi: misure raccolte e inviate al server via Wi-Fi o rete locale.", en: "Temperature, presence, energy use, access: readings collected and sent to the server over Wi-Fi or local network." } },
      { title: { it: "Dashboard e allarmi", en: "Dashboards and alerts" }, body: { it: "Dati in tempo reale, storico e notifiche quando un valore esce dai limiti.", en: "Live data, history and notifications when a value goes out of range." } },
      { title: { it: "Integrazione con i sistemi esistenti", en: "Integration with existing systems" }, body: { it: "Macchine, totem e postazioni collegati al gestionale e alle automazioni con l’AI.", en: "Machines, kiosks and workstations linked to your back office and AI automations." } },
    ],
    stack: [k("ESP32", si.siEspressif), k("Arduino", si.siArduino), k("Raspberry Pi", si.siRaspberrypi), k("C++", si.siCplusplus), k("MicroPython", si.siMicropython), k("MQTT", si.siMqtt), k("Home Assistant", si.siHomeassistant), k("Grafana", si.siGrafana)],
    projects: [],
  },
  {
    slug: "integrazioni-api",
    key: "api",
    need: 6,
    label: { it: "Integrazioni", en: "Integrations" },
    title: { it: "Programmi che si parlano", en: "Tools that talk to each other" },
    short: { it: "I tuoi programmi collegati tra loro: pagamenti, clienti e agenda si aggiornano da soli.", en: "Your tools connected to each other: payments, customers and calendar update themselves." },
    lead: {
      it: "Basta copiare dati a mano da un programma all’altro. Collego i tuoi strumenti perché quando succede qualcosa in uno, gli altri si aggiornano da soli, in modo affidabile.",
      en: "No more copying data by hand from one tool to another. I connect your tools so that when something happens in one, the others update on their own, reliably.",
    },
    includes: [
      { title: { it: "Collegamenti su misura", en: "Custom connections" }, body: { it: "Il tuo gestionale apre le porte giuste ad app, sito e partner, in modo sicuro e documentato.", en: "Your back office opens the right doors to apps, website and partners, securely and documented." } },
      { title: { it: "Pagamenti", en: "Payments" }, body: { it: "Incassi, abbonamenti, fatture e rimborsi che finiscono da soli nel gestionale.", en: "Payments, subscriptions, invoices and refunds that land in your system automatically." } },
      { title: { it: "Clienti, email e calendari", en: "Customers, email and calendars" }, body: { it: "Contatti, appuntamenti e messaggi sincronizzati tra CRM, Gmail e Google Calendar.", en: "Contacts, appointments and messages kept in sync across CRM, Gmail and Google Calendar." } },
      { title: { it: "In tempo reale, senza perdite", en: "Real time, nothing lost" }, body: { it: "Se un servizio non risponde, il dato riprova da solo; ogni passaggio resta registrato.", en: "If a service doesn’t answer, the data retries on its own; every step is logged." } },
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
    label: { it: "Gestione", en: "Care" },
    title: { it: "Hosting, sicurezza e assistenza", en: "Hosting, security and support" },
    short: { it: "Sito sempre online, aggiornato e protetto, con un referente che interviene prima che tu te ne accorga.", en: "Your site always online, updated and protected, with someone stepping in before you even notice." },
    lead: {
      it: "Ti consegno il progetto e resto a occuparmene: lo tengo online e veloce, lo proteggo, faccio una copia di sicurezza ogni notte e lo aggiorno senza fermarlo.",
      en: "I deliver your project and keep looking after it: online and fast, protected, backed up every night and updated without downtime.",
    },
    includes: [
      { title: { it: "Sempre online", en: "Always online" }, body: { it: "Server dedicato e configurato per il tuo progetto, con il lucchetto di sicurezza attivo e il tuo dominio.", en: "A server set up for your project, with the security padlock on and your own domain." } },
      { title: { it: "Aggiornamenti senza interruzioni", en: "Updates without downtime" }, body: { it: "Ogni modifica viene controllata in automatico prima di andare online: i tuoi clienti non vedono pagine rotte.", en: "Every change is checked automatically before it goes live: your customers never see broken pages." } },
      { title: { it: "Copie di sicurezza e controllo", en: "Backups and monitoring" }, body: { it: "Una copia di tutto ogni notte e un avviso immediato se qualcosa smette di rispondere.", en: "A copy of everything every night and an instant alert if something stops responding." } },
      { title: { it: "Assistenza", en: "Support" }, body: { it: "Aggiornamenti di sicurezza, nuove funzioni e risposte rapide da chi conosce il progetto.", en: "Security updates, new features and quick answers from someone who knows the project." } },
    ],
    stack: [k("Docker", si.siDocker), k("Linux", si.siLinux), k("GitHub Actions", si.siGithubactions), k("Caddy", si.siCaddy), k("Nginx", si.siNginx), k("Cloudflare", si.siCloudflare)],
    projects: ["unispace", "creacloud"],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
