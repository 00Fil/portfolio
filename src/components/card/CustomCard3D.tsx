"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { onIntroLift } from "@/lib/intro";

export type CustomCard3DHandle = {
  flip: () => void;
  showBack: () => void;
};

type Props = {
  name?: string;
  logo?: string;
  creds: { user: string; pass: string; url: string } | null;
  copiedText: string;
  tip: "user" | "pass" | null;
  onCopy: (k: "user" | "pass") => void;
  ariaLabel: string;
};

// Dimensioni fisiche reali ISO CR80 (85.6mm x 54.0mm) in unita' 3D
const CARD_W = 8.56;
const CARD_H = 5.4;
const CARD_R = 0.34;
const CARD_T = 0.14;
const FLOOR_Y = -3.7;
const CARD_HEX = "#3A5864";
const CARD_RGB: [number, number, number] = [58 / 255, 88 / 255, 100 / 255];

const CAM_POS: [number, number, number] = [0, 1.25, 16.2];
const CAM_TARGET: [number, number, number] = [0, -0.35, 0];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// --- Matematica 4x4 column-major minimale ---
function mat4Perspective(fovRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovRad * 0.5);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function mat4LookAt(eye: [number, number, number], target: [number, number, number]): Float32Array {
  let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len; zy /= len; zz /= len;
  // up = (0, 1, 0)
  let xx = zz, xy = 0, xz = -zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len; xy /= len; xz /= len;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
}

function mat4Mul(a: Float32Array, b: Float32Array): Float32Array {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

/** Matrice modello: T(tx, ty, tz) * Rz(rz) * Rx(rx) * Ry(ry) + rotazione 3x3 */
function buildModelMatrix(
  tx: number,
  ty: number,
  tz: number,
  rx: number,
  ry: number,
  rz: number,
): { model: Float32Array; rot3: Float32Array } {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  // Rx * Ry (rx > 0 inclina la parte alta indietro, fronte verso l'alto)
  const a00 = cy,       a01 = 0,   a02 = sy;
  const a10 = -sx * sy, a11 = cx,  a12 = sx * cy;
  const a20 = -cx * sy, a21 = -sx, a22 = cx * cy;

  // Rz * (Rx * Ry)
  const r00 = cz * a00 - sz * a10, r01 = cz * a01 - sz * a11, r02 = cz * a02 - sz * a12;
  const r10 = sz * a00 + cz * a10, r11 = sz * a01 + cz * a11, r12 = sz * a02 + cz * a12;
  const r20 = a20,                 r21 = a21,                 r22 = a22;

  const model = new Float32Array([
    r00, r10, r20, 0,
    r01, r11, r21, 0,
    r02, r12, r22, 0,
    tx,  ty,  tz,  1,
  ]);
  const rot3 = new Float32Array([
    r00, r10, r20,
    r01, r11, r21,
    r02, r12, r22,
  ]);
  return { model, rot3 };
}

// --- Costruzione geometria 3D card con bordi arrotondati 100% pieni e smussati ---
function buildCardGeometry() {
  const hw = CARD_W * 0.5;
  const hh = CARD_H * 0.5;
  const r = CARD_R;
  const ht = CARD_T * 0.5;
  const bev = 0.016;
  const segsPerCorner = 24;

  // Contorno arrotondato in senso antiorario (+Z guarda verso la camera)
  const contour: Array<{ x: number; y: number; nx: number; ny: number }> = [];
  const corners = [
    { cx: hw - r, cy: hh - r, a0: 0, a1: Math.PI * 0.5 },
    { cx: -hw + r, cy: hh - r, a0: Math.PI * 0.5, a1: Math.PI },
    { cx: -hw + r, cy: -hh + r, a0: Math.PI, a1: Math.PI * 1.5 },
    { cx: hw - r, cy: -hh + r, a0: Math.PI * 1.5, a1: Math.PI * 2 },
  ];
  for (const c of corners) {
    for (let i = 0; i <= segsPerCorner; i++) {
      const a = c.a0 + (c.a1 - c.a0) * (i / segsPerCorner);
      const ca = Math.cos(a), sa = Math.sin(a);
      contour.push({ x: c.cx + ca * r, y: c.cy + sa * r, nx: ca, ny: sa });
    }
  }
  const N = contour.length;

  // Attributi per vertice: pos(3), normal(3), uv(2), matId(1) -> 9 float
  const verts: number[] = [];
  const indices: number[] = [];
  const pushV = (x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, v: number, m: number) => {
    verts.push(x, y, z, nx, ny, nz, u, v, m);
    return verts.length / 9 - 1;
  };

  // 1. Faccia frontale (z = +ht, leggermente rientrata di bev per raccordarsi allo smusso)
  const fCenter = pushV(0, 0, ht, 0, 0, 1, 0.5, 0.5, 0);
  const fRing: number[] = [];
  for (let i = 0; i < N; i++) {
    const p = contour[i];
    const x = p.x - p.nx * bev;
    const y = p.y - p.ny * bev;
    fRing.push(pushV(x, y, ht, 0, 0, 1, x / CARD_W + 0.5, 0.5 - y / CARD_H, 0));
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    indices.push(fCenter, fRing[i], fRing[j]);
  }

  // 2. Faccia posteriore (z = -ht)
  const bCenter = pushV(0, 0, -ht, 0, 0, -1, 0.5, 0.5, 1);
  const bRing: number[] = [];
  for (let i = 0; i < N; i++) {
    const p = contour[i];
    const x = p.x - p.nx * bev;
    const y = p.y - p.ny * bev;
    bRing.push(pushV(x, y, -ht, 0, 0, -1, 0.5 - x / CARD_W, 0.5 - y / CARD_H, 1));
  }
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    indices.push(bCenter, bRing[j], bRing[i]);
  }

  // 3. Bordo 3D continuo con 4 anelli (smusso fronte -> lato esterno -> smusso retro)
  const rings = [
    { inset: bev, z: ht, nz: 0.72, nr: 0.69 },
    { inset: 0, z: ht - bev, nz: 0.15, nr: 0.988 },
    { inset: 0, z: -ht + bev, nz: -0.15, nr: 0.988 },
    { inset: bev, z: -ht, nz: -0.72, nr: 0.69 },
  ];
  const ringIdx: number[][] = [];
  for (const rg of rings) {
    const arr: number[] = [];
    for (let i = 0; i < N; i++) {
      const p = contour[i];
      const x = p.x - p.nx * rg.inset;
      const y = p.y - p.ny * rg.inset;
      arr.push(pushV(x, y, rg.z, p.nx * rg.nr, p.ny * rg.nr, rg.nz, i / N, (rg.z + ht) / CARD_T, 2));
    }
    ringIdx.push(arr);
  }
  for (let rIdx = 0; rIdx < rings.length - 1; rIdx++) {
    const a = ringIdx[rIdx];
    const b = ringIdx[rIdx + 1];
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      indices.push(a[i], b[i], b[j], a[i], b[j], a[j]);
    }
  }

  return { vertices: new Float32Array(verts), indices: new Uint32Array(indices) };
}

// --- Mesh 3D ad alta risoluzione per il "Ciao!" a goccia d'acqua spostata in Z ---
function buildCiaoMesh(cols = 280, rows = 96) {
  const x0 = -CARD_W * 0.5 + 0.1168 * CARD_W;
  const x1 = x0 + 0.771 * CARD_W;
  const yTop = CARD_H * 0.5 - 0.25 * CARD_H;
  const yBot = yTop - 0.416652 * CARD_H;
  const zBase = CARD_T * 0.5 - 0.004;

  const verts = new Float32Array((cols + 1) * (rows + 1) * 5);
  let ptr = 0;
  for (let j = 0; j <= rows; j++) {
    const v = j / rows;
    const y = yTop + (yBot - yTop) * v;
    for (let i = 0; i <= cols; i++) {
      const u = i / cols;
      const x = x0 + (x1 - x0) * u;
      verts[ptr++] = x;
      verts[ptr++] = y;
      verts[ptr++] = zBase;
      verts[ptr++] = u;
      verts[ptr++] = v;
    }
  }
  const indices = new Uint32Array(cols * rows * 6);
  let idx = 0;
  const stride = cols + 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const a = j * stride + i;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices[idx++] = a;
      indices[idx++] = c;
      indices[idx++] = b;
      indices[idx++] = b;
      indices[idx++] = c;
      indices[idx++] = d;
    }
  }
  return { vertices: verts, indices };
}

// --- Piano studio infinito 3D ---
function buildFloorGeometry() {
  const s = 60;
  const vertices = new Float32Array([
    -s, FLOOR_Y, -s,
     s, FLOOR_Y, -s,
    -s, FLOOR_Y,  s,
     s, FLOOR_Y,  s,
  ]);
  const indices = new Uint16Array([0, 2, 1, 1, 2, 3]);
  return { vertices, indices };
}

// --- Shaders WebGL2 ---
const FLOOR_VERT = `#version 300 es
in vec3 aPos;
uniform mat4 uVP;
out vec3 vWorld;
void main() {
  vWorld = aPos;
  gl_Position = uVP * vec4(aPos, 1.0);
}`;

const FLOOR_FRAG = `#version 300 es
precision highp float;
in vec3 vWorld;
uniform vec3 uCardPos;
uniform vec3 uCardRot; // rx, ry, rz
out vec4 outColor;

void main() {
  // Mondo bianco infinito senza confini + ombra 3D dinamica della card proiettata sul piano
  float h = max(0.35, uCardPos.y - ${FLOOR_Y.toFixed(2)});
  float cosY = abs(cos(uCardRot.y));
  float sinX = abs(sin(uCardRot.x));
  float spread = 0.85 + h * 0.24;

  vec2 p = vWorld.xz - vec2(uCardPos.x, uCardPos.z);
  float rx = max(0.55, 4.15 * cosY + 0.45) * spread;
  float rz = max(0.75, 1.15 + 2.4 * sinX) * spread;

  vec2 q = p / vec2(rx, rz);
  float d2 = dot(q, q);
  float heightFade = clamp(1.0 / (1.0 + h * 0.16), 0.14, 1.0);
  float sh = exp(-d2 * 1.95) * 0.22 * heightFade * (0.55 + 0.45 * cosY);
  float core = exp(-d2 * 5.2) * 0.11 * heightFade * (0.45 + 0.55 * cosY);

  // Sfumatura sottilissima al centro del piatto studio che si dissolve nel bianco puro #ffffff
  float floorGrad = exp(-dot(vWorld.xz, vWorld.xz) * 0.0028) * 0.016;
  vec3 tint = vec3(0.14, 0.22, 0.26);
  vec3 col = mix(vec3(1.0), tint, clamp(sh + core, 0.0, 0.36)) - vec3(floorGrad);
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const CARD_VERT = `#version 300 es
in vec3 aPos;
in vec3 aNorm;
in vec2 aUv;
in float aMat;
uniform mat4 uVP;
uniform mat4 uModel;
uniform mat3 uRot3;
out vec3 vWorldPos;
out vec3 vWorldNorm;
out vec2 vUv;
out float vMat;
void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vWorldNorm = normalize(uRot3 * aNorm);
  vUv = aUv;
  vMat = aMat;
  gl_Position = uVP * wp;
}`;

const CARD_FRAG = `#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vWorldNorm;
in vec2 vUv;
in float vMat;

uniform vec3 uCamPos;
uniform vec3 uCardColor;
uniform mat3 uRot3;
uniform float uProgress;
uniform sampler2D uFrontTex;
uniform sampler2D uBackTex;
uniform sampler2D uData;
uniform sampler2D uPass2;

out vec4 outColor;

const vec2 DATA_TEXEL = vec2(1.0 / 1320.0, 1.0 / 450.0);

vec4 sampleData(vec2 duv) {
  if (duv.x < 0.0 || duv.x > 1.0 || duv.y < 0.0 || duv.y > 1.0) return vec4(0.0, 0.0, 1.0, 0.0);
  return texture(uData, duv);
}

float revealTime(float tVal) {
  if (tVal > 0.994 && uProgress < 0.995) return 0.0;
  float edge = 0.022;
  float p = uProgress * (1.0 + edge * 1.4) - edge * 0.2;
  float t = clamp((p - (tVal - edge)) / (edge * 1.4), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec3 N = normalize(vWorldNorm);
  vec3 V = normalize(uCamPos - vWorldPos);
  vec3 L1 = normalize(vec3(-0.22, 0.82, 0.53));
  vec3 L2 = normalize(vec3(0.55, 0.35, 0.75));

  float diff1 = max(dot(N, L1), 0.0);
  float diff2 = max(dot(N, L2), 0.0);
  vec3 H1 = normalize(L1 + V);
  vec3 H2 = normalize(L2 + V);
  float spec1 = pow(max(dot(N, H1), 0.0), 42.0) * 0.24;
  float spec2 = pow(max(dot(N, H2), 0.0), 18.0) * 0.09;
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.4);

  vec3 base = uCardColor;
  if (vMat > 1.5) {
    // Bordo 3D solido arrotondato: leggermente piu' profondo con riflesso satinato netto
    base *= 0.88;
    spec1 *= 1.85;
  }

  vec3 col = base * (0.64 + 0.38 * diff1 + 0.16 * diff2) + vec3(0.86, 0.93, 0.96) * (spec1 + spec2 + fresnel * 0.16);

  if (vMat < 0.5) {
    // Ombra morbida della goccia 3D "Ciao!" direttamente sulla faccia frontale della card
    vec2 duv = vec2((vUv.x - 0.1168) / 0.771, (vUv.y - 0.25) / 0.416652);
    if (duv.x > -0.05 && duv.x < 1.05 && duv.y > -0.08 && duv.y < 1.12) {
      vec3 L_local = normalize(transpose(uRot3) * L1);
      vec2 shDir = vec2(-L_local.x, L_local.y) * vec2(0.011, 0.028);
      vec2 sUv = duv - shDir;
      vec2 rad = DATA_TEXEL * 9.0;
      float sh = 0.0;
      vec4 s0 = sampleData(sUv);
      float r0 = revealTime(s0.b);
      sh += s0.g * r0 * 0.32;
      vec4 s1 = sampleData(sUv + vec2( rad.x, 0.0)); sh += s1.g * revealTime(s1.b) * 0.17;
      vec4 s2 = sampleData(sUv + vec2(-rad.x, 0.0)); sh += s2.g * revealTime(s2.b) * 0.17;
      vec4 s3 = sampleData(sUv + vec2(0.0,  rad.y)); sh += s3.g * revealTime(s3.b) * 0.17;
      vec4 s4 = sampleData(sUv + vec2(0.0, -rad.y)); sh += s4.g * revealTime(s4.b) * 0.17;

      float core = smoothstep(0.32, 0.90, s0.r) * r0;
      float shAlpha = clamp(sh * 0.58 * (1.0 - 0.36 * core), 0.0, 0.62);
      float caustic = core * 0.18 * max(L_local.y, 0.0);
      col = mix(col, col * 0.22, shAlpha);
      col += vec3(0.58, 0.76, 0.85) * caustic;
    }

    // Firma in basso (logo/nome x Filippo Corsini)
    vec4 signTex = texture(uFrontTex, vUv);
    col = mix(col, signTex.rgb, signTex.a);
  } else if (vMat < 1.5) {
    // Retro: pillole credenziali
    vec4 backTex = texture(uBackTex, vUv);
    col = mix(col, backTex.rgb, backTex.a);
  }

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

const CIAO_VERT = `#version 300 es
in vec3 aPos;
in vec2 aUv;

uniform mat4 uVP;
uniform mat4 uModel;
uniform sampler2D uData;
uniform float uProgress;

out vec2 vDuv;
out vec3 vWorldPos;

const vec2 TEXEL = vec2(1.0 / 1320.0, 1.0 / 450.0);

float revealTime(float tVal) {
  if (tVal > 0.994 && uProgress < 0.995) return 0.0;
  float edge = 0.016;
  float p = uProgress * (1.0 + edge * 1.4) - edge * 0.2;
  float t = clamp((p - (tVal - edge)) / (edge * 1.4), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float capHeight(vec4 d) {
  float rev = revealTime(d.b);
  // Profilo semisferico vero anche sulla punta mobile: ogni estremo aperto e' tondo come una goccia
  float tipDome = sqrt(max(0.0, 1.0 - (1.0 - rev) * (1.0 - rev)));
  return d.r * tipDome;
}

void main() {
  vec4 dat = texture(uData, aUv);

  // Media morbida su 5 campioni usando l'altezza rivelata di ogni campione + raccordo a 0 sul bordo esterno
  vec2 o = TEXEL * 2.5;
  float hAvg = capHeight(dat) * 0.40
    + capHeight(texture(uData, aUv + vec2( o.x, 0.0))) * 0.15
    + capHeight(texture(uData, aUv + vec2(-o.x, 0.0))) * 0.15
    + capHeight(texture(uData, aUv + vec2(0.0,  o.y))) * 0.15
    + capHeight(texture(uData, aUv + vec2(0.0, -o.y))) * 0.15;
  float rimMask = smoothstep(0.14, 0.58, dat.g);

  vec3 pos = aPos;
  pos.z += hAvg * rimMask * 0.24;

  vec4 wp = uModel * vec4(pos, 1.0);
  vWorldPos = wp.xyz;
  vDuv = aUv;
  gl_Position = uVP * wp;
}`;

const CIAO_FRAG = `#version 300 es
precision highp float;
in vec2 vDuv;
in vec3 vWorldPos;

uniform sampler2D uData;
uniform mat3 uRot3;
uniform vec3 uCamPos;
uniform vec3 uCardColor;
uniform float uProgress;

out vec4 outColor;

const vec2 TEXEL = vec2(1.0 / 1320.0, 1.0 / 450.0);
const float U_IOR = 1.50;
const float U_DISPERSION = 0.38;
const float U_REFLECTION = 1.08;

vec4 sampleData(vec2 duv) {
  if (duv.x < 0.0 || duv.x > 1.0 || duv.y < 0.0 || duv.y > 1.0) return vec4(0.0, 0.0, 1.0, 0.0);
  return texture(uData, duv);
}

float revealTime(float tVal) {
  if (tVal > 0.994 && uProgress < 0.995) return 0.0;
  float edge = 0.016;
  float p = uProgress * (1.0 + edge * 1.4) - edge * 0.2;
  float t = clamp((p - (tVal - edge)) / (edge * 1.4), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float capHeightAt(vec2 duv) {
  vec4 d = sampleData(duv);
  float rev = revealTime(d.b);
  float tipDome = sqrt(max(0.0, 1.0 - (1.0 - rev) * (1.0 - rev)));
  return d.r * tipDome;
}

// Filtro gaussiano 9-tap sull'altezza rivelata: calcola la vera curvatura 3D tonda anche sulle estremita' aperte
float smoothHeight(vec2 duv) {
  vec2 o = TEXEL * 2.8;
  float s = capHeightAt(duv) * 0.25;
  s += capHeightAt(duv + vec2( o.x,  0.0)) * 0.125;
  s += capHeightAt(duv + vec2(-o.x,  0.0)) * 0.125;
  s += capHeightAt(duv + vec2( 0.0,  o.y)) * 0.125;
  s += capHeightAt(duv + vec2( 0.0, -o.y)) * 0.125;
  s += capHeightAt(duv + vec2( o.x,  o.y)) * 0.0625;
  s += capHeightAt(duv + vec2(-o.x,  o.y)) * 0.0625;
  s += capHeightAt(duv + vec2( o.x, -o.y)) * 0.0625;
  s += capHeightAt(duv + vec2(-o.x, -o.y)) * 0.0625;
  return s;
}

// Motore FluidGlass: studio HDR softbox (key + strip + dome)
vec3 studio(vec3 d) {
  vec2 a = vec2(atan(d.x, d.z), d.y);
  float key = smoothstep(0.42, 0.22, abs(a.x + 0.62)) * smoothstep(0.30, 0.12, abs(a.y - 0.50));
  float strip = smoothstep(0.12, 0.05, abs(a.x - 0.95)) * smoothstep(0.80, 0.35, abs(a.y - 0.05));
  float dome = smoothstep(0.0, 1.0, d.z) * 0.04;
  return vec3(18.0) * key + vec3(8.0) * strip + vec3(dome);
}

vec4 fgLight(vec3 d, float weight) {
  vec3 c = studio(d) * weight;
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  return vec4(min(c, vec3(a)), a);
}

// Campiona la superficie illuminata della card #3A5864 + caustica/ombra interna vista attraverso il vetro
vec3 cardSurfaceAt(vec2 duv, vec3 cardN, vec3 V, vec3 L1_local) {
  vec3 L1 = normalize(vec3(-0.22, 0.82, 0.53));
  vec3 L2 = normalize(vec3(0.55, 0.35, 0.75));
  float diff1 = max(dot(cardN, L1), 0.0);
  float diff2 = max(dot(cardN, L2), 0.0);
  vec3 H1 = normalize(L1 + V);
  float spec = pow(max(dot(cardN, H1), 0.0), 42.0) * 0.24;
  // Lieve variazione spaziale sulla card cosi' la rifrazione e la dispersione RGB sono nitidamente leggibili
  float grad = 0.90 + 0.20 * clamp(1.0 - duv.y, 0.0, 1.0) + 0.08 * sin(duv.x * 5.0 - duv.y * 3.0);
  vec3 col = uCardColor * grad * (0.66 + 0.38 * diff1 + 0.16 * diff2) + vec3(0.86, 0.93, 0.96) * spec;

  vec4 sd = sampleData(duv);
  float sRev = revealTime(sd.b);
  float depth = sd.r * sRev;
  float caustic = smoothstep(0.14, 0.62, depth) * (U_IOR - 1.0) * 0.55 * max(L1_local.y, 0.2);
  float darkRim = exp(-depth * 7.5) * 0.28 * sRev;
  col = col * (1.0 - darkRim) + vec3(0.75, 0.88, 0.94) * caustic;
  return clamp(col, 0.0, 1.0);
}

void main() {
  vec4 dat = sampleData(vDuv);
  float rev = revealTime(dat.b);
  float alpha = smoothstep(0.14, 0.54, dat.g) * smoothstep(0.02, 0.35, rev);
  if (alpha < 0.02) discard;

  float hC = smoothHeight(vDuv);

  vec2 gStep = TEXEL * 3.5;
  float hR = smoothHeight(vDuv + vec2(gStep.x, 0.0));
  float hL = smoothHeight(vDuv - vec2(gStep.x, 0.0));
  float hD = smoothHeight(vDuv + vec2(0.0, gStep.y));
  float hU = smoothHeight(vDuv - vec2(0.0, gStep.y));

  float slope = 5.0;
  vec3 N_local = normalize(vec3(-(hR - hL) * slope, (hD - hU) * slope, 1.0));
  vec3 N_world = normalize(uRot3 * N_local);
  vec3 cardN = normalize(uRot3 * vec3(0.0, 0.0, 1.0));

  vec3 V_world = normalize(uCamPos - vWorldPos);
  vec3 rd = -V_world;
  vec3 L1_local = normalize(transpose(uRot3) * normalize(vec3(-0.22, 0.82, 0.53)));

  // FluidGlass: Schlick Fresnel con IOR = 1.50
  float cosi = clamp(-dot(rd, N_world), 0.0, 1.0);
  float f0 = pow((U_IOR - 1.0) / (U_IOR + 1.0), 2.0);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - cosi, 5.0);

  // Rifrazione + dispersione cromatica RGB attraverso lo spessore reale della goccia 3D
  vec3 rdLocal = normalize(transpose(uRot3) * rd);
  vec3 insideG = refract(rdLocal, N_local, 1.0 / U_IOR);
  vec3 spread = vec3(-1.0, 0.0, 1.0) * U_DISPERSION * 0.06;
  vec3 insideR = refract(rdLocal, N_local, 1.0 / (U_IOR + spread.x));
  vec3 insideB = refract(rdLocal, N_local, 1.0 / (U_IOR + spread.z));

  float thick = 0.014 + 0.076 * hC;
  vec2 hitR = vDuv + vec2(insideR.x, -insideR.y) / max(abs(insideR.z), 0.25) * thick;
  vec2 hitG = vDuv + vec2(insideG.x, -insideG.y) / max(abs(insideG.z), 0.25) * thick;
  vec2 hitB = vDuv + vec2(insideB.x, -insideB.y) / max(abs(insideB.z), 0.25) * thick;

  vec3 colR = cardSurfaceAt(hitR, cardN, V_world, L1_local);
  vec3 colG = cardSurfaceAt(hitG, cardN, V_world, L1_local);
  vec3 colB = cardSurfaceAt(hitB, cardN, V_world, L1_local);
  vec4 transmitted = vec4(colR.r, colG.g, colB.b, 1.0);

  // Riflessione speculare studio FluidGlass (key + strip softboxes)
  vec3 mirrorDir = reflect(rd, N_world);
  vec4 mirror = fgLight(mirrorDir, U_REFLECTION);
  vec4 reflected = fgLight(mirrorDir, U_REFLECTION * fresnel);

  // Composizione ottica FluidGlass: reflected + transmitted * (1 - reflected.a) + edge + rimLight
  vec4 glass = reflected + transmitted * (1.0 - reflected.a);
  float edge = 1.0 - smoothstep(0.04, 0.30, cosi);
  glass = mix(glass, mirror + transmitted * (1.0 - mirror.a), edge * 0.78);

  vec2 facing = normalize(vec2(-0.42, 0.55));
  float rimLight = pow(1.0 - cosi, 3.0) * (0.25 + 0.75 * abs(dot(normalize(N_local.xy + 1e-5), facing))) * 0.58 * U_REFLECTION;
  rimLight *= smoothstep(0.0, 0.08, cosi);
  glass.rgb = vec3(rimLight) + glass.rgb * (1.0 - rimLight);

  outColor = vec4(clamp(glass.rgb, 0.0, 1.0), alpha);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  return p;
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export const CustomCard3D = forwardRef<CustomCard3DHandle, Props>(function CustomCard3D(
  { name, logo, creds, copiedText, tip, onCopy, ariaLabel },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ name, logo, creds, copiedText, tip, onCopy });
  propsRef.current = { name, logo, creds, copiedText, tip, onCopy };

  const stRef = useRef({
    // Stato interattivo
    ry: 0,
    rx: 0,
    rz: 0,
    vy: 0,
    vx: 0,
    snap: 0,
    px: 0,
    py: 0,
    drag: false,
    moved: 0,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    // Stato entrata 3D (caduta + giravolte + lievitazione)
    introActive: true,
    introStarted: false,
    introStartMs: 0,
    ciaoStarted: false,
    ciaoStartMs: 0,
    ciaoProgress: 0,
    reduce: false,
    cardY: 9.2,
    cardZ: -3.2,
    redrawBack: () => {},
  });

  useImperativeHandle(ref, () => ({
    flip() {
      const a = stRef.current;
      a.introActive = false;
      a.snap = Math.round(a.ry / 180) * 180 + 180;
    },
    showBack() {
      const a = stRef.current;
      a.introActive = false;
      a.snap = Math.round(a.ry / 180) * 180 + (((Math.round(a.ry / 180) % 2) + 2) % 2 === 0 ? 180 : 0);
    },
  }), []);

  useEffect(() => {
    stRef.current.redrawBack();
  }, [creds, tip, copiedText]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stRef.current.reduce = reduce;
    if (reduce) {
      const a = stRef.current;
      a.introActive = false;
      a.introStarted = true;
      a.ciaoStarted = true;
      a.ciaoProgress = 1;
      a.cardY = 0;
      a.cardZ = 0;
      a.rx = 0;
      a.ry = 0;
      a.rz = 0;
      return;
    }
    return onIntroLift(() => {
      const a = stRef.current;
      a.introStarted = true;
      a.introStartMs = performance.now();
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: true, powerPreference: "high-performance" });
    if (!gl) return;

    let dead = false;

    // Programs
    const floorProg = linkProgram(gl, FLOOR_VERT, FLOOR_FRAG);
    const cardProg = linkProgram(gl, CARD_VERT, CARD_FRAG);
    const ciaoProg = linkProgram(gl, CIAO_VERT, CIAO_FRAG);

    // Geometries + VAOs
    const floorGeo = buildFloorGeometry();
    const floorVao = gl.createVertexArray()!;
    gl.bindVertexArray(floorVao);
    const floorVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVbo);
    gl.bufferData(gl.ARRAY_BUFFER, floorGeo.vertices, gl.STATIC_DRAW);
    const fPosLoc = gl.getAttribLocation(floorProg, "aPos");
    gl.enableVertexAttribArray(fPosLoc);
    gl.vertexAttribPointer(fPosLoc, 3, gl.FLOAT, false, 0, 0);
    const floorIbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floorGeo.indices, gl.STATIC_DRAW);

    const cardGeo = buildCardGeometry();
    const cardVao = gl.createVertexArray()!;
    gl.bindVertexArray(cardVao);
    const cardVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, cardVbo);
    gl.bufferData(gl.ARRAY_BUFFER, cardGeo.vertices, gl.STATIC_DRAW);
    const cStride = 9 * 4;
    const cPos = gl.getAttribLocation(cardProg, "aPos");
    const cNorm = gl.getAttribLocation(cardProg, "aNorm");
    const cUv = gl.getAttribLocation(cardProg, "aUv");
    const cMat = gl.getAttribLocation(cardProg, "aMat");
    gl.enableVertexAttribArray(cPos); gl.vertexAttribPointer(cPos, 3, gl.FLOAT, false, cStride, 0);
    gl.enableVertexAttribArray(cNorm); gl.vertexAttribPointer(cNorm, 3, gl.FLOAT, false, cStride, 12);
    gl.enableVertexAttribArray(cUv); gl.vertexAttribPointer(cUv, 2, gl.FLOAT, false, cStride, 24);
    gl.enableVertexAttribArray(cMat); gl.vertexAttribPointer(cMat, 1, gl.FLOAT, false, cStride, 32);
    const cardIbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cardIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cardGeo.indices, gl.STATIC_DRAW);

    const ciaoGeo = buildCiaoMesh(320, 110);
    const ciaoVao = gl.createVertexArray()!;
    gl.bindVertexArray(ciaoVao);
    const ciaoVbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, ciaoVbo);
    gl.bufferData(gl.ARRAY_BUFFER, ciaoGeo.vertices, gl.STATIC_DRAW);
    const gStride = 5 * 4;
    const gPos = gl.getAttribLocation(ciaoProg, "aPos");
    const gUv = gl.getAttribLocation(ciaoProg, "aUv");
    gl.enableVertexAttribArray(gPos); gl.vertexAttribPointer(gPos, 3, gl.FLOAT, false, gStride, 0);
    gl.enableVertexAttribArray(gUv); gl.vertexAttribPointer(gUv, 2, gl.FLOAT, false, gStride, 12);
    const ciaoIbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ciaoIbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ciaoGeo.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // Textures
    const makeTex = (unit: number) => {
      const tex = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 0]));
      return tex;
    };
    const dataTex = makeTex(0);
    const pass2Tex = makeTex(1);
    const frontTex = makeTex(2);
    const backTex = makeTex(3);

    let dataReady = 0;
    const loadImgTex = (url: string, tex: WebGLTexture, unit: number) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (dead) return;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        dataReady++;
      };
      img.src = url;
    };
    loadImgTex("/card/ciao-data.png", dataTex, 0);
    loadImgTex("/card/ciao-pass2.png", pass2Tex, 1);

    // Canvas 2D ad alta risoluzione per firma frontale e pillole posteriori
    const frontCv = document.createElement("canvas");
    frontCv.width = 1712;
    frontCv.height = 1080;
    const renderFrontTex = (logoImg?: HTMLImageElement) => {
      if (dead) return;
      const ctx = frontCv.getContext("2d")!;
      ctx.clearRect(0, 0, frontCv.width, frontCv.height);
      const { name: nm } = propsRef.current;
      const yCenter = frontCv.height - 68;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";

      const logoH = 56;
      const logoW = logoImg && logoImg.naturalHeight ? Math.min(200, (logoImg.naturalWidth / logoImg.naturalHeight) * logoH) : 0;
      ctx.font = "700 46px system-ui, -apple-system, sans-serif";
      const leftText = !logoImg && nm ? nm : "";
      const leftW = logoImg ? logoW : ctx.measureText(leftText).width;

      const xFont = "400 44px system-ui, -apple-system, sans-serif";
      ctx.font = xFont;
      const xW = ctx.measureText("×").width;

      const logoFontVar = getComputedStyle(document.documentElement).getPropertyValue("--font-logo").trim();
      const meFont = `500 56px ${logoFontVar || "Georgia, serif"}`;
      ctx.font = meFont;
      const meText = "Filippo Corsini";
      const meW = ctx.measureText(meText).width;

      const gap = 24;
      const totalW = leftW + gap + xW + gap + meW;
      let curX = (frontCv.width - totalW) * 0.5;

      if (logoImg && logoW > 0) {
        ctx.drawImage(logoImg, curX, yCenter - logoH * 0.5, logoW, logoH);
      } else if (leftText) {
        ctx.font = "700 46px system-ui, -apple-system, sans-serif";
        ctx.fillText(leftText, curX, yCenter);
      }
      curX += leftW + gap;

      ctx.globalAlpha = 0.78;
      ctx.font = xFont;
      ctx.fillText("×", curX, yCenter);
      ctx.globalAlpha = 1;
      curX += xW + gap;

      ctx.font = meFont;
      ctx.fillText(meText, curX, yCenter);

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, frontTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frontCv);
    };

    let loadedLogo: HTMLImageElement | undefined;
    if (propsRef.current.logo) {
      const lImg = new Image();
      lImg.crossOrigin = "anonymous";
      lImg.onload = () => { loadedLogo = lImg; renderFrontTex(lImg); };
      lImg.onerror = () => renderFrontTex();
      lImg.src = propsRef.current.logo;
    } else {
      renderFrontTex();
    }
    document.fonts?.ready.then(() => { if (!dead) renderFrontTex(loadedLogo); });

    const backCv = document.createElement("canvas");
    backCv.width = 1712;
    backCv.height = 1080;
    const renderBackTex = () => {
      if (dead) return;
      const ctx = backCv.getContext("2d")!;
      ctx.clearRect(0, 0, backCv.width, backCv.height);
      const { creds: cr, tip: tp, copiedText: cp } = propsRef.current;

      const drawPill = (topFrac: number, text: string, isDots: boolean, isTip: boolean, isUser: boolean) => {
        const px = 0.1262 * backCv.width;
        const pw = 0.7477 * backCv.width;
        const py = topFrac * backCv.height;
        const ph = 0.178 * backCv.height;

        const grad = ctx.createLinearGradient(0, py, 0, py + ph);
        grad.addColorStop(0, "rgba(255,255,255,0.86)");
        grad.addColorStop(1, "rgba(232,244,250,0.62)");
        drawRoundedRect(ctx, px, py, pw, ph, ph * 0.5);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.stroke();

        // Icona minimalista a sinistra
        ctx.strokeStyle = "#162d36";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const ix = px + 88;
        const iy = py + ph * 0.5;
        if (isUser) {
          ctx.beginPath();
          ctx.arc(ix, iy - 12, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ix, iy + 26, 22, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(ix - 8, iy, 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(ix + 5, iy);
          ctx.lineTo(ix + 26, iy);
          ctx.lineTo(ix + 26, iy + 9);
          ctx.stroke();
        }

        ctx.fillStyle = isDots ? "rgba(22, 45, 54, 0.55)" : "#162d36";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${isUser ? 66 : 54}px system-ui, -apple-system, sans-serif`;
        ctx.fillText(text, px + pw * 0.5, iy + 2);

        if (isTip) {
          ctx.textAlign = "right";
          ctx.fillStyle = "rgba(22, 45, 54, 0.78)";
          ctx.font = "700 34px system-ui, -apple-system, sans-serif";
          ctx.fillText(cp, px + pw - 52, iy + 2);
        }
        ctx.textAlign = "left";
      };

      drawPill(0.30, cr ? cr.user : "• • • • • • • •", !cr, tp === "user", true);
      drawPill(0.525, cr ? cr.pass : "• • • • • • • • • •", !cr, tp === "pass", false);

      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, backTex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backCv);
    };
    stRef.current.redrawBack = renderBackTex;
    renderBackTex();

    // Uniform locations
    const fLoc = {
      uVP: gl.getUniformLocation(floorProg, "uVP"),
      uCardPos: gl.getUniformLocation(floorProg, "uCardPos"),
      uCardRot: gl.getUniformLocation(floorProg, "uCardRot"),
    };
    const cLoc = {
      uVP: gl.getUniformLocation(cardProg, "uVP"),
      uModel: gl.getUniformLocation(cardProg, "uModel"),
      uRot3: gl.getUniformLocation(cardProg, "uRot3"),
      uCamPos: gl.getUniformLocation(cardProg, "uCamPos"),
      uCardColor: gl.getUniformLocation(cardProg, "uCardColor"),
      uProgress: gl.getUniformLocation(cardProg, "uProgress"),
      uFrontTex: gl.getUniformLocation(cardProg, "uFrontTex"),
      uBackTex: gl.getUniformLocation(cardProg, "uBackTex"),
      uData: gl.getUniformLocation(cardProg, "uData"),
      uPass2: gl.getUniformLocation(cardProg, "uPass2"),
    };
    const gLoc = {
      uVP: gl.getUniformLocation(ciaoProg, "uVP"),
      uModel: gl.getUniformLocation(ciaoProg, "uModel"),
      uRot3: gl.getUniformLocation(ciaoProg, "uRot3"),
      uCamPos: gl.getUniformLocation(ciaoProg, "uCamPos"),
      uCardColor: gl.getUniformLocation(ciaoProg, "uCardColor"),
      uProgress: gl.getUniformLocation(ciaoProg, "uProgress"),
      uData: gl.getUniformLocation(ciaoProg, "uData"),
      uPass2: gl.getUniformLocation(ciaoProg, "uPass2"),
    };

    const viewMat = mat4LookAt(CAM_POS, CAM_TARGET);
    let projMat = mat4Perspective((34 * Math.PI) / 180, 1, 0.5, 100);
    let vpMat = mat4Mul(projMat, viewMat);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(2, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      const aspect = canvas.width / canvas.height;
      // Su schermi stretti (mobile) allarga leggermente il FOV cosi' la card entra comodamente
      const fov = aspect < 1.1 ? (34 * Math.PI) / 180 / Math.max(0.58, aspect * 0.92) : (34 * Math.PI) / 180;
      projMat = mat4Perspective(Math.min(fov, (58 * Math.PI) / 180), aspect, 0.5, 100);
      vpMat = mat4Mul(projMat, viewMat);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let raf = 0;
    let lastNow = performance.now();

    const frame = (now: number) => {
      if (dead) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      const a = stRef.current;

      // 1. Animazione entrata: caduta nel centro -> lievitazione -> giravolte fluide
      if (a.introActive) {
        if (!a.introStarted) {
          a.cardY = 9.2;
          a.cardZ = -3.2;
          a.ry = -405;
          a.rx = -32;
          a.rz = 16;
        } else {
          const t = Math.min(1, (now - a.introStartMs) / 1550);
          const easeOut = 1 - Math.pow(1 - t, 4);
          // Caduta con morbido affondo verso il pavimento e risalita in lievitazione
          const dip = Math.sin(t * Math.PI) * Math.pow(1 - t, 1.35) * -1.45;
          a.cardY = 9.2 * Math.pow(1 - t, 3.2) + dip;
          a.cardZ = -3.2 * (1 - easeOut);
          // Giravolta fluida di 360+ gradi che rallenta morbidamente in posizione frontale
          a.ry = -390 * Math.pow(1 - t, 3.4);
          a.rx = -30 * Math.pow(1 - t, 2.8) + Math.sin(t * Math.PI * 2) * (1 - t) * 10;
          a.rz = 16 * Math.pow(1 - t, 3.0) - Math.sin(t * Math.PI * 1.5) * (1 - t) * 7;

          // Avvia la scrittura veloce del "Ciao!" leggermente prima che la card si fermi
          if (!a.ciaoStarted && t >= 0.48) {
            a.ciaoStarted = true;
            a.ciaoStartMs = now;
          }
          if (t >= 1) {
            a.introActive = false;
            a.cardY = 0;
            a.cardZ = 0;
            a.ry = 0;
            a.rx = 0;
            a.rz = 0;
          }
        }
      } else {
        // Lievitazione morbida continua nello spazio 3D
        const hover = a.reduce ? 0 : Math.sin(now * 0.00145) * 0.085;
        a.cardY += (hover - a.cardY) * (1 - Math.exp(-dt * 6));
        a.cardZ += (0 - a.cardZ) * (1 - Math.exp(-dt * 6));
        a.rz += (0 - a.rz) * (1 - Math.exp(-dt * 8));

        if (!a.drag) {
          const ty = a.snap + (a.reduce ? 0 : a.px * 10);
          const tx = a.reduce ? 0 : -a.py * 8;
          const k = 26, c = 9.5;
          a.vy += ((ty - a.ry) * k - a.vy * c) * dt;
          a.vx += ((tx - a.rx) * k - a.vx * c) * dt;
          a.ry += a.vy * dt;
          a.rx += a.vx * dt;
        }
      }

      // 2. Animazione scrittura "Ciao!" piu' veloce (2.05s)
      if (a.ciaoStarted && a.ciaoProgress < 1) {
        a.ciaoProgress = Math.min(1, (now - a.ciaoStartMs) / 2050);
      }

      const rxRad = (a.rx * Math.PI) / 180;
      const ryRad = (a.ry * Math.PI) / 180;
      const rzRad = (a.rz * Math.PI) / 180;
      const { model, rot3 } = buildModelMatrix(0, a.cardY, a.cardZ, rxRad, ryRad, rzRad);

      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Passo 1: Piatto studio 3D infinito con ombra dinamica
      gl.disable(gl.BLEND);
      gl.depthMask(true);
      gl.useProgram(floorProg);
      gl.bindVertexArray(floorVao);
      gl.uniformMatrix4fv(fLoc.uVP, false, vpMat);
      gl.uniform3f(fLoc.uCardPos, 0, a.cardY, a.cardZ);
      gl.uniform3f(fLoc.uCardRot, rxRad, ryRad, rzRad);
      gl.drawElements(gl.TRIANGLES, floorGeo.indices.length, gl.UNSIGNED_SHORT, 0);

      // Passo 2: Card 3D solida con bordi arrotondati 100% pieni
      gl.useProgram(cardProg);
      gl.bindVertexArray(cardVao);
      gl.uniformMatrix4fv(cLoc.uVP, false, vpMat);
      gl.uniformMatrix4fv(cLoc.uModel, false, model);
      gl.uniformMatrix3fv(cLoc.uRot3, false, rot3);
      gl.uniform3fv(cLoc.uCamPos, CAM_POS);
      gl.uniform3fv(cLoc.uCardColor, CARD_RGB);
      gl.uniform1f(cLoc.uProgress, a.ciaoProgress);
      gl.uniform1i(cLoc.uData, 0);
      gl.uniform1i(cLoc.uPass2, 1);
      gl.uniform1i(cLoc.uFrontTex, 2);
      gl.uniform1i(cLoc.uBackTex, 3);
      gl.drawElements(gl.TRIANGLES, cardGeo.indices.length, gl.UNSIGNED_INT, 0);

      // Passo 3: Vero rilievo 3D a goccia d'acqua "Ciao!" (mesh spostata lungo +Z)
      if (dataReady >= 2 && a.ciaoProgress > 0.001) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(ciaoProg);
        gl.bindVertexArray(ciaoVao);
        gl.uniformMatrix4fv(gLoc.uVP, false, vpMat);
        gl.uniformMatrix4fv(gLoc.uModel, false, model);
        gl.uniformMatrix3fv(gLoc.uRot3, false, rot3);
        gl.uniform3fv(gLoc.uCamPos, CAM_POS);
        gl.uniform3fv(gLoc.uCardColor, CARD_RGB);
        gl.uniform1f(gLoc.uProgress, a.ciaoProgress);
        gl.uniform1i(gLoc.uData, 0);
        gl.uniform1i(gLoc.uPass2, 1);
        gl.drawElements(gl.TRIANGLES, ciaoGeo.indices.length, gl.UNSIGNED_INT, 0);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteTexture(dataTex);
      gl.deleteTexture(pass2Tex);
      gl.deleteTexture(frontTex);
      gl.deleteTexture(backTex);
      gl.deleteBuffer(floorVbo); gl.deleteBuffer(floorIbo); gl.deleteVertexArray(floorVao);
      gl.deleteBuffer(cardVbo); gl.deleteBuffer(cardIbo); gl.deleteVertexArray(cardVao);
      gl.deleteBuffer(ciaoVbo); gl.deleteBuffer(ciaoIbo); gl.deleteVertexArray(ciaoVao);
      gl.deleteProgram(floorProg); gl.deleteProgram(cardProg); gl.deleteProgram(ciaoProg);
    };
  }, []);

  const updatePointer = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    stRef.current.px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    stRef.current.py = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const a = stRef.current;
    a.introActive = false;
    a.drag = true;
    a.moved = 0;
    a.vy = 0;
    a.vx = 0;
    a.lastX = e.clientX;
    a.lastY = e.clientY;
    a.lastT = performance.now();
    canvasRef.current!.setPointerCapture(e.pointerId);
    updatePointer(e);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const a = stRef.current;
    updatePointer(e);
    if (a.drag) {
      const dx = e.clientX - a.lastX;
      const dy = e.clientY - a.lastY;
      const now = performance.now();
      const dtm = Math.max(1, now - a.lastT);
      a.moved += Math.abs(dx) + Math.abs(dy);
      a.ry += dx * 0.48;
      a.rx = clamp(a.rx - dy * 0.30, -58, 58);
      a.vy = (dx * 0.48) / (dtm / 1000);
      a.vx = (-dy * 0.30) / (dtm / 1000);
      a.lastX = e.clientX;
      a.lastY = e.clientY;
      a.lastT = now;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const a = stRef.current;
    if (!a.drag) return;
    a.drag = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    if (a.moved < 6) {
      const ang = ((a.ry % 360) + 360) % 360;
      const showingBack = ang > 90 && ang < 270;
      if (showingBack && propsRef.current.creds) {
        const r = canvasRef.current!.getBoundingClientRect();
        const ny = (e.clientY - r.top) / r.height;
        if (ny > 0.36 && ny < 0.50) {
          propsRef.current.onCopy("user");
          return;
        }
        if (ny >= 0.50 && ny < 0.64) {
          propsRef.current.onCopy("pass");
          return;
        }
      }
      a.snap = Math.round(a.ry / 180) * 180 + 180;
    } else {
      a.snap = Math.round((a.ry + clamp(a.vy, -700, 700) * 0.16) / 180) * 180;
    }
  };

  const onPointerLeave = () => {
    const a = stRef.current;
    if (!a.drag) {
      a.px = 0;
      a.py = 0;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const a = stRef.current;
          a.introActive = false;
          a.snap = Math.round(a.ry / 180) * 180 + 180;
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        display: "block",
        touchAction: "none",
        cursor: "grab",
        zIndex: 1,
        background: "#ffffff",
      }}
      data-card-color={CARD_HEX}
    />
  );
});
