"use client";

import type { ReactNode } from "react";
import { ArrowRight, Eye, Code2, Smartphone, Globe, Star, MapPin, Phone, CalendarDays, FileText, ShieldCheck, Lock, RefreshCw, HardDrive, KeyRound, Search, Check, History, MessageCircle, Activity } from "lucide-react";
import { Bead } from "@/components/glass/Bead";

/* Un diagramma per ogni capitolo della pagina: mostra il concetto, non lo elenca. Testi in italiano e inglese. */

const blue = "linear-gradient(180deg,#3b8cff,#1f6ae8)";
const surface = "bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_var(--hair-strong),0_14px_32px_-18px_rgba(0,0,0,.28)]";
const tag = "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3";
const L = (it: boolean, a: string, b: string) => (it ? a : b);
const Arrow = ({ className = "" }: { className?: string }) => <ArrowRight size={18} strokeWidth={1.8} className={`shrink-0 text-ink-3 ${className}`} aria-hidden />;
const Node = ({ children, accent = false, className = "" }: { children: ReactNode; accent?: boolean; className?: string }) => (
  <Bead as="div" radius={18} tint={accent ? "sky" : undefined} className={`flex items-center gap-2 px-3.5 py-2.5 text-[14px] font-medium leading-tight text-ink ${className}`}>
    {children}
  </Bead>
);

/** Analisi: da cosa cerca il cliente, a quale pagina, a quale obiettivo. */
export function FlowDiagram({ it }: { it: boolean }) {
  const rows: [string, string, string, string][] = it
    ? [
        ["«idraulico urgente zona Brescia»", "Pagina Pronto intervento", "Chiamata", "phone"],
        ["«cambio caldaia prezzo»", "Pagina Caldaie", "Richiesta di preventivo", "file"],
        ["«idraulico per ristrutturazione bagno»", "Pagina Bagni", "Prenotazione sopralluogo", "cal"],
      ]
    : [
        ["“emergency plumber near me”", "Emergency page", "Phone call", "phone"],
        ["“boiler replacement cost”", "Boilers page", "Quote request", "file"],
        ["“bathroom renovation plumber”", "Bathrooms page", "Site visit booking", "cal"],
      ];
  const Ic = { phone: Phone, file: FileText, cal: CalendarDays } as const;
  return (
    <div className="grid gap-x-3 gap-y-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <p className={`${tag} hidden sm:block`}>{L(it, "Cosa cerca", "What they search")}</p>
      <span className="hidden sm:block" />
      <p className={`${tag} hidden sm:block`}>{L(it, "Pagina che risponde", "Page that answers")}</p>
      <span className="hidden sm:block" />
      <p className={`${tag} hidden sm:block`}>{L(it, "Obiettivo", "Goal")}</p>
      {rows.map(([q, p, g, k]) => {
        const I = Ic[k as keyof typeof Ic];
        return (
          <div key={q} className="contents">
            <Node className="font-normal text-ink-2">
              <Search size={15} className="shrink-0 text-ink-3" aria-hidden />
              {q}
            </Node>
            <Arrow className="hidden sm:block" />
            <Node>
              <Globe size={15} className="shrink-0 text-[var(--accent)]" aria-hidden />
              {p}
            </Node>
            <Arrow className="hidden sm:block" />
            <Node accent>
              <I size={15} className="shrink-0" aria-hidden />
              {g}
            </Node>
          </div>
        );
      })}
    </div>
  );
}

/** Grafica: la stessa pagina su tre schermi e le regole di stile. */
export function DesignDiagram({ it }: { it: boolean }) {
  const block = (c = "linear-gradient(140deg,#8fd8ff,#2f6fe0)") => <span className="block rounded-[5px]" style={{ background: c }} />;
  const line = <span className="block h-[5px] rounded-full bg-[var(--hair-strong)]" />;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-center">
      <div className="flex items-end justify-center gap-4 sm:gap-6">
        {[
          { w: "w-[46%]", h: "aspect-[16/10]", n: L(it, "Computer", "Computer") },
          { w: "w-[26%]", h: "aspect-[3/4]", n: "Tablet" },
          { w: "w-[14%]", h: "aspect-[9/19]", n: L(it, "Telefono", "Phone") },
        ].map((d) => (
          <div key={d.n} className={`${d.w} shrink-0`}>
            <div className={`${d.h} grid grid-rows-[1.2fr_auto_auto] gap-1.5 rounded-[14px] p-2 ${surface}`}>
              {block()}
              {line}
              <span className="grid grid-cols-2 gap-1.5">
                {block("var(--hair-strong)")}
                {block("var(--hair-strong)")}
              </span>
            </div>
            <p className={`${tag} mt-2 text-center`}>{d.n}</p>
          </div>
        ))}
      </div>
      <div className={`grid gap-4 rounded-[24px] p-5 ${surface}`}>
        <p className={tag}>{L(it, "Sistema di stile", "Style system")}</p>
        <div className="flex gap-2">
          {["#5ec4ff", "#2f6fe0", "#14171c", "#f3f4f6"].map((c) => (
            <span key={c} className="h-9 flex-1 rounded-[10px]" style={{ background: c, boxShadow: "inset 0 0 0 1px var(--hair-strong)" }} />
          ))}
        </div>
        <div className="flex items-end gap-4">
          <span className="text-[44px] font-medium leading-none tracking-[-0.05em] text-ink">Aa</span>
          <span className="text-[13px] leading-snug text-ink-2">{L(it, "Titoli e testi con gli stessi caratteri in ogni pagina", "Headings and text in the same typefaces on every page")}</span>
        </div>
        <span className="flex h-9 items-center justify-center rounded-full text-[13px] font-medium text-white" style={{ background: blue }}>
          {L(it, "Pulsante uguale ovunque", "Same button everywhere")}
        </span>
      </div>
    </div>
  );
}

/** Sviluppo: dal codice alla pubblicazione, con un controllo a ogni passo. */
export function PipelineDiagram({ it }: { it: boolean }) {
  const steps: [typeof Code2, string, string][] = [
    [Code2, L(it, "Sviluppo", "Development"), "Next.js · TypeScript"],
    [Eye, L(it, "Anteprima", "Preview"), L(it, "indirizzo di prova, solo per te", "test address, just for you")],
    [Smartphone, L(it, "Prova", "Testing"), L(it, "telefoni, tablet, browser", "phones, tablets, browsers")],
    [Globe, L(it, "Online", "Live"), L(it, "tuo dominio, HTTPS", "your domain, HTTPS")],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-stretch">
      {steps.map(([I, t, d], i) => (
        <div key={t} className="contents">
          <Bead as="div" radius={26} className="flex flex-col gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] text-white" style={{ background: blue }}>
              <I size={19} strokeWidth={1.9} aria-hidden />
            </span>
            <span className="text-[17px] font-medium tracking-[-0.02em] text-ink">{t}</span>
            <span className="text-[13.5px] leading-snug text-ink-2">{d}</span>
          </Bead>
          {i < steps.length - 1 && <Arrow className="hidden self-center sm:block" />}
        </div>
      ))}
    </div>
  );
}

/** SEO: come un risultato di Google legge la pagina, e dove stanno i dati. */
export function SnippetDiagram({ it }: { it: boolean }) {
  const n = (k: number) => (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: blue }}>
      {k}
    </span>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className={`rounded-[24px] p-5 sm:p-6 ${surface}`}>
        <p className="text-[12.5px] text-ink-3">latuaattivita.it › servizi</p>
        <p className="mt-1 flex items-start gap-2 text-[19px] leading-snug text-[#1a5fd0]">
          {n(1)}
          {L(it, "Idraulico a Brescia · Pronto intervento 24 ore", "Plumber in Brescia · 24-hour emergency service")}
        </p>
        <p className="mt-2 flex items-start gap-2 text-[14px] leading-[1.5] text-ink-2">
          {n(2)}
          {L(it, "Riparazioni urgenti, caldaie e bagni. Interveniamo in giornata in tutta la provincia.", "Urgent repairs, boilers and bathrooms. Same-day visits across the province.")}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-2">
          {n(3)}
          <span className="flex items-center gap-1">
            4,8 <Star size={13} fill="#f5b301" stroke="#f5b301" aria-hidden />
            <Star size={13} fill="#f5b301" stroke="#f5b301" aria-hidden />
            <Star size={13} fill="#f5b301" stroke="#f5b301" aria-hidden />
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={13} aria-hidden />
            {L(it, "Aperto ora · chiude alle 19:00", "Open now · closes 7 pm")}
          </span>
        </p>
        <div className="mt-3 grid gap-1.5">
          {[L(it, "Fate interventi la domenica?", "Do you work on Sundays?"), L(it, "Quanto costa un sopralluogo?", "How much is a site visit?")].map((q, i) => (
            <p key={q} className="flex items-center gap-2 rounded-[12px] bg-[var(--hover)] px-3 py-2 text-[13.5px] text-ink">
              {i === 0 && n(4)}
              <span className={i ? "pl-7" : ""}>{q}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="grid gap-4">
        <pre className={`overflow-x-auto rounded-[24px] p-5 font-mono text-[12.5px] leading-[1.7] text-ink-2 ${surface}`}>
{`{
  "@type": "LocalBusiness",
  "name": "${L(it, "La tua attività", "Your business")}",
  "telephone": "+39 000 000 0000",
  "openingHours": "Mo-Sa 09:00-19:00",
  "aggregateRating": { "ratingValue": 4.8 },
  "address": { "addressLocality": "Brescia" }
}`}
        </pre>
        <ul className="grid gap-2 text-[14px] leading-snug text-ink-2">
          {[
            [1, L(it, "Titolo e descrizione: scritti per ogni singola pagina", "Title and description: written for each individual page")],
            [3, L(it, "Orari, indirizzo, telefono e valutazioni: dati strutturati schema.org", "Hours, address, phone and ratings: schema.org structured data")],
            [4, L(it, "Domande frequenti: marcate perché si leggano senza interpretare", "FAQs: marked up so they can be read without interpretation")],
          ].map(([k, t]) => (
            <li key={String(t)} className="flex items-start gap-2.5">
              {n(k as number)}
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Prestazioni: le tre misure di Google con le loro soglie ufficiali. */
export function VitalsDiagram({ it }: { it: boolean }) {
  const rows = [
    { n: "LCP", t: L(it, "Si carica il contenuto principale", "Main content loads"), good: 2.5, mid: 4, max: 6, u: " s", fmt: (v: number) => String(v).replace(".", it ? "," : ".") },
    { n: "INP", t: L(it, "Il sito risponde a un tocco", "The site responds to a tap"), good: 200, mid: 500, max: 800, u: " ms", fmt: (v: number) => String(v) },
    { n: "CLS", t: L(it, "Niente salti mentre si carica", "No jumping while it loads"), good: 0.1, mid: 0.25, max: 0.4, u: "", fmt: (v: number) => String(v).replace(".", it ? "," : ".") },
  ];
  return (
    <div className="grid gap-6">
      {rows.map((r) => {
        const g = (r.good / r.max) * 100;
        const m = (r.mid / r.max) * 100;
        return (
          <div key={r.n} className="grid gap-2 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-6">
            <div>
              <p className="text-[20px] font-medium tracking-[-0.03em] text-ink">{r.n}</p>
              <p className="text-[13.5px] text-ink-2">{r.t}</p>
            </div>
            <div className="relative pt-6">
              <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[12.5px] font-medium text-[#1f9d58]" style={{ left: `${g}%` }}>
                {L(it, "obiettivo", "target")} ≤ {r.fmt(r.good)}
                {r.u}
              </span>
              <div className="flex h-3.5 overflow-hidden rounded-full">
                <span style={{ width: `${g}%`, background: "#2fb36a" }} />
                <span style={{ width: `${m - g}%`, background: "#f5b301" }} />
                <span className="flex-1" style={{ background: "#ef5b4d" }} />
              </div>
              <span className="absolute top-[18px] h-[26px] w-[2px] -translate-x-1/2 rounded-full bg-ink" style={{ left: `${g}%` }} />
            </div>
          </div>
        );
      })}
      <p className="text-[12.5px] text-ink-3">{L(it, "Soglie indicate da Google. Le misuro sul tuo sito, da telefono, prima e dopo il lavoro.", "Thresholds set by Google. I measure them on your site, on a phone, before and after the work.")}</p>
    </div>
  );
}

/** Contenuti: le tre fasi di una modifica e la cronologia che permette di tornare indietro. */
export function VersionsDiagram({ it }: { it: boolean }) {
  const st = [L(it, "Modifichi", "Edit"), L(it, "Controlli l’anteprima", "Check the preview"), L(it, "Pubblichi", "Publish")];
  const v = [L(it, "Versione 12 · 3 marzo", "Version 12 · 3 Mar"), L(it, "Versione 13 · 18 marzo", "Version 13 · 18 Mar"), L(it, "Versione 14 · oggi", "Version 14 · today")];
  return (
    <div className="grid gap-8">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {st.map((t, i) => (
          <div key={t} className="contents">
            <Node accent={i === 2} className="justify-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--hover)] text-[11px] font-semibold">{i + 1}</span>
              {t}
            </Node>
            {i < 2 && <Arrow className="hidden sm:block" />}
          </div>
        ))}
      </div>
      <div>
        <p className={`${tag} mb-4 flex items-center gap-2`}>
          <History size={14} aria-hidden />
          {L(it, "Cronologia delle versioni", "Version history")}
        </p>
        <div className="relative grid grid-cols-3 gap-2">
          <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-[9px] h-[2px] bg-[var(--hair-strong)]" />
          {v.map((t, i) => (
            <div key={t} className="relative flex flex-col items-center gap-2 text-center">
              <span className="h-[20px] w-[20px] rounded-full" style={i === 2 ? { background: blue, boxShadow: "0 0 0 5px color-mix(in srgb,#3b8cff 25%,transparent)" } : { background: "var(--bg-surface)", boxShadow: "inset 0 0 0 2px var(--hair-strong)" }} />
              <span className={`text-[13.5px] ${i === 2 ? "font-medium text-ink" : "text-ink-2"}`}>{t}</span>
              {i === 1 && (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--hover)] px-2.5 py-1 text-[12px] font-medium text-ink">
                  <RefreshCw size={12} aria-hidden />
                  {L(it, "Ripristina", "Restore")}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Assistente: tre richieste su WhatsApp e quello che producono. */
export function AssistantDiagram({ it }: { it: boolean }) {
  const col = (q: string, out: ReactNode, k: string) => (
    <div key={k} className="grid content-start gap-3">
      <Bead as="p" tint="sky" radius={18} className="ml-auto max-w-[92%] px-3.5 py-2 text-[14px] leading-[1.35] text-ink">
        {q}
      </Bead>
      <span className="mx-auto text-ink-3">↓</span>
      <Bead as="div" radius={22} className="p-4">
        {out}
      </Bead>
    </div>
  );
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {col(
        L(it, "Sabato apriamo alle 9, aggiorna il sito", "We open at 9 on Saturday, update the site"),
        <div className="grid gap-2 text-[14px]">
          <p className={tag}>{L(it, "Orari sul sito", "Hours on the site")}</p>
          <p className="flex justify-between text-ink-3 line-through">
            <span>{L(it, "Sabato", "Saturday")}</span>
            <span>{L(it, "chiuso", "closed")}</span>
          </p>
          <p className="flex justify-between font-medium text-ink">
            <span>{L(it, "Sabato", "Saturday")}</span>
            <span>9:00 – 13:00</span>
          </p>
          <p className="flex items-center gap-1.5 text-[12.5px] text-[#1f9d58]">
            <Check size={13} aria-hidden />
            {L(it, "Pubblicato", "Published")}
          </p>
        </div>,
        "a",
      )}
      {col(
        L(it, "Come sta andando il sito?", "How is the site doing?"),
        <div>
          <p className={tag}>{L(it, "Visite, ultimi 7 giorni", "Visits, last 7 days")}</p>
          <div className="mt-3 flex h-[84px] items-end gap-1.5">
            {[38, 52, 45, 61, 70, 84, 97].map((h, i) => (
              <span key={i} className="flex-1 rounded-t-[4px]" style={{ height: `${h}%`, background: i === 6 ? blue : "color-mix(in srgb,#5ec4ff 45%,transparent)" }} />
            ))}
          </div>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-[24px] font-semibold tracking-[-0.02em] text-ink">1.284</span>
            <span className="text-[13px] font-semibold text-[#1f9d58]">+18%</span>
          </p>
        </div>,
        "b",
      )}
      {col(
        L(it, "Chi ha chiesto di essere ricontattato?", "Who asked to be called back?"),
        <div className="grid gap-2.5">
          <p className={tag}>{L(it, "Da richiamare", "To call back")}</p>
          {[
            ["Giulia R.", L(it, "Preventivo caldaia", "Boiler quote")],
            ["Marco B.", L(it, "Sopralluogo bagno", "Bathroom visit")],
          ].map(([a, b]) => (
            <p key={a} className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-[14px] font-semibold text-ink">{a[0]}</span>
              <span className="leading-tight">
                <span className="block text-[14px] font-medium text-ink">{a}</span>
                <span className="block text-[12.5px] text-ink-2">{b}</span>
              </span>
            </p>
          ))}
        </div>,
        "c",
      )}
      <p className="flex items-center justify-center gap-2 text-[13px] text-ink-3 md:col-span-3">
        <MessageCircle size={15} aria-hidden />
        {L(it, "Tutto da una chat su WhatsApp, senza accessi o programmi in più", "All from one WhatsApp chat, with no extra logins or programs")}
      </p>
    </div>
  );
}

/** Contatti e statistiche: un esempio di resoconto. */
export function ReportDiagram({ it }: { it: boolean }) {
  const pts = [18, 26, 22, 34, 30, 44, 52];
  const W = 320;
  const H = 120;
  const path = pts.map((v, i) => `${i ? "L" : "M"}${(i / 6) * W},${H - (v / 60) * H}`).join(" ");
  const src: [string, number][] = [[L(it, "Ricerca Google", "Google search"), 58], [L(it, "Diretto", "Direct"), 21], [L(it, "Schede e mappe", "Listings and maps"), 14], [L(it, "Altro", "Other"), 7]];
  return (
    <div>
      <p className={`${tag} mb-4 flex items-center gap-2`}>
        <Activity size={14} aria-hidden />
        {L(it, "Esempio di resoconto mensile", "Example of a monthly report")}
      </p>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className={`rounded-[24px] p-5 ${surface}`}>
          <p className="text-[13.5px] text-ink-2">{L(it, "Visite per settimana", "Visits per week")}</p>
          <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="mt-3 w-full" aria-hidden>
            <defs>
              <linearGradient id="rp-a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3b8cff" stopOpacity=".28" />
                <stop offset="1" stopColor="#3b8cff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${path} L${W},${H} L0,${H} Z`} fill="url(#rp-a)" />
            <path d={path} fill="none" stroke="#2f6fe0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <div className="grid content-center gap-3">
          <p className="text-[13.5px] text-ink-2">{L(it, "Da dove arrivano", "Where they come from")}</p>
          {src.map(([n, v]) => (
            <div key={n} className="grid grid-cols-[110px_1fr_36px] items-center gap-3 text-[13.5px] text-ink">
              <span className="truncate">{n}</span>
              <span className="h-2 overflow-hidden rounded-full bg-[var(--hair-strong)]">
                <span className="block h-full rounded-full" style={{ width: `${v}%`, background: blue }} />
              </span>
              <span className="text-right text-ink-2">{v}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Assistenza: cosa è tuo e cosa gestiamo noi. */
export function OwnershipDiagram({ it }: { it: boolean }) {
  const mine = [[KeyRound, L(it, "Dominio", "Domain")], [Code2, L(it, "Codice", "Code")], [FileText, L(it, "Contenuti", "Content")], [Search, L(it, "Account e schede", "Accounts and listings")]] as const;
  const ours = [[Lock, L(it, "Connessione HTTPS", "HTTPS connection")], [HardDrive, L(it, "Copie di sicurezza", "Backups")], [RefreshCw, L(it, "Aggiornamenti", "Updates")], [ShieldCheck, L(it, "Controlli di sicurezza", "Security checks")]] as const;
  const zone = (title: string, items: readonly (readonly [typeof Lock, string])[], accent: boolean) => (
    <div className={`rounded-[28px] p-5 ${accent ? "" : surface}`} style={accent ? { background: "color-mix(in srgb,#5ec4ff 16%,transparent)", boxShadow: "inset 0 0 0 1.5px color-mix(in srgb,#2f6fe0 45%,transparent)" } : undefined}>
      <p className="text-[18px] font-medium tracking-[-0.025em] text-ink">{title}</p>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {items.map(([I, t]) => (
          <li key={t} className="flex items-center gap-2.5 text-[14.5px] text-ink">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--hover)]">
              <I size={16} strokeWidth={1.9} aria-hidden />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
      {zone(L(it, "Intestato a te", "In your name"), mine, true)}
      <p className="mx-auto max-w-[16ch] text-center text-[12.5px] leading-snug text-ink-3">{L(it, "Se cambi fornitore, passa tutto documentato", "If you switch supplier, everything is handed over, documented")}</p>
      {zone(L(it, "Gestito da noi", "Handled by us"), ours, false)}
    </div>
  );
}
