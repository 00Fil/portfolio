"use client";

import { Cover } from "@/components/work/Covers";
import { Shape, type ShapeKind } from "@/components/visual/Shapes";

/**
 * Un pezzo dei nastri di testo: parola, copertina di un progetto (@slug) o forma (#tipo).
 * "*parola" va in corsivo azzurro. Le forme portano data-shape per le animazioni.
 */
export function Piece({ tok, k }: { tok: string; k: string }) {
  if (tok.startsWith("@")) {
    return (
      <span data-cov className="relative mx-[0.12em] inline-block h-[0.78em] w-[1.25em] shrink-0 overflow-hidden rounded-[0.16em] align-middle shadow-[0_0_0_1px_rgba(255,255,255,.1),0_20px_40px_-20px_rgba(0,0,0,.9)]">
        <Cover slug={tok.slice(1)} mini />
      </span>
    );
  }
  if (tok.startsWith("#")) {
    return (
      <span data-shape className="mx-[0.1em] inline-block h-[0.82em] w-[0.82em] shrink-0 align-middle">
        <span data-shape-in className="block h-full w-full">
          <Shape kind={tok.slice(1) as ShapeKind} id={`sh-${k}`} className="h-full w-full" />
        </span>
      </span>
    );
  }
  const em = tok.startsWith("*");
  return <span className={`mx-[0.12em] shrink-0 whitespace-nowrap ${em ? "t-serif italic text-[var(--sky)]" : ""}`}>{em ? tok.slice(1) : tok}</span>;
}
