"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/env";
import { drawDesktop, drawMobile } from "./deviceScreens";

/**
 * MacBook Pro e iPhone in 3D (modelli GLB), con il sito disegnato sugli schermi.
 * Si carica solo quando il riquadro è vicino alla vista; se il dispositivo è lento, o non c'è WebGL, resta il disegno di `fallback`.
 */
export function DeviceScene({ fallback }: { fallback: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "ready" | "no">("idle");

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (prefersReducedMotion() || document.documentElement.dataset.perf === "low") {
      setState("no");
      return;
    }
    let dead = false;
    let stop = () => {};
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        void start();
      },
      { rootMargin: "300px" },
    );
    io.observe(el);

    async function start() {
      try {
        const [THREE, { GLTFLoader }, { MeshoptDecoder }, { RoomEnvironment }] = await Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js"), import("three/addons/libs/meshopt_decoder.module.js"), import("three/addons/environments/RoomEnvironment.js")]);
        if (dead || !el) return;
        const canvas = document.createElement("canvas");
        canvas.className = "absolute inset-0 h-full w-full";
        const gl = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        gl.outputColorSpace = THREE.SRGBColorSpace;
        const scene = new THREE.Scene();
        const pm = new THREE.PMREMGenerator(gl);
        scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
        pm.dispose();
        const cam = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        const load = (u: string) => loader.loadAsync(u).then((g) => g.scene);
        const [mac, ph] = await Promise.all([load("/models/macbook.glb"), load("/models/iphone.glb")]);
        if (dead) return;

        // schermi: due tele disegnate che si aggiornano a ogni quadro
        const mk = (w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number, t: number) => void) => {
          const cv = document.createElement("canvas");
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext("2d")!;
          const tex = new THREE.CanvasTexture(cv);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.flipY = false;
          tex.anisotropy = 4;
          draw(ctx, w, h, 0);
          return { tex, tick: (t: number) => { draw(ctx, w, h, t); tex.needsUpdate = true; } };
        };
        const sMac = mk(1024, 640, drawDesktop);
        const sPh = mk(512, 1110, drawMobile);
        const basic = (map: import("three").Texture) => new THREE.MeshBasicMaterial({ map, toneMapped: false });
        mac.traverse((o) => {
          const m = o as import("three").Mesh;
          if (m.isMesh && m.name === "Object_56") m.material = basic(sMac.tex);
        });
        ph.traverse((o) => {
          const m = o as import("three").Mesh;
          if (m.isMesh && m.name === "Front_Screen") m.material = basic(sPh.tex);
        });

        // proporzioni vere: il MacBook è largo 35,5 cm e misura 4,47 unità; l'iPhone è alto 16,3 cm
        const bb = (o: import("three").Object3D) => new THREE.Box3().setFromObject(o);
        const k = 4.47 / 0.355;
        ph.scale.setScalar(k);
        const pb = bb(ph);
        ph.position.y -= pb.min.y;
        const mb = bb(mac);
        mac.position.y -= mb.min.y;
        const phone = new THREE.Group();
        phone.add(ph);
        phone.position.set(2.45, 0, 1.1);
        phone.rotation.y = -0.18;
        const rig = new THREE.Group();
        rig.add(mac, phone);
        const all = bb(rig);
        rig.position.x -= all.getCenter(new THREE.Vector3()).x;
        const size = all.getSize(new THREE.Vector3());
        scene.add(rig);

        const resize = () => {
          const w = el.clientWidth;
          const h = el.clientHeight;
          gl.setSize(w, h, false);
          cam.aspect = w / h;
          const fov = (cam.fov * Math.PI) / 180;
          const dv = (size.y * 1.5) / 2 / Math.tan(fov / 2);
          const dh = (size.x * 1.2) / 2 / Math.tan(Math.atan(Math.tan(fov / 2) * cam.aspect));
          const d = Math.max(dv, dh);
          cam.position.set(0, size.y * 0.62 + d * 0.12, d);
          cam.lookAt(0, size.y * 0.4, 0);
          cam.updateProjectionMatrix();
        };
        el.prepend(canvas);
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);

        let vis = true;
        const io2 = new IntersectionObserver(([e]) => void (vis = e.isIntersecting));
        io2.observe(el);
        const t0 = performance.now();
        let raf = 0;
        let first = true;
        const frame = () => {
          raf = requestAnimationFrame(frame);
          if (!vis) return;
          const t = (performance.now() - t0) / 1000;
          sMac.tick(t);
          sPh.tick(t + 1.5);
          rig.rotation.y = -0.34 + Math.sin(t * 0.45) * 0.26;
          rig.rotation.x = Math.sin(t * 0.32) * 0.03;
          phone.position.y = Math.sin(t * 0.9) * 0.05;
          gl.render(scene, cam);
          if (first) {
            first = false;
            setState("ready");
          }
        };
        frame();
        stop = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          io2.disconnect();
          gl.dispose();
          scene.traverse((o) => {
            const m = o as import("three").Mesh;
            if (m.isMesh) {
              m.geometry.dispose();
              (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
            }
          });
          canvas.remove();
        };
      } catch {
        if (!dead) setState("no");
      }
    }
    return () => {
      dead = true;
      io.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={host} className="relative h-full">
      <div className={`h-full transition-opacity duration-500 ${state === "ready" ? "opacity-0" : "opacity-100"}`} aria-hidden={state === "ready"}>
        {fallback}
      </div>
    </div>
  );
}
