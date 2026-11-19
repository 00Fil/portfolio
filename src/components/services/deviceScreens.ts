/** Schermate disegnate a mano per i modelli 3D: lo stesso sito in versione computer e telefono, con piccoli movimenti. Nessun testo, solo forme. */

const BLUE = "#2f6fe0";
const SKY = "#8fd8ff";

function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

function hero(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number) {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, SKY);
  g.addColorStop(1, BLUE);
  c.fillStyle = g;
  rr(c, x, y, w, h, Math.min(w, h) * 0.07);
  c.fill();
  c.save();
  rr(c, x, y, w, h, Math.min(w, h) * 0.07);
  c.clip();
  const gx = x + ((t * 0.18) % 1.6) * w - w * 0.3;
  const sh = c.createLinearGradient(gx - w * 0.2, 0, gx + w * 0.2, 0);
  sh.addColorStop(0, "rgba(255,255,255,0)");
  sh.addColorStop(0.5, "rgba(255,255,255,.35)");
  sh.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = sh;
  c.fillRect(x, y, w, h);
  c.restore();
}

function card(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a: number, hue: number) {
  c.globalAlpha = a;
  c.fillStyle = "#fff";
  c.shadowColor = "rgba(20,50,100,.18)";
  c.shadowBlur = h * 0.18;
  c.shadowOffsetY = h * 0.05;
  rr(c, x, y, w, h, h * 0.12);
  c.fill();
  c.shadowColor = "transparent";
  const g = c.createLinearGradient(x, y, x + h * 0.3, y + h * 0.3);
  g.addColorStop(0, hue ? "#b4e8ff" : SKY);
  g.addColorStop(1, BLUE);
  c.fillStyle = g;
  rr(c, x + h * 0.12, y + h * 0.12, h * 0.26, h * 0.26, h * 0.07);
  c.fill();
  c.fillStyle = "#dfe6f1";
  rr(c, x + h * 0.12, y + h * 0.5, w - h * 0.24, h * 0.1, h * 0.05);
  c.fill();
  rr(c, x + h * 0.12, y + h * 0.68, (w - h * 0.24) * 0.6, h * 0.1, h * 0.05);
  c.fill();
  c.globalAlpha = 1;
}

/** Versione computer. */
export function drawDesktop(c: CanvasRenderingContext2D, w: number, h: number, t: number) {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#f4f7fb";
  c.fillRect(0, 0, w, h);
  const u = w / 1024;
  // barra
  c.fillStyle = "#fff";
  c.fillRect(0, 0, w, 64 * u);
  c.fillStyle = BLUE;
  rr(c, 36 * u, 18 * u, 28 * u, 28 * u, 8 * u);
  c.fill();
  c.fillStyle = "#dfe6f1";
  [0, 1, 2].forEach((i) => {
    rr(c, (420 + i * 92) * u, 26 * u, 64 * u, 12 * u, 6 * u);
    c.fill();
  });
  const pulse = 1 + Math.sin(t * 2.4) * 0.03;
  c.fillStyle = BLUE;
  rr(c, w - 150 * u, 16 * u, 114 * u * pulse, 32 * u, 16 * u);
  c.fill();
  // testata
  const a0 = ease(t / 0.8);
  c.globalAlpha = a0;
  c.fillStyle = "#14171c";
  rr(c, 60 * u, (130 + (1 - a0) * 20) * u, 420 * u, 30 * u, 15 * u);
  c.fill();
  rr(c, 60 * u, (178 + (1 - a0) * 20) * u, 320 * u, 30 * u, 15 * u);
  c.fill();
  c.fillStyle = "#c3cddc";
  rr(c, 60 * u, 236 * u, 360 * u, 12 * u, 6 * u);
  c.fill();
  rr(c, 60 * u, 262 * u, 300 * u, 12 * u, 6 * u);
  c.fill();
  c.globalAlpha = 1;
  const bp = 1 + (Math.sin(t * 2.4) > 0.9 ? 0.04 : 0);
  c.fillStyle = BLUE;
  rr(c, 60 * u, 306 * u, 150 * u * bp, 44 * u, 22 * u);
  c.fill();
  hero(c, 540 * u, 100 * u, 424 * u, 270 * u, t);
  // schede che salgono, una dopo l'altra, in ciclo
  const k = t % 7;
  [0, 1, 2].forEach((i) => {
    const a = ease((k - 0.4 - i * 0.25) / 0.7) * (k > 6.2 ? Math.max(0, (7 - k) / 0.8) : 1);
    card(c, (60 + i * 316) * u, (420 + (1 - a) * 40) * u, 288 * u, 170 * u, a, i % 2);
  });
  // puntatore
  const px = (300 + Math.sin(t * 0.8) * 160) * u;
  const py = (470 + Math.cos(t * 0.8) * 60) * u;
  c.fillStyle = "#14171c";
  c.beginPath();
  c.moveTo(px, py);
  c.lineTo(px + 18 * u, py + 26 * u);
  c.lineTo(px + 8 * u, py + 25 * u);
  c.lineTo(px + 2 * u, py + 36 * u);
  c.closePath();
  c.fill();
}

/** Versione telefono: stessa pagina, in una colonna, che scorre. */
export function drawMobile(c: CanvasRenderingContext2D, w: number, h: number, t: number) {
  c.clearRect(0, 0, w, h);
  c.fillStyle = "#f4f7fb";
  c.fillRect(0, 0, w, h);
  const u = w / 512;
  const scroll = (Math.sin(t * 0.7 - 1.2) * 0.5 + 0.5) * 300 * u;
  c.save();
  c.translate(0, -scroll);
  hero(c, 28 * u, 150 * u, 456 * u, 300 * u, t);
  c.fillStyle = "#14171c";
  rr(c, 36 * u, 490 * u, 380 * u, 30 * u, 15 * u);
  c.fill();
  rr(c, 36 * u, 536 * u, 280 * u, 30 * u, 15 * u);
  c.fill();
  c.fillStyle = "#c3cddc";
  rr(c, 36 * u, 590 * u, 400 * u, 14 * u, 7 * u);
  c.fill();
  rr(c, 36 * u, 616 * u, 330 * u, 14 * u, 7 * u);
  c.fill();
  c.fillStyle = BLUE;
  rr(c, 36 * u, 660 * u, 200 * u, 52 * u, 26 * u);
  c.fill();
  [0, 1, 2].forEach((i) => card(c, 28 * u, (760 + i * 200) * u, 456 * u, 180 * u, 1, i % 2));
  c.restore();
  // barra fissa in alto, con l'isola del telefono libera
  c.fillStyle = "rgba(255,255,255,.94)";
  c.fillRect(0, 0, w, 124 * u);
  c.fillStyle = BLUE;
  rr(c, 28 * u, 70 * u, 30 * u, 30 * u, 9 * u);
  c.fill();
  c.fillStyle = "#14171c";
  [0, 1, 2].forEach((i) => {
    rr(c, w - 64 * u, (74 + i * 9) * u, 32 * u, 4 * u, 2 * u);
    c.fill();
  });
}
