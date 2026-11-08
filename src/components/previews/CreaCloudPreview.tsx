"use client";

import { Check } from "lucide-react";
import { useLocale } from "next-intl";
import { useLoop } from "./useLoop";

const DAYS = { it: ["Lun", "Mar", "Mer", "Gio", "Ven"], en: ["Mon", "Tue", "Wed", "Thu", "Fri"] };
// [giorno, riga di inizio, durata in mezz'ore]
const SLOTS: [number, number, number][] = [
  [0, 1, 2], [0, 4, 3], [1, 0, 2], [1, 3, 4], [2, 2, 2], [2, 5, 2], [3, 0, 3], [3, 4, 2], [4, 1, 4], [4, 6, 1],
];
const MOVED = 7; // la lezione di giovedì che il messaggio sposta

/** CreaCloud: il solver colloca le lezioni del mese; un messaggio su WhatsApp ne sposta una, il coordinatore approva. */
export function CreaCloudPreview() {
  const locale = useLocale() as "it" | "en";
  const ref = useLoop<HTMLDivElement>((root, tl) => {
    const blocks = root.querySelectorAll("[data-b]");
    const moved = root.querySelector(`[data-b="${MOVED}"]`);
    tl.set(blocks, { opacity: 0, scale: 0.6 })
      .set(root.querySelector("[data-msg]"), { opacity: 0, y: 8 })
      .set(root.querySelector("[data-ok]"), { opacity: 0, scale: 0.6 })
      .set(moved, { y: 0 })
      .to(blocks, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.8)", stagger: { each: 0.12, from: "random" } }, 0.3)
      .to(root.querySelector("[data-msg]"), { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 2.2)
      .to(moved, { y: () => (moved as HTMLElement).offsetHeight * 0.75, duration: 0.6, ease: "back.out(1.4)" }, 3.1)
      .to(root.querySelector("[data-ok]"), { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 3.4)
      .to([blocks, root.querySelector("[data-msg]")], { opacity: 0, duration: 0.4 }, 5.6)
      .to({}, { duration: 0.4 });
  });

  return (
    <div ref={ref} className="relative grid h-full w-full grid-cols-[1fr_34%] gap-[4%] p-[6%]">
      <div className="grid grid-cols-5 gap-1.5">
        {DAYS[locale].map((d, di) => (
          <div key={d} className="flex flex-col">
            <span className="t-label mb-2 text-[9px] text-ink-3">{d}</span>
            <div className="relative flex-1 rounded-[8px] bg-[#0b0b0c] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
              {SLOTS.map(([day, row, len], i) =>
                day === di ? (
                  <span
                    key={i}
                    data-b={i}
                    className="absolute inset-x-1 rounded-[6px] px-1 pt-0.5 text-[8px] leading-[10px] text-[var(--accent-on-subtle)]"
                    style={{ top: `${(row / 8) * 100}%`, height: `calc(${(len / 8) * 100}% - 4px)`, background: i === MOVED ? "var(--accent)" : "var(--accent-subtle)", color: i === MOVED ? "#fff" : undefined }}
                  >
                    {len / 2}h
                  </span>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-end gap-2">
        <div data-msg className="self-start rounded-[12px] rounded-bl-[4px] bg-[#1f2c24] px-2.5 py-2 text-[10px] leading-[14px] text-[#d6efe0]">
          {locale === "it" ? "Giovedì possiamo spostare di un’ora?" : "Can we move Thursday by an hour?"}
        </div>
        <div data-ok className="flex items-center gap-1.5 self-end rounded-full bg-[#1c1c1e] py-1 pl-1 pr-2.5 text-[10px] text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white">
            <Check size={9} strokeWidth={2.6} />
          </span>
          {locale === "it" ? "Approvato" : "Approved"}
        </div>
      </div>
    </div>
  );
}
