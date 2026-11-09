import type { ServiceKey } from "@/content/services";
import { HUE } from "@/components/sections/ServiceBg";

/* Disegni propri, tratto unico da 1,6: niente set di icone pronte. */
const P: Record<ServiceKey, React.ReactNode> = {
  web: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M3 9h18" />
      <path d="M7 13.5h6M7 16h3.5" />
    </>
  ),
  seo: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
      <path d="m7.5 12.2 2-2 1.6 1.5 2.4-3" />
    </>
  ),
  geo: (
    <>
      <path d="M20 11.5c0 4-3.6 7-8 7-1.1 0-2.2-.2-3.2-.5L4 19.5l1.3-3.6C4.5 14.6 4 13.1 4 11.5c0-4 3.6-7 8-7s8 3 8 7Z" />
      <path d="M12 8.3c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7Z" />
    </>
  ),
  apps: (
    <>
      <rect x="14" y="7" width="7" height="13" rx="2" />
      <path d="M11 16H4.5A1.5 1.5 0 0 1 3 14.5v-8A1.5 1.5 0 0 1 4.5 5h11A1.5 1.5 0 0 1 17 6.5V7" />
      <path d="M2 19.5h9" />
    </>
  ),
  design: (
    <>
      <path d="M4 18C7 7 17 7 20 18" />
      <path d="M4 18 9 7.5M20 18 15 7.5" />
      <circle cx="9" cy="7.5" r="1.5" />
      <circle cx="15" cy="7.5" r="1.5" />
    </>
  ),
  ai: (
    <>
      <path d="M10 3.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
      <path d="M17.5 14c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8Z" />
    </>
  ),
  hw: (
    <>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="10" y="10" width="4" height="4" rx=".8" />
      <path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21" />
    </>
  ),
  api: (
    <>
      <circle cx="5.5" cy="12" r="2.5" />
      <circle cx="18.5" cy="6" r="2.5" />
      <circle cx="18.5" cy="18" r="2.5" />
      <path d="M8 12h3.5c1.5 0 2-1 2.6-2.4L15 8M11.5 12c1.5 0 2 1 2.6 2.4L15 16" />
    </>
  ),
  shop: (
    <>
      <path d="M5 8h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </>
  ),
  ops: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6Z" />
      <path d="m9 12 2 2 4-4.2" />
    </>
  ),
};

/** Tessera con la sfumatura del servizio e il suo disegno al centro. */
export function ServiceIcon({ k, size = 40, className = "" }: { k: ServiceKey; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.18),0_6px_16px_-8px_rgba(5,20,35,.6)] ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.3, background: `radial-gradient(120% 120% at 85% 0%, ${HUE[k]}, #0b2f45 60%, #04121c)` }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {P[k]}
      </svg>
    </span>
  );
}
