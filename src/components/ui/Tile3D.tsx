import type { LucideIcon } from "lucide-react";

/** Tessera 3D: faccia di vetro azzurro con spessore (strati dietro) e icona in rilievo. Si inclina con rotationX/Y da fuori (data-tile). */
export function Tile3D({ Icon, size = 26, className = "" }: { Icon: LucideIcon; size?: number; className?: string }) {
  return (
    <span className={`[perspective:240px] ${className}`}>
      <span data-tile className="relative block h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {[6, 5, 4, 3, 2, 1].map((z) => (
          <span key={z} className="absolute inset-0 rounded-[30%]" style={{ transform: `translateZ(${-z * 1.7}px)`, background: `color-mix(in srgb, #1e56c8 ${70 + z * 5}%, #07225f)` }} />
        ))}
        <span className="absolute inset-0 flex items-center justify-center rounded-[30%] text-white" style={{ transformStyle: "preserve-3d", background: "linear-gradient(150deg,#b4e8ff 0%,#52b0f4 42%,#2f6fe0 100%)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.85), inset 0 -3px 6px rgba(10,50,140,.4)" }}>
          <Icon size={size} strokeWidth={2.1} style={{ transform: "translateZ(7px)", filter: "drop-shadow(0 3px 2px rgba(10,50,140,.55))" }} />
        </span>
      </span>
    </span>
  );
}
