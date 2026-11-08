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
  return (
    <Reveal as="section" id="stack" className="mx-auto w-full max-w-[1200px] px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead index="02" title={t("title")} lead={t("lead")} />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" data-stagger>
        {GROUPS.map((g) => {
          const GI = g.icon;
          return (
            <article key={g.key} className={`plate p-5 sm:p-6 ${g.wide ? "lg:col-span-2" : ""}`}>
              <header className="mb-6 flex items-center gap-3">
                <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-accent-subtle text-accent-on-subtle">
                  <GI size={20} strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="font-medium text-ink">{t(`groups.${g.key}`)}</h3>
                <span className="t-label t-fig ml-auto text-ink-3">{String(g.items.length).padStart(2, "0")}</span>
              </header>
              <ul className={`grid gap-2 ${g.wide ? "sm:grid-cols-2" : ""}`}>
                {g.items.map((it) => (
                  <li key={it.name} className="flex items-center gap-3 rounded-[14px] bg-canvas/40 p-2 pr-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-sunken text-ink">
                      <TechIcon item={it} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-ink">{it.name}</span>
                      <span className="t-foot block truncate text-ink-3">{usedIn(it.match).join(" · ")}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </Reveal>
  );
}
