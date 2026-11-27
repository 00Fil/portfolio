import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/nav/SiteNav";
import { KINDS, KIND_LABEL, reportBySlug, type Entry } from "@/lib/admin-store";
import s from "./report.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = reportBySlug((await params).slug);
  return { title: r?.title ?? "Documento", robots: { index: false, follow: false } };
}

const TEST_COLOR: Record<Entry["test"], string> = { collaudato: "#30d158", parziale: "#f5a524", "da collaudare": "#e5484d", "n/a": "rgba(255,255,255,.35)" };
const STATE_COLOR: Record<string, string> = { aperto: "#e5484d", risolto: "#30d158", rinviato: "#f5a524" };
const SEV_COLOR: Record<string, string> = { critica: "#e5484d", alta: "#ff8a3d", media: "#f5a524", bassa: "#5ec4ff" };

const Dot = ({ c, children }: { c: string; children: React.ReactNode }) => (
  <span className={s.st}>
    <i className={s.dot} style={{ background: c }} />
    {children}
  </span>
);

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

export default async function ReportPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const r = reportBySlug(slug);
  if (!r) notFound();
  setRequestLocale(locale);

  const n = r.entries.length;
  const count = (t: Entry["test"]) => r.entries.filter((e) => e.test === t).length;
  const testable = n - count("n/a");
  const pct = testable ? Math.round((count("collaudato") / testable) * 100) : 0;
  const open = r.entries.filter((e) => e.state === "aperto").length;
  const todo = count("da collaudare");

  return (
    <>
      <main id="main" className={s.page}>
        <div className={s.wrap}>
          <p className={s.eyebrow}>Documento tecnico{r.project ? ` · ${r.project}` : ""}</p>
          <h1 className={s.title}>{r.title}</h1>
          <div className={s.meta}>
            <Dot c={r.status === "rilasciato" ? "#30d158" : "#f5a524"}>
              <b>{r.status === "rilasciato" ? "Rilasciato" : "Bozza"}</b>
            </Dot>
            {r.version && <span className={s.mono}>{r.version}</span>}
            <span>{fmt(r.date)}</span>
            {r.env && <span>{r.env}</span>}
          </div>

          <div className={s.tiles}>
            <div className={`${s.glass} ${s.tile}`}>
              <div className={s.k}>Voci</div>
              <div className={s.v}>{n}</div>
            </div>
            <div className={`${s.glass} ${s.tile}`}>
              <div className={s.k}>Collaudate</div>
              <div className={s.v}>{pct}%</div>
            </div>
            <div className={`${s.glass} ${s.tile}`}>
              <div className={s.k}>Aperte</div>
              <div className={s.v}>{open}</div>
            </div>
            <div className={`${s.glass} ${s.tile}`}>
              <div className={s.k}>Da collaudare</div>
              <div className={s.v}>{todo}</div>
            </div>
          </div>

          {r.summary && <p className={s.sum}>{r.summary}</p>}

          {n > 0 && (
            <div className={`${s.glass} ${s.cov}`}>
              <div className={s.bar} role="img" aria-label="Copertura collaudi">
                {(["collaudato", "parziale", "da collaudare", "n/a"] as const).map((t) => (count(t) ? <i key={t} style={{ width: `${(count(t) / n) * 100}%`, background: TEST_COLOR[t] }} /> : null))}
              </div>
              <div className={s.legend}>
                {(["collaudato", "parziale", "da collaudare", "n/a"] as const).map((t) => (
                  <Dot key={t} c={TEST_COLOR[t]}>
                    {t} <b>{count(t)}</b>
                  </Dot>
                ))}
              </div>
            </div>
          )}

          {KINDS.map((k) => {
            const list = r.entries.filter((e) => e.kind === k);
            if (!list.length) return null;
            return (
              <section key={k} className={s.group}>
                <div className={s.gh}>
                  <h2>{KIND_LABEL[k]}</h2>
                  <span>{list.length}</span>
                </div>
                <ul className={s.list}>
                  {list.map((e) => (
                    <li key={e.id} className={`${s.glass} ${s.row}`}>
                      <div>
                        <h3>{e.title}</h3>
                        {e.detail && <p>{e.detail}</p>}
                        {e.evidence && <p className={s.ev}>{e.evidence}</p>}
                        {(e.area || e.commit) && (
                          <div className={`${s.tags} ${s.mono}`}>
                            {e.area && <span>{e.area}</span>}
                            {e.commit && <span>{e.commit}</span>}
                          </div>
                        )}
                      </div>
                      <div className={s.side}>
                        <Dot c={TEST_COLOR[e.test]}>{e.test === "n/a" ? "Collaudo n/a" : e.test === "da collaudare" ? "Da collaudare" : e.test === "collaudato" ? "Collaudato" : "Collaudo parziale"}</Dot>
                        {e.state && <Dot c={STATE_COLOR[e.state]}>{e.state[0].toUpperCase() + e.state.slice(1)}</Dot>}
                        {e.severity && <Dot c={SEV_COLOR[e.severity]}>Gravità {e.severity}</Dot>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}

          <p className={s.foot}>Filippo Corsini · aggiornato {fmt(r.updated.slice(0, 10))}</p>
        </div>
      </main>
      <SiteNav detail={{ title: r.title, section: "home" }} plain />
    </>
  );
}
