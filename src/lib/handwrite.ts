import { gsap } from "gsap";
import NAME_PEN from "./name-pen.json";

/**
 * Il corsivo del marchio si scrive davvero a mano: la parola viene disegnata su un canvas con lo stesso font,
 * ridotta alla sua linea centrale e percorsa da una «penna» in ordine (si segue il tratto, i rami corti si fanno al volo,
 * i puntini vanno in fondo). La maschera della parola è fatta di tanti timbri lungo quella linea: ognuno si apre quando ci arriva la penna,
 * così si vede solo il tratto già scritto. Avanzamento sulla variabile --p (0 = niente, 1 = tutta la parola).
 */
const S = 100; // px per em nel canvas
const PAD = 40;
const BASE = 150;

type Pt = [number, number, number?];
type Item = { p?: number[][]; d?: number[]; t: number[] };
type Skel = { items: Item[]; total: number; w: number };
/** Il nome ha la sua penna disegnata a mano (ordine dei tratti, ritorni sul già scritto più veloci): niente calcolo automatico. */
const PEN = NAME_PEN as Record<string, Skel>;
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
  const nb0: number[][] = idx.map((i) => {
    const o: number[] = [];
    for (const dd of [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1]) { const j = at[i + dd]; if (j >= 0) o.push(j); }
    return o;
  });
  // ogni lettera è un pezzo a sé: la penna ne finisce una prima di cominciare la successiva
  const bounds: number[] = [];
  for (let k = 0; k <= text.length; k++) bounds.push(ctx.measureText(text.slice(0, k)).width);
  const letterOf = (n: number) => {
    const x = idx[n] % w - PAD;
    let k = 0;
    while (k < text.length - 1 && x >= bounds[k + 1]) k++;
    return k;
  };
  const let0 = idx.map((_, n) => letterOf(n));
  const nb: number[][] = nb0.map((o, n) => o.filter((m) => let0[m] === let0[n]));
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
    .map((c) => ({ c, k: let0[c[0]] }))
    .sort((p, q) => p.k - q.k || q.c.length - p.c.length);
  // Una penna sola: parte da un capo (in alto a sinistra), segue il tratto e fa un ramo alla volta
  // (i rami corti subito, il filo principale per ultimo); i pezzi staccati vanno dopo. Ogni pezzo continuo è una polilinea levigata.
  const lines: number[][] = [];
  let pen = -1;
  for (const { c } of order) {
    if (c.length < 4) continue;
    const far = (from: number) => {
      const d = new Map<number, number>([[from, 0]]);
      const qq = [from];
      for (let h = 0; h < qq.length; h++) for (const m of nb[qq[h]]) if (!d.has(m)) { d.set(m, d.get(qq[h])! + 1); qq.push(m); }
      return qq[qq.length - 1];
    };
    const A = far(c[0]), B = far(A);
    const sc = (n: number) => X(n) + Y(n) * 0.6;
    let start = sc(A) <= sc(B) ? A : B;
    if (pen >= 0) {
      let bd = Infinity;
      for (const n of c) { const dd = Math.hypot(X(n) - X(pen), Y(n) - Y(pen)); if (dd < bd) { bd = dd; start = n; } }
    }
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
      while (par.get(q)! >= 0 && k++ < 6) { const pp = par.get(q)!; dx += X(n) - X(pp); dy += Y(n) - Y(pp); q = pp; }
      const cand = nb[n].filter((m) => !seen.has(m));
      cand.sort((m1, m2) => (X(m1) - X(n)) * dx + (Y(m1) - Y(n)) * dy - ((X(m2) - X(n)) * dx + (Y(m2) - Y(n)) * dy) || X(m2) - X(m1));
      for (const m of cand) stack.push([m, n]);
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
    for (const n of post) size.set(n, 1 + (kids.get(n) ?? []).reduce((t, m) => t + size.get(m)!, 0));
    let cur: number[] = [start];
    let last = start;
    lines.push(cur);
    const out: number[] = [start];
    const order2: number[] = [];
    while (out.length) {
      const n = out.pop()!;
      order2.push(n);
      const ks = (kids.get(n) ?? []).slice().sort((m1, m2) => size.get(m2)! - size.get(m1)!);
      for (const m of ks) out.push(m);
    }
    for (const n of order2.slice(1)) {
      if (par.get(n) !== last) { cur = [par.get(n)!]; lines.push(cur); }
      cur.push(n);
      last = n;
    }
    pen = last;
  }
  // levigatura: media mobile, estremi fermi
  const smooth = (px: Pt[]): Pt[] => {
    const R = 4;
    return px.map((_, i) => {
      if (i === 0 || i === px.length - 1) return px[i];
      const k = Math.min(R, i, px.length - 1 - i);
      let sx = 0, sy = 0;
      for (let j = i - k; j <= i + k; j++) { sx += px[j][0]; sy += px[j][1]; }
      return [sx / (2 * k + 1), sy / (2 * k + 1)] as Pt;
    });
  };
  const items: Item[] = [];
  let total = 0;
  const strokes: { pts: Pt[]; start: number }[] = [];
  for (const ln of lines) {
    if (ln.length < 2) continue;
    const pts = smooth(ln.map((n) => [(X(n) + 0.5 - PAD) / S, (Y(n) + 0.5 - BASE) / S] as Pt));
    const t = [total];
    for (let k = 1; k < pts.length; k++) { total += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); t.push(total); }
    strokes.push({ pts, start: t[0] });
    items.push({ p: pts as number[][], t });
  }
  for (const dt of dots) {
    const dx = (dt[0] - PAD) / S, dy = (dt[1] - BASE) / S;
    let at = total;
    for (const it of items) it.p!.forEach((q, k) => { if (Math.abs(q[0] - dx) < 0.14 && q[1] > dy) at = it.t[k]; });
    items.push({ d: [dx, dy, (dt[2] + 1.5) / S], t: [at, at + 0.03] });
  }
  const out: Skel = { items, total, w: (2 * (half * 1.3 + 2.5)) / S };
  cache.set(key, out);
  return out;
}

const isScript = (el: Element) => el.hasAttribute("data-script") || (el as HTMLElement).style.fontFamily.includes("font-logo");

const MASK = ["mask-image", "-webkit-mask-image", "mask-size", "-webkit-mask-size", "mask-repeat", "-webkit-mask-repeat"];
const clearMask = (el: HTMLElement) => MASK.forEach((k) => el.style.removeProperty(k));

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
  return { family: cs.fontFamily, ox, by, fs, text: (tn?.textContent ?? el.textContent ?? "").trim() };
}

type St = { sk: Skel; ox: number; by: number; fs: number; cv: HTMLCanvasElement; text: string; font: string; color: string; dpr: number };
const state = new WeakMap<HTMLElement, St>();

/**
 * Mentre scrive, la parola vera è nascosta e al suo posto c'è un canvas alla risoluzione dello schermo:
 * la stessa parola, stesso font e stessa posizione, ritagliata dal tratto della penna fino a p (0..1).
 * Alla fine il canvas sparisce e torna il testo: identico, nessuno scatto.
 */
function render(e: HTMLElement, p: number) {
  const st = state.get(e);
  if (!st) return;
  const { sk, ox, by, fs, cv, dpr } = st;
  const ctx = cv.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = ctx.fillStyle = "#000";
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.lineWidth = sk.w * fs;
  const T = p * sk.total;
  const px = (x: number, y: number): [number, number] => [(ox + x) * fs, (by + y) * fs];
  for (const it of sk.items) {
    if (T <= it.t[0]) continue;
    if (it.d) {
      const f = Math.min(1, (T - it.t[0]) / Math.max(1e-4, it.t[1] - it.t[0]));
      const [x, y] = px(it.d[0], it.d[1]);
      ctx.beginPath();
      ctx.arc(x, y, it.d[2] * fs * (0.35 + 0.65 * f), 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    const P = it.p!, t = it.t;
    ctx.beginPath();
    ctx.moveTo(...px(P[0][0], P[0][1]));
    for (let k = 1; k < P.length; k++) {
      if (t[k] >= T) {
        const f = (T - t[k - 1]) / Math.max(1e-6, t[k] - t[k - 1]);
        ctx.lineTo(...px(P[k - 1][0] + (P[k][0] - P[k - 1][0]) * f, P[k - 1][1] + (P[k][1] - P[k - 1][1]) * f));
        break;
      }
      ctx.lineTo(...px(P[k][0], P[k][1]));
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = st.color;
  ctx.font = st.font;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(st.text, ox * fs, by * fs);
}

/** Toglie il canvas e rimette il testo vero. */
function finish(e: HTMLElement) {
  const st = state.get(e);
  st?.cv.remove();
  e.style.removeProperty("-webkit-text-fill-color");
  clearMask(e);
}

/** Prepara la parola: calcola la linea di scrittura e la porta a «niente scritto». */
export function prepareWrite(el: Element) {
  const e = el as HTMLElement;
  if (!isScript(e) || typeof document === "undefined") return;
  const go = () => {
    const prev = state.get(e);
    if (prev?.cv.isConnected && e.dataset.wdone) return;
    const m = measure(e);
    if (!m.text) return;
    const sk = PEN[m.text] ?? build(m.text, m.family);
    if (!sk.items.length) return;
    const cs = getComputedStyle(e);
    const color = prev?.color ?? cs.color;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const cv = prev?.cv ?? document.createElement("canvas");
    const w = e.offsetWidth, h = e.offsetHeight;
    cv.width = Math.ceil(w * dpr);
    cv.height = Math.ceil(h * dpr);
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h}px;pointer-events:none`;
    if (getComputedStyle(e).position === "static") e.style.position = "relative";
    if (!cv.isConnected) e.appendChild(cv);
    e.style.setProperty("-webkit-text-fill-color", "transparent");
    state.set(e, { sk, ox: m.ox, by: m.by, fs: m.fs, cv, text: m.text, font: `${cs.fontStyle} ${cs.fontWeight} ${m.fs}px ${m.family}`, color, dpr });
    e.dataset.wlen = String(sk.total);
    render(e, Number(e.dataset.wp ?? 0));
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

/** Quanto dura scrivere una parola: segue la lunghezza del tratto (per ora lenta). */
export const writeTime = (el: Element) => {
  prepareWrite(el);
  const len = parseFloat((el as HTMLElement).dataset.wlen ?? "");
  return len ? Math.min(3.2, Math.max(0.6, 0.35 + len / 3.2)) : Math.min(1.6, Math.max(0.5, 0.28 + (el.textContent?.length ?? 6) * 0.075));
};

/** Aggiunge alla timeline la scrittura di una parola. */
export const writeOn = (L: gsap.core.Timeline, el: Element, at: number, dur = writeTime(el)) => {
  const e = el as HTMLElement;
  if (isScript(e)) {
    prepareWrite(e);
    e.dataset.wp = "0";
    const pr = { p: 0 };
    L.fromTo(pr, { p: 0 }, { p: 1, duration: dur, ease: "sine.inOut", onUpdate: () => { e.dataset.wp = String(pr.p); render(e, pr.p); } }, at);
    L.call(() => { e.dataset.wdone = "1"; finish(e); }, undefined, at + dur + 0.02);
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
    el.dataset.wp = "0";
    const pr = { p: 0 };
    gsap.to(pr, { p: 1, duration: writeTime(el), ease: "sine.inOut", delay: delay + i * 0.18, onUpdate: () => { el.dataset.wp = String(pr.p); render(el, pr.p); }, onComplete: () => { el.dataset.wdone = "1"; finish(el); } });
  });
};
