/**
 * Porting web dei due materiali di Relay.
 *  - Lente (GLASS_AGSL, GlassBar.kt): vetro piatto al centro che piega la luce in una fascia vicino al bordo.
 *    In Relay è uno shader sul contenuto sotto; qui diventa una mappa di spostamento per feDisplacementMap,
 *    calcolata con la stessa formula (distanza dal bordo della capsula, normale, smoothstep al quadrato).
 *  - Smusso (BEVEL_AGSL, Goccia.kt): bordo di luce con dispersione. Qui lo stesso shader gira in WebGL una volta
 *    per misura e diventa un'immagine di sfondo: durante lo scroll i tasti non costano nulla.
 */

const mapCache = new Map<string, string>();

export function lensMap(w: number, h: number, radius: number, edge: number): string {
  const W = Math.max(2, Math.round(w));
  const H = Math.max(2, Math.round(h));
  const key = `${W}x${H}r${radius}e${edge}`;
  const hit = mapCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(W, H);
  const r = Math.min(radius, W / 2, H / 2);
  const hbx = W / 2 - r;
  const hby = H / 2 - r;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - W / 2;
      const py = y + 0.5 - H / 2;
      const qx = Math.abs(px) - hbx;
      const qy = Math.abs(py) - hby;
      const mx = Math.max(qx, 0);
      const my = Math.max(qy, 0);
      const sd = Math.hypot(mx, my) + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -sd;
      const sx = px < 0 ? -1 : 1;
      const sy = py < 0 ? -1 : 1;
      let nx: number;
      let ny: number;
      if (qx > 0 || qy > 0) {
        const ax = Math.max(qx, 0.0001);
        const ay = Math.max(qy, 0.0001);
        const l = Math.hypot(ax, ay);
        nx = (ax / l) * sx;
        ny = (ay / l) * sy;
      } else if (qx > qy) {
        nx = sx;
        ny = 0;
      } else {
        nx = 0;
        ny = sy;
      }
      const t = Math.min(1, Math.max(0, 1 - depth / edge));
      let bend = t * t * (3 - 2 * t);
      bend *= bend;
      // spostamento verso l'interno: il vetro "pesca" il contenuto più vicino al centro
      const dx = -nx * bend;
      const dy = -ny * bend;
      const i = (y * W + x) * 4;
      img.data[i] = 128 + dx * 127;
      img.data[i + 1] = 128 + dy * 127;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  mapCache.set(key, url);
  return url;
}

// ------------------------------------------------------------------ smusso

const BEVEL_FS = `
precision highp float;
uniform vec2 size;
uniform float radius;
uniform float bevel;
uniform float strength;
uniform vec2 light;
float edgeW(float depth) {
  float t = clamp(1.0 - depth / bevel, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}
void main() {
  vec2 fc = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec2 p = fc - size * 0.5;
  vec2 hb = size * 0.5 - vec2(radius);
  vec2 q = abs(p) - hb;
  float sd = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0) - radius;
  float depth = -sd;
  if (depth < 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 s = vec2(p.x < 0.0 ? -1.0 : 1.0, p.y < 0.0 ? -1.0 : 1.0);
  vec2 n = (q.x > 0.0 || q.y > 0.0) ? normalize(max(q, vec2(0.0001))) * s : (q.x > q.y ? vec2(s.x, 0.0) : vec2(0.0, s.y));
  float lit = dot(n, light);
  float w = edgeW(depth);
  float hi = max(lit, 0.0) * w;
  float lo = max(-lit, 0.0) * w * 0.45;
  float shift = 0.9;
  float wr = edgeW(depth - shift);
  float wb = edgeW(depth + shift);
  float disp = (max(lit, 0.0) + 0.45) * strength;
  vec3 fringe = vec3(wr - w, 0.0, wb - w) * disp;
  float a = (hi + lo) * strength;
  vec3 rgb = vec3(1.0) * a + fringe * 0.9;
  float alpha = clamp(a + abs(fringe.r) + abs(fringe.b), 0.0, 1.0);
  gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), alpha);
}`;

const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

let gl: WebGLRenderingContext | null | undefined;
let prog: WebGLProgram | null = null;
let glCanvas: HTMLCanvasElement | null = null;
const bevelCache = new Map<string, string>();

function setup(): boolean {
  if (gl !== undefined) return !!gl;
  try {
    glCanvas = document.createElement("canvas");
    gl = glCanvas.getContext("webgl", { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
  } catch {
    gl = null;
  }
  if (!gl) return false;
  const sh = (type: number, src: string) => {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    return s;
  };
  prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, BEVEL_FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl = null;
    return false;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return true;
}

/**
 * Bordo di vetro come immagine. La forza è cotta a 0,935: il CSS la riporta a 0,36 a riposo (opacità 0,385)
 * e la porta a 0,36 · 2,6 alla pressione piena, come `strength * (1 + 1.6 * press)` nello shader.
 *
 * Il bordo cambia solo negli angoli: lungo i lati è sempre uguale. Quindi si cuoce un quadrato piccolo
 * (due angoli più quattro pixel di lato) e il CSS lo stira a nove fette con border-image. Prima si cuoceva
 * l'immagine a misura piena per ogni elemento, e la lettura dalla GPU bloccava l'arrivo sul sito.
 * Restituisce il valore completo per `border-image` (sorgente, fette, larghezza).
 */
export function bevelImage(w: number, h: number, radius?: number): string | null {
  if (typeof window === "undefined" || w < 4 || h < 4) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const r = Math.round(Math.min(radius ?? Math.min(w, h) / 2, w / 2, h / 2) * 2) / 2;
  const bevel = Math.min(Math.min(w, h) * 0.3, 7);
  const key = `${r}|${bevel.toFixed(1)}|${dpr}`;
  const hit = bevelCache.get(key);
  if (hit) return hit;
  if (!setup() || !gl || !prog || !glCanvas) return null;
  const S = Math.round((Math.ceil(r * 2) + 4) * dpr);
  glCanvas.width = S;
  glCanvas.height = S;
  gl.viewport(0, 0, S, S);
  gl.useProgram(prog);
  gl.uniform2f(gl.getUniformLocation(prog, "size"), S, S);
  gl.uniform1f(gl.getUniformLocation(prog, "radius"), r * dpr);
  gl.uniform1f(gl.getUniformLocation(prog, "bevel"), bevel * dpr);
  gl.uniform1f(gl.getUniformLocation(prog, "strength"), 0.935);
  gl.uniform2f(gl.getUniformLocation(prog, "light"), -0.55, -0.83);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const slice = Math.max(1, r * dpr);
  const value = `url(${glCanvas.toDataURL("image/png")}) ${slice} / ${Math.max(0.5, r)}px stretch`;
  bevelCache.set(key, value);
  return value;
}
