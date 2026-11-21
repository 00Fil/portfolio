"use client";

import { Fragment, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { gsap } from "gsap";
import { Bead } from "@/components/glass/Bead";
import { GradientText } from "@/components/ui/GradientText";
import Strands from "@/components/ui/Strands";
import { createVoice, type Voice } from "@/lib/voice";
import { getIntake, type Answers } from "@/content/intake";

type KwC = ComponentType<{ text: string }>;
const PINK = ["#ff00ff", "#ffffff", "#5b00ff", "#ff00c9"];

/** `*parola*` nel carattere della firma, con la sfumatura rosa degli strands. */
function Sub({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} className="inline-block" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.45em 0.34em 0.5em", margin: "-0.45em -0.34em -0.5em" }}>
            <GradientText colors={PINK} animationSpeed={8} variant="flow" glow={0.8}>
              {p}
            </GradientText>
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

const reading = (t: string) => Math.max(1800, t.length * 62);

/**
 * L'assistente si presenta con la bolla degli strands al centro (la voce ne muove la luce), poi la bolla si apre in una card
 * con le domande; il bordo luminoso ha gli stessi colori e reagisce alla voce. Le risposte personalizzano il video.
 */
export function FilmIntake({ en, K, onDone, onSkip }: { en: boolean; K: KwC; onDone: (a: Answers, sound: boolean) => void; onSkip: (sound: boolean) => void }) {
  const C = getIntake(en);
  const [phase, setPhase] = useState<"intro" | "form" | "busy">("intro");
  const [sub, setSub] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  const [muted, setMuted] = useState(false);
  const [light, setLight] = useState(true);
  const level = useRef({ current: 0 });
  const voice = useRef<Voice | null>(null);
  const mutedRef = useRef(false);
  const ans = useRef<Partial<Answers>>({});
  const orb = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const src = (n: string) => (en || !n ? null : `/intake/${n}.mp3`);

  useEffect(() => {
    const read = () => setLight(document.documentElement.dataset.theme === "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);

  // presentazione: una frase alla volta, sottotitolata; poi la bolla diventa card e arriva la prima domanda
  useEffect(() => {
    const v = createVoice(level.current);
    voice.current = v;
    let dead = false;
    (async () => {
      await new Promise((r) => setTimeout(r, 700));
      for (const l of C.intro) {
        if (dead) return;
        setSub(l.t);
        await v.say(src(l.audio), reading(l.t));
        if (dead) return;
        setSub(null);
        await new Promise((r) => setTimeout(r, 380));
      }
      if (dead) return;
      setPhase("form");
      await new Promise((r) => setTimeout(r, 900));
      if (!dead) void v.say(src(C.steps[0].audio), 1500);
    })();
    return () => {
      dead = true;
      v.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!subRef.current || !sub) return;
    gsap.fromTo(subRef.current, { autoAlpha: 0, y: 16, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" });
  }, [sub]);

  // la bolla si espande nella card
  useEffect(() => {
    if (phase !== "form" || !card.current) return;
    const tl = gsap.timeline();
    if (orb.current) tl.to(orb.current, { scale: 2.6, autoAlpha: 0, duration: 0.8, ease: "power3.in" }, 0);
    tl.fromTo(card.current, { scale: 0.22, autoAlpha: 0, filter: "blur(14px)" }, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 1.0, ease: "expo.out" }, 0.25);
    return () => void tl.kill();
  }, [phase]);

  // ogni domanda entra con un respiro
  useEffect(() => {
    if (phase === "intro" || !body.current) return;
    gsap.fromTo(body.current.querySelectorAll("[data-in]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06, overwrite: true, delay: step === 0 && phase === "form" ? 0.7 : 0 });
  }, [step, phase]);

  // il bagliore del bordo segue la voce
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (glow.current) glow.current.style.setProperty("--lv", String(Math.min(1, level.current.current)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    voice.current?.mute(mutedRef.current);
  };
  const finish = async (a: Answers) => {
    setPhase("busy");
    const v = voice.current;
    v?.cut();
    await v?.say(src(C.done), 1100);
    window.setTimeout(() => onDone(a, !mutedRef.current), 250);
  };
  const answer = (id: keyof Answers, val: string) => {
    ans.current = { ...ans.current, [id]: val };
    if (step + 1 < C.steps.length) {
      setStep(step + 1);
      setText("");
      voice.current?.cut();
      void voice.current?.say(src(C.steps[step + 1].audio), 1500);
    } else void finish(ans.current as Answers);
  };

  const cur = C.steps[step];
  const btn = "cine-fg flex min-h-[64px] w-full items-center justify-center rounded-[24px] px-4 text-center text-[18px] font-medium leading-[1.2] tracking-[-0.01em] transition-transform active:scale-[.98] max-sm:min-h-[52px] max-sm:text-[16px]";
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[color-mix(in_srgb,var(--bg-canvas)_45%,transparent)] px-5 backdrop-blur-2xl">
      <div className="absolute right-4 top-4 flex gap-2.5 max-sm:right-3 max-sm:top-3">
        <Bead as="button" type="button" radius={999} onClick={toggleMute} aria-label={muted ? "Audio" : "Mute"} className="cine-fg flex h-11 w-11 items-center justify-center">
          {muted ? <VolumeX size={19} strokeWidth={1.8} aria-hidden /> : <Volume2 size={19} strokeWidth={1.8} aria-hidden />}
        </Bead>
      </div>

      {phase === "intro" && (
        <>
          <div ref={orb} className="relative aspect-square w-[min(40vh,360px,74vw)]">
            <Strands colors={PINK} lightMode={light} levelRef={level.current} energy={0.45} />
          </div>
          <div className="relative mt-2 flex min-h-[6.2em] w-full max-w-[34ch] items-start justify-center text-center md:max-w-[40ch]">
            {sub && (
              <p ref={subRef} className="cine-fg text-[clamp(22px,2.9cqw,42px)] font-semibold leading-[1.1] tracking-[-0.05em]">
                <Sub text={sub} />
              </p>
            )}
          </div>
        </>
      )}

      {phase !== "intro" && (
        <div className="relative w-full max-w-[860px]">
          <div ref={card} className="relative opacity-0">
            <Bead as="div" radius={44} className="relative px-12 pb-12 pt-14 text-center max-sm:px-5 max-sm:pb-7 max-sm:pt-9">
              <div ref={body} className="flex flex-col items-center gap-9 max-sm:gap-6">
                {phase === "form" && (
                  <>
                    <span data-in aria-hidden className="flex gap-1.5">
                      {C.steps.map((_, i) => (
                        <span key={i} className="h-[3px] w-12 rounded-full" style={{ background: i <= step ? "#b64dff" : "var(--hair-strong)" }} />
                      ))}
                    </span>
                    <p data-in className="cine-fg text-[clamp(30px,5.2cqw,56px)] font-medium leading-[1.1] tracking-[-0.05em]">
                      <K text={cur.q} />
                    </p>
                    {cur.opts ? (
                      <div data-in className={`grid w-full gap-3 ${cur.opts.length === 4 ? "grid-cols-2 max-sm:grid-cols-1" : "grid-cols-3 max-sm:grid-cols-1"}`}>
                        {cur.opts.map((o) => (
                          <Bead key={o.id} as="button" type="button" radius={24} onClick={() => answer(cur.id, o.id)} className={btn}>
                            {o.t}
                          </Bead>
                        ))}
                      </div>
                    ) : (
                      <form
                        data-in
                        className="flex w-full items-center gap-2.5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (text.trim()) answer(cur.id, text.trim());
                        }}
                      >
                        <Bead as="div" radius={24} className="flex h-[68px] min-w-0 flex-1 items-center px-7">
                          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={28} placeholder={cur.ph} aria-label={cur.ph} className="cine-fg w-full bg-transparent text-[22px] font-medium tracking-[-0.01em] outline-none placeholder:opacity-45" />
                        </Bead>
                        <Bead as="button" type="submit" tint="sky" radius={999} aria-label={C.next} className="cine-fg flex h-[68px] w-[68px] shrink-0 items-center justify-center">
                          <ArrowRight size={21} strokeWidth={1.9} aria-hidden />
                        </Bead>
                      </form>
                    )}
                  </>
                )}
                {phase === "busy" && (
                  <p data-in className="cine-fg py-6 text-[clamp(26px,3.6cqw,40px)] font-medium leading-[1.1] tracking-[-0.05em]">
                    {C.busy}
                  </p>
                )}
              </div>
            </Bead>
            <div ref={glow} aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[44px]">
              <div className="rim-l3" />
              <div className="rim-l2" />
              <div className="rim-l1" />
            </div>
          </div>
        </div>
      )}

      <button type="button" onClick={() => onSkip(!mutedRef.current)} className="cine-fg2 absolute left-5 top-6 text-[14px] underline-offset-4 hover:underline max-sm:left-4 max-sm:top-5">
        {C.skip}
      </button>
    </div>
  );
}
