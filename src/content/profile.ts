/**
 * Dati personali. Tutto ciò che va completato prima della pubblicazione sta qui.
 * Un campo vuoto ("") nasconde l'elemento corrispondente.
 */
export const profile = {
  /** Nome come appare nell'hero e nel titolo. */
  name: "Filippo Corsini",
  /** Foto in /public (es. "/me.jpg"). Vuota: al suo posto la visuale di Relay. */
  photo: "",
  city: "Brescia",
  email: "",
  github: "https://github.com/00Fil",
  linkedin: "",
  instagram: "",
  /** Numero WhatsApp in formato internazionale senza spazi né +, es. "393331234567". */
  whatsapp: "",
  /** Percorsi dei CV in /public, per lingua. */
  cv: { it: "/cv/filippo-corsini-cv-it.pdf", en: "/cv/filippo-corsini-cv-en.pdf" },
  site: "https://example.com",
  /** Area clienti inclusa in ogni progetto: link agli store e alla versione web. Vuoti: i tasti puntano a "#". */
  clientArea: { ios: "", android: "", web: "" },
  /**
   * Chiamate conoscitive da 30 minuti: giorni (1 = lunedì), fasce orarie in ora italiana,
   * preavviso minimo e quanti giorni avanti si può prenotare.
   */
  booking: {
    tz: "Europe/Rome",
    minutes: 30,
    days: [1, 2, 3, 4, 5],
    windows: [
      ["09:30", "12:30"],
      ["14:30", "18:30"],
    ] as [string, string][],
    noticeHours: 20,
    horizonDays: 14,
  },
};
