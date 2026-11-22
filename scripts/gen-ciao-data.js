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

// 4. Parse PEN paths from CardViewer.tsx and build natural cursive timeline
const cardSrc = fs.readFileSync(path.join(root, "src/components/card/CardViewer.tsx"), "utf8");
const penMatches = [...cardSrc.matchAll(/d:\s*"([^"]+)"/g)].map(m =>
  [...m[1].matchAll(/[ML](\d+)\s+(\d+)/g)].map(p => [+p[1], +p[2]])
);
const [P0, P1, P2, P3, P4] = penMatches;

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

// Each stroke has { pts, t0, t1 } in normalized timeline [0, 1]
// Natural left-to-right cursive flow:
//   0.00 - 0.30 : C + i upstroke (P0)
//   0.30 - 0.39 : i downstroke + connector to a (P1[0..25])
//   0.39 - 0.50 : a top arch (P1[25..52])
//   0.42 - 0.53 : a bottom loop (P2) — sweeps concurrently to meet right stem!
//   0.50 - 0.55 : a right downstroke (P1[52..68])
//   0.55 - 0.61 : connector a -> o (P1[68..86])
//   0.61 - 0.72 : o top arch (P1[86..116])
//   0.63 - 0.74 : o bottom loop (P3 reversed) — sweeps concurrently to meet top-right!
//   0.73 - 0.78 : o exit tail (P1[116..127])
//   0.81 - 0.90 : ! stem (P4)
//   0.91 - 0.95 : ! dot (radial bloom from 1201, 384)
//   0.94 - 0.99 : i spark (radial bloom from 432, 97)
const bodyStrokes = [
  { pts: P0, t0: 0.00, t1: 0.30 },
  { pts: P1.slice(0, 26), t0: 0.30, t1: 0.39 },
  { pts: P1.slice(25, 53), t0: 0.39, t1: 0.50 },
  { pts: P2, t0: 0.42, t1: 0.53 },
  { pts: P1.slice(52, 69), t0: 0.50, t1: 0.55 },
  { pts: P1.slice(68, 87), t0: 0.55, t1: 0.61 },
  { pts: P1.slice(86, 117), t0: 0.61, t1: 0.72 },
  { pts: [...P3].reverse(), t0: 0.63, t1: 0.74 },
  { pts: P1.slice(116), t0: 0.73, t1: 0.78 },
];

// Precompute cumulative arc-length times for each sample point
function densify(strokes) {
  const samples = [];
  for (const st of strokes) {
    const pts = st.pts;
    const total = segLen(pts) || 1;
    let acc = 0;
    for (let i = 0; i < pts.length; i++) {
      if (i > 0) acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      const t = st.t0 + (st.t1 - st.t0) * (acc / total);
      samples.push({ x: pts[i][0], y: pts[i][1], t });
      // Add midpoint for smoother nearest-point mapping
      if (i < pts.length - 1) {
        const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        const tm = st.t0 + (st.t1 - st.t0) * ((acc + d * 0.5) / total);
        samples.push({ x: (pts[i][0] + pts[i + 1][0]) * 0.5, y: (pts[i][1] + pts[i + 1][1]) * 0.5, t: tm });
      }
    }
  }
  return samples;
}

const bodySamples = densify(bodyStrokes);
const bangSamples = densify([{ pts: P4, t0: 0.81, t1: 0.90 }]);

function nearestTime(x, y, samples) {
  let bestD = Infinity, bestT = 0;
  for (let i = 0; i < samples.length; i++) {
    const dx = x - samples[i].x, dy = y - samples[i].y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) { bestD = d2; bestT = samples[i].t; }
  }
  return bestT;
}

// 5. Pack RGB buffer: R = normalized interior distance, G = alpha, B = reveal time
const NORM_R = 44.0; // max half-width ~42px
const rgb = Buffer.alloc(W * H * 3);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const a = alpha[i];
    const rVal = Math.min(255, Math.round((dist[i] / NORM_R) * 255));
    let t = 0;
    const c = comp[i];
    if (c === cBody) {
      t = nearestTime(x, y, bodySamples);
    } else if (c === cBang) {
      t = nearestTime(x, y, bangSamples);
    } else if (c === cDot) {
      const dr = Math.min(1, Math.hypot(x - 1201, y - 384) / 48);
      t = 0.91 + dr * 0.04;
    } else if (c === cSpark) {
      const dr = Math.min(1, Math.hypot(x - 432, y - 97) / 72);
      t = 0.94 + dr * 0.05;
    }
    rgb[i * 3] = rVal;
    rgb[i * 3 + 1] = a;
    rgb[i * 3 + 2] = Math.min(255, Math.max(0, Math.round(t * 255)));
  }
}

// 6. Save RGB buffer as PNG via Python PIL
const outPath = path.join(root, "public/card/ciao-data.png");
execFileSync("python3", [
  "-c",
  `import sys; from PIL import Image; Image.frombytes('RGB', (${W}, ${H}), sys.stdin.buffer.read()).save('${outPath}', optimize=True)`,
], { input: rgb });

console.log("Saved", outPath, fs.statSync(outPath).size, "bytes");
