import { profile } from "@/content/profile";
import { GradientText } from "@/components/ui/GradientText";

export const LOGO_COLORS = ["#1f8fd0", "#5ec4ff", "#2f6fe0", "#8fd8ff"];

/** Il nome come logo: font del marchio, sempre con lo stesso gradiente. La dimensione la decide chi lo usa (font-size). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`whitespace-nowrap normal-case leading-[1.1] ${className}`} style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontSize: "var(--logo-size, 26px)", fontWeight: 400, fontSynthesis: "none", letterSpacing: "normal", fontFeatureSettings: '"calt","liga","ss02"' }}>
      <GradientText colors={LOGO_COLORS} animationSpeed={10} variant="flow" glow={0.6}>
        {profile.name}
      </GradientText>
    </span>
  );
}
