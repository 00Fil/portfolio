"use client";

import type { ReactNode } from "react";
import { Bead } from "@/components/glass/Bead";
import type { EngineId } from "@/content/geo";
import { play } from "@/lib/sound";

const OPENAI_PATH =
  "M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z";

export const ENGINE_PITCH: Record<EngineId, number> = {
  chatgpt: 1,
  gemini: 1.12,
  claude: 1.26,
  perplexity: 1.5,
};

export function BrandMark({
  engine,
  size = 22,
  mono = false,
  className = "",
}: {
  engine: EngineId;
  size?: number | string;
  mono?: boolean;
  className?: string;
}) {
  if (engine === "chatgpt") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={typeof size === "number" ? size : undefined}
        height={typeof size === "number" ? size : undefined}
        className={`${mono ? "fill-current" : "fill-black"} ${className}`}
        style={typeof size === "string" ? { width: size, height: size } : undefined}
        aria-hidden
      >
        <path d={OPENAI_PATH} />
      </svg>
    );
  }
  const src =
    engine === "gemini"
      ? "/visual/brands/gemini.svg"
      : engine === "claude"
        ? "/visual/brands/claude.svg"
        : "/visual/brands/perplexity.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={typeof size === "number" ? size : undefined}
      height={typeof size === "number" ? size : undefined}
      draggable={false}
      className={`block object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function BrandTile({
  engine,
  size = 44,
  sizeClass,
  radius: radiusProp,
  variant = "light",
  className = "",
  interactive = false,
}: {
  engine: EngineId;
  size?: number;
  sizeClass?: string;
  radius?: number;
  variant?: "light" | "glass";
  className?: string;
  interactive?: boolean;
}) {
  const radius = radiusProp ?? Math.round(size * 0.3);
  const tint = variant === "light" ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.11)";

  const inner: ReactNode = sizeClass ? (
    <BrandMark engine={engine} size="56%" mono={variant === "glass" && engine === "chatgpt"} />
  ) : (
    <BrandMark engine={engine} size={Math.round(size * 0.56)} mono={variant === "glass" && engine === "chatgpt"} />
  );

  const bead = (
    <Bead
      aria-hidden
      tint={tint}
      radius={radius}
      className={`inline-flex shrink-0 items-center justify-center shadow-[0_12px_28px_-12px_rgba(0,0,0,.45)] ${
        variant === "light" ? "text-black" : "text-white"
      } ${interactive ? "transition-transform duration-300 ease-[var(--ease-out)] group-hover/tile:-translate-y-0.5 group-hover/tile:scale-105 group-active/tile:scale-95" : ""} ${sizeClass ?? ""} ${className}`}
      style={sizeClass ? undefined : { width: size, height: size }}
    >
      {inner}
    </Bead>
  );

  if (!interactive) return bead;

  return (
    <span
      className="group/tile inline-flex shrink-0 cursor-pointer"
      onMouseEnter={() => play("copy", ENGINE_PITCH[engine])}
      onClick={() => play("copy", ENGINE_PITCH[engine])}
    >
      {bead}
    </span>
  );
}
