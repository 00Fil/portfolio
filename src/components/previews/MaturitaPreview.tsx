"use client";

import { Calendar, Compass, Folder, Map, Presentation, Server } from "lucide-react";
import { useLoop } from "./useLoop";

const DOCK = [Folder, Presentation, Calendar, Map, Server, Compass];

/** maturita-2k26: il cursore passa sul dock, che si ingrandisce; si apre la finestra del capitolo. */
export function MaturitaPreview() {
  const ref = useLoop<HTMLDivElement>((root, tl) => {
    const icons = Array.from(root.querySelectorAll<HTMLElement>("[data-dock]"));
    const win = root.querySelector("[data-win]");
    tl.set(win, { opacity: 0, scale: 0.6, transformOrigin: "30% 100%" }).set(icons, { scale: 1, y: 0 });
    const sweep = { x: -1 };
    tl.to(sweep, {
      x: icons.length,
      duration: 2.2,
      ease: "sine.inOut",
      onUpdate: () => {
        icons.forEach((el, i) => {
          const d = Math.abs(i - sweep.x);
          const s = 1 + Math.max(0, 1 - d / 1.6) * 0.55;
          el.style.transform = `translateY(${-(s - 1) * 14}px) scale(${s})`;
        });
      },
    }, 0.3)
      .to(icons[1], { y: -10, duration: 0.18, yoyo: true, repeat: 3, ease: "power1.out" }, 2.7)
      .to(win, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.4)" }, 3.2)
      .to(win, { opacity: 0, scale: 0.9, duration: 0.35 }, 5.6)
      .to({}, { duration: 0.4 });
  });

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden">
      <div className="flex h-6 items-center gap-3 bg-[rgba(28,28,30,0.7)] px-4 text-[10px] text-ink-2">
        <span className="font-medium text-ink">PCTO</span>
        <span>File</span>
        <span>Vista</span>
        <span className="t-fig ml-auto">10:00</span>
      </div>
      <div data-win className="absolute left-[14%] top-[16%] w-[52%] rounded-[10px] bg-[#1c1c1e] shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-1 px-2.5 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[9px] text-ink-3">2 · CS Metal Europe</span>
        </div>
        <div className="space-y-1.5 px-3 pb-3">
          <div className="t-serif text-[18px] leading-5 text-ink">240 ore</div>
          <div className="h-1.5 w-[80%] rounded bg-[#2c2c2e]" />
          <div className="h-1.5 w-[64%] rounded bg-[#2c2c2e]" />
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-end gap-2 rounded-[14px] bg-[rgba(28,28,30,0.75)] px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
        {DOCK.map((I, i) => (
          <span key={i} data-dock className="flex h-8 w-8 origin-bottom items-center justify-center rounded-[9px] bg-[#2c2c2e] text-ink">
            <I size={15} strokeWidth={1.6} />
          </span>
        ))}
      </div>
    </div>
  );
}
