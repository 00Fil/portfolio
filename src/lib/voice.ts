/**
 * Voce dell'assistente: riproduce i clip passando da un analizzatore, così l'interfaccia può reagire al volume.
 * Parte da sola se il browser lo permette (chi arriva da un click sul sito lo permette); altrimenti aspetta il primo gesto qualsiasi, senza chiedere nulla.
 */
export type Voice = {
  level: { current: number };
  say: (src: string | null, fallbackMs: number) => Promise<void>;
  mute: (m: boolean) => void;
  cut: () => void;
  stop: () => void;
};

const GESTURES = ["pointerdown", "keydown", "touchend", "click"] as const;

export function createVoice(level: { current: number } = { current: 0 }): Voice {
  let ctx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let gain: GainNode | null = null;
  let muted = false;
  let alive = true;
  let raf = 0;
  let cur: HTMLAudioElement | null = null;
  let cancel: (() => void) | null = null;
  const buf = new Uint8Array(512);

  const ensure = () => {
    if (ctx) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    gain = ctx.createGain();
    gain.gain.value = muted ? 0 : 1;
    analyser.connect(gain);
    gain.connect(ctx.destination);
  };
  const tick = () => {
    if (!alive) return;
    let v = 0;
    if (analyser && cur && !cur.paused) {
      analyser.getByteTimeDomainData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) {
        const d = (buf[i] - 128) / 128;
        s += d * d;
      }
      v = Math.min(1, Math.sqrt(s / buf.length) * 4.2);
    }
    level.current += (v - level.current) * (v > level.current ? 0.5 : 0.12);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const gesture = () =>
    new Promise<void>((res) => {
      const f = () => {
        GESTURES.forEach((e) => window.removeEventListener(e, f, true));
        cancel = null;
        res();
      };
      GESTURES.forEach((e) => window.addEventListener(e, f, true));
      cancel = () => {
        GESTURES.forEach((e) => window.removeEventListener(e, f, true));
        res();
      };
    });

  const wait = (ms: number) =>
    new Promise<void>((res) => {
      const t = window.setTimeout(res, ms);
      cancel = () => {
        window.clearTimeout(t);
        res();
      };
    });

  const say = async (src: string | null, fallbackMs: number) => {
    if (!alive) return;
    if (!src) return wait(fallbackMs);
    try {
      ensure();
      const a = new Audio(src);
      cur = a;
      ctx!.createMediaElementSource(a).connect(analyser!);
      const start = async () => {
        await ctx!.resume();
        await a.play();
      };
      try {
        await start();
      } catch {
        if (!alive) return;
        await gesture();
        if (!alive) return;
        await start().catch(() => undefined);
      }
      if (a.paused && a.currentTime === 0) return wait(fallbackMs);
      await new Promise<void>((res) => {
        a.onended = () => res();
        a.onerror = () => res();
        cancel = () => res();
      });
    } catch {
      await wait(fallbackMs);
    }
  };

  return {
    level,
    say,
    mute: (m) => {
      muted = m;
      if (gain) gain.gain.value = m ? 0 : 1;
    },
    cut: () => {
      cancel?.();
      cur?.pause();
    },
    stop: () => {
      alive = false;
      cancelAnimationFrame(raf);
      cancel?.();
      cur?.pause();
      void ctx?.close().catch(() => undefined);
    },
  };
}
