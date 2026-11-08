"use client";

import { useEffect, useState } from "react";
import { lensMap } from "@/lib/glass";

export type LensParams = {
  id: string;
  width: number;
  height: number;
  radius: number;
  /** Larghezza della fascia che piega la luce. */
  edge: number;
  /** Spostamento massimo sul bordo, in px. */
  amount: number;
  /** 0..1: separazione dei colori. */
  aberr: number;
  sat: number;
};

/**
 * Filtro SVG equivalente a GLASS_AGSL: tre spostamenti (uno per canale, scale diverse = aberrazione cromatica),
 * ricomposti, poi saturazione. La mappa viene dalla stessa formula dello shader.
 */
export function LensFilter({ id, width, height, radius, edge, amount, aberr, sat }: LensParams) {
  const [map, setMap] = useState("");
  useEffect(() => {
    if (width > 2 && height > 2) setMap(lensMap(width, height, radius, edge));
  }, [width, height, radius, edge]);

  const s = (k: number) => (2 * amount * k).toFixed(2);
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
      <filter
        id={id}
        x="0"
        y="0"
        width={width}
        height={height}
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        {map && <feImage href={map} x="0" y="0" width={width} height={height} preserveAspectRatio="none" result="map" />}
        <feDisplacementMap in="SourceGraphic" in2="map" scale={s(1 + aberr)} xChannelSelector="R" yChannelSelector="G" result="dr" />
        <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={s(1)} xChannelSelector="R" yChannelSelector="G" result="dg" />
        <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={s(1 - aberr)} xChannelSelector="R" yChannelSelector="G" result="db" />
        <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feComposite in="r" in2="g" operator="arithmetic" k2="1" k3="1" result="rg" />
        <feComposite in="rg" in2="b" operator="arithmetic" k2="1" k3="1" result="rgb" />
        <feColorMatrix in="rgb" type="saturate" values={String(sat)} />
      </filter>
    </svg>
  );
}
