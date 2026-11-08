"use client";

import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { play } from "@/lib/sound";

type Props = {
  slug: string;
  className: string;
  aspect: string;
  headline: string;
  context: string;
  tags: string[];
  view: string;
  label: string;
  children: ReactNode;
};

/** Un lavoro: anteprima viva del prodotto, sotto le etichette, il risultato come titolo e il contesto. */
export function WorkTile({ slug, className, aspect, headline, context, tags, view, label, children }: Props) {
  return (
    <Link href={`/lavori/${slug}`} aria-label={label} onClick={() => play("open")} className={`group block ${className}`}>
      <div className={`relative overflow-hidden rounded-[28px] bg-surface ${aspect}`}>
        <div className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.015]">{children}</div>
        <span className="drop float-glass t-foot absolute right-4 top-4 inline-flex h-9 translate-y-1 items-center gap-1.5 px-3.5 font-medium text-ink opacity-0 transition-[opacity,transform] duration-300 ease-[var(--ease-out)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
          {view}
          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden />
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="t-foot rounded-full bg-sunken px-2.5 py-0.5 text-ink-2">
            {t}
          </span>
        ))}
      </div>
      <h3 className="t-title3 mt-3 max-w-[30ch] text-ink transition-colors group-hover:text-white">{headline}</h3>
      <p className="mt-1.5 text-ink-3">{context}</p>
    </Link>
  );
}
