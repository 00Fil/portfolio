import type { Cinema } from "./cinema";

/** Le domande di rito prima del video: le risposte entrano nelle scritte del film (nome, settore, sito, obiettivo, come ti trovano). */
export type Answers = { name: string; sector: string; site: string; goal: string; found: string };
type Opt = { id: string; t: string };
type Step = { id: keyof Answers; audio: string; q: string; opts?: Opt[]; ph?: string };
type Copy = { start: string; mute: string; skip: string; next: string; steps: Step[]; head: string; sub: string; busy: string };

const IT: Copy = {
  head: "Il video, *su di te*",
  sub: "Cinque domande, poi parte",
  start: "Inizia",
  mute: "Senza audio",
  skip: "Salta",
  next: "Avanti",
  busy: "Preparo il tuo video",
  steps: [
    { id: "name", audio: "name", q: "Come si chiama la *tua attività*?", ph: "Nome dell’attività" },
    { id: "sector", audio: "sector", q: "Di cosa *ti occupi*?", opts: [{ id: "food", t: "Ristorazione" }, { id: "pro", t: "Studio professionale" }, { id: "shop", t: "Negozio" }, { id: "craft", t: "Artigiano o servizi" }, { id: "care", t: "Salute e benessere" }, { id: "home", t: "Casa e immobili" }, { id: "event", t: "Eventi e turismo" }, { id: "school", t: "Formazione" }, { id: "other", t: "Altro" }] },
    { id: "site", audio: "site", q: "Hai già *un sito*?", opts: [{ id: "none", t: "No, non ce l’ho" }, { id: "old", t: "Sì, ma è vecchio" }, { id: "ok", t: "Sì, funziona bene" }] },
    { id: "goal", audio: "goal", q: "Cosa ti *serve* dal sito?", opts: [{ id: "leads", t: "Più clienti" }, { id: "book", t: "Prenotazioni" }, { id: "show", t: "Una vetrina" }, { id: "sell", t: "Vendere online" }] },
    { id: "found", audio: "found", q: "Come ti trovano *oggi*?", opts: [{ id: "word", t: "Passaparola" }, { id: "google", t: "Google" }, { id: "social", t: "Social" }, { id: "none", t: "Non mi trovano" }] },
  ],
};
const EN: Copy = {
  head: "The film, *about you*",
  sub: "Five questions, then it starts",
  start: "Start",
  mute: "Without sound",
  skip: "Skip",
  next: "Next",
  busy: "Preparing your film",
  steps: [
    { id: "name", audio: "", q: "What’s your *business* called?", ph: "Business name" },
    { id: "sector", audio: "", q: "What do *you do*?", opts: [{ id: "food", t: "Food & drink" }, { id: "pro", t: "Professional firm" }, { id: "shop", t: "Shop" }, { id: "craft", t: "Trades & services" }, { id: "care", t: "Health & wellness" }, { id: "home", t: "Home & property" }, { id: "event", t: "Events & travel" }, { id: "school", t: "Training" }, { id: "other", t: "Other" }] },
    { id: "site", audio: "", q: "Do you have *a site*?", opts: [{ id: "none", t: "No, I don’t" }, { id: "old", t: "Yes, but it’s old" }, { id: "ok", t: "Yes, it works well" }] },
    { id: "goal", audio: "", q: "What do you *need* from it?", opts: [{ id: "leads", t: "More customers" }, { id: "book", t: "Bookings" }, { id: "show", t: "A showcase" }, { id: "sell", t: "Sell online" }] },
    { id: "found", audio: "", q: "How do people find you *today*?", opts: [{ id: "word", t: "Word of mouth" }, { id: "google", t: "Google" }, { id: "social", t: "Social media" }, { id: "none", t: "They don’t" }] },
  ],
};
export const getIntake = (en: boolean) => (en ? EN : IT);

const clean = (s: string) => s.replace(/[*^!<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 28);
const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "latuaattivita";

const SECTOR_Q: Record<string, [string, string]> = {
  food: ["ristorante qui vicino", "un buon ristorante"],
  pro: ["studio professionale qui vicino", "uno studio professionale"],
  shop: ["negozio qui vicino", "un negozio"],
  craft: ["artigiano qui vicino", "un artigiano"],
  care: ["centro benessere qui vicino", "un centro benessere"],
  home: ["agenzia immobiliare qui vicino", "un’agenzia immobiliare"],
  event: ["organizzazione eventi qui vicino", "chi organizza eventi"],
  school: ["corsi di formazione qui vicino", "un corso di formazione"],
};
const SECTOR_QE: Record<string, [string, string]> = {
  food: ["restaurant near me", "a good restaurant"],
  pro: ["professional services near me", "a professional firm"],
  shop: ["shop near me", "a shop"],
  craft: ["tradesperson near me", "a tradesperson"],
  care: ["wellness centre near me", "a wellness centre"],
  home: ["estate agent near me", "an estate agent"],
  event: ["event organiser near me", "an event organiser"],
  school: ["training courses near me", "a training course"],
};
const GOAL: Record<string, [string, string][]> = {
  leads: [["Nuova richiesta", "Giulia R. · preventivo"]],
  book: [["Nuova prenotazione", "Elena T. · giovedì alle 14:30"]],
  show: [["Nuovo messaggio", "Marco B. · informazioni"]],
  sell: [["Nuovo ordine", "Elena T. · 2 articoli"]],
};
const GOAL_E: Record<string, [string, string][]> = {
  leads: [["New request", "Julia R. · quote"]],
  book: [["New booking", "Ellen T. · Thursday 2:30 pm"]],
  show: [["New message", "Mark B. · information"]],
  sell: [["New order", "Ellen T. · 2 items"]],
};
const FOUND: Record<string, string> = {
  word: "Ti consigliano, poi cercano il tuo sito. Se è lento o confuso, ne scelgono un altro.",
  google: "Ti trova su Google, ma se il sito è lento o confuso ne sceglie un altro.",
  social: "Ti conosce dai social, poi cerca il sito. Se non convince, ne sceglie un altro.",
  none: "Se non ti trova, ne sceglie un altro.",
};
const FOUND_E: Record<string, string> = {
  word: "Someone recommends you, then looks for your site. If it’s slow or confusing, they pick another.",
  google: "They find you on Google, but if the site is slow or confusing they pick another.",
  social: "They know you from social media, then look for the site. If it doesn’t convince, they pick another.",
  none: "If they can’t find you, they pick another.",
};

/** Le scritte del film con i dati di chi ha risposto. Voce e montaggio restano gli stessi: cambiano solo i testi. */
export function personalize(c: Cinema, a: Answers | null, en: boolean): Cinema {
  if (!a) return c;
  const name = clean(a.name);
  const out: Cinema = { ...c };
  if (name) {
    out.find = { ...c.find, me: [name, `${slug(name)}.${en ? "com" : "it"}`] };
    out.far = { ...c.far, mine: en ? `${name} · Official site` : `${name} · Sito ufficiale` };
    out.geo = { ...c.geo, a: en ? `I’d recommend ${name}: they reply right away and have great reviews.` : `Ti consiglio ${name}: risponde subito e ha ottime recensioni.` };
    if (a.site !== "none") out.old = { ...c.old, brand: name };
  }
  const sq = (en ? SECTOR_QE : SECTOR_Q)[a.sector];
  if (sq) {
    out.find = { ...out.find, typed: sq[0] };
    out.geo = { ...out.geo, q: en ? `Can you recommend ${sq[1]} near me?` : `Mi consigli ${sq[1]} qui vicino?` };
  }
  const fo = (en ? FOUND_E : FOUND)[a.found];
  if (fo) out.find = { ...out.find, a: fo };
  const g = (en ? GOAL_E : GOAL)[a.goal];
  if (g) out.clients = { ...c.clients, items: [...g, ...c.clients.items.filter((it) => it[0] !== g[0][0])].slice(0, 3) as [string, string][] };
  if (a.site === "none") {
    out.cap = c.cap.map((t, i) => (i === 1 ? (en ? "They look for you, but *can’t find you*." : "Ti cerca, ma *non ti trova*.") : i === 2 ? (en ? "With your site, *fast*. They find you." : "Con il tuo sito, *veloce*. Ti trova.") : t));
    out.find = { ...out.find, loading: en ? "No results" : "Nessun risultato", a: en ? "Without a site, they can’t find you: they pick another." : "Senza un sito non ti trova: ne sceglie un altro." };
    out.seo = { ...c.seo, cap: en ? "With your site, you’re *among the first*." : "Con il tuo sito, *tra i primi risultati*." };
  }
  return out;
}
