import { gsap } from "gsap";

/**
 * Il corsivo del marchio si scrive davvero a mano: la parola viene disegnata su un canvas con lo stesso font,
 * ridotta alla sua linea centrale e percorsa da una «penna» in ordine (si segue il tratto, i rami corti si fanno al volo,
 * i puntini vanno in fondo). La maschera della parola è fatta di tanti timbri lungo quella linea: ognuno si apre quando ci arriva la penna,
 * così si vede solo il tratto già scritto. Avanzamento sulla variabile --p (0 = niente, 1 = tutta la parola).
 */
const S = 100; // px per em nel canvas
const PAD = 40;
const BASE = 150;

type Pt = [number, number];
type Skel = { pts: Pt[]; r: number; len: number };
const cache = new Map<string, Skel>();
let fontsReady = false;

function thin(a: Uint8Array, w: number, h: number) {
  const del: number[] = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let step = 0; step < 2; step++) {
      del.length = 0;
      for (let y = 1; y < h - 1; y++)
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!a[i]) continue;
          const p2 = a[i - w], p3 = a[i - w + 1], p4 = a[i + 1], p5 = a[i + w + 1], p6 = a[i + w], p7 = a[i + w - 1], p8 = a[i - 1], p9 = a[i - w - 1];
          const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (B < 2 || B > 6) continue;
          const A = (!p2 && p3 ? 1 : 0) + (!p3 && p4 ? 1 : 0) + (!p4 && p5 ? 1 : 0) + (!p5 && p6 ? 1 : 0) + (!p6 && p7 ? 1 : 0) + (!p7 && p8 ? 1 : 0) + (!p8 && p9 ? 1 : 0) + (!p9 && p2 ? 1 : 0);
          if (A !== 1) continue;
          if (step === 0 ? p2 * p4 * p6 || p4 * p6 * p8 : p2 * p4 * p8 || p2 * p6 * p8) continue;
          del.push(i);
        }
      if (del.length) changed = true;
      for (const i of del) a[i] = 0;
    }
  }
}

function build(text: string, family: string): Skel {
  const key = family + "|" + text;
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  const font = `400 ${S}px ${family}`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + PAD * 2;
  const h = BASE + 100;
  cv.width = w;
  cv.height = h;
  ctx.font = font;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, PAD, BASE);
  const d = ctx.getImageData(0, 0, w, h).data;
  const a = new Uint8Array(w * h);
  let ink = 0;
  for (let i = 0; i < a.length; i++) if (d[i * 4 + 3] > 127) { a[i] = 1; ink++; }
  const dots: number[][] = [];
  {
    const lab = new Uint8Array(w * h);
    for (let s0 = 0; s0 < a.length; s0++) {
      if (!a[s0] || lab[s0]) continue;
      const st = [s0];
      lab[s0] = 1;
      let n = 0, sx = 0, sy = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
      while (st.length) {
        const i = st.pop()!, x = i % w, y = (i / w) | 0;
        n++; sx += x; sy += y;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const j of [i - 1, i + 1, i - w, i + w]) if (j >= 0 && j < a.length && a[j] && !lab[j]) { lab[j] = 1; st.push(j); }
      }
      if (x1 - x0 < S * 0.3 && y1 - y0 < S * 0.3 && n > 20) dots.push([sx / n, sy / n, Math.max(x1 - x0, y1 - y0) / 2]);
    }
  }
  thin(a, w, h);
  const idx: number[] = [];
  const at = new Int32Array(w * h).fill(-1);
  for (let i = 0; i < a.length; i++) if (a[i]) { at[i] = idx.length; idx.push(i); }
  const N = idx.length;
  const nb: number[][] = idx.map((i) => {
    const o: number[] = [];
    for (const dd of [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1]) { const j = at[i + dd]; if (j >= 0) o.push(j); }
    return o;
  });
  const X = (n: number) => idx[n] % w, Y = (n: number) => (idx[n] / w) | 0;
  const half = N ? ink / N / 2 : 4;
  // componenti
  const comp = new Int32Array(N).fill(-1);
  const comps: number[][] = [];
  for (let s = 0; s < N; s++) {
    if (comp[s] >= 0) continue;
    const c: number[] = [], st = [s];
    comp[s] = comps.length;
    while (st.length) { const n = st.pop()!; c.push(n); for (const m of nb[n]) if (comp[m] < 0) { comp[m] = comps.length; st.push(m); } }
    comps.push(c);
  }
  const order = comps
    .map((c) => ({ c, x: Math.min(...c.map(X)), small: c.length < S * 0.28 }))
    .sort((p, q) => (p.small === q.small ? p.x - q.x : p.small ? 1 : -1));
  const seq: number[] = [];
  for (const { c } of order) {
    let start = c[0];
    for (const n of c) {
      const e = nb[n].length === 1, es = nb[start].length === 1;
      if (e && (!es || X(n) < X(start))) start = n;
      else if (!es && !e && X(n) < X(start)) start = n;
    }
    // albero di visita che preferisce proseguire dritto
    const par = new Map<number, number>();
    const seen = new Set<number>();
    const kids = new Map<number, number[]>();
    const stack: [number, number][] = [[start, -1]];
    while (stack.length) {
      const [n, p] = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      par.set(n, p);
      if (p >= 0) (kids.get(p) ?? kids.set(p, []).get(p)!).push(n);
      let dx = 0, dy = 0, q = n, k = 0;
      while (par.get(q)! >= 0 && k++ < 5) { const pp = par.get(q)!; dx += X(n) - X(pp); dy += Y(n) - Y(pp); q = pp; }
      const cand = nb[n].filter((m) => !seen.has(m));
      cand.sort((m1, m2) => {
        const s1 = (X(m1) - X(n)) * dx + (Y(m1) - Y(n)) * dy;
        const s2 = (X(m2) - X(n)) * dx + (Y(m2) - Y(n)) * dy;
        return s1 - s2 || X(m2) - X(m1);
      });
      for (const m of cand) stack.push([m, n]); // l'ultimo inserito (il più dritto) esce per primo
    }
    const size = new Map<number, number>();
    const post: number[] = [];
    const st2: [number, boolean][] = [[start, false]];
    while (st2.length) {
      const [n, done] = st2.pop()!;
      if (done) { post.push(n); continue; }
      st2.push([n, true]);
      for (const m of kids.get(n) ?? []) st2.push([m, false]);
    }
    for (const n of post) size.set(n, 1 + (kids.get(n) ?? []).reduce((s, m) => s + size.get(m)!, 0));
    // preordine: i rami piccoli prima, il filo principale per ultimo
    const out: [number, boolean][] = [[start, false]];
    while (out.length) {
      const [n] = out.pop()!;
      seq.push(n);
      const ks = (kids.get(n) ?? []).slice().sort((m1, m2) => size.get(m2)! - size.get(m1)!);
      for (const m of ks) out.push([m, false]); // il più grande entra per primo => esce per ultimo
    }
  }
  const r = half * 1.18 + 1.2;
  const step = Math.max(2, r * 0.55);
  const pts: Pt[] = [];
  let len = 0, lx = -999, ly = -999;
  for (const n of seq) {
    const x = X(n), y = Y(n);
    const dd = Math.hypot(x - lx, y - ly);
    if (dd >= step || dd > 3) {
      pts.push([(x - PAD) / S, (y - BASE) / S]);
      lx = x; ly = y;
    }
  }
  // i puntini: dopo l'assottigliamento spariscono, ma il punto è più largo del tratto; si fanno subito dopo il gambo della loro lettera
  for (const dt of dots) {
    const dx = (dt[0] - PAD) / S, dy = (dt[1] - BASE) / S;
    const add: Pt[] = [[dx, dy]];
    const ring = Math.max(0, dt[2] - r) / S;
    if (ring > 0.01) for (let k = 0; k < 6; k++) add.push([dx + Math.cos((k * Math.PI) / 3) * ring, dy + Math.sin((k * Math.PI) / 3) * ring]);
    let at = -1;
    pts.forEach((q, k) => { if (Math.abs(q[0] - dx) < 0.14 && q[1] > dy) at = k; });
    pts.splice(at < 0 ? pts.length : at + 1, 0, ...add);
  }
  for (let k = 1; k < pts.length; k++) {
    const g = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (g < 0.12) len += g;
  }
  const out = { pts, r: r / S, len };
  cache.set(key, out);
  return out;
}

const isScript = (el: Element) => el.hasAttribute("data-script") || (el as HTMLElement).style.fontFamily.includes("font-logo");

const MP = ["mask-image", "-webkit-mask-image", "mask-size", "-webkit-mask-size", "mask-position", "-webkit-mask-position", "mask-repeat", "-webkit-mask-repeat"];
const clearMask = (el: HTMLElement) => MP.forEach((k) => el.style.removeProperty(k));

function measure(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const fs = parseFloat(cs.fontSize);
  const er = el.getBoundingClientRect();
  const sc = el.offsetWidth ? er.width / el.offsetWidth : 1;
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const tn = tw.nextNode();
  let ox = parseFloat(cs.paddingLeft) / fs;
  if (tn && tn.textContent) {
    const rg = document.createRange();
    rg.setStart(tn, 0);
    rg.setEnd(tn, 1);
    ox = (rg.getBoundingClientRect().left - er.left) / sc / fs;
  }
  const mk = document.createElement("i");
  mk.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  el.appendChild(mk);
  const by = (mk.getBoundingClientRect().bottom - er.top) / sc / fs;
  el.removeChild(mk);
  return { family: cs.fontFamily, ox, by, text: (tn?.textContent ?? el.textContent ?? "").trim() };
}

/** Prepara la parola: costruisce la maschera a timbri e la porta a «niente scritto» (--p 0). */
export function prepareWrite(el: Element) {
  const e = el as HTMLElement;
  if (!isScript(e) || typeof document === "undefined") return;
  const go = () => {
    const m = measure(e);
    if (!m.text) return;
    const sk = build(m.text, m.family);
    const n = sk.pts.length;
    if (!n) return;
    const R = sk.r;
    const rr = (k: number) => `clamp(0em,calc((var(--p,1) * ${n} - ${k}) * ${R.toFixed(4)}em),${R.toFixed(4)}em)`;
    const img: string[] = [], pos: string[] = [], size: string[] = [];
    sk.pts.forEach(([x, y], k) => {
      const r = rr(k);
      img.push(`radial-gradient(circle ${R.toFixed(4)}em at center,#000 calc(${r} - 0.02em),transparent ${r})`);
      pos.push(`${(m.ox + x - R).toFixed(4)}em ${(m.by + y - R).toFixed(4)}em`);
      size.push(`${(2 * R).toFixed(4)}em ${(2 * R).toFixed(4)}em`);
    });
    for (const p of ["", "-webkit-"]) {
      e.style.setProperty(p + "mask-image", img.join(","));
      e.style.setProperty(p + "mask-position", pos.join(","));
      e.style.setProperty(p + "mask-size", size.join(","));
      e.style.setProperty(p + "mask-repeat", "no-repeat");
    }
    e.dataset.wlen = String(sk.len);
    if (!e.dataset.wp) e.style.setProperty("--p", "0");
  };
  go();
  if (!fontsReady && document.fonts) document.fonts.ready.then(() => { fontsReady = true; cache.clear(); go(); });
}

export const WRITE_STYLE = {} as const;

const EDGE = "linear-gradient(104deg, #000 calc(var(--w, 130) * 1% - 16%), transparent calc(var(--w, 130) * 1%))";
/** Per le parole che non sono nel corsivo: il vecchio passaggio con bordo inclinato. */
const wipeStyle = (el: HTMLElement) => {
  el.style.webkitMaskImage = EDGE;
  el.style.maskImage = EDGE;
};

/** Quanto dura scrivere una parola: segue la lunghezza del tratto. */
export const writeTime = (el: Element) => {
  prepareWrite(el);
  const len = parseFloat((el as HTMLElement).dataset.wlen ?? "");
  return len ? Math.min(2.6, Math.max(0.55, 0.3 + len / 4.4)) : Math.min(1.6, Math.max(0.5, 0.28 + (el.textContent?.length ?? 6) * 0.075));
};

/** Aggiunge alla timeline la scrittura di una parola. */
export const writeOn = (L: gsap.core.Timeline, el: Element, at: number, dur = writeTime(el)) => {
  const e = el as HTMLElement;
  if (isScript(e)) {
    prepareWrite(e);
    e.dataset.wp = "1";
    L.fromTo(e, { "--p": 0 }, { "--p": 1, duration: dur, ease: "sine.inOut" }, at);
    L.set(e, { clearProps: "maskImage,webkitMaskImage,maskSize,webkitMaskSize,maskPosition,webkitMaskPosition,maskRepeat,webkitMaskRepeat" }, at + dur + 0.02);
    return L;
  }
  wipeStyle(e);
  return L.fromTo(e, { "--w": 0 }, { keyframes: [{ "--w": 58, duration: dur * 0.5, ease: "power1.out" }, { "--w": 92, duration: dur * 0.3, ease: "sine.inOut" }, { "--w": 130, duration: dur * 0.2, ease: "power1.out" }] }, at);
};

/** Per le pagine: ogni parola in corsivo si scrive quando entra nello schermo. */
export const writeOnScroll = (els: Element[], delay = 0.3) => {
  els.forEach((e, i) => {
    const el = e as HTMLElement;
    prepareWrite(el);
    el.dataset.wp = "1";
    const d = writeTime(el);
    gsap.fromTo(el, { "--p": 0 }, { "--p": 1, duration: d, ease: "sine.inOut", delay: delay + i * 0.18, overwrite: true, onComplete: () => clearMask(el) });
  });
};
