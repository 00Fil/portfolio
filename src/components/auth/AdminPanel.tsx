"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Copy, ImagePlus, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { Bead } from "@/components/glass/Bead";
import { Wordmark } from "@/components/nav/Wordmark";
import { deleteCard, saveCard, signOut, toggleMaintenance } from "@/app/[locale]/login/actions";

type CardT = { id: string; slug: string; name: string; code: string; user: string; pass: string; url: string; logo: number };

const logoSrc = (c: Pick<CardT, "id" | "logo">) => (c.logo ? `/api/logo/${c.id}?v=${c.logo}` : "");

/** Qualunque immagine diventa un PNG di al massimo 640 px: il server accetta solo quello. */
async function toPng(file: File, max = 640): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const nw = img.naturalWidth || max;
    const nh = img.naturalHeight || max;
    const k = Math.min(1, max / Math.max(nw, nh));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(nw * k));
    c.height = Math.max(1, Math.round(nh * k));
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("png"))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Field({ label, name, defaultValue, prefix, type = "text", mono }: { label: string; name: string; defaultValue?: string; prefix?: string; type?: string; mono?: boolean }) {
  return (
    <label className="block min-w-0">
      <span className="block pl-2 text-[12.5px] font-medium text-ink-2">{label}</span>
      <Bead as="div" radius={20} className="mt-1.5 flex h-12 items-center px-4">
        {prefix && <span className="mr-0.5 text-[15px] text-ink-2">{prefix}</span>}
        <input name={name} type={type} defaultValue={defaultValue} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} className={`no-ring w-full min-w-0 bg-transparent text-[15px] text-ink outline-none ${mono ? "font-mono text-[14px]" : ""}`} />
      </Bead>
    </label>
  );
}

function CardForm({ card, onClose }: { card?: CardT; onClose: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(card ? logoSrc(card) : "");
  const [drop, setDrop] = useState(false);
  const [err, setErr] = useState("");
  const [busy, start] = useTransition();
  const pick = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", card?.id ?? "");
    fd.delete("logo");
    if (drop) fd.set("dropLogo", "1");
    start(async () => {
      setErr("");
      try {
        if (file) fd.set("logo", await toPng(file), "logo.png");
        const r = await saveCard(fd);
        if (!r.ok) return setErr(r.error);
        router.refresh();
        onClose();
      } catch {
        setErr("Immagine non leggibile");
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-4 rounded-[28px] p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <Bead as="button" type="button" radius={22} onClick={() => pick.current?.click()} aria-label="Logo" className="no-ring flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden text-ink-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {preview ? <img src={preview} alt="" className="h-full w-full object-contain p-2" /> : <ImagePlus size={24} strokeWidth={1.6} />}
        </Bead>
        <input
          ref={pick}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setFile(f);
            setDrop(false);
            setPreview(URL.createObjectURL(f));
          }}
        />
        {preview && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPreview("");
              setDrop(true);
            }}
            className="no-ring flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink"
            aria-label="Togli logo"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <Field label="Nome" name="name" defaultValue={card?.name} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="URL" name="slug" defaultValue={card?.slug} prefix="/c/" />
        <Field label="Codice di sblocco" name="code" defaultValue={card?.code} mono />
        <Field label="Utente" name="user" defaultValue={card?.user} mono />
        <Field label="Password" name="pass" defaultValue={card?.pass} mono />
      </div>
      <Field label="Link" name="url" defaultValue={card?.url} />
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

function Row({ c, editing, onEdit, onClose }: { c: CardT; editing: boolean; onEdit: () => void; onClose: () => void }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [ask, setAsk] = useState(false);
  const [, start] = useTransition();
  const href = `/c/${c.slug}`;
  const ib = "no-ring flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink";
  return (
    <li>
      <Bead as="div" radius={26} className="flex items-center gap-3 p-3 pr-2">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[color-mix(in_srgb,var(--fg,#000)_6%,transparent)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {c.logo ? <img src={logoSrc(c)} alt="" className="h-full w-full object-contain p-1.5" /> : <span className="text-[18px] font-semibold text-ink-2">{c.name.slice(0, 1).toUpperCase()}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold text-ink">{c.name}</p>
          <p className="truncate text-[13.5px] text-ink-2">{href}</p>
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
              await deleteCard(c.id);
              router.refresh();
            });
          }}
        >
          <Trash2 size={16} strokeWidth={1.7} />
        </button>
      </Bead>
      {editing && <CardForm card={c} onClose={onClose} />}
    </li>
  );
}

export function AdminPanel({ cards, maintenance, persist }: { cards: CardT[]; maintenance: boolean; persist: boolean | null }) {
  const router = useRouter();
  const [edit, setEdit] = useState<string | null>(null);
  const [on, setOn] = useState(maintenance);
  const [, start] = useTransition();

  const flip = () => {
    const v = !on;
    setOn(v);
    start(async () => {
      await toggleMaintenance(v);
      router.refresh();
    });
  };

  return (
    <main id="main" className="fixed inset-0 z-[150] overflow-y-auto bg-[var(--bg-canvas)]">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-24 pt-6 sm:pt-10">
        <header className="flex items-center justify-between">
          <h1 style={{ ["--logo-size" as string]: "28px" }} aria-label="Admin">
            <Wordmark />
          </h1>
          <form action={signOut}>
            <button type="submit" aria-label="Esci" className="no-ring flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink">
              <LogOut size={19} strokeWidth={1.7} />
            </button>
          </form>
        </header>

        <Bead as="div" radius={28} className="mt-8 flex items-center gap-4 p-5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: on ? "#f5a524" : "#30d158", boxShadow: `0 0 0 4px ${on ? "rgba(245,165,36,.18)" : "rgba(48,209,88,.16)"}` }} />
          <p className="flex-1 text-[17px] font-semibold text-ink">{on ? "Manutenzione" : "Online"}</p>
          <button type="button" role="switch" aria-checked={on} aria-label="Manutenzione" onClick={flip} className="no-ring relative h-8 w-[54px] rounded-full transition-colors duration-300" style={{ background: on ? "#5ec4ff" : "color-mix(in srgb, var(--fg, #000) 16%, transparent)" }}>
            <span className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.25)] transition-[left] duration-300 ease-[cubic-bezier(.16,1,.3,1)]" style={{ left: on ? 26 : 4 }} />
          </button>
        </Bead>

        {persist !== null && (
          <p className="mt-4 flex items-center gap-2.5 pl-3 text-[13.5px] text-ink-2">
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: persist ? "#30d158" : "#e5484d" }} />
            {persist ? "Dati su volume" : "Dati non persistenti"}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">Card</h2>
          <Bead as="button" type="button" tint="sky" radius={999} onClick={() => setEdit(edit === "new" ? null : "new")} aria-label="Nuova card" className="no-ring flex h-11 w-11 items-center justify-center text-ink">
            <Plus size={20} strokeWidth={1.9} className={`transition-transform duration-300 ${edit === "new" ? "rotate-45" : ""}`} />
          </Bead>
        </div>

        {edit === "new" && <CardForm onClose={() => setEdit(null)} />}
        <ul className="mt-4 grid gap-3">
          {cards.map((c) => (
            <Row key={c.id + c.logo} c={c} editing={edit === c.id} onEdit={() => setEdit(c.id)} onClose={() => setEdit(null)} />
          ))}
        </ul>
      </div>
    </main>
  );
}
