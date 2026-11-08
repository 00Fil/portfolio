import { gsap } from "gsap";

/** Molla di Compose: dampingRatio (zeta) e stiffness (k), massa 1. */
export type SpringSpec = { zeta: number; k: number };

/** Le molle di Relay (Goccia.kt, GlassBar.kt, Nav.kt). */
export const SPR = {
  press: { zeta: 0.72, k: 280 },
  release: { zeta: 0.38, k: 170 },
  settle: { zeta: 0.86, k: 320 },
  follow: { zeta: 0.9, k: 480 },
  bubble: { zeta: 0.78, k: 360 },
  barSettle: { zeta: 0.86, k: 300 },
  page: { zeta: 1, k: 380 },
} satisfies Record<string, SpringSpec>;

const STEP = 1 / 240;

/**
 * Oscillatore smorzato integrato sul ticker di GSAP (lo stesso clock di Lenis e ScrollTrigger).
 * Interrompibile: un nuovo `to` riparte dalla posizione e dalla velocità attuali, come Animatable.animateTo.
 */
export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private spec: SpringSpec = SPR.settle;
  private running = false;
  private done?: () => void;
  private listeners = new Set<(v: number) => void>();

  constructor(initial = 0) {
    this.value = initial;
    this.target = initial;
  }

  subscribe(fn: (v: number) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  snap(v: number) {
    this.stop();
    this.value = v;
    this.target = v;
    this.velocity = 0;
    this.emit();
  }

  to(target: number, spec: SpringSpec, done?: () => void) {
    this.target = target;
    this.spec = spec;
    this.done = done;
    if (!this.running) {
      this.running = true;
      gsap.ticker.add(this.tick);
    }
  }

  /** Raggiunge il valore con una curva a tempo (il tocco rapido: 140 ms FastOutSlowIn), poi chiama done. */
  tweenTo(target: number, ms: number, done?: () => void) {
    this.stop();
    const o = { v: this.value };
    gsap.to(o, {
      v: target,
      duration: ms / 1000,
      ease: "power2.inOut",
      onUpdate: () => {
        this.value = o.v;
        this.emit();
      },
      onComplete: () => {
        this.velocity = 0;
        done?.();
      },
    });
  }

  stop() {
    if (this.running) gsap.ticker.remove(this.tick);
    this.running = false;
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.value));
  }

  private tick = (_t: number, deltaMs: number) => {
    const { zeta, k } = this.spec;
    const c = 2 * zeta * Math.sqrt(k);
    let dt = Math.min(deltaMs / 1000, 1 / 20);
    while (dt > 0) {
      const h = Math.min(STEP, dt);
      const a = -k * (this.value - this.target) - c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
      dt -= h;
    }
    if (Math.abs(this.velocity) < 0.0005 && Math.abs(this.value - this.target) < 0.0005) {
      this.value = this.target;
      this.velocity = 0;
      this.stop();
      this.emit();
      const d = this.done;
      this.done = undefined;
      d?.();
      return;
    }
    this.emit();
  };
}
