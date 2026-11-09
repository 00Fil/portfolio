/**
 * Forme decorative per i nastri di testo, nello spirito della home di GSAP ma disegnate da zero:
 * solo toni dell'azzurro cielo, con una luce in alto a sinistra perché sembrino oggetti e non icone.
 */
export type ShapeKind = "star" | "flower" | "squiggle" | "ring" | "pill" | "blob" | "moon" | "burst";

const Grad = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#d9f2ff" />
      <stop offset=".45" stopColor="#5ec4ff" />
      <stop offset="1" stopColor="#1f7fb8" />
    </linearGradient>
    <radialGradient id={`${id}-h`} cx=".3" cy=".25" r=".5">
      <stop offset="0" stopColor="#fff" stopOpacity=".7" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const burst = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const r = i % 2 ? 30 : 48;
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
})();

export function Shape({ kind, id, className = "" }: { kind: ShapeKind; id: string; className?: string }) {
  const g = `url(#${id}-g)`;
  const h = `url(#${id}-h)`;
  const body = (() => {
    switch (kind) {
      case "star":
        return (
          <>
            <path d="M50 2C54 38 62 46 98 50C62 54 54 62 50 98C46 62 38 54 2 50C38 46 46 38 50 2Z" fill={g} />
            <path d="M50 2C54 38 62 46 98 50C62 54 54 62 50 98C46 62 38 54 2 50C38 46 46 38 50 2Z" fill={h} />
          </>
        );
      case "flower":
        return (
          <>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <circle key={i} cx={50 + 28 * Math.cos(a)} cy={50 + 28 * Math.sin(a)} r="19" fill={g} />;
            })}
            <circle cx="50" cy="50" r="48" fill={h} />
            <circle cx="50" cy="50" r="17" fill="#d9f2ff" />
          </>
        );
      case "squiggle":
        return <path d="M8 62C18 22 34 22 42 50S66 82 76 46 92 30 94 38" fill="none" stroke={g} strokeWidth="15" strokeLinecap="round" />;
      case "ring":
        return (
          <>
            <circle cx="50" cy="50" r="34" fill="none" stroke={g} strokeWidth="22" />
            <circle cx="50" cy="50" r="34" fill="none" stroke={h} strokeWidth="22" />
          </>
        );
      case "pill":
        return (
          <g transform="rotate(-28 50 50)">
            <rect x="6" y="30" width="88" height="40" rx="20" fill={g} />
            <rect x="6" y="30" width="44" height="40" rx="20" fill="#d9f2ff" opacity=".9" />
            <rect x="6" y="30" width="88" height="40" rx="20" fill={h} />
          </g>
        );
      case "blob":
        return (
          <>
            <path d="M52 6C72 6 94 20 94 46S78 94 50 94 6 76 8 50 30 6 52 6Z" fill={g} />
            <path d="M52 6C72 6 94 20 94 46S78 94 50 94 6 76 8 50 30 6 52 6Z" fill={h} />
          </>
        );
      case "moon":
        return (
          <>
            <path d="M6 50A44 44 0 0 1 94 50Z" fill={g} />
            <path d="M6 58A44 44 0 0 0 94 58Z" fill="#d9f2ff" opacity=".85" />
          </>
        );
      case "burst":
        return (
          <>
            <polygon points={burst} fill={g} />
            <polygon points={burst} fill={h} />
          </>
        );
    }
  })();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <Grad id={id} />
      {body}
    </svg>
  );
}
