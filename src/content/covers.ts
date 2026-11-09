import type { Locale } from "@/i18n/routing";
import type { BRAND } from "./brand-icons";

type L = Record<Locale, string>;

/** Una tappa del giro sulla schermata vera: punto da inquadrare (0–1), ingrandimento, didascalia. */
export type Stop = { x: number; y: number; s: number; title: L; body: L };

export type Cover = {
  slug: string;
  /** Colori del progetto: la pagina prende questi, la copertina li usa per lo sfondo. */
  theme: { bg: string; fg: string; fg2: string; acc: string; acc2: string; surface: string; light: boolean };
  label: L;
  def: L;
  stack: (keyof typeof BRAND)[];
  tour?: { src: string; w: number; h: number; video?: string; stops: Stop[] };
};

export const COVERS: Cover[] = [
  {
    slug: "creacloud",
    theme: { bg: "#F4F1EC", fg: "#292524", fg2: "#6f6a62", acc: "#5F6BA3", acc2: "#D98A6C", surface: "#ffffff", light: true },
    label: { it: "Piattaforma web · Per un cliente · 2026", en: "Web platform · Client work · 2026" },
    def: {
      it: "Il gestionale di un centro didattico. Le famiglie scrivono su WhatsApp come sempre, il calendario delle lezioni si organizza da solo.",
      en: "Management software for a tutoring centre. Families write on WhatsApp as always, and the lesson schedule organises itself.",
    },
    stack: ["nextjs", "supabase", "python", "fastapi", "gemini", "docker"],
    tour: {
      src: "/work/creacloud/richiesta.webp",
      w: 1100,
      h: 1550,
      stops: [
        {
          x: 0.5,
          y: 0.2,
          s: 1.6,
          title: { it: "Una richiesta, in parole semplici", en: "A request, in plain words" },
          body: { it: "Materia e obiettivo: niente codici, niente moduli da ufficio.", en: "Subject and goal: no codes, no office forms." },
        },
        {
          x: 0.5,
          y: 0.33,
          s: 2,
          title: { it: "Frequenza e durata con un tocco", en: "Frequency and length in one tap" },
          body: { it: "Le scelte sono pulsanti grandi, pensati anche per il telefono.", en: "Choices are large buttons, made for the phone too." },
        },
        {
          x: 0.5,
          y: 0.62,
          s: 1.8,
          title: { it: "Regole chiare per il calendario", en: "Clear rules for the schedule" },
          body: { it: "Si decide subito se la durata può cambiare per trovare un incastro.", en: "You decide up front whether the length may change to find a slot." },
        },
        {
          x: 0.5,
          y: 0.73,
          s: 2,
          title: { it: "Riepilogo prima di salvare", en: "A summary before saving" },
          body: { it: "Il calendario cambia solo dopo il calcolo e una conferma.", en: "The schedule changes only after the calculation and a confirmation." },
        },
      ],
    },
  },
  {
    slug: "relay",
    theme: { bg: "#05070F", fg: "#F2F2F0", fg2: "#9a9caa", acc: "#4D7CFF", acc2: "#5C9DFF", surface: "#10131d", light: false },
    label: { it: "App Android e Windows · Progetto personale · 2026", en: "Android and Windows apps · Personal project · 2026" },
    def: {
      it: "Due app che passano appunti, screenshot e file dal computer al telefono in un istante. Le cuffie seguono il dispositivo che stai usando.",
      en: "Two apps that move clipboard, screenshots and files between computer and phone in an instant. Headphones follow the device you are using.",
    },
    stack: ["kotlin", "compose", "dotnet", "node", "githubactions"],
  },
  {
    slug: "unispace",
    theme: { bg: "#0C0D0F", fg: "#F3EEE6", fg2: "#A9A49B", acc: "#3F9C97", acc2: "#EE8A6C", surface: "#121316", light: false },
    label: { it: "Piattaforma web · Progetto personale · 2026", en: "Web platform · Personal project · 2026" },
    def: {
      it: "Strumenti per chi studia. Le lezioni registrate perdono i silenzi, scorrono più veloci e arrivano già trascritte, formule comprese.",
      en: "Tools for students. Recorded lectures lose their silences, play faster and arrive already transcribed, formulas included.",
    },
    stack: ["python", "docker", "caddy", "sqlite"],
    tour: {
      src: "/work/unispace/studycut.webp",
      w: 2400,
      h: 1500,
      video: "/work/unispace/studycut.mp4",
      stops: [
        {
          x: 0.12,
          y: 0.2,
          s: 2.2,
          title: { it: "La libreria delle lezioni", en: "The lecture library" },
          body: { it: "Accanto a ogni lezione: quanto dura e quanto dura senza silenzi.", en: "Next to each lecture: its length, and its length without silences." },
        },
        {
          x: 0.47,
          y: 0.6,
          s: 2.1,
          title: { it: "I silenzi saltati da soli", en: "Silences skipped on their own" },
          body: { it: "La barra mostra le parti tolte. Il video parte subito, già accorciato.", en: "The bar shows the parts removed. The video starts at once, already shortened." },
        },
        {
          x: 0.87,
          y: 0.45,
          s: 1.9,
          title: { it: "La trascrizione segue la voce", en: "The transcript follows the voice" },
          body: { it: "Parola per parola, con le formule scritte come sulla lavagna.", en: "Word by word, with formulas written as on the board." },
        },
      ],
    },
  },
];

export const getCover = (slug: string) => COVERS.find((c) => c.slug === slug)!;
