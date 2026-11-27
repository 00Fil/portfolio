/** Tipi e valori dei documenti tecnici: condivisi tra server e pannello (nessun accesso al disco qui). */
export const KINDS = ["security", "bug", "fix", "feature", "change", "perf"] as const;
export const TESTS = ["collaudato", "parziale", "da collaudare", "n/a"] as const;
export const STATES = ["", "aperto", "risolto", "rinviato"] as const;
export const SEVERITIES = ["", "critica", "alta", "media", "bassa"] as const;
export type Entry = {
  id: string;
  kind: (typeof KINDS)[number];
  title: string;
  detail: string;
  area: string;
  commit: string;
  severity: (typeof SEVERITIES)[number];
  state: (typeof STATES)[number];
  test: (typeof TESTS)[number];
  evidence: string;
};
export type Report = {
  id: string;
  slug: string;
  title: string;
  project: string;
  version: string;
  status: "bozza" | "rilasciato";
  date: string;
  env: string;
  summary: string;
  entries: Entry[];
  created: string;
  updated: string;
};

export const KIND_LABEL: Record<(typeof KINDS)[number], string> = {
  security: "Sicurezza",
  bug: "Bug",
  fix: "Correzione",
  feature: "Funzione",
  change: "Modifica",
  perf: "Prestazioni",
};
