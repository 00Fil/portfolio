"use client";

import { Clipboard, House, Image as ImageIcon, MonitorSmartphone, Settings, Headphones, FileText } from "lucide-react";
import { useLoop } from "./useLoop";

/** Relay: un ritaglio copiato sul PC arriva sul telefono; la bolla della barra si sposta su Appunti. */
export function RelayPreview() {
  const ref = useLoop<HTMLDivElement>((root, tl) => {
    const q = (s: string) => root.querySelector(s);
    tl.set(q("[data-chip]"), { opacity: 0, x: 0, y: 0, scale: 1 })
      .set(q("[data-item]"), { opacity: 0, y: -10, height: 0 })
      .set(q("[data-bubble]"), { x: 0 })
      .set(q("[data-sel]"), { opacity: 0 })
      .to(q("[data-sel]"), { opacity: 1, duration: 0.3 }, 0.4)
      .to(q("[data-copied]"), { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.9)
      .to(q("[data-copied]"), { opacity: 0, duration: 0.3 }, 1.9)
      .to(q("[data-chip]"), { opacity: 1, duration: 0.2 }, 1.5)
      .to(q("[data-chip]"), { x: () => (q("[data-dest]") as HTMLElement).getBoundingClientRect().left - (q("[data-chip]") as HTMLElement).getBoundingClientRect().left, y: () => (q("[data-dest]") as HTMLElement).getBoundingClientRect().top - (q("[data-chip]") as HTMLElement).getBoundingClientRect().top, duration: 1, ease: "power3.inOut" }, 1.6)
      .to(q("[data-chip]"), { opacity: 0, scale: 0.8, duration: 0.2 }, 2.55)
      .to(q("[data-bubble]"), { x: () => (q("[data-tab2]") as HTMLElement).offsetLeft - (q("[data-tab0]") as HTMLElement).offsetLeft, duration: 0.55, ease: "back.out(1.6)" }, 2.4)
      .to(q("[data-item]"), { opacity: 1, y: 0, height: "auto", duration: 0.5, ease: "power3.out" }, 2.55)
      .to(q("[data-sel]"), { opacity: 0, duration: 0.3 }, 3.4)
      .to(q("[data-bubble]"), { x: 0, duration: 0.6, ease: "back.out(1.4)" }, 4.6)
      .to(q("[data-item]"), { opacity: 0, duration: 0.4 }, 4.8)
      .to({}, { duration: 0.6 });
  });

  return (
    <div ref={ref} className="relative flex h-full w-full items-center justify-center gap-[6%] px-[6%]">
      {/* PC */}
      <div className="relative aspect-[16/10] w-[56%] rounded-[14px] bg-[#0b0b0c] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3a3a3c]" />
          <span className="h-2 w-2 rounded-full bg-[#3a3a3c]" />
          <span className="h-2 w-2 rounded-full bg-[#3a3a3c]" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-[70%] rounded bg-[#2c2c2e]" />
          <div className="relative h-2 w-[86%] rounded bg-[#2c2c2e]">
            <span data-sel className="absolute inset-y-[-3px] left-[18%] w-[52%] rounded bg-[rgba(47,95,255,0.45)]" />
          </div>
          <div className="h-2 w-[60%] rounded bg-[#2c2c2e]" />
          <div className="h-2 w-[78%] rounded bg-[#2c2c2e]" />
        </div>
        <span data-copied className="absolute bottom-3 left-1/2 -translate-x-1/2 scale-90 rounded-full bg-[#1c1c1e] px-2.5 py-1 text-[10px] text-ink opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
          Ctrl C
        </span>
        <span data-chip className="absolute left-[34%] top-[46%] flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] text-white opacity-0">
          <Clipboard size={10} strokeWidth={2} /> 1 KB
        </span>
      </div>
      {/* Telefono */}
      <div className="relative aspect-[9/19] w-[24%] overflow-hidden rounded-[22px] bg-black p-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
        <div className="mt-3 space-y-1.5 px-1">
          <div data-dest className="overflow-hidden">
            <div data-item className="flex items-center gap-1.5 overflow-hidden rounded-[8px] bg-[#1c1c1e] p-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent-on-subtle)]">
                <Clipboard size={8} strokeWidth={2} />
              </span>
              <span className="h-1.5 flex-1 rounded bg-[#3a3a3c]" />
            </div>
          </div>
          {[FileText, ImageIcon, Headphones].map((I, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-[8px] bg-[#1c1c1e] p-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2c2c2e] text-ink-2">
                <I size={8} strokeWidth={2} />
              </span>
              <span className="h-1.5 flex-1 rounded bg-[#2c2c2e]" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-1.5 bottom-2 flex h-6 items-center rounded-full bg-[#121214] px-0.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          <span data-bubble className="absolute left-0.5 h-5 w-[calc((100%-4px)/4)] rounded-full bg-[rgba(157,182,240,0.14)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]" />
          {[House, MonitorSmartphone, Clipboard, Settings].map((I, i) => (
            <span key={i} data-tab0={i === 0 ? "" : undefined} data-tab2={i === 2 ? "" : undefined} className="relative flex flex-1 items-center justify-center text-ink-2">
              <I size={9} strokeWidth={2} />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
