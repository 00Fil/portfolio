import type { BRAND } from "./brand-icons";

type Work = { title: string; what: string; when: string; points: string[]; stack?: (keyof typeof BRAND)[] };
type Cv = {
  kicker: string;
  role: string;
  where: string;
  profile: string;
  workTitle: string;
  work: Work[];
  eduTitle: string;
  edu: { when: string; title: string; body: string }[];
  skillsTitle: string;
  skills: { title: string; items: string[] }[];
  howTitle: string;
  how: string[];
  footer: string;
};

const SKILLS_IT = [
  { title: "Linguaggi", items: ["TypeScript", "JavaScript", "Python", "Kotlin", "C#", "Java", "C", "SQL", "Bash"] },
  { title: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML · CSS", "GSAP", "Accessibilità", "SEO tecnica"] },
  { title: "Backend e API", items: ["Node.js", "FastAPI", "REST", "WebSocket", "Autenticazione · JWT"] },
  { title: "App multipiattaforma", items: ["Android · Jetpack Compose", "iOS · macOS · Swift", "Windows · .NET", "Linux", "Flutter · Tauri"] },
  { title: "Dati", items: ["PostgreSQL", "Supabase", "SQLite", "MySQL", "Redis"] },
  { title: "DevOps e cloud", items: ["Docker", "Linux", "Git", "GitHub Actions · CI/CD", "Caddy · Nginx", "VPS · Dokploy"] },
  { title: "Qualità", items: ["Test unitari ed end-to-end", "Playwright", "Code review", "Design pattern"] },
  { title: "Fondamenti", items: ["Algoritmi e strutture dati", "OOP", "Reti", "Sistemi operativi", "Basi di dati"] },
  { title: "AI", items: ["Gemini · LLM", "Whisper", "OR-Tools CP-SAT"] },
];
const SKILLS_EN_T = ["Languages", "Frontend", "Backend and APIs", "Cross-platform apps", "Data", "DevOps and cloud", "Quality", "Foundations", "AI"];
const EN_ITEMS: Record<string, string> = {
  "Accessibilità": "Accessibility",
  "SEO tecnica": "Technical SEO",
  "Autenticazione · JWT": "Authentication · JWT",
  "Test unitari ed end-to-end": "Unit and end-to-end testing",
  "Algoritmi e strutture dati": "Algorithms and data structures",
  "Reti": "Networking",
  "Sistemi operativi": "Operating systems",
  "Basi di dati": "Databases",
};
const SKILLS_EN = SKILLS_IT.map((g, i) => ({ title: SKILLS_EN_T[i], items: g.items.map((x) => EN_ITEMS[x] ?? x) }));

export const CV: Record<"it" | "en", Cv> = {
  it: {
    kicker: "Curriculum · 2026",
    role: "Software developer freelance · Studente di Ingegneria Informatica",
    where: "Brescia, Italia",
    profile:
      "Progetto e sviluppo software completo, dall’interfaccia al server: app per Android, iOS, macOS, Windows e Linux, piattaforme web e strumenti su misura. Seguo ogni progetto dall’analisi alla messa online, con cura per il design, il codice e chi lo userà ogni giorno.",
    workTitle: "Esperienza e progetti",
    work: [
      {
        title: "CreaCloud",
        what: "Sviluppatore freelance · Piattaforma per un centro didattico",
        when: "2026",
        points: [
          "Progettato e sviluppato il gestionale del centro: famiglie e tutor scrivono su WhatsApp, un assistente basato su Gemini registra richieste, cambi e disdette.",
          "Motore di pianificazione con OR-Tools CP-SAT che colloca le lezioni del mese su quattro livelli di vincoli.",
          "Dashboard Next.js per il coordinatore, con ricerca globale e approvazione delle azioni critiche.",
        ],
        stack: ["nextjs", "supabase", "python", "fastapi", "gemini", "docker"],
      },
      {
        title: "Relay",
        what: "Progetto personale · App Android, app Windows e server",
        when: "2026",
        points: [
          "Due app native e un server che condividono lo stesso protocollo: appunti, screenshot e file passano tra telefono e computer in un istante.",
          "Doppio trasporto (rete locale e server) con eliminazione dei doppioni; riserve offline via Bluetooth, Wi-Fi Direct e rete privata Headscale.",
          "Design system proprio (Canone) con controlli in vetro e fisica a molla; build e release automatiche con GitHub Actions.",
        ],
        stack: ["kotlin", "compose", "dotnet", "node", "githubactions"],
      },
      {
        title: "uniSpace · StudyCut",
        what: "Progetto personale · Strumenti per lo studio",
        when: "2026",
        points: [
          "Piattaforma con account e tool modulari dietro un unico accesso, pubblicata con Docker e Caddy.",
          "StudyCut toglie i silenzi dalle lezioni registrate, le riproduce fino a 3× e le trascrive con Whisper, formule in LaTeX comprese.",
        ],
        stack: ["python", "docker", "caddy", "sqlite"],
      },
    ],
    eduTitle: "Formazione",
    edu: [
      { when: "2026 — oggi", title: "Ingegneria Informatica", body: "Università degli Studi di Brescia, laurea triennale." },
      { when: "2021 — 2026", title: "Diploma di Perito Informatico", body: "Istituto tecnico, indirizzo Informatica e Telecomunicazioni." },
    ],
    skillsTitle: "Competenze",
    skills: SKILLS_IT,
    howTitle: "Servizi",
    how: ["Siti web e SEO", "Web app full stack", "App multipiattaforma", "API e integrazioni", "AI e sistemi integrati", "Soluzioni hardware e IoT"],
    footer: "Filippo Corsini · Portfolio e progetti su github.com/00Fil",
  },
  en: {
    kicker: "Résumé · 2026",
    role: "Freelance software developer · Computer Engineering student",
    where: "Brescia, Italy",
    profile:
      "I design and build complete software, from interface to server: apps for Android, iOS, macOS, Windows and Linux, web platforms and custom tools. I follow every project from analysis to launch, with care for design, code and the people who use it every day.",
    workTitle: "Experience and projects",
    work: [
      {
        title: "CreaCloud",
        what: "Freelance developer · Platform for a tutoring centre",
        when: "2026",
        points: [
          "Designed and built the centre’s management software: families and tutors write on WhatsApp, a Gemini-based assistant records requests, changes and cancellations.",
          "Scheduling engine with OR-Tools CP-SAT that places the month’s lessons across four levels of constraints.",
          "Next.js dashboard for the coordinator, with global search and approval of critical actions.",
        ],
        stack: ["nextjs", "supabase", "python", "fastapi", "gemini", "docker"],
      },
      {
        title: "Relay",
        what: "Personal project · Android app, Windows app and server",
        when: "2026",
        points: [
          "Two native apps and a server sharing one protocol: clipboard, screenshots and files move between phone and computer instantly.",
          "Dual transport (local network and server) with de-duplication; offline fallbacks via Bluetooth, Wi-Fi Direct and a private Headscale network.",
          "Own design system (Canone) with glass controls and spring physics; automated builds and releases with GitHub Actions.",
        ],
        stack: ["kotlin", "compose", "dotnet", "node", "githubactions"],
      },
      {
        title: "uniSpace · StudyCut",
        what: "Personal project · Study tools",
        when: "2026",
        points: [
          "Platform with accounts and modular tools behind a single sign-in, deployed with Docker and Caddy.",
          "StudyCut removes silences from recorded lectures, plays them up to 3× and transcribes them with Whisper, LaTeX formulas included.",
        ],
        stack: ["python", "docker", "caddy", "sqlite"],
      },
    ],
    eduTitle: "Education",
    edu: [
      { when: "2026 — today", title: "Computer Engineering", body: "University of Brescia, bachelor’s degree." },
      { when: "2021 — 2026", title: "IT Technician Diploma", body: "Technical high school, Computer Science and Telecommunications." },
    ],
    skillsTitle: "Skills",
    skills: SKILLS_EN,
    howTitle: "Services",
    how: ["Websites and SEO", "Full-stack web apps", "Cross-platform apps", "APIs and integrations", "AI and integrated systems", "Hardware and IoT solutions"],
    footer: "Filippo Corsini · Portfolio and projects at github.com/00Fil",
  },
};
