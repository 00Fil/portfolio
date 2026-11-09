/** Colore e tema di ogni progetto: la home e la pagina del progetto passano a questi colori. */
export type Theme = { bg: string; fg: string; fg2: string; acc: string; onAcc: string; surface: string; sunken: string; light: boolean };

export const THEMES: Record<string, Theme> = {
  creacloud: { bg: "#F2EEE6", fg: "#121212", fg2: "#5c5a55", acc: "#0E9F6E", onAcc: "#ffffff", surface: "#E8E2D6", sunken: "#DDD6C8", light: true },
  relay: { bg: "#05070F", fg: "#F2F2F0", fg2: "#9a9caa", acc: "#4D7CFF", onAcc: "#ffffff", surface: "#11141f", sunken: "#1c2030", light: false },
  unispace: { bg: "#EDEBFF", fg: "#14112B", fg2: "#5d5980", acc: "#FF5A1F", onAcc: "#ffffff", surface: "#E0DDF7", sunken: "#D3CFF0", light: true },
};

export const DARK: Theme = { bg: "#000000", fg: "#F2F2F0", fg2: "#A6A6A1", acc: "#5ec4ff", onAcc: "#000000", surface: "#1c1c1e", sunken: "#2c2c2e", light: false };

/** Variabili per ridipingere i token Canone dentro un contenitore. */
export const tokenVars = (t: Theme) =>
  ({
    "--bg-canvas": t.bg,
    "--bg-surface": t.surface,
    "--bg-sunken": t.sunken,
    "--label-primary": t.fg,
    "--label-secondary": t.fg2,
    "--label-tertiary": t.fg2,
    "--line-separator": t.sunken,
    "--line-strong": t.sunken,
    "--accent": t.acc,
    "--sky": t.acc,
    "--accent-subtle": t.light ? t.sunken : "#11244f",
    "--accent-on-subtle": t.light ? t.fg : "#b4d2ff",
    "--drop-veil": t.light ? "rgba(0,0,0,0.06)" : "rgba(157,182,240,0.09)",
    "--drop-edge": t.light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.14)",
    colorScheme: t.light ? "light" : "dark",
    background: t.bg,
    color: t.fg,
  }) as React.CSSProperties;
