/**
 * Relay: al posto del giro sulle schermate (in arrivo), il suo linguaggio visivo.
 * Colori e raggi sono quelli del tema dell'app (Canone); la barra di navigazione di questo sito usa la stessa fisica.
 */
const SWATCHES = [
  { name: "Canvas", hex: "#000000" },
  { name: "Surface", hex: "#1C1C1E" },
  { name: "Sunken", hex: "#2C2C2E" },
  { name: "Accent", hex: "#2F5FFF" },
  { name: "Subtle", hex: "#11244F" },
  { name: "On subtle", hex: "#B4D2FF" },
];
const RADII = [6, 10, 14, 20, 28, 36];

export function RelaySystem({ kicker, title, body, nav }: { kicker: string; title: string; body: string; nav: string }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 py-24 sm:px-8 sm:py-36">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <p className="t-label text-[var(--accent)]">{kicker}</p>
          <h3 className="mt-5 text-[clamp(28px,3vw,42px)] font-medium leading-[1.05] tracking-[-0.04em] text-ink">{title}</h3>
          <p className="mt-4 max-w-[36ch] text-[17px] leading-[1.5] text-ink-2">{body}</p>
          <p className="mt-6 max-w-[36ch] text-[15px] leading-[1.5] text-ink-3">{nav}</p>
        </div>
        <div className="grid gap-4 lg:col-span-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[28px] bg-black lg:row-span-2">
            <iframe title="" aria-hidden tabIndex={-1} loading="lazy" src="/visual/slats.html" className="pointer-events-none absolute inset-0 h-full w-full border-0" />
            <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6">
              <img src="/work/relay/icon.webp" alt="" className="h-16 w-16" />
            </div>
          </div>
          <div className="rounded-[28px] bg-[var(--bg-surface)] p-6">
            <div className="grid grid-cols-3 gap-3">
              {SWATCHES.map((s) => (
                <div key={s.name}>
                  <span className="block aspect-square rounded-[14px] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]" style={{ background: s.hex }} />
                  <p className="mt-2 text-[13px] text-ink">{s.name}</p>
                  <p className="font-mono text-[11px] text-ink-3">{s.hex}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] bg-[var(--bg-surface)] p-6">
            <div className="flex items-end gap-3">
              {RADII.map((r) => (
                <div key={r} className="flex flex-1 flex-col items-center gap-2">
                  <span className="block aspect-square w-full border border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]" style={{ borderRadius: r }} />
                  <span className="font-mono text-[11px] text-ink-3">{r}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[40px] font-medium leading-none tracking-[-0.04em] text-ink">Aa</p>
            <p className="mt-2 text-[13px] text-ink-3">Geist · Geist Mono</p>
          </div>
        </div>
      </div>
    </section>
  );
}
