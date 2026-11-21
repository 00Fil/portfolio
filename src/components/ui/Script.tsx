import { Fragment } from "react";
import { GradientText } from "@/components/ui/GradientText";
import { LOGO_COLORS } from "@/components/nav/Wordmark";

/** Testo con le parole tra asterischi nel font del marchio, in gradiente azzurro (come il nome). La punteggiatura che segue entra nel tratto. */
export function Script({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2) {
          const m = /^[.,!?;:]+/.exec(parts[i + 1] ?? "");
          return (
            <span key={i} data-script className="inline-block" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.45em 0.34em 0.5em", margin: "-0.45em -0.34em -0.5em" }}>
              <GradientText colors={LOGO_COLORS} animationSpeed={8} variant="flow" glow={1}>
                {p + (m ? m[0] : "")}
              </GradientText>
            </span>
          );
        }
        const lead = /^[.,!?;:]+/.exec(p);
        return <Fragment key={i}>{i > 0 && lead ? p.slice(lead[0].length) : p}</Fragment>;
      })}
    </>
  );
}
