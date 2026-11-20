import type { Locale } from "@/i18n/routing";

/** Il film del servizio SEO: un'attività che da pagina due arriva prima, perché il sito diventa veloce. */
export type SeoFilm = {
  cap: string[];
  end: string;
  me: string;
  others: string[];
  vitals: [string, string, string][]; // etichetta, valore lento, valore veloce
  rank: string;
  ctl: { play: string; pause: string; replay: string };
};

const IT: SeoFilm = {
  cap: ["Sei a *pagina due*.", "Un sito *lento* perde posti.", "Lo rendiamo *veloce*.", "E Google ti mette *primo*."],
  end: "Sei *primo*.",
  me: "La tua attività",
  others: ["Rossi Impianti", "Bianchi e Figli", "Termoservice", "Casa Calda", "Idro Pronto", "Studio Termico", "Verde Energia"],
  vitals: [
    ["Caricamento", "4,8 s", "1,2 s"],
    ["Reazione", "480 ms", "90 ms"],
    ["Stabilità", "0,31", "0,02"],
  ],
  rank: "Posizione",
  ctl: { play: "Riproduci", pause: "Pausa", replay: "Rivedi" },
};

const EN: SeoFilm = {
  cap: ["You're on *page two*.", "A *slow* site loses places.", "We make it *fast*.", "And Google puts you *first*."],
  end: "You're *first*.",
  me: "Your business",
  others: ["Rossi Heating", "Bianchi & Sons", "Termoservice", "Warm Home", "Quick Plumb", "Thermal Studio", "Green Energy"],
  vitals: [
    ["Loading", "4.8 s", "1.2 s"],
    ["Response", "480 ms", "90 ms"],
    ["Stability", "0.31", "0.02"],
  ],
  rank: "Position",
  ctl: { play: "Play", pause: "Pause", replay: "Replay" },
};

export const getSeoFilm = (l: Locale) => (l === "en" ? EN : IT);
