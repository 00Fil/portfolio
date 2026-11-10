import type { Locale } from "@/i18n/routing";

type L = Record<Locale, string>;

export type Project = {
  slug: string;
  name: string;
  year: string;
  platforms: L;
  role: L;
  stack: string[];
  repo?: string;
  line: L;
  summary: L;
  problem: L;
  built: Record<Locale, string[]>;
  decisions: Record<Locale, string[]>;
  limits: Record<Locale, string[]>;
  figures: { value: string; label: L }[];
  headline: L;
  context: L;
  tags: Record<Locale, string[]>;
};

export const projects: Project[] = [
  {
    slug: "relay",
    headline: { it: "Appunti, file e cuffie che seguono il dispositivo che stai usando", en: "Clipboard, files and headphones that follow the device you are using" },
    context: { it: "Relay, app per computer e telefono", en: "Relay, apps for computer and phone" },
    tags: { it: ["App native", "Protocollo di rete", "Design system"], en: ["Native apps", "Network protocol", "Design system"] },
    name: "Relay",
    year: "2026",
    platforms: { it: "Windows, macOS, Linux, iOS, Android", en: "Windows, macOS, Linux, iOS, Android" },
    role: { it: "Progetto personale", en: "Personal project" },
    stack: ["Kotlin", "Jetpack Compose", "C#", "WinUI 3", "Node.js", "WebSocket", "Headscale", "GitHub Actions"],
    repo: "https://github.com/00Fil/ponte",
    line: {
      it: "Appunti, screenshot, file, audio e notifiche condivisi tra Windows, macOS, Linux, iOS e Android.",
      en: "Clipboard, screenshots, files, audio and notifications shared across Windows, macOS, Linux, iOS and Android.",
    },
    summary: {
      it: "App native per ogni sistema e un server parlano lo stesso protocollo. Ogni messaggio viaggia insieme sulla rete locale e sul server, e il doppione viene scartato. Senza Wi-Fi in comune restano Bluetooth, Wi-Fi Direct e una rete privata Headscale.",
      en: "Native apps for every system and a server speak one protocol. Every message travels over the local network and the server at once, and the duplicate is dropped. Without shared Wi-Fi, Bluetooth, Wi-Fi Direct and a private Headscale network take over.",
    },
    problem: {
      it: "Passare un testo, uno screenshot o le cuffie dal PC al telefono richiede ogni volta un'app diversa, un cloud o un cavo. Fuori casa la rete locale non c'è; in casa il cloud è una strada inutilmente lunga.",
      en: "Moving a piece of text, a screenshot or a pair of headphones between PC and phone takes a different app, a cloud service or a cable each time. Away from home there is no local network; at home the cloud is a needlessly long way round.",
    },
    built: {
      it: [
        "App Android in Kotlin e Jetpack Compose, app Windows in C# e WinUI 3, server Node con WebSocket.",
        "Appunti di testo, file e immagini fino a 50 MB, screenshot inviati appena salvati, notifiche del telefono sul PC.",
        "Passaggio automatico delle cuffie al dispositivo in uso, con blocco manuale dal riquadro rapido o dall'area di notifica.",
        "Aggiornamenti automatici: GitHub Actions compila APK e installer e pubblica la release.",
        "Stesso protocollo per le app macOS, iOS e Linux: un'unica specifica, cinque sistemi.",
      ],
      en: [
        "Android app in Kotlin and Jetpack Compose, Windows app in C# and WinUI 3, Node server over WebSocket.",
        "Text clipboard, files and images up to 50 MB, screenshots sent as soon as they are saved, phone notifications on the PC.",
        "Headphones move automatically to the device in use, with a manual lock from Quick Settings or the system tray.",
        "Automatic updates: GitHub Actions builds the APK and installer and publishes the release.",
        "The same protocol drives the macOS, iOS and Linux apps: one spec, five systems.",
      ],
    },
    decisions: {
      it: [
        "Un protocollo, un'unica specifica: vive in un solo file e ogni modifica vale per il server e per tutte le app.",
        "Due trasporti sempre attivi, hub e LAN diretta; i doppioni si scartano per id del messaggio.",
        "In LAN nasce un solo collegamento per coppia (decide l'id minore) e si autentica con HMAC-SHA256 sul token condiviso.",
        "File a blocchi da 48 KiB, in ordine, con un limite di 1 MiB per frame.",
        "Interfaccia su un design system proprio: token Canone e controlli di vetro Goccia, con shader AGSL per la rifrazione.",
      ],
      en: [
        "One protocol, one spec: it lives in a single file and every change applies to the server and every app.",
        "Two transports always on, hub and direct LAN; duplicates are dropped by message id.",
        "On the LAN each pair opens a single connection (the lower id dials) and authenticates with HMAC-SHA256 over the shared token.",
        "Files travel in ordered 48 KiB chunks, with a 1 MiB cap per frame.",
        "The interface runs on its own design system: Canone tokens and Goccia glass controls, with AGSL shaders for refraction.",
      ],
    },
    limits: {
      it: [
        "Il traffico in rete locale non è cifrato; quello verso il server passa da HTTPS.",
        "Il token su Android è salvato in chiaro nelle preferenze.",
        "Le eliminazioni non si propagano agli altri dispositivi.",
        "Spostare l'audio su Android richiede il root; il ritardo è di circa 100 ms.",
      ],
      en: [
        "Local network traffic is not encrypted; traffic to the server goes over HTTPS.",
        "The token on Android is stored in plain text in preferences.",
        "Deletions do not propagate to other devices.",
        "Routing audio on Android requires root; latency is about 100 ms.",
      ],
    },
    figures: [
      { value: "45+ h", label: { it: "di progettazione e sviluppo", en: "of design and development" } },
      { value: "5", label: { it: "sistemi: Windows, macOS, Linux, iOS e Android", en: "systems: Windows, macOS, Linux, iOS and Android" } },
      { value: "Beta", label: { it: "privata, distribuzione in arrivo", en: "private, release coming soon" } },
    ],
  },
  {
    slug: "creacloud",
    headline: { it: "Un mese di lezioni organizzato in automatico e gestito su WhatsApp", en: "A month of lessons scheduled automatically and run over WhatsApp" },
    context: { it: "CreaCloud, per un centro didattico", en: "CreaCloud, for a tutoring centre" },
    tags: { it: ["Piattaforma web", "AI", "Ottimizzazione"], en: ["Web platform", "AI", "Optimisation"] },
    name: "CreaCloud",
    year: "2026",
    platforms: { it: "Web, WhatsApp", en: "Web, WhatsApp" },
    role: { it: "Progetto per un cliente", en: "Client project" },
    stack: ["Next.js 16", "Supabase", "Python", "FastAPI", "OR-Tools CP-SAT", "Gemini", "shadcn/ui", "Dokploy"],
    repo: "https://github.com/00Fil/CreaCloud",
    line: {
      it: "Coordinamento lezioni per un centro didattico: WhatsApp, assistente AI e pianificazione automatica.",
      en: "Lesson scheduling for a tutoring centre: WhatsApp, an AI assistant and an automatic planner.",
    },
    summary: {
      it: "Famiglie e tutor scrivono su WhatsApp. Un assistente basato su Gemini registra impegni, richieste e annullamenti; un motore OR-Tools CP-SAT colloca le lezioni del mese su quattro livelli di vincoli. Il coordinatore approva le azioni critiche da una dashboard Next.js.",
      en: "Families and tutors write on WhatsApp. A Gemini-based assistant records commitments, requests and cancellations; an OR-Tools CP-SAT engine schedules the month's lessons across four constraint priorities. The coordinator approves critical actions from a Next.js dashboard.",
    },
    problem: {
      it: "Il calendario di un centro con decine di famiglie e tutor si costruiva a mano, messaggio per messaggio. Ogni cambio di orario costringeva a rifare incastri e conti.",
      en: "The schedule of a centre with dozens of families and tutors was built by hand, one message at a time. Every change of time meant redoing the slots and the accounts.",
    },
    built: {
      it: [
        "Assistente su WhatsApp che gestisce impegni, disponibilità, nuove lezioni, cambi e annullamenti.",
        "Motore di pianificazione mensile per lezioni da 1 h, 1 h 30 o 2 h.",
        "Dashboard con ricerca globale (Ctrl/⌘ K), pannelli laterali e tabelle; su telefono i pannelli salgono dal basso.",
        "Conti in contanti per famiglia e per tutor, con annullamento gratuito fino a 24 ore prima (configurabile).",
      ],
      en: [
        "A WhatsApp assistant that handles commitments, availability, new lessons, changes and cancellations.",
        "A monthly planning engine for lessons of 1 h, 1 h 30 or 2 h.",
        "A dashboard with global search (Ctrl/⌘ K), side panels and tables; on phones the panels slide up from the bottom.",
        "Cash accounts per family and per tutor, with free cancellation up to 24 hours before (configurable).",
      ],
    },
    decisions: {
      it: [
        "Date e messaggi di conferma calcolati dal codice, non dal modello.",
        "Le azioni critiche aspettano l'approvazione del coordinatore; ogni chat si può prendere in mano manualmente.",
        "Vincoli su quattro priorità: P1 non si viola mai, P4 si sacrifica per primo. Il motore spiega in italiano le lezioni non collocate.",
        "Tetto mensile di spesa AI: oltre la soglia l'assistente prepara solo bozze.",
        "Dati in Unione Europea, deploy su Dokploy.",
      ],
      en: [
        "Dates and confirmation messages are computed by code, not by the model.",
        "Critical actions wait for the coordinator's approval; any chat can be taken over by hand.",
        "Constraints on four priorities: P1 is never broken, P4 is dropped first. The engine explains unplaced lessons in plain Italian.",
        "A monthly AI spending cap: above it, the assistant only prepares drafts.",
        "Data stays in the EU, deployed on Dokploy.",
      ],
    },
    limits: {
      it: [
        "Il canale WhatsApp usa una libreria non ufficiale: non esclude il blocco dell'account.",
      ],
      en: [
        "The WhatsApp channel uses an unofficial library, which does not rule out the account being blocked.",
      ],
    },
    figures: [
      { value: "150+", label: { it: "famiglie la usano ogni giorno", en: "families use it every day" } },
      { value: "1 mese", label: { it: "di lezioni pianificato in automatico", en: "of lessons scheduled automatically" } },
      { value: "0", label: { it: "app da installare: si usa da WhatsApp", en: "apps to install: it runs on WhatsApp" } },
    ],
  },
  {
    slug: "unispace",
    headline: { it: "Lezioni registrate fino a 3× più veloci, con le formule in LaTeX", en: "Recorded lectures up to 3\u00d7 faster, with formulas in LaTeX" },
    context: { it: "uniSpace, strumenti per lo studio", en: "uniSpace, tools for studying" },
    tags: { it: ["Piattaforma web", "Trascrizione", "Self-hosting"], en: ["Web platform", "Transcription", "Self-hosting"] },
    name: "uniSpace",
    year: "2026",
    platforms: { it: "Web", en: "Web" },
    role: { it: "Progetto personale", en: "Personal project" },
    stack: ["Caddy", "Docker Compose", "SQLite", "yt-dlp", "faster-whisper", "KaTeX", "Dokploy"],
    repo: "https://github.com/00Fil/uniSpace",
    line: {
      it: "Una piattaforma di strumenti per lo studio. StudyCut accorcia le lezioni registrate e le trascrive con le formule.",
      en: "A toolkit for studying. StudyCut shortens recorded lectures and transcribes them, formulas included.",
    },
    summary: {
      it: "Un gateway Caddy espone una sola home e protegge i tool dietro un account. Ogni tool si aggiunge con una cartella e un file tool.json, senza toccare la home. StudyCut toglie i silenzi, riproduce fino a 3× e trascrive con Whisper, convertendo le formule dettate in LaTeX.",
      en: "A Caddy gateway serves one home page and keeps the tools behind an account. Each tool is added with a folder and a tool.json file, without touching the home page. StudyCut removes silences, plays at up to 3× and transcribes with Whisper, turning spoken formulas into LaTeX.",
    },
    problem: {
      it: "Le lezioni registrate durano ore, tra pause e silenzi, e le formule dette a voce si perdono negli appunti.",
      en: "Recorded lectures run for hours, full of pauses and silences, and formulas spoken aloud get lost in the notes.",
    },
    built: {
      it: [
        "Home unica con tutti i tool dietro un solo accesso.",
        "Account con SQLite e password scrypt, blocco dopo 10 tentativi falliti in 15 minuti, quota di 2 GB per utente.",
        "StudyCut: download con yt-dlp, rimozione dei silenzi, riproduzione fino a 3×.",
        "Trascrizione con faster-whisper large-v3 e formule in LaTeX verificate con KaTeX.",
      ],
      en: [
        "A single home page for every tool, behind one sign-in.",
        "Accounts on SQLite with scrypt passwords, a lock after 10 failed attempts in 15 minutes, a 2 GB quota per user.",
        "StudyCut: download with yt-dlp, silence removal, playback at up to 3×.",
        "Transcription with faster-whisper large-v3 and formulas in LaTeX checked by KaTeX.",
      ],
    },
    decisions: {
      it: [
        "Registro dei tool generato in fase di build: il gateway crea l'elenco della home e una rotta per ogni tool.",
        "Solo il gateway ha un dominio; l'autenticazione passa da forward_auth e gli header utente inviati dal browser vengono ripuliti.",
        "La trascrizione incrocia l'audio con l'OCR dei fotogrammi chiave delle slide e ricontrolla le parole incerte.",
      ],
      en: [
        "The tool registry is generated at build time: the gateway writes the home page list and one route per tool.",
        "Only the gateway has a domain; authentication goes through forward_auth and user headers sent by the browser are stripped.",
        "Transcription cross-checks the audio against OCR of the slides' key frames and re-checks uncertain words.",
      ],
    },
    limits: {
      it: [],
      en: [],
    },
    figures: [
      { value: "3×", label: { it: "più veloce riascoltare una lezione, senza i silenzi", en: "faster to replay a lecture, without the silences" } },
      { value: "LaTeX", label: { it: "formule trascritte come sul libro", en: "formulas transcribed as in the textbook" } },
      { value: "1", label: { it: "accesso per tutti gli strumenti", en: "sign-in for every tool" } },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
