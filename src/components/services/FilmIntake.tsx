"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { ArrowRight, Check, Volume2 } from "lucide-react";
import { gsap } from "gsap";
import { Bead } from "@/components/glass/Bead";
import { getIntake, type Answers } from "@/content/intake";

type KwC = ComponentType<{ text: string }>;

/**
 * Le domande di rito prima del video: una alla volta, lette dalla voce del film (Aida), in vetro come il resto.
 * Le risposte personalizzano le scritte del video. Senza audio le domande restano solo scritte.
 */
export function FilmIntake({ en, K, onDone, onSkip }: { en: boolean; K: KwC; onDone: (a: Answers, sound: boolean) => void; onSkip: (sound: boolean) => void }) {
  const C = getIntake(en);
  const [step, setStep] = useState(-1); // -1 = apertura
  const [ans, setAns] = useState<Partial<Answers>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const sound = useRef(false);
  const au = useRef<HTMLAudioElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const queue = useRef<string[]>([]);

  const play = (...names: string[]) => {
    au.current?.pause();
    queue.current = names.filter(Boolean);
    const next = () => {
      const n = queue.current.shift();
      if (!n || !sound.current || en) return;
      const a = new Audio(`/intake/${n}.mp3`);
      au.current = a;
      a.onended = next;
      a.play().catch(() => undefined);
    };
    next();
  };
  useEffect(() => () => au.current?.pause(), []);

  // ogni domanda entra con un respiro
  useEffect(() => {
    if (!card.current) return;
    gsap.fromTo(card.current.querySelectorAll("[data-in]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06, overwrite: true });
  }, [step, busy]);

  const begin = (withSound: boolean) => {
    sound.current = withSound;
    setStep(0);
    play("intro", C.steps[0].audio);
  };
  const finish = (a: Answers) => {
    setBusy(true);
    const go = () => window.setTimeout(() => onDone(a, sound.current), 350);
    if (sound.current && !en) {
      au.current?.pause();
      const d = new Audio("/intake/done.mp3");
      au.current = d;
      d.onended = go;
      d.onerror = go;
      d.play().catch(go);
    } else window.setTimeout(() => onDone(a, sound.current), 1100);
  };
  const answer = (id: keyof Answers, v: string) => {
    const a = { ...ans, [id]: v };
    setAns(a);
    if (step + 1 < C.steps.length) {
      setStep(step + 1);
      setText("");
      play(C.steps[step + 1].audio);
    } else finish(a as Answers);
  };

  const cur = step >= 0 ? C.steps[step] : null;
  const btn = "cine-fg flex min-h-[64px] w-full items-center justify-center rounded-[24px] px-4 text-center text-[18px] font-medium leading-[1.2] max-sm:min-h-[52px] max-sm:text-[16px] tracking-[-0.01em] transition-transform active:scale-[.98]";

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[color-mix(in_srgb,var(--bg-canvas)_45%,transparent)] px-5 backdrop-blur-2xl">
      <Bead as="div" radius={44} className="relative w-full max-w-[860px] px-12 pb-12 pt-14 text-center max-sm:px-5 max-sm:pb-7 max-sm:pt-9">
        <div ref={card} className="flex flex-col items-center gap-9 max-sm:gap-6">
          {step < 0 && !busy && (
            <>
              <Bead as="span" data-in tint="sky" radius={999} className="cine-fg flex h-[76px] w-[76px] items-center justify-center">
                <Volume2 size={30} strokeWidth={1.7} aria-hidden />
              </Bead>
              <p data-in className="cine-fg text-[clamp(34px,5.6cqw,60px)] font-medium leading-[1.08] tracking-[-0.05em]">
                <K text={C.head} />
                <span className="cine-fg2 mt-2 block text-[clamp(15px,1.8cqw,17.5px)] font-normal leading-[1.4] tracking-[-0.01em]">{C.sub}</span>
              </p>
              <div data-in className="grid w-full gap-2.5">
                <Bead as="button" type="button" tint="sky" radius={26} onClick={() => begin(true)} className={`${btn} h-[54px] gap-2.5 text-[16.5px]`}>
                  <Volume2 size={19} strokeWidth={1.9} aria-hidden />
                  {C.start}
                </Bead>
                <Bead as="button" type="button" radius={26} onClick={() => begin(false)} className={`${btn} cine-fg2 h-[48px] text-[15px]`}>
                  {C.mute}
                </Bead>
              </div>
              <button type="button" data-in onClick={() => onSkip(false)} className="cine-fg2 text-[14px] underline-offset-4 hover:underline">
                {C.skip}
              </button>
            </>
          )}
          {cur && !busy && (
            <>
              <span data-in aria-hidden className="flex gap-1.5">
                {C.steps.map((_, i) => (
                  <span key={i} className="h-[3px] w-12 rounded-full" style={{ background: i <= step ? "var(--accent)" : "var(--hair-strong)" }} />
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
          {busy && (
            <>
              <Bead as="span" data-in tint="sky" radius={999} className="cine-fg flex h-[76px] w-[76px] items-center justify-center">
                <Check size={30} strokeWidth={1.8} aria-hidden />
              </Bead>
              <p data-in className="cine-fg text-[clamp(26px,3.6cqw,36px)] font-medium leading-[1.1] tracking-[-0.05em]">{C.busy}</p>
            </>
          )}
        </div>
      </Bead>
    </div>
  );
}
