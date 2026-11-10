import type { ServiceKey } from "@/content/services";
import { Bead } from "@/components/glass/Bead";

/*
 * Pittogrammi a tratto unico, nello spirito di SF Symbols: griglia di 24, tratto 1,5 arrotondato,
 * un solo colore (quello del testo), nessun riempimento e nessuna tessera dietro.
 */
const P: Record<ServiceKey, React.ReactNode> = {
  web: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M3 8.75h18" />
      <path d="M6 6.65h.01M8.25 6.65h.01" strokeWidth="1.9" />
      <path d="M7 12.5h6M7 15.5h10" />
    </>
  ),
  seo: (
    <>
      <path d="M4 4v14.5A1.5 1.5 0 0 0 5.5 20H20" />
      <path d="m7.5 15 3.5-4 3 2.5 5-6" />
      <path d="M15.5 7.5H19V11" />
    </>
  ),
  geo: (
    <>
      <path d="M20.5 11.5c0 4.14-3.8 7.5-8.5 7.5-1.2 0-2.36-.22-3.4-.62L4 19.5l1.15-3.45C4.1 14.78 3.5 13.2 3.5 11.5 3.5 7.36 7.3 4 12 4s8.5 3.36 8.5 7.5Z" />
      <path d="M12 8.25c.33 1.9 1.1 2.67 3 3-1.9.33-2.67 1.1-3 3-.33-1.9-1.1-2.67-3-3 1.9-.33 2.67-1.1 3-3Z" />
    </>
  ),
  ai: (
    <>
      <path d="M10 3.5c.62 3.86 2.14 5.38 6 6-3.86.62-5.38 2.14-6 6-.62-3.86-2.14-5.38-6-6 3.86-.62 5.38-2.14 6-6Z" />
      <path d="M17.5 14c.3 1.85 1.15 2.7 3 3-1.85.3-2.7 1.15-3 3-.3-1.85-1.15-2.7-3-3 1.85-.3 2.7-1.15 3-3Z" />
    </>
  ),
  design: (
    <>
      <path d="m12 3 5 8.5-5 6.5-5-6.5Z" />
      <path d="M12 11.5V18" />
      <circle cx="12" cy="11.25" r="1.25" />
      <path d="M9.5 21h5" />
    </>
  ),
  api: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.25 10.9 7.5-3.8M8.25 13.1l7.5 3.8" />
    </>
  ),
  ops: (
    <>
      <rect x="3.5" y="4" width="17" height="7" rx="2.25" />
      <rect x="3.5" y="13" width="17" height="7" rx="2.25" />
      <path d="M7 7.5h.01M7 16.5h.01" strokeWidth="1.9" />
      <path d="M11 7.5h6M11 16.5h6" />
    </>
  ),
  hw: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9.5 3v3M14.5 3v3M9.5 18v3M14.5 18v3M3 9.5h3M3 14.5h3M18 9.5h3M18 14.5h3" />
    </>
  ),
  apps: (
    <>
      <path d="M3.5 16.5V7A2 2 0 0 1 5.5 5h11A2 2 0 0 1 18.5 7v1" />
      <path d="M1.5 18.5h12" />
      <rect x="15" y="10" width="7" height="11" rx="1.75" />
      <path d="M17.75 18.75h1.5" />
    </>
  ),
  shop: (
    <>
      <path d="M5 8h14l-1 11.25A2 2 0 0 1 16 21H8a2 2 0 0 1-2-1.75Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </>
  ),
};

/** Il pittogramma del servizio: tratto sottile dentro una tessera di vetro, come i tasti del sito. `size` è lo spazio che occupa. */
export function ServiceIcon({ k, size = 40, className = "" }: { k: ServiceKey; size?: number; className?: string }) {
  const s = Math.round(size * 0.5);
  return (
    <Bead aria-hidden radius={Math.round(size * 0.32)} className={`inline-flex shrink-0 items-center justify-center text-ink ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {P[k]}
      </svg>
    </Bead>
  );
}
