/**
 * Generates public/card/ciao-data.png (1320x450 RGB):
 *   R = exact Euclidean interior distance field (0..46px -> 0..255) for smooth 3D glass dome normals
 *   G = exact anti-aliased alpha mask from public/card/ciao.png
 *   B = smooth cursive handwriting reveal time (0..255) in natural left-to-right flow
 *
 * Uses Python PIL only for PNG I/O and Node.js for fast exact EDT & stroke projection.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const W = 1320, H = 450;
const root = path.resolve(__dirname, "..");

// 1. Read raw RGBA bytes of public/card/ciao.png via Python PIL
const raw = execFileSync("python3", [
  "-c",
  `import sys; from PIL import Image; sys.stdout.buffer.write(Image.open('${path.join(root, "public/card/ciao.png")}').convert('RGBA').tobytes())`,
], { maxBuffer: W * H * 4 + 1024 });

const alpha = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) alpha[i] = raw[i * 4 + 3];

// 2. Exact 2D Euclidean Distance Transform (Felzenszwalb & Huttenlocher, O(W*H))
//    Computes distance to nearest exterior pixel (alpha < 128).
const INF = 1e12;
function edt1d(f, n, d, v, z) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) {
      k--;
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dx = q - v[k];
    d[q] = dx * dx + f[v[k]];
  }
}

const grid = new Float64Array(W * H);
for (let i = 0; i < W * H; i++) grid[i] = alpha[i] >= 128 ? INF : 0;

const fCol = new Float64Array(H), dCol = new Float64Array(H);
const vCol = new Int32Array(H), zCol = new Float64Array(H + 1);
for (let x = 0; x < W; x++) {
  for (let y = 0; y < H; y++) fCol[y] = grid[y * W + x];
  edt1d(fCol, H, dCol, vCol, zCol);
  for (let y = 0; y < H; y++) grid[y * W + x] = dCol[y];
}

const fRow = new Float64Array(W), dRow = new Float64Array(W);
const vRow = new Int32Array(W), zRow = new Float64Array(W + 1);
const dist = new Float32Array(W * H);
let maxDist = 0;
for (let y = 0; y < H; y++) {
  const off = y * W;
  for (let x = 0; x < W; x++) fRow[x] = grid[off + x];
  edt1d(fRow, W, dRow, vRow, zRow);
  for (let x = 0; x < W; x++) {
    const dv = Math.sqrt(dRow[x]);
    dist[off + x] = dv;
    if (dv > maxDist) maxDist = dv;
  }
}
console.log("Max interior distance:", maxDist.toFixed(2), "px");

// 3. Connected components on alpha >= 16 so Ciao body, spark, ! stem, ! dot never bleed into each other
const comp = new Int32Array(W * H).fill(-1);
const compCount = [];
const qx = new Int32Array(W * H), qy = new Int32Array(W * H);
let cid = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = y * W + x;
    if (alpha[idx] < 16 || comp[idx] !== -1) continue;
    let head = 0, tail = 0;
    qx[tail] = x; qy[tail] = y; tail++;
    comp[idx] = cid;
    let sx = 0, sy = 0, cnt = 0;
    while (head < tail) {
      const cx = qx[head], cy = qy[head]; head++;
      sx += cx; sy += cy; cnt++;
      if (cx > 0 && alpha[cy * W + cx - 1] >= 16 && comp[cy * W + cx - 1] === -1) { comp[cy * W + cx - 1] = cid; qx[tail] = cx - 1; qy[tail] = cy; tail++; }
      if (cx < W - 1 && alpha[cy * W + cx + 1] >= 16 && comp[cy * W + cx + 1] === -1) { comp[cy * W + cx + 1] = cid; qx[tail] = cx + 1; qy[tail] = cy; tail++; }
      if (cy > 0 && alpha[(cy - 1) * W + cx] >= 16 && comp[(cy - 1) * W + cx] === -1) { comp[(cy - 1) * W + cx] = cid; qx[tail] = cx; qy[tail] = cy - 1; tail++; }
      if (cy < H - 1 && alpha[(cy + 1) * W + cx] >= 16 && comp[(cy + 1) * W + cx] === -1) { comp[(cy + 1) * W + cx] = cid; qx[tail] = cx; qy[tail] = cy + 1; tail++; }
    }
    compCount.push({ id: cid, cnt, cx: sx / cnt, cy: sy / cnt });
    cid++;
  }
}
console.log("Connected components:", compCount.filter(c => c.cnt > 50));

// Identify the 4 main components by centroid
const cBody = compCount.reduce((a, b) => (b.cnt > a.cnt ? b : a)).id;
const cSpark = compCount.find(c => c.cnt > 100 && c.cx > 350 && c.cx < 520 && c.cy < 170).id;
const cBang = compCount.find(c => c.cnt > 100 && c.cx > 1150 && c.cy < 280).id;
const cDot = compCount.find(c => c.cnt > 100 && c.cx > 1150 && c.cy > 320).id;

// 4. Centerline PEN paths of "Ciao!" (viewBox 1320x450)
const PEN_RAW = [
  "M307 128 L303 120 L298 112 L294 104 L289 96 L284 89 L278 83 L271 77 L264 71 L256 67 L247 64 L239 61 L230 60 L221 58 L212 58 L203 57 L194 58 L185 59 L176 61 L167 63 L159 66 L150 69 L142 74 L135 79 L128 84 L121 90 L115 97 L109 103 L103 110 L98 118 L93 126 L89 134 L85 142 L82 150 L79 159 L76 167 L73 176 L71 185 L70 194 L68 202 L67 211 L66 220 L65 229 L65 238 L65 248 L65 257 L66 266 L67 275 L69 283 L70 292 L73 301 L76 310 L79 318 L83 326 L87 334 L92 341 L98 349 L104 355 L110 362 L117 367 L125 372 L133 377 L141 381 L149 384 L158 387 L166 390 L175 392 L184 393 L193 394 L202 395 L211 396 L220 396 L229 395 L238 394 L247 393 L256 392 L265 390 L274 388 L282 385 L291 382 L299 379 L307 375 L315 371 L323 366 L331 361 L338 356 L345 350 L353 345 L361 341 L369 338 L378 335 L385 330 L391 323 L393 314 L395 306 L397 297 L399 288 L401 279 L402 270 L404 261 L406 252 L407 244 L409 235 L411 226 L413 217 L413 208",
  "M390 328 L395 336 L398 344 L400 353 L402 362 L405 370 L410 378 L417 384 L425 388 L434 390 L443 392 L452 392 L461 392 L470 390 L479 388 L487 385 L495 381 L503 377 L510 371 L517 366 L525 360 L532 355 L540 351 L549 348 L557 344 L562 337 L564 328 L566 319 L568 310 L569 301 L571 292 L572 283 L575 275 L578 266 L581 258 L585 250 L590 242 L596 235 L602 229 L609 223 L617 218 L625 214 L633 212 L642 210 L651 209 L660 209 L669 210 L678 211 L687 212 L696 213 L705 214 L714 216 L720 222 L719 231 L719 240 L718 249 L717 258 L717 267 L716 276 L714 285 L713 294 L712 303 L711 312 L710 321 L709 330 L709 339 L708 348 L707 357 L708 366 L713 373 L720 379 L727 385 L736 388 L744 391 L753 393 L762 393 L771 393 L780 391 L789 389 L797 386 L805 382 L813 377 L820 371 L826 365 L833 358 L840 352 L848 348 L856 344 L863 339 L867 331 L869 322 L870 313 L872 305 L873 296 L875 287 L878 278 L881 270 L884 261 L888 253 L893 246 L899 238 L905 232 L911 226 L919 220 L927 216 L935 213 L944 211 L953 210 L962 209 L971 210 L980 211 L989 213 L998 215 L1006 219 L1014 223 L1022 227 L1030 231 L1039 232 L1048 232 L1057 231 L1066 230 L1075 229 L1084 227 L1092 225 L1101 221 L1108 216 L1115 210 L1122 204",
  "M562 343 L568 350 L573 357 L577 365 L582 373 L588 380 L595 386 L603 389 L612 392 L621 393 L630 394 L639 393 L648 392 L657 389 L665 386 L673 381 L681 377 L689 373 L697 370 L706 367",
  "M1033 233 L1034 242 L1035 251 L1035 260 L1035 269 L1035 278 L1034 287 L1034 296 L1033 305 L1031 314 L1029 323 L1027 332 L1023 340 L1020 348 L1015 356 L1010 363 L1003 370 L997 376 L989 381 L981 385 L973 388 L964 390 L955 392 L946 392 L937 392 L928 391 L919 389 L911 386 L903 381 L895 376 L889 369 L884 362 L879 354 L873 347 L867 341",
  "M1247 58 L1246 67 L1244 76 L1243 85 L1241 94 L1240 103 L1239 112 L1238 121 L1236 130 L1235 139 L1234 147 L1233 156 L1231 165 L1230 174 L1229 183 L1227 192 L1226 201 L1225 210 L1224 219 L1222 228 L1221 237 L1220 246 L1219 255",
];
const [P0, P1, P2, P3, P4] = PEN_RAW.map(d => [...d.matchAll(/[ML](\d+)\s+(\d+)/g)].map(p => [+p[1], +p[2]]));

// Split P1 cleanly into natural cursive segments:
// P1[0..25]: i downstroke + connector to a
// P1[25..52]: a left upstroke + top arch
// P1[52..68]: a right downstroke
// P1[68..86]: connector from a to o
// P1[86..116]: o left upstroke + top arch
// P1[116..127]: o exit tail
// P2: a bottom loop (562,343 -> 706,367)
// P3 reversed: o bottom loop (867,341 -> 1033,233)
function segLen(pts) {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return s;
}

// Segmenti base del "Ciao!" (una lettera completa alla volta, zero pause morte)
const sC     = P0;                              // 0: C -> sale fino all'apice della 'i' (413, 208)
const sICon  = P1.slice(0, 26);                 // 1: curva bassa della 'i' e rampa fino a 'a'
const sAT    = P1.slice(25, 53);                // 2: a sale a sinistra e gira sopra -> (720, 222)
const sAS    = P1.slice(52, 69);                // 3: a scende sullo stelo destro -> (708, 366)
const sABRev = [...P2].reverse();               // 4: a chiude completamente il fondo in senso orario
const sAO    = P1.slice(68, 87);                // 5: rampa di collegamento a -> o (867, 341)
const sOT    = P1.slice(86, 117);               // 6: o sale a sinistra e gira sopra -> (1030, 231)
const sOB    = P3;                              // 7: o scende a destra e chiude completamente il fondo in senso orario
const sOTl   = P1.slice(118);                   // 8: gambetto finale della 'o' (parte fuori dall'anello -> zero tagli sulla 'o')
const sBng   = P4;                              // ! asta

// Percorso continuo senza stutter ne' pause tra le lettere:
// C + i -> stellina all'apice -> curva i -> a completa -> rampa -> o completa -> gambetto o -> ! -> punto
const rawBody = [];
let cur = 0;
function pushSeg(pts, speedMul = 1, gap = 0) {
  cur += gap;
  const len = segLen(pts);
  const dur = len / speedMul;
  rawBody.push({ id: rawBody.length, pts, s0: cur, s1: cur + dur });
  cur += dur;
}

pushSeg(sC, 1.0);                 // 0: C -> apice 'i'
const sparkStart = cur;           // stellina esattamente all'apice della 'i'
const sparkEnd = sparkStart + 70;
cur = sparkEnd;                   // zero pausa dopo la stellina
pushSeg(sICon, 1.0);              // 1: curva bassa 'i' -> rampa 'a'
pushSeg(sAT, 1.0);                // 2: a sale sx + arco sopra
pushSeg(sAS, 1.0);                // 3: a scende stelo dx
pushSeg(sABRev, 1.0);             // 4: a chiude il fondo (lettera 'a' completata!)
pushSeg(sAO, 1.0);                // 5: rampa a -> o
pushSeg(sOT, 1.0);                // 6: o sale sx + arco sopra
pushSeg(sOB, 1.0);                // 7: o scende dx + chiude il fondo (lettera 'o' completata!)
pushSeg(sOTl, 1.0);               // 8: gambetto finale della 'o'

const bangStart = cur + 18;       // stacco penna minimo prima del '!' (zero stutter)
const bangEnd = bangStart + segLen(sBng);
const dotStart = bangEnd + 14;
const dotEnd = dotStart + 55;
const TOTAL = dotEnd;

const pass1Segs = rawBody.map(st => ({ id: st.id, pts: st.pts, t0: st.s0 / TOTAL, t1: st.s1 / TOTAL }));
const pass2Segs = [];
const bangT0 = bangStart / TOTAL, bangT1 = bangEnd / TOTAL;
const dotT0 = dotStart / TOTAL, dotT1 = dotEnd / TOTAL;
const sparkT0 = sparkStart / TOTAL, sparkT1 = sparkEnd / TOTAL;
console.log("Total smooth path:", Math.round(TOTAL), "px | i-apex spark:", sparkT0.toFixed(3), "..", sparkT1.toFixed(3));

// Densifica i campioni ogni ~2px mantenendo l'id del segmento per evitare bleed prematuri agli incroci
function densify(segs) {
  const samples = [];
  for (const st of segs) {
    const pts = st.pts;
    const total = segLen(pts) || 1;
    let acc = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) {
        const x0 = pts[i - 1][0], y0 = pts[i - 1][1];
        const x1 = pts[i][0], y1 = pts[i][1];
        const d = Math.hypot(x1 - x0, y1 - y0);
        const steps = Math.max(1, Math.ceil(d / 2.0));
        for (let k = 1; k <= steps; k++) {
          const f = k / steps;
          const t = st.t0 + (st.t1 - st.t0) * ((acc + d * f) / total);
          samples.push({ x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, t, seg: st.id });
        }
        acc += d;
      } else {
        samples.push({ x: pts[0][0], y: pts[0][1], t: st.t0, seg: st.id });
      }
    }
  }
  return samples;
}

const bodyP1 = densify(pass1Segs);
const bodyP2 = densify(pass2Segs);
const bangSamples = densify([{ id: 99, pts: sBng, t0: bangT0, t1: bangT1 }]);

// Punta a sfera circolare pura (nessun taglio Voronoi agli incroci!):
// ogni pixel viene rivelato nel primo istante in cui la punta circolare (raggio 31px = raggio reale del tratto)
// lo raggiunge lungo il percorso continuo. Cosi' ogni fine tratto e' SEMPRE un semicerchio perfetto e uniforme.
const PEN_R = 35;
const PEN_R2 = PEN_R * PEN_R;

function ballpointOwned(x, y, samples, fallback = true) {
  let firstT = Infinity;
  let bestD = Infinity, bestT = 0;
  for (let i = 0; i < samples.length; i++) {
    const dx = x - samples[i].x, dy = y - samples[i].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) { bestD = d2; bestT = samples[i].t; }
    if (d2 <= PEN_R2 && samples[i].t < firstT) {
      firstT = samples[i].t;
    }
  }
  if (!fallback && firstT === Infinity) return 1.0;
  return firstT < Infinity ? firstT : bestT;
}

// 5. Calcola un vero profilo a SEMISFERA (dh/du = 0 al centro del tratto, zero cresta nel mezzo)
//    normalizzato sulla semilarghezza reale del tratto (~32px) e lisciato con filtro gaussiano separabile.
const STROKE_R = 32.0;
const hRaw = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  if (dist[i] <= 0) continue;
  const u = Math.min(1.0, dist[i] / STROKE_R);
  hRaw[i] = Math.sqrt(Math.max(0.0, 1.0 - (1.0 - u) * (1.0 - u)));
}

// Blur gaussiano separabile (raggio 6px) solo sull'altezza per una semisfera perfettamente tonda senza creste
const G_RAD = 6;
const gKern = new Float32Array(G_RAD * 2 + 1);
let gSum = 0;
for (let k = -G_RAD; k <= G_RAD; k++) {
  const v = Math.exp(-(k * k) / (2 * 2.8 * 2.8));
  gKern[k + G_RAD] = v;
  gSum += v;
}
for (let k = 0; k < gKern.length; k++) gKern[k] /= gSum;

const hTmp = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  const row = y * W;
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let k = -G_RAD; k <= G_RAD; k++) {
      const xx = Math.max(0, Math.min(W - 1, x + k));
      acc += hRaw[row + xx] * gKern[k + G_RAD];
    }
    hTmp[row + x] = acc;
  }
}
const hSmooth = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let acc = 0;
    for (let k = -G_RAD; k <= G_RAD; k++) {
      const yy = Math.max(0, Math.min(H - 1, y + k));
      acc += hTmp[yy * W + x] * gKern[k + G_RAD];
    }
    hSmooth[y * W + x] = acc;
  }
}

// Pack buffers:
//   ciao-data.png  (RGB): R = altezza semisfera liscia (0..255), G = alpha, B = t1 (esterno = 255 + dilatazione 3px)
//   ciao-pass2.png (L):   t2 (secondo passaggio / profondita', 255 = nessun ripasso)
const rgb = Buffer.alloc(W * H * 3);
const p2buf = Buffer.alloc(W * H, 255);
const t1Grid = new Uint8Array(W * H).fill(255);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const a = alpha[i];
    const rVal = Math.min(255, Math.round(hSmooth[i] * 255));
    let t1 = 1.0;
    let t2 = 1.0;
    const c = comp[i];
    if (c === cBody) {
      t1 = ballpointOwned(x, y, bodyP1, true);
      t2 = ballpointOwned(x, y, bodyP2, false);
    } else if (c === cBang) {
      t1 = ballpointOwned(x, y, bangSamples, true);
    } else if (c === cDot) {
      const dr = Math.min(1, Math.hypot(x - 1201, y - 384) / 48);
      t1 = dotT0 + dr * (dotT1 - dotT0);
    } else if (c === cSpark) {
      const dr = Math.min(1, Math.hypot(x - 432, y - 97) / 72);
      t1 = sparkT0 + dr * (sparkT1 - sparkT0);
    }
    rgb[i * 3] = rVal;
    rgb[i * 3 + 1] = a;
    if (c !== -1) {
      t1Grid[i] = Math.min(254, Math.max(0, Math.round(t1 * 254)));
    }
    p2buf[i] = t2 < 0.995 ? Math.min(254, Math.max(0, Math.round(t2 * 254))) : 255;
  }
}

// Dilata t1 di 3px verso l'esterno trasparente cosi' il filtro bilineare WebGL non sfuma mai verso 0 sui bordi
let curT1 = t1Grid;
for (let pass = 0; pass < 3; pass++) {
  const nextT1 = new Uint8Array(curT1);
  for (let y = 1; y < H - 1; y++) {
    const row = y * W;
    for (let x = 1; x < W - 1; x++) {
      const i = row + x;
      if (curT1[i] !== 255) continue;
      let m = 255;
      const n1 = curT1[i - 1], n2 = curT1[i + 1], n3 = curT1[i - W], n4 = curT1[i + W];
      if (n1 < m) m = n1;
      if (n2 < m) m = n2;
      if (n3 < m) m = n3;
      if (n4 < m) m = n4;
      if (m < 255) nextT1[i] = m;
    }
  }
  curT1 = nextT1;
}
for (let i = 0; i < W * H; i++) {
  rgb[i * 3 + 2] = curT1[i];
}

// 6. Save PNGs via Python PIL
const outPath = path.join(root, "public/card/ciao-data.png");
execFileSync("python3", [
  "-c",
  `import sys; from PIL import Image; Image.frombytes('RGB', (${W}, ${H}), sys.stdin.buffer.read()).save('${outPath}', optimize=True)`,
], { input: rgb });

const outP2 = path.join(root, "public/card/ciao-pass2.png");
execFileSync("python3", [
  "-c",
  `import sys; from PIL import Image; Image.frombytes('L', (${W}, ${H}), sys.stdin.buffer.read()).save('${outP2}', optimize=True)`,
], { input: p2buf });

console.log("Saved", outPath, fs.statSync(outPath).size, "bytes");
console.log("Saved", outP2, fs.statSync(outP2).size, "bytes");
