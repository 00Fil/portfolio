"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { gsap } from "gsap";
import { Bead } from "@/components/glass/Bead";
import { GradientText } from "@/components/ui/GradientText";
import ShinyText from "@/components/ui/ShinyText";
import Strands from "@/components/ui/Strands";
import { createVoice, type Voice } from "@/lib/voice";
import { getIntake, type Answers } from "@/content/intake";

const PINK = ["#ff00ff", "#ffffff", "#5b00ff", "#ff00c9"];

/** `*parola*` nel carattere della firma, con la sfumatura rosa degli strands. */
function Sub({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <span key={i} data-w className="inline-block" style={{ fontFamily: "var(--font-logo), var(--font-sans)", fontWeight: 400, fontSize: "1.2em", fontSynthesis: "none", letterSpacing: "normal", lineHeight: 1, padding: "0.45em 0.34em 0.5em", margin: "-0.45em -0.34em -0.5em" }}>
            <GradientText colors={PINK} animationSpeed={8} variant="flow" glow={0.8}>
              {p}
            </GradientText>
          </span>
        ) : (
          <Fragment key={i}>
            {p.split(/(\s+)/).map((x, j) =>
              /^\s*$/.test(x) ? (
                x
              ) : (
                <span key={j} data-w className="inline-block">
                  {x}
                </span>
              ),
            )}
          </Fragment>
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
export function FilmIntake({ en, onDone, onSkip }: { en: boolean; onDone: (a: Answers, sound: boolean) => void; onSkip: (sound: boolean) => void }) {
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
  const rim = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const zoom = useRef<Promise<void> | null>(null);
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
      await new Promise((r) => setTimeout(r, 350));
      for (const l of C.intro) {
        if (dead) return;
        // una frase alla volta: ogni pezzo compare quando la voce ci arriva, in proporzione alla lunghezza
        let chunks = l.t.split(/(?<=[.,!?])\s+/);
        // una sola riga visibile per volta: le frasi lunghe si dividono a metà, sulla parola più vicina
        chunks = chunks.flatMap((c) => {
          if (c.length <= 30) return [c];
          const m = c.length / 2;
          let at = -1;
          for (let i = 0; i < c.length; i++) if (c[i] === " " && (at < 0 || Math.abs(i - m) < Math.abs(at - m))) at = i;
          return at < 0 ? [c] : [c.slice(0, at), c.slice(at + 1)];
        });
        const total = chunks.reduce((n, c) => n + c.length, 0);
        setSub(chunks[0]);
        await v.say(src(l.audio), reading(l.t), (ms) => {
          let acc = chunks[0].length;
          chunks.slice(1).forEach((c) => {
            const at = (acc / total) * ms;
            acc += c.length;
            window.setTimeout(() => !dead && setSub(c), at);
          });
        });
        if (dead) return;
        setSub(null);
        await new Promise((r) => setTimeout(r, 150));
      }
      if (dead) return;
      setPhase("form");
      await new Promise((r) => setTimeout(r, 450));
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
    gsap.set(subRef.current, { autoAlpha: 1 });
    gsap.fromTo(subRef.current.querySelectorAll("[data-w]"), { autoAlpha: 0, y: 14, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power3.out", stagger: 0.085 });
  }, [sub]);

  // la bolla si espande nella card
  useEffect(() => {
    if (phase !== "form" || !card.current) return;
    const tl = gsap.timeline();
    if (orb.current) tl.to(orb.current, { scale: 2.2, autoAlpha: 0, duration: 0.9, ease: "sine.inOut", force3D: true }, 0);
    tl.fromTo(card.current, { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "sine.inOut", force3D: true }, 0.15);
    if (rim.current) tl.fromTo(rim.current, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.0, ease: "sine.inOut", force3D: true }, 0.05);
    return () => void tl.kill();
  }, [phase]);

  // personalizzo la tua esperienza: lo zoom parte lentissimo, accelera sempre di piu, attraversa la scritta e arriva allo sfondo pieno
  useEffect(() => {
    if (phase !== "busy" || !card.current || !body.current) return;
    const txt = body.current.querySelector<HTMLElement>("p");
    const z = { p: 0 };
    let tl: gsap.core.Timeline | null = null;
    zoom.current = new Promise<void>((res) => {
      tl = gsap.timeline({ onComplete: res });
      // zoom percepito costante sul logaritmo: p^3 lo rende lentissimo all'inizio e fulmineo alla fine
      tl.to(z, { p: 1, duration: 1.15, ease: "power2.in", onUpdate: () => {
        const k = Math.exp(Math.log(420) * z.p);
        if (txt) gsap.set(txt, { scale: k, transformOrigin: "50% 50%" });
        gsap.set(card.current, { opacity: 1 - Math.max(0, z.p - 0.82) * 5.5 });
      } }, 0);
      if (rim.current) tl.to(rim.current, { scale: 1.8, autoAlpha: 0, duration: 0.8, ease: "power2.in", force3D: true }, 0.3);
      tl.fromTo(flash.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12, ease: "power1.in" }, 1.05);
    });
    return () => void tl?.kill();
  }, [phase]);

  // ogni domanda entra con un respiro
  useEffect(() => {
    if (phase === "intro" || !body.current) return;
    gsap.fromTo(body.current.querySelectorAll("[data-in]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.04, overwrite: true, delay: step === 0 && phase === "form" ? 0.6 : 0 });
    // la domanda arriva parola per parola
    gsap.fromTo(body.current.querySelectorAll("p [data-w]"), { autoAlpha: 0, y: 12, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power3.out", stagger: 0.07, overwrite: true, delay: (step === 0 && phase === "form" ? 0.6 : 0) + 0.1 });
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
    void v?.say(src(C.done), 1100);
    await new Promise((r) => window.setTimeout(r, 120));
    await zoom.current;
    v?.cut();
    onDone(a, !mutedRef.current);
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
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--bg-canvas)_45%,transparent)] px-5 backdrop-blur-2xl">
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
          <div className="relative mt-2 flex min-h-[1.4em] w-full items-start justify-center whitespace-nowrap text-center">
            {sub && (
              <p ref={subRef} className="cine-fg text-[clamp(16px,2cqw,30px)] font-semibold leading-[1.1] tracking-[-0.05em]">
                <Sub text={sub} />
              </p>
            )}
          </div>
        </>
      )}

      {phase !== "intro" && (
        <div className="relative w-full max-w-[920px]">
          <div ref={card} className="relative opacity-0">
            <div className="relative px-6 text-center max-sm:px-2">
              <div ref={body} className="flex flex-col items-center gap-9 max-sm:gap-6">
                {phase === "form" && (
                  <>
                    <span data-in aria-hidden className="flex gap-1.5">
                      {C.steps.map((_, i) => (
                        <span key={i} className="h-[3px] w-12 rounded-full" style={{ background: i <= step ? "#b64dff" : "var(--hair-strong)" }} />
                      ))}
                    </span>
                    <p data-in className="cine-fg text-[clamp(30px,5.2cqw,56px)] font-medium leading-[1.1] tracking-[-0.05em]">
                      <Sub text={cur.q} />
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
                  <p data-in className="py-6 text-[clamp(26px,3.6cqw,40px)] font-medium leading-[1.1] tracking-[-0.05em]">
                    <ShinyText text={C.busy} color={light ? "#8e8e93" : "#b5b5b5"} shineColor={light ? "#1d1d1f" : "#ffffff"} speed={0.8} shineWidth={55} softness={0.8} trigger="loop" angle={97} direction="right" followPointer />
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* il bordo luminoso coincide con il bordo del riquadro del video */}
      {phase !== "intro" && (
        <div ref={rim} aria-hidden className="pointer-events-none absolute inset-0 -z-0 opacity-0">
          <div ref={glow} className="absolute inset-0 overflow-hidden rounded-[34px]">
            <div className="rim-l3" />
            <div className="rim-l2" />
            <div className="rim-l1" />
          </div>
        </div>
      )}

      <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 z-40 opacity-0" style={{ background: light ? "#ffffff" : "#000000" }} />

      <button type="button" onClick={() => onSkip(!mutedRef.current)} className="cine-fg2 absolute left-5 top-6 text-[14px] underline-offset-4 hover:underline max-sm:left-4 max-sm:top-5">
        {C.skip}
      </button>
    </div>
  );
}
