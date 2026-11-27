"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Copy, Pencil, Plus, Trash2, X } from "lucide-react";
import { Bead } from "@/components/glass/Bead";
import { connectGithub, deleteReport, disconnectGithub, importCommits, saveReport } from "@/app/[locale]/login/actions";
import { KINDS, KIND_LABEL, SEVERITIES, STATES, TESTS, type Entry, type Report } from "@/lib/report-shared";

const uid = () => Math.random().toString(36).slice(2, 10);
const blank = (): Entry => ({ id: uid(), kind: "fix", title: "", detail: "", area: "", commit: "", severity: "", state: "", test: "da collaudare", evidence: "" });
const today = () => new Date().toISOString().slice(0, 10);

function Inp({ label, value, onChange, prefix, mono, type = "text" }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; mono?: boolean; type?: string }) {
  return (
    <label className="block min-w-0">
      <span className="block pl-2 text-[12.5px] font-medium text-ink-2">{label}</span>
      <Bead as="div" radius={18} className="mt-1.5 flex h-11 items-center px-4">
        {prefix && <span className="mr-0.5 text-[15px] text-ink-2">{prefix}</span>}
        <input value={value} type={type} onChange={(e) => onChange(e.target.value)} autoComplete="off" spellCheck={false} className={`no-ring w-full min-w-0 bg-transparent text-[14.5px] text-ink outline-none ${mono ? "font-mono text-[13.5px]" : ""}`} />
      </Bead>
    </label>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="block min-w-0">
      <span className="block pl-2 text-[12.5px] font-medium text-ink-2">{label}</span>
      <Bead as="div" radius={18} className="mt-1.5 px-4 py-2.5">
        <textarea value={value} rows={rows} onChange={(e) => onChange(e.target.value)} spellCheck={false} className="no-ring block w-full resize-y bg-transparent text-[14.5px] leading-snug text-ink outline-none" />
      </Bead>
    </label>
  );
}

function Pick<T extends string>({ label, value, list, onChange, show }: { label: string; value: T; list: readonly T[]; onChange: (v: T) => void; show?: (v: T) => string }) {
  return (
    <label className="block min-w-0">
      <span className="block pl-2 text-[12.5px] font-medium text-ink-2">{label}</span>
      <Bead as="div" radius={18} className="mt-1.5 flex h-11 items-center px-3">
        <select value={value} onChange={(e) => onChange(e.target.value as T)} className="no-ring w-full min-w-0 bg-transparent text-[14.5px] text-ink outline-none">
          {list.map((v) => (
            <option key={v} value={v}>
              {show ? show(v) : v || "—"}
            </option>
          ))}
        </select>
      </Bead>
    </label>
  );
}

type Gh = { connected: boolean; login: string; repo: string };

function ReportForm({ report, onClose, gh }: { report?: Report; onClose: () => void; gh: Gh }) {
  const router = useRouter();
  const [d, setD] = useState<Report>(
    report ?? { id: "", slug: "", title: "", project: "portfolio", version: "", status: "bozza", date: today(), env: "", summary: "", entries: [blank()], created: "", updated: "" },
  );
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();
  const set = <K extends keyof Report>(k: K, v: Report[K]) => setD((x) => ({ ...x, [k]: v }));
  const upd = (id: string, patch: Partial<Entry>) => setD((x) => ({ ...x, entries: x.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  const [repo, setRepo] = useState(gh.repo);
  const [since, setSince] = useState("");
  const [branch, setBranch] = useState("");
  const [limit, setLimit] = useState("30");
  const [imp, setImp] = useState("");
  const [loading, load] = useTransition();
  const pull = () =>
    load(async () => {
      setImp("");
      const r = await importCommits(repo, since, Number(limit), branch);
      if (!r.ok) return setImp(r.error);
      setD((x) => {
        const have = new Set(x.entries.map((e) => e.commit).filter(Boolean));
        const fresh = r.entries.filter((e) => !have.has(e.commit));
        return { ...x, project: x.project || r.repo.split("/")[1], entries: [...x.entries.filter((e) => e.title || e.commit), ...fresh] };
      });
      setImp(`${r.entries.length} commit letti`);
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      setErr("");
      const r = await saveReport(JSON.stringify(d));
      if (!r.ok) return setErr(r.error);
      router.refresh();
      onClose();
    });
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-4 rounded-[28px] p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Inp label="Titolo" value={d.title} onChange={(v) => set("title", v)} />
        <Inp label="URL (vuoto = casuale)" value={d.slug} onChange={(v) => set("slug", v)} prefix="/r/" mono />
        <Inp label="Progetto" value={d.project} onChange={(v) => set("project", v)} />
        <Inp label="Versione" value={d.version} onChange={(v) => set("version", v)} mono />
        <Inp label="Data" value={d.date} onChange={(v) => set("date", v)} type="date" mono />
        <Pick label="Stato" value={d.status} list={["bozza", "rilasciato"] as const} onChange={(v) => set("status", v)} />
      </div>
      <Inp label="Ambiente di collaudo" value={d.env} onChange={(v) => set("env", v)} />
      <Area label="Sintesi" value={d.summary} onChange={(v) => set("summary", v)} />

      {gh.connected && (
        <Bead as="div" radius={24} className="grid gap-3 p-3.5">
          <span className="pl-1 text-[12.5px] font-medium text-ink-2">Importa da GitHub</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <Inp label="Repository" value={repo} onChange={setRepo} mono />
            <Inp label="Ramo (vuoto = principale)" value={branch} onChange={setBranch} mono />
            <Inp label="Dal giorno" value={since} onChange={setSince} type="date" mono />
            <Inp label="Numero massimo" value={limit} onChange={setLimit} type="number" mono />
          </div>
          <div className="flex items-center gap-3">
            <Bead as="button" type="button" tint="sky" radius={999} onClick={pull} disabled={loading} className="no-ring flex h-11 min-w-[150px] items-center justify-center px-5 text-[14.5px] font-semibold text-ink disabled:opacity-60">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : "Importa commit"}
            </Bead>
            <span className="text-[13.5px] text-ink-2">{imp}</span>
          </div>
        </Bead>
      )}

      <div className="flex items-center justify-between px-2">
        <span className="text-[12.5px] font-medium text-ink-2">Voci · {d.entries.length}</span>
        <button type="button" onClick={() => setD((x) => ({ ...x, entries: [...x.entries, blank()] }))} className="no-ring inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--fg,#000)_8%,transparent)] px-2.5 py-1 text-[12px] font-medium text-ink">
          <Plus size={13} strokeWidth={2} /> Aggiungi voce
        </button>
      </div>
      <ul className="grid gap-3">
        {d.entries.map((e) => (
          <li key={e.id}>
            <Bead as="div" radius={24} className="grid gap-3 p-3.5">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <Inp label="Titolo voce" value={e.title} onChange={(v) => upd(e.id, { title: v })} />
                </div>
                <button type="button" aria-label="Rimuovi voce" onClick={() => setD((x) => ({ ...x, entries: x.entries.filter((y) => y.id !== e.id) }))} className="no-ring mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-2 hover:text-ink">
                  <X size={16} strokeWidth={1.9} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Pick label="Tipo" value={e.kind} list={KINDS} onChange={(v) => upd(e.id, { kind: v })} show={(v) => KIND_LABEL[v]} />
                <Pick label="Gravità" value={e.severity} list={SEVERITIES} onChange={(v) => upd(e.id, { severity: v })} />
                <Pick label="Stato" value={e.state} list={STATES} onChange={(v) => upd(e.id, { state: v })} />
                <Pick label="Collaudo" value={e.test} list={TESTS} onChange={(v) => upd(e.id, { test: v })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Inp label="Area / componente" value={e.area} onChange={(v) => upd(e.id, { area: v })} mono />
                <Inp label="Commit" value={e.commit} onChange={(v) => upd(e.id, { commit: v })} mono />
              </div>
              <Area label="Dettaglio tecnico" value={e.detail} onChange={(v) => upd(e.id, { detail: v })} rows={2} />
              <Inp label="Prova di collaudo" value={e.evidence} onChange={(v) => upd(e.id, { evidence: v })} />
            </Bead>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <Bead as="button" type="submit" tint="sky" radius={999} disabled={busy} className="no-ring flex h-12 min-w-[120px] items-center justify-center px-6 text-[15px] font-semibold text-ink disabled:opacity-60">
          {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : "Salva"}
        </Bead>
        <button type="button" onClick={onClose} className="no-ring h-12 rounded-full px-4 text-[15px] text-ink-2 transition-colors hover:text-ink">
          Annulla
        </button>
        <p role="alert" className="ml-auto text-[13.5px] text-[#e5484d]">
          {err}
        </p>
      </div>
    </form>
  );
}

function Row({ r, editing, onEdit, onClose, gh }: { r: Report; editing: boolean; onEdit: () => void; onClose: () => void; gh: Gh }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [ask, setAsk] = useState(false);
  const [, start] = useTransition();
  const href = `/r/${r.slug}`;
  const ib = "no-ring flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink";
  return (
    <li>
      <Bead as="div" radius={26} className="flex items-center gap-3 p-3 pr-2">
        <span aria-hidden className="ml-1 h-2 w-2 shrink-0 rounded-full" style={{ background: r.status === "rilasciato" ? "#30d158" : "#f5a524" }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-ink">{r.title}</p>
          <p className="truncate text-[13.5px] text-ink-2">
            {href} · {r.entries.length} voci
          </p>
        </div>
        <button
          type="button"
          className={ib}
          aria-label="Copia link"
          onClick={() => {
            void navigator.clipboard?.writeText(`${location.origin}${href}`).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? <Check size={17} strokeWidth={1.9} /> : <Copy size={17} strokeWidth={1.7} />}
        </button>
        <a href={href} target="_blank" rel="noopener noreferrer" className={ib} aria-label="Apri">
          <ArrowUpRight size={18} strokeWidth={1.8} />
        </a>
        <button type="button" className={ib} aria-label="Modifica" onClick={editing ? onClose : onEdit}>
          <Pencil size={16} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          aria-label="Elimina"
          className={`${ib} ${ask ? "!text-[#e5484d]" : ""}`}
          onClick={() => {
            if (!ask) {
              setAsk(true);
              setTimeout(() => setAsk(false), 2500);
              return;
            }
            start(async () => {
              await deleteReport(r.id);
              router.refresh();
            });
          }}
        >
          <Trash2 size={16} strokeWidth={1.7} />
        </button>
      </Bead>
      {editing && <ReportForm report={r} onClose={onClose} gh={gh} />}
    </li>
  );
}

function GithubLink({ gh }: { gh: Gh }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(gh.repo);
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();
  return (
    <div className="mt-4">
      <Bead as="div" radius={26} className="flex items-center gap-3 p-3 pr-2">
        <span aria-hidden className="ml-1 h-2 w-2 shrink-0 rounded-full" style={{ background: gh.connected ? "#30d158" : "color-mix(in srgb, var(--fg, #000) 30%, transparent)" }} />
        <p className="min-w-0 flex-1 truncate text-[15px] text-ink">{gh.connected ? `GitHub · ${gh.login || "collegato"}${gh.repo ? ` · ${gh.repo}` : ""}` : "GitHub · non collegato"}</p>
        {gh.connected && (
          <button
            type="button"
            className="no-ring h-10 rounded-full px-3 text-[13.5px] text-ink-2 transition-colors hover:text-ink"
            onClick={() =>
              start(async () => {
                await disconnectGithub();
                router.refresh();
              })
            }
          >
            Scollega
          </button>
        )}
        <button type="button" className="no-ring h-10 rounded-full px-3 text-[13.5px] font-medium text-ink" onClick={() => setOpen(!open)}>
          {gh.connected ? "Modifica" : "Collega"}
        </button>
      </Bead>
      {open && (
        <form
          className="mt-3 grid gap-4 rounded-[28px] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setErr("");
              const r = await connectGithub(token, repo);
              if (!r.ok) return setErr(r.error);
              setToken("");
              setOpen(false);
              router.refresh();
            });
          }}
        >
          <Inp label="Token (sola lettura dei contenuti)" value={token} onChange={setToken} type="password" mono />
          <Inp label="Repository predefinito" value={repo} onChange={setRepo} mono />
          <div className="flex items-center gap-3">
            <Bead as="button" type="submit" tint="sky" radius={999} disabled={busy} className="no-ring flex h-11 min-w-[120px] items-center justify-center px-5 text-[14.5px] font-semibold text-ink disabled:opacity-60">
              {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : "Collega"}
            </Bead>
            <p role="alert" className="text-[13.5px] text-[#e5484d]">
              {err}
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

export function ReportsAdmin({ reports, github }: { reports: Report[]; github: Gh }) {
  const [edit, setEdit] = useState<string | null>(null);
  return (
    <>
      <div className="mt-12 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">Documenti</h2>
        <Bead as="button" type="button" tint="sky" radius={999} onClick={() => setEdit(edit === "new" ? null : "new")} aria-label="Nuovo documento" className="no-ring flex h-11 w-11 items-center justify-center text-ink">
          <Plus size={20} strokeWidth={1.9} className={`transition-transform duration-300 ${edit === "new" ? "rotate-45" : ""}`} />
        </Bead>
      </div>
      <GithubLink gh={github} />
      {edit === "new" && <ReportForm onClose={() => setEdit(null)} gh={github} />}
      <ul className="mt-4 grid gap-3">
        {reports.map((r) => (
          <Row key={r.id + r.updated} r={r} editing={edit === r.id} onEdit={() => setEdit(r.id)} onClose={() => setEdit(null)} gh={github} />
        ))}
      </ul>
    </>
  );
}
