import { useTranslations } from "next-intl";
import {
  AppWindow,
  AudioLines,
  Cable,
  Container,
  Database,
  LayoutTemplate,
  Network,
  Server,
  Sigma,
  Smartphone,
  Waypoints,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { projects } from "@/content/projects";
import { BRAND } from "@/content/brand-icons";
import { SectionHead } from "./SectionHead";
import { Marquee } from "@/components/motion/Marquee";

type Item = { name: string; match: string; brand?: keyof typeof BRAND; icon?: LucideIcon };
type Group = { key: "mobile" | "frontend" | "backend" | "data" | "infra"; icon: LucideIcon; wide?: boolean; items: Item[] };

const GROUPS: Group[] = [
  {
    key: "mobile",
    icon: Smartphone,
    items: [
      { name: "Kotlin", match: "Kotlin", brand: "kotlin" },
      { name: "Jetpack Compose", match: "Jetpack Compose", brand: "compose" },
      { name: "C# / .NET", match: "C#", brand: "dotnet" },
      { name: "WinUI 3", match: "WinUI 3", icon: AppWindow },
    ],
  },
  {
    key: "frontend",
    icon: LayoutTemplate,
    items: [
      { name: "Next.js", match: "Next.js", brand: "nextjs" },
      { name: "React", match: "Next.js", brand: "react" },
      { name: "shadcn/ui", match: "shadcn/ui", brand: "shadcn" },
      { name: "KaTeX", match: "KaTeX", icon: Sigma },
    ],
  },
  {
    key: "backend",
    icon: Server,
    items: [
      { name: "Node.js", match: "Node.js", brand: "node" },
      { name: "WebSocket", match: "WebSocket", icon: Cable },
      { name: "Python", match: "Python", brand: "python" },
      { name: "FastAPI", match: "FastAPI", brand: "fastapi" },
      { name: "PHP", match: "PHP", brand: "php" },
    ],
  },
  {
    key: "data",
    icon: Database,
    wide: true,
    items: [
      { name: "Supabase", match: "Supabase", brand: "supabase" },
      { name: "SQLite", match: "SQLite", brand: "sqlite" },
      { name: "MySQL", match: "MySQL", brand: "mysql" },
      { name: "OR-Tools CP-SAT", match: "OR-Tools", icon: Network },
      { name: "Gemini", match: "Gemini", brand: "gemini" },
      { name: "faster-whisper", match: "faster-whisper", icon: AudioLines },
    ],
  },
  {
    key: "infra",
    icon: Cloud,
    items: [
      { name: "Docker Compose", match: "Docker Compose", brand: "docker" },
      { name: "Dokploy", match: "Dokploy", icon: Container },
      { name: "Caddy", match: "Caddy", brand: "caddy" },
      { name: "Headscale", match: "Headscale", icon: Waypoints },
      { name: "GitHub Actions", match: "GitHub Actions", brand: "githubactions" },
    ],
  },
];

const usedIn = (match: string) => projects.filter((p) => p.stack.some((s) => s.startsWith(match))).map((p) => p.name);

function TechIcon({ item }: { item: Item }) {
  if (item.brand) {
    const b = BRAND[item.brand];
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="currentColor">
        <path d={b.path} />
      </svg>
    );
  }
  const I = item.icon!;
  return <I size={18} strokeWidth={1.6} aria-hidden />;
}

export function Stack() {
  const t = useTranslations("stack");
  const all = GROUPS.flatMap((g) => g.items);
  const half = Math.ceil(all.length / 2);
  const rows = [all.slice(0, half), all.slice(half)];
  return (
    <section id="stack" className="py-24 sm:py-32">
      <Reveal className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <SectionHead index="02" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="space-y-4 sm:space-y-6">
        {rows.map((row, r) => (
          <Marquee key={r} direction={r === 0 ? -1 : 1}>
            {row.map((it) => (
              <span key={it.name} className="mr-10 inline-flex shrink-0 items-center gap-3 text-ink sm:mr-16 sm:gap-4">
                <span className="scale-[1.4] text-ink-2 sm:scale-[1.8]">
                  <TechIcon item={it} />
                </span>
                <span className="whitespace-nowrap text-[26px] font-medium leading-[1.25] tracking-[-0.02em] sm:text-[44px]">{it.name}</span>
              </span>
            ))}
          </Marquee>
        ))}
      </div>
      <Reveal className="mx-auto mt-16 grid w-full max-w-[1280px] gap-x-8 gap-y-8 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-5">
        {GROUPS.map((g) => {
          const GI = g.icon;
          return (
            <div key={g.key} data-reveal>
              <p className="mb-3 inline-flex items-center gap-2 text-ink">
                <GI size={16} strokeWidth={1.6} aria-hidden className="text-accent-on-subtle" />
                <span className="font-medium">{t(`groups.${g.key}`)}</span>
              </p>
              <ul className="space-y-1.5">
                {g.items.map((it) => (
                  <li key={it.name} className="text-ink-2">
                    {it.name}
                    <span className="t-foot ml-2 text-ink-3">{usedIn(it.match).join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
