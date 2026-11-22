"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import s from "./card.module.css";

export type CiaoGlassHandle = {
  /** Aggiorna la rotazione 3D della card (in gradi) senza re-render React. */
  setTilt: (rxDeg: number, ryDeg: number) => void;
  /** Avvia l'animazione fluida di scrittura del "Ciao!". */
  play: (delayMs?: number) => void;
  /** Mostra subito il "Ciao!" completo. */
  settle: () => void;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Padding attorno a ciao-data.png per contenere l'ombra proiettata senza tagli:
// X: [-0.04, 1.04], Y: [-0.08, 1.16]
const FRAG = `
precision highp float;

uniform sampler2D uData;  // R = sdf (0..1), G = alpha, B = t1 primo passaggio
uniform sampler2D uBg;    // back.webp
uniform sampler2D uPass2; // R = t2 secondo passaggio (1.0 = nessun ripasso)
uniform vec2 uRot;        // (rxRad, ryRad)
uniform float uProgress;  // 0..1

varying vec2 vUv;

const vec2 TEXEL = vec2(1.0 / 1320.0, 1.0 / 450.0);

vec2 toDataUv(vec2 uv) {
  return vec2(mix(-0.04, 1.04, uv.x), mix(-0.08, 1.16, uv.y));
}

vec4 sampleData(vec2 duv) {
  if (duv.x < 0.0 || duv.x > 1.0 || duv.y < 0.0 || duv.y > 1.0) {
    return vec4(0.0);
  }
  return texture2D(uData, duv);
}

float samplePass2(vec2 duv) {
  if (duv.x < 0.0 || duv.x > 1.0 || duv.y < 0.0 || duv.y > 1.0) {
    return 1.0;
  }
  return texture2D(uPass2, duv).r;
}

// Campiona la distanza SDF lisciata per evitare creste sull'asse mediano
float smoothSdf(vec2 duv) {
  vec2 o = TEXEL * 2.2;
  float s = sampleData(duv).r * 0.28;
  s += sampleData(duv + vec2( o.x,  0.0)).r * 0.12;
  s += sampleData(duv + vec2(-o.x,  0.0)).r * 0.12;
  s += sampleData(duv + vec2( 0.0,  o.y)).r * 0.12;
  s += sampleData(duv + vec2( 0.0, -o.y)).r * 0.12;
  s += sampleData(duv + vec2( o.x,  o.y)).r * 0.06;
  s += sampleData(duv + vec2(-o.x,  o.y)).r * 0.06;
  s += sampleData(duv + vec2( o.x, -o.y)).r * 0.06;
  s += sampleData(duv + vec2(-o.x, -o.y)).r * 0.06;
  return s;
}

// Profilo a cupola lenticolare del vetro liquido
float domeHeight(float d) {
  float u = clamp(d * 1.12, 0.0, 1.0);
  return pow(max(0.0, 1.0 - (1.0 - u) * (1.0 - u)), 0.52);
}

float revealTime(float tVal) {
  float edge = 0.012;
  float p = uProgress * (1.0 + edge * 1.4) - edge * 0.2;
  return smoothstep(tVal - edge, tVal + edge * 0.35, p);
}

float revealAt(vec4 dat) {
  return revealTime(dat.b);
}

float overlapAt(vec2 duv) {
  float t2 = samplePass2(duv);
  if (t2 > 0.99) return 0.0;
  return revealTime(t2);
}

// Altezza combinata: cupola base + rilievo del secondo passaggio sui tratti sovrapposti
float combinedHeight(vec2 duv, float swell) {
  float h = domeHeight(smoothSdf(duv)) * swell;
  float p2 = overlapAt(duv);
  // Il secondo strato aggiunge spessore convesso morbido al centro del tratto sovrapposto
  return h * (1.0 + 0.34 * p2);
}

// Matrice di rotazione CSS: rotateX(rx) * rotateY(ry)
mat3 cardRot(vec2 rot) {
  float cx = cos(rot.x), sx = sin(rot.x);
  float cy = cos(rot.y), sy = sin(rot.y);
  mat3 Rx = mat3(
    1.0, 0.0, 0.0,
    0.0,  cx,  sx,
    0.0, -sx,  cx
  );
  mat3 Ry = mat3(
     cy, 0.0, -sy,
    0.0, 1.0,  0.0,
     sy, 0.0,  cy
  );
  return Rx * Ry;
}

void main() {
  vec2 duv = toDataUv(vUv);
  vec4 dat = sampleData(duv);

  mat3 R = cardRot(uRot);
  // Luce reale: unica sorgente centrale dall'alto, leggermente frontale
  vec3 L_world = normalize(vec3(0.0, 0.86, 0.51));
  vec3 V_world = vec3(0.0, 0.0, 1.0);

  mat3 Rt = mat3(
    R[0][0], R[1][0], R[2][0],
    R[0][1], R[1][1], R[2][1],
    R[0][2], R[1][2], R[2][2]
  );
  vec3 L_local = normalize(Rt * L_world);
  vec3 V_local = normalize(Rt * V_world);

  // 1. Ombra reale morbida proiettata sulla card bianca dalla luce dall'alto (5 tap)
  vec2 shDir = vec2(-L_local.x, L_local.y) * vec2(0.010, 0.028);
  vec2 sUv = duv - shDir;
  vec2 sRad = TEXEL * 7.0;
  float sh = 0.0;
  vec4 sd0 = sampleData(sUv);
  sh += sd0.g * revealAt(sd0) * (1.0 + 0.28 * overlapAt(sUv)) * 0.32;
  vec4 sd1 = sampleData(sUv + vec2( sRad.x,  0.0)); sh += sd1.g * revealAt(sd1) * 0.17;
  vec4 sd2 = sampleData(sUv + vec2(-sRad.x,  0.0)); sh += sd2.g * revealAt(sd2) * 0.17;
  vec4 sd3 = sampleData(sUv + vec2( 0.0,  sRad.y)); sh += sd3.g * revealAt(sd3) * 0.17;
  vec4 sd4 = sampleData(sUv + vec2( 0.0, -sRad.y)); sh += sd4.g * revealAt(sd4) * 0.17;
  float shadowAlpha = min(0.45, sh * 0.30);

  // 2. Maschera e crescita fluida della goccia di vetro
  float rev = revealAt(dat);
  float glassAlpha = smoothstep(0.08, 0.72, dat.g) * rev;

  if (glassAlpha < 0.004 && shadowAlpha < 0.004) {
    discard;
  }

  // Ombra morbida su carta bianca (tono blu-ardesia tenue)
  vec3 outCol = vec3(0.08, 0.18, 0.30);
  float outA = shadowAlpha;

  if (glassAlpha >= 0.004) {
    float swell = smoothstep(0.0, 1.0, rev);
    float dC = smoothSdf(duv);
    float p2 = overlapAt(duv);
    float hC = combinedHeight(duv, swell);

    // Gradiente della cupola combinata (base + rilievo del secondo passaggio) -> normale 3D locale
    vec2 gStep = TEXEL * 2.5;
    float hR = combinedHeight(duv + vec2(gStep.x, 0.0), swell);
    float hL = combinedHeight(duv - vec2(gStep.x, 0.0), swell);
    float hD = combinedHeight(duv + vec2(0.0, gStep.y), swell);
    float hU = combinedHeight(duv - vec2(0.0, gStep.y), swell);

    float slope = 3.2;
    vec3 N_local = normalize(vec3(-(hR - hL) * slope, (hD - hU) * slope, 1.0));
    vec3 N_world = normalize(R * N_local);

    // 3. Rifrazione reale (legge di Snell) dello sfondo chiaro della card (piu' profonda sui tratti ripassati)
    vec2 cardUv = vec2(0.1168 + duv.x * 0.771, 0.25 + duv.y * 0.416652);
    float thick = (0.018 + 0.048 * hC) * swell;

    vec3 tr = refract(-V_local, N_local, 1.0 / 1.48);
    vec3 tg = refract(-V_local, N_local, 1.0 / 1.50);
    vec3 tb = refract(-V_local, N_local, 1.0 / 1.525);

    vec2 offR = vec2(tr.x, -tr.y) / max(abs(tr.z), 0.3) * thick;
    vec2 offG = vec2(tg.x, -tg.y) / max(abs(tg.z), 0.3) * thick;
    vec2 offB = vec2(tb.x, -tb.y) / max(abs(tb.z), 0.3) * thick;

    vec2 aspectFix = vec2(1.0 / 1.585, 1.0);
    float bgR = texture2D(uBg, clamp(cardUv + offR * aspectFix, 0.002, 0.998)).r;
    float bgG = texture2D(uBg, clamp(cardUv + offG * aspectFix, 0.002, 0.998)).g;
    float bgB = texture2D(uBg, clamp(cardUv + offB * aspectFix, 0.002, 0.998)).b;
    vec3 refracted = vec3(bgR, bgG, bgB);

    // Spessore ottico: i tratti ripassati (p2 > 0) hanno un lieve assorbimento cristallino piu' profondo
    float NdotV = max(dot(N_world, V_world), 0.0);
    float edgeDark = pow(1.0 - NdotV, 1.8) * (0.34 + 0.14 * p2);
    vec3 glassTint = mix(vec3(0.84, 0.91, 0.97), vec3(0.96, 0.99, 1.0), clamp(hC * 0.85, 0.0, 1.0));
    glassTint *= mix(vec3(1.0), vec3(0.92, 0.96, 1.0), p2);
    vec3 transmitted = refracted * glassTint * (1.0 - edgeDark);

    // 4. Riflessione Fresnel reale in studio luminoso (luce morbida dall'alto)
    float fresnel = 0.04 + 0.96 * pow(1.0 - NdotV, 3.6);
    vec3 Refl = reflect(-V_world, N_world);
    float topLight = smoothstep(0.05, 0.82, Refl.y) * exp(-Refl.x * Refl.x * 1.2);
    vec3 envColor = mix(vec3(0.76, 0.85, 0.93), vec3(1.0, 1.0, 1.0), topLight);

    // 5. Riflesso speculare diretto dalla luce reale dall'alto (leggermente piu' vivo sul rilievo p2)
    vec3 H = normalize(L_world + V_world);
    float NdotH = max(dot(N_world, H), 0.0);
    float NdotL = max(dot(N_world, L_world), 0.0);
    float specSharp = pow(NdotH, 130.0) * (1.25 + 0.25 * p2) * smoothstep(0.0, 0.12, NdotL);
    float specBroad = pow(NdotH, 22.0) * 0.28 * NdotL;
    vec3 specColor = vec3(1.0) * (specSharp + specBroad);

    // 6. Caustica luminosa sul bordo inferiore
    float lowerCurve = clamp(-N_local.y, 0.0, 1.0);
    float edgeBand = (1.0 - clamp(hC, 0.0, 1.0)) * smoothstep(0.03, 0.36, dC);
    float caustic = pow(lowerCurve, 1.5) * edgeBand * max(L_local.y, 0.0) * 0.38;

    vec3 glassCol = mix(transmitted + vec3(caustic), envColor, clamp(fresnel * 0.72, 0.0, 0.85)) + specColor;
    glassCol = clamp(glassCol, 0.0, 1.0);

    // Composizione vetro sopra l'ombra sulla card
    float invG = 1.0 - glassAlpha;
    float finalA = glassAlpha + outA * invG;
    vec3 finalCol = (glassCol * glassAlpha + outCol * outA * invG) / max(finalA, 0.0001);
    outCol = finalCol;
    outA = finalA;
  }

  gl_FragColor = vec4(outCol * outA, outA);
}
`;

export const CiaoGlass = forwardRef<CiaoGlassHandle, { immediate?: boolean }>(function CiaoGlass({ immediate = false }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    rx: 0,
    ry: 0,
    progress: immediate ? 1 : 0,
    dirty: true,
    ready: 0,
    animRaf: 0,
    delayId: 0,
    draw: () => {},
  });

  useImperativeHandle(ref, () => ({
    setTilt(rxDeg: number, ryDeg: number) {
      const st = stateRef.current;
      st.rx = (rxDeg * Math.PI) / 180;
      st.ry = (ryDeg * Math.PI) / 180;
      st.draw();
    },
    play(delayMs = 120) {
      const st = stateRef.current;
      cancelAnimationFrame(st.animRaf);
      window.clearTimeout(st.delayId);
      st.progress = 0;
      st.draw();
      const DURATION = 4000;
      const start = () => {
        const t0 = performance.now();
        const step = (now: number) => {
          const u = Math.min(1, (now - t0) / DURATION);
          st.progress = u;
          st.draw();
          if (u < 1) st.animRaf = requestAnimationFrame(step);
          else {
            st.progress = 1;
            st.draw();
          }
        };
        st.animRaf = requestAnimationFrame(step);
      };
      if (delayMs > 0) st.delayId = window.setTimeout(start, delayMs);
      else start();
    },
    settle() {
      const st = stateRef.current;
      cancelAnimationFrame(st.animRaf);
      window.clearTimeout(st.delayId);
      st.progress = 1;
      st.draw();
    },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true, powerPreference: "high-performance" });
    if (!gl) return;

    let dead = false;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uData = gl.getUniformLocation(prog, "uData");
    const uBg = gl.getUniformLocation(prog, "uBg");
    const uPass2 = gl.getUniformLocation(prog, "uPass2");
    const uRot = gl.getUniformLocation(prog, "uRot");
    const uProgress = gl.getUniformLocation(prog, "uProgress");

    gl.uniform1i(uData, 0);
    gl.uniform1i(uBg, 1);
    gl.uniform1i(uPass2, 2);

    const st = stateRef.current;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.round(rect.width * dpr));
      const h = Math.max(2, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      if (dead || st.ready < 3) return;
      resize();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRot, st.rx, st.ry);
      gl.uniform1f(uProgress, st.progress);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    st.draw = draw;

    const loadTex = (url: string, unit: number) => {
      const tex = gl.createTexture()!;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (dead) return;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        st.ready++;
        if (st.ready >= 3) draw();
      };
      img.src = url;
      return tex;
    };

    const t0 = loadTex("/card/ciao-data.png", 0);
    const t1 = loadTex("/card/back.webp", 1);
    const t2 = loadTex("/card/ciao-pass2.png", 2);

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);

    return () => {
      dead = true;
      cancelAnimationFrame(st.animRaf);
      window.clearTimeout(st.delayId);
      ro.disconnect();
      gl.deleteTexture(t0);
      gl.deleteTexture(t1);
      gl.deleteTexture(t2);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, []);

  return <canvas ref={canvasRef} className={s.ciaoCanvas} aria-hidden />;
});
