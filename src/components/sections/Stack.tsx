import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion/Reveal";
import { BRAND } from "@/content/brand-icons";
import { StackLoop } from "./StackLoop";
import { SectionHead } from "./SectionHead";

/** Con cosa lavoro: una sola fascia di marchi che scorre, divisi per dove girano. */
const ROWS: { key: string; ids: (keyof typeof BRAND)[] }[] = [
  { key: "apps", ids: ["kotlin", "compose", "android", "dotnet", "react", "nextjs", "typescript", "gsap"] },
  { key: "server", ids: ["node", "python", "fastapi", "supabase", "sqlite", "gemini", "docker", "caddy", "githubactions"] },
];

export function Stack() {
  const t = useTranslations("stack");
  return (
    <section id="stack" className="relative pt-24 sm:pt-36">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="03" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="grid gap-4">
        {ROWS.map((r, i) => (
          <StackLoop key={r.key} label={t(`rows.${r.key}`)} items={r.ids.map((id) => ({ id, name: BRAND[id].title, path: BRAND[id].path }))} reverse={i === 1} />
        ))}
      </div>
    </section>
  );
}
