import type { Locale } from "@/i18n/routing";
import { INTENTS, PROJECT_KW, SERVICE_KW, type Widget } from "@/content/assistant";
import { SERVICES, type ServiceKey } from "@/content/services";
import { getProject } from "@/content/projects";
import { PRESET } from "@/components/sections/Brief";

export type ChatText = {
  name: string;
  role: string;
  status: string;
  hello: string;
  starts: string[];
  placeholder: string;
  send: string;
  close: string;
  open: string;
  now: string;
  notifTitle: string;
  notifBody: string;
  fallback: string;
  book: string;
  nextFree: string;
  area: string;
  cv: string;
  service: string;
  project: string;
  hName: string;
  hEmail: string;
  hSend: string;
  hDone: string;
  hErr: string;
};
export type Msg = { id: number; from: "me" | "bot"; text: string; w?: Widget[] };

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9€]+/)
    .filter(Boolean);
const hits = (tokens: string[], kw: string[]) => kw.reduce((n, k) => n + (tokens.some((t) => (k.length <= 3 ? t === k : t.startsWith(k))) ? 1 : 0), 0);

/** La risposta: vince ciò che ha più parole in comune con la domanda (progetto, servizio o argomento). */
export function answer(q: string, locale: Locale, t: ChatText): Omit<Msg, "id" | "from"> {
  const tokens = norm(q);
  const intent = INTENTS.map((x) => ({ x, n: hits(tokens, x.kw) })).sort((a, b) => b.n - a.n)[0];
  const svc = (Object.keys(SERVICE_KW) as ServiceKey[]).map((k) => ({ k, n: hits(tokens, SERVICE_KW[k]) })).sort((a, b) => b.n - a.n)[0];
  const prj = Object.keys(PROJECT_KW).map((k) => ({ k, n: hits(tokens, PROJECT_KW[k]) })).sort((a, b) => b.n - a.n)[0];

  if (prj.n > 0 && prj.n > svc.n && prj.n >= intent.n) {
    return { text: t.project.replace("{name}", getProject(prj.k)?.name ?? prj.k), w: [{ kind: "project", slug: prj.k }] };
  }
  // chi chiede un consiglio o supporto va da Filippo anche se nomina un servizio: il servizio resta come scheda
  const human = intent.n > 0 && ["agent", "support", "start"].includes(intent.x.id);
  if (human && intent.n >= svc.n) {
    const extra: Widget[] = svc.n > 0 ? [{ kind: "service", key: svc.k }] : [];
    return { text: intent.x.a[locale], w: [...extra, ...(intent.x.w ?? [])] };
  }
  if (svc.n > 0 && svc.n >= intent.n) {
    const s = SERVICES.find((x) => x.key === svc.k)!;
    return { text: `${t.service.replace("{name}", s.title[locale].toLowerCase())} ${s.lead[locale]}`, w: [{ kind: "service", key: svc.k }, { kind: "book", path: PRESET[svc.k] ? svc.k : undefined }] };
  }
  if (intent.n > 0) return { text: intent.x.a[locale], w: intent.x.w };
  return { text: t.fallback, w: [{ kind: "handoff" }, { kind: "book" }] };
}
