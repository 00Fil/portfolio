import type { ServiceKey } from "@/content/services";

/*
 * Pittogrammi disegnati per il sito: tre livelli (un piano di fondo tenue, il tratto nell'inchiostro del tema
 * e un solo dettaglio azzurro), costruiti su una griglia di 32. Si adattano da soli al tema chiaro e scuro.
 */
const S = { fill: "currentColor", fillOpacity: 0.13 } as const;
const L = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const A = { fill: "var(--icon-acc)" } as const;

const P: Record<ServiceKey, React.ReactNode> = {
  web: (
    <>
      <rect x="3.5" y="6" width="22" height="17" rx="3.5" {...S} />
      <rect x="3.5" y="6" width="22" height="17" rx="3.5" {...L} />
      <path d="M3.5 11h22" {...L} />
      <circle cx="7" cy="8.6" r=".9" fill="currentColor" />
      <circle cx="9.8" cy="8.6" r=".9" fill="currentColor" />
      <rect x="15" y="15" width="13.5" height="11" rx="2.6" {...A} />
      <path d="M18 19h7.5M18 22.2h4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  seo: (
    <>
      <rect x="4" y="18" width="5" height="9" rx="1.6" {...S} />
      <rect x="11.5" y="14" width="5" height="13" rx="1.6" {...S} />
      <rect x="19" y="8" width="5" height="19" rx="1.6" {...A} />
      <path d="M4.5 13.5 10 9l4 3 7.5-7" {...L} />
      <path d="M17.5 5h4v4" {...L} />
    </>
  ),
  geo: (
    <>
      <path d="M27 15c0 5.2-4.9 9.2-11 9.2-1.5 0-3-.2-4.3-.7L5 25.5l1.8-4.7C5.7 19.1 5 17.1 5 15c0-5.2 4.9-9.2 11-9.2S27 9.8 27 15Z" {...S} />
      <path d="M27 15c0 5.2-4.9 9.2-11 9.2-1.5 0-3-.2-4.3-.7L5 25.5l1.8-4.7C5.7 19.1 5 17.1 5 15c0-5.2 4.9-9.2 11-9.2S27 9.8 27 15Z" {...L} />
      <path d="M16 9.5c.5 3 1.7 4.3 4.6 4.8-2.9.5-4.1 1.8-4.6 4.8-.5-3-1.7-4.3-4.6-4.8 2.9-.5 4.1-1.8 4.6-4.8Z" {...A} />
    </>
  ),
  ai: (
    <>
      <circle cx="16" cy="16" r="11.5" {...S} />
      <circle cx="16" cy="16" r="11.5" {...L} strokeDasharray="2 3.2" />
      <path d="M14 6.5c.8 5 3 7.2 8 8-5 .8-7.2 3-8 8-.8-5-3-7.2-8-8 5-.8 7.2-3 8-8Z" {...A} />
      <path d="M23 19.5c.4 2.3 1.3 3.2 3.6 3.6-2.3.4-3.2 1.3-3.6 3.6-.4-2.3-1.3-3.2-3.6-3.6 2.3-.4 3.2-1.3 3.6-3.6Z" fill="currentColor" />
    </>
  ),
  design: (
    <>
      <path d="M5 25C8 12 24 12 27 25" {...L} />
      <path d="M16 3.5 21 13l-5 6-5-6Z" {...S} />
      <path d="M16 3.5 21 13l-5 6-5-6Z" {...L} />
      <path d="M16 12.5v6.5" {...L} />
      <rect x="2.8" y="22.8" width="4.4" height="4.4" rx="1.1" {...A} />
      <rect x="24.8" y="22.8" width="4.4" height="4.4" rx="1.1" {...A} />
    </>
  ),
  api: (
    <>
      <path d="M11.5 16h3.5c2.5 0 3.2-1.6 4.2-3.8l1-2.2M15 16c2.5 0 3.2 1.6 4.2 3.8l1 2.2" {...L} />
      <circle cx="24" cy="8" r="4" {...S} />
      <circle cx="24" cy="8" r="4" {...L} />
      <circle cx="24" cy="24" r="4" {...S} />
      <circle cx="24" cy="24" r="4" {...L} />
      <circle cx="8" cy="16" r="5" {...A} />
      <circle cx="8" cy="16" r="1.7" fill="#fff" />
    </>
  ),
  ops: (
    <>
      <rect x="3.5" y="4.5" width="19" height="8" rx="2.4" {...S} />
      <rect x="3.5" y="4.5" width="19" height="8" rx="2.4" {...L} />
      <rect x="3.5" y="15" width="13" height="8" rx="2.4" {...S} />
      <rect x="3.5" y="15" width="13" height="8" rx="2.4" {...L} />
      <circle cx="7.5" cy="8.5" r="1" fill="currentColor" />
      <circle cx="7.5" cy="19" r="1" fill="currentColor" />
      <path d="M23 13.5 29 16v4.6c0 3.6-2.5 6.3-6 7.6-3.5-1.3-6-4-6-7.6V16Z" {...A} />
      <path d="m20.4 20.6 1.8 1.8 3.4-3.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  hw: (
    <>
      <rect x="7" y="7" width="18" height="18" rx="3.5" {...S} />
      <rect x="7" y="7" width="18" height="18" rx="3.5" {...L} />
      <path d="M12 3v4M16 3v4M20 3v4M12 25v4M16 25v4M20 25v4M3 12h4M3 16h4M3 20h4M25 12h4M25 16h4M25 20h4" {...L} />
      <rect x="11.5" y="11.5" width="9" height="9" rx="2" {...A} />
    </>
  ),
  apps: (
    <>
      <path d="M4.5 21V8.5A2.5 2.5 0 0 1 7 6h16a2.5 2.5 0 0 1 2.5 2.5V10" {...L} />
      <path d="M4.5 8.5A2.5 2.5 0 0 1 7 6h12v15H4.5Z" {...S} />
      <path d="M2 24h15" {...L} />
      <rect x="19" y="10.5" width="10" height="17.5" rx="2.6" {...A} />
      <path d="M22.5 25h3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  shop: (
    <>
      <path d="M6 11h20l-1.4 15.2a2.4 2.4 0 0 1-2.4 2.3H9.8a2.4 2.4 0 0 1-2.4-2.3Z" {...S} />
      <path d="M6 11h20l-1.4 15.2a2.4 2.4 0 0 1-2.4 2.3H9.8a2.4 2.4 0 0 1-2.4-2.3Z" {...L} />
      <path d="M11.5 14V9a4.5 4.5 0 0 1 9 0v5" {...L} />
      <circle cx="22.5" cy="21.5" r="5" {...A} />
      <path d="m20.3 21.6 1.5 1.5 2.9-3" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

/** Tessera neutra del tema con il pittogramma del servizio. */
export function ServiceIcon({ k, size = 40, className = "" }: { k: ServiceKey; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center bg-[var(--icon-tile)] text-ink shadow-[inset_0_0_0_1px_var(--hair),0_1px_0_rgba(255,255,255,.06)_inset,0_6px_14px_-10px_var(--shadow-strong)] ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <svg viewBox="0 0 32 32" width={size * 0.66} height={size * 0.66}>
        {P[k]}
      </svg>
    </span>
  );
}
