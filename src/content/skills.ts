import * as si from "simple-icons";

/** Una competenza: nome e, se esiste, il marchio da Simple Icons. */
export type Skill = { name: string; path?: string };
type Icon = { path: string };
const k = (name: string, icon?: Icon): Skill => ({ name, path: icon?.path });

/** Competenze per area, come le chiede un annuncio da software engineer. Le etichette delle aree sono nei messaggi. */
export const SKILL_GROUPS: { key: string; items: Skill[] }[] = [
  {
    key: "languages",
    items: [
      k("TypeScript", si.siTypescript),
      k("JavaScript", si.siJavascript),
      k("Python", si.siPython),
      k("Kotlin", si.siKotlin),
      k("C#", si.siDotnet),
      k("Java", si.siOpenjdk),
      k("C", si.siC),
      k("C++", si.siCplusplus),
      k("PHP", si.siPhp),
      k("SQL", si.siPostgresql),
      k("Bash", si.siGnubash),
    ],
  },
  {
    key: "frontend",
    items: [k("React", si.siReact), k("Next.js", si.siNextdotjs), k("Tailwind CSS", si.siTailwindcss), k("HTML5", si.siHtml5), k("CSS", si.siCss), k("GSAP", si.siGsap), k("SEO tecnico"), k("Accessibilità WCAG")],
  },
  {
    key: "backend",
    items: [k("Node.js", si.siNodedotjs), k("FastAPI", si.siFastapi), k("REST API"), k("WebSocket", si.siSocketdotio), k("GraphQL", si.siGraphql), k("JWT · OAuth", si.siJsonwebtokens), k("Prisma", si.siPrisma)],
  },
  {
    key: "native",
    items: [k("Android", si.siAndroid), k("iOS · macOS", si.siApple), k("Swift", si.siSwift), k("Jetpack Compose", si.siJetpackcompose), k(".NET · WinUI 3", si.siDotnet), k("Flutter", si.siFlutter), k("Tauri", si.siTauri), k("Coroutines"), k("MVVM")],
  },
  {
    key: "data",
    items: [k("PostgreSQL", si.siPostgresql), k("Supabase", si.siSupabase), k("MySQL", si.siMysql), k("SQLite", si.siSqlite), k("Redis", si.siRedis), k("MongoDB", si.siMongodb)],
  },
  {
    key: "devops",
    items: [k("Docker", si.siDocker), k("Linux", si.siLinux), k("GitHub Actions", si.siGithubactions), k("CI/CD"), k("Caddy", si.siCaddy), k("Nginx", si.siNginx), k("Cloudflare", si.siCloudflare), k("Vercel", si.siVercel)],
  },
  {
    key: "quality",
    items: [k("Git", si.siGit), k("GitHub", si.siGithub), k("Vitest", si.siVitest), k("Jest", si.siJest), k("JUnit", si.siJunit5), k("Playwright"), k("Code review"), k("Postman", si.siPostman)],
  },
  {
    key: "foundations",
    items: [k("Algoritmi e strutture dati"), k("OOP e design pattern"), k("SOLID · Clean Code"), k("Architettura software"), k("Reti e protocolli"), k("Agile · Scrum")],
  },
  {
    key: "ai",
    items: [k("Google Gemini", si.siGooglegemini), k("LLM e prompt"), k("Whisper"), k("OR-Tools"), k("Automazioni")],
  },
];

/** Nastro di marchi in testa alla sezione. */
export const LOGO_STRIP: Skill[] = SKILL_GROUPS.flatMap((g) => g.items).filter((s, i, a) => s.path && a.findIndex((x) => x.name === s.name) === i);
