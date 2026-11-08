"use client";

import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useDrop } from "@/components/glass/useDrop";
import { play } from "@/lib/sound";

type Props = { slug: string; index: string; name: string; line: string; year: string; stack: string[]; open: string };

/** Riga di Lavori: non si muove, si illumina dove la premi (dropClickable) e segue il cursore con un riflesso tenue. */
export function WorkRow({ slug, index, name, line, year, stack, open }: Props) {
  const { ref } = useDrop<HTMLAnchorElement>({ deform: [0, 0], bevel: false, sound: false });
  return (
    <Link
      ref={ref}
      href={`/lavori/${slug}`}
      aria-label={open}
      onClick={() => play("open")}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--hx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--hy", `${e.clientY - r.top}px`);
      }}
      className="work-row plate press-glow spot group grid grid-cols-[40px_1fr_auto] items-baseline gap-x-4 gap-y-2 px-5 py-6 sm:grid-cols-[56px_minmax(160px,1.1fr)_2fr_64px_24px] sm:px-7 sm:py-8"
    >
      <span className="t-label t-fig text-ink-3">{index}</span>
      <span className="t-title3 text-ink">{name}</span>
      <span className="t-fig t-foot text-ink-3 sm:hidden">{year}</span>
      <span className="col-span-3 col-start-1 text-ink-2 sm:col-span-1 sm:col-start-auto">
        {line}
        <span className="t-label mt-3 block text-ink-3">{stack.slice(0, 4).join(" · ")}</span>
      </span>
      <span className="t-fig t-foot hidden text-ink-3 sm:block">{year}</span>
      <ArrowUpRight
        size={20}
        strokeWidth={1.6}
        aria-hidden
        className="hidden self-center text-ink-3 transition-[transform,color] duration-200 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink sm:block"
      />
    </Link>
  );
}
