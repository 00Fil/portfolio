"""
Colonna sonora del film "Siti web": brano originale, elettronica morbida e moderna in stile spot Apple.
Tutto sintetizzato qui: pad caldi, piano elettrico, arpeggio filtrato con eco, una piccola melodia di vetro,
sub, cassa morbida, battito di mani, charleston, shaker, «ooh» di voce sintetica, salite e colpi nei passaggi.
128 bpm. Le parti seguono gli umori del video: legge i tempi da /tmp/film-marks.json (window.__film), se c'è.
Uscita: public/sfx/film-web.mp3       Uso: python3 scripts/film-score.py
"""
import numpy as np, subprocess, os, json
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BPM = 128
BEAT = 60 / BPM
BAR = 4 * BEAT
S16 = BEAT / 4
rng = np.random.default_rng(5)

MOODS = [(0.0, "calm"), (2.81, "doubt"), (7.97, "tense"), (15.23, "stop"), (16.88, "rise"), (20.63, "drive"), (34.22, "light"), (45.47, "end")]
LEN = 49.2
try:
    f = json.load(open("/tmp/film-marks.json"))
    MOODS = [(m["t"], m["what"].split(": ")[1]) for m in f["marks"] if m["what"].startswith("umore")]
    LEN = f["total"] + 0.5
except Exception:
    pass
T = {n: t for t, n in MOODS}
def mood(t):
    m = "calm"
    for s, n in MOODS:
        if t >= s - 1e-6: m = n
    return m

N = lambda m: 440 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(max(1, int(d * SR))) / SR
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR / 2 - 100), "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)
def saw(f, t, det=0.0): return 2 * ((f * (1 + det) * t) % 1.0) - 1
def env(n, a, r):
    e = np.ones(n); A = min(n, int(a * SR)); R = min(n - A, int(r * SR))
    if A: e[:A] = np.linspace(0, 1, A)
    if R: e[n - R:] = np.linspace(1, 0, R)
    return e

class Bus:
    def __init__(self): self.x = np.zeros((int((LEN + 6) * SR), 2))
    def add(self, y, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i < 0 or i >= len(self.x): return
        y = y[: len(self.x) - i]
        l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
        self.x[i:i + len(y), 0] += y * g * l; self.x[i:i + len(y), 1] += y * g * r

# ───────── suoni ─────────
def pad(notes, d, bright=1400, vel=1.0):
    t = tt(d); x = np.zeros_like(t)
    for m in notes:
        for dt in (-0.007, -0.0025, 0.0025, 0.007): x += saw(N(m), t, dt)
    return lp(x, bright) * env(len(t), 0.5, 0.7) * 0.022 * vel

def ooh(notes, d, vel=1.0):
    """«ooh» di voce: sega filtrata da due formanti (o), vibrato lento"""
    t = tt(d); x = np.zeros_like(t); vib = 1 + 0.003 * np.sin(2 * np.pi * 4.8 * t)
    for m in notes: x += saw(N(m) * vib, t) + saw(N(m) * vib, t, 0.004)
    x = bp(x, 380, 520) * 1.0 + bp(x, 700, 950) * 0.5
    return x * env(len(t), 0.4, 0.6) * 0.08 * vel

def ep(f, d=0.9, vel=1.0):
    """piano elettrico morbido"""
    t = tt(d); idx = 1.6 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t * 2.6)
    x += 0.12 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 5)
    return x * np.minimum(1, t / 0.004) * 0.3 * vel

def pluck(f, d=0.3, vel=1.0):
    t = tt(d); x = saw(f, t, -0.004) + saw(f, t, 0.004)
    k = np.exp(-t * 18)
    x = lp(x, 5000) * k + lp(x, 900) * (1 - k)
    return x * np.exp(-t * 9) * np.minimum(1, t / 0.002) * 0.12 * vel

def glass(f, d=0.6, vel=1.0):
    """la melodia: vetro morbido (seno + terza armonica lieve), non xilofono: attacco tondo, coda lunga"""
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6) + 0.05 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 10)
    return x * np.minimum(1, t / 0.012) * np.exp(-t * 3.2) * 0.22 * vel

def sub(f, d, vel=1.0):
    t = tt(d); x = np.sin(2 * np.pi * f * t) + 0.25 * np.tanh(3 * np.sin(2 * np.pi * f * t)) * 0.5
    return x * env(len(t), 0.005, 0.04) * 0.5 * vel

def kick(vel=1.0):
    t = tt(0.4); f = 46 + 70 * np.exp(-t * 32)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    x += 0.15 * hp(rng.normal(size=len(t)), 4000) * np.exp(-t * 300)
    return np.tanh(x * 1.3) * vel * 0.85

def clap(vel=1.0):
    t = tt(0.35); n = rng.normal(size=len(t)); e = np.zeros_like(t)
    for o in (0, 0.009, 0.018): e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * 160)
    e += 0.45 * np.exp(-t * 16)
    return bp(n, 900, 2400) * e * 0.28 * vel

def hat(open_=False, vel=1.0):
    t = tt(0.2 if open_ else 0.045)
    return lp(hp(rng.normal(size=len(t)), 7000), 13000) * np.exp(-t * (18 if open_ else 90)) * 0.08 * vel

def shaker(vel=1.0):
    t = tt(0.1)
    return bp(rng.normal(size=len(t)), 5500, 11000) * np.sin(np.pi * t / 0.1) ** 2 * 0.035 * vel

def tick(vel=1.0):
    t = tt(0.025)
    return bp(rng.normal(size=len(t)), 3000, 6000) * np.exp(-t * 220) * 0.14 * vel

def riser(d):
    t = tt(d); k = (t / d) ** 2; n = rng.normal(size=len(t))
    x = (bp(n, 400, 1600) * (1 - k) + bp(n, 2500, 9000) * k) * k * 0.12
    x += np.sin(2 * np.pi * np.cumsum(180 + 700 * k) / SR) * k * 0.04
    return x

def downlift(d=1.6):
    t = tt(d); k = 1 - t / d; n = rng.normal(size=len(t))
    return bp(n, 600, 5000) * k ** 2 * 0.07

def boom(vel=1.0):
    t = tt(2.4); f = 34 + 60 * np.exp(-t * 7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.5) + lp(rng.normal(size=len(t)), 400) * np.exp(-t * 5) * 0.4
    return np.tanh(x * 1.5) * 0.75 * vel

def swell(d=1.0):
    t = tt(d); return bp(rng.normal(size=len(t)), 1500, 8000) * (t / d) ** 3 * 0.05

# ───────── armonia e gancio ─────────
C = lambda r, *n: (r, list(n))
PROB = [C(33, 57, 60, 64, 71), C(29, 57, 60, 64, 65), C(36, 55, 60, 64, 67), C(28, 56, 59, 62, 64)]   # Am9 Fmaj7 C/G E7
NEW = [C(29, 60, 64, 65, 69), C(31, 59, 62, 64, 67), C(28, 59, 62, 64, 67), C(33, 60, 64, 67, 69)]    # Fmaj7(9) G6 Em7 Am7
# il gancio: due battute, domanda e risposta (sedicesimo → nota)
HOOK = [{0: 76, 3: 79, 6: 81, 10: 79, 12: 76}, {0: 74, 3: 76, 6: 72, 12: 71}]
HOOK_MIN = [{0: 76, 3: 72, 6: 71, 10: 69}, {0: 71, 6: 68, 12: 64}]

def render():
    mel, harm, bass, drums, fx = Bus(), Bus(), Bus(), Bus(), Bus()
    side = np.ones(len(mel.x))
    def duck(t, depth=0.35, d=0.22):
        i = int(t * SR); n = int(d * SR)
        if i + n < len(side): side[i:i + n] *= np.linspace(depth, 1, n)
    nb = int(LEN / BAR) + 1
    for b in range(nb):
        t0 = b * BAR
        for s in range(16):
            ts = t0 + s * S16
            if ts > LEN: break
            m = mood(ts)
            if m in ("stop", "end"): continue
            prob = m in ("calm", "doubt", "tense")
            # battuta del giro relativa all'inizio del gruppo (il giro riparte quando cambia tonalità)
            g0 = 0.0 if prob else T.get("rise", 0)
            gb = int(max(0, ts - g0 + 1e-6) // BAR)
            r, notes = (PROB if prob else NEW)[gb % 4]
            hook = (HOOK_MIN if prob else HOOK)[gb % 2]
            first = s == 0 or abs(ts - g0) < S16 / 2
            if m == "calm":
                if first: harm.add(pad(notes, BAR, 1100, 0.8), ts)
                if s in (0, 8): harm.add(ep(N(notes[1]), 1.4, .6), ts, 1, -.2); harm.add(ep(N(notes[3]), 1.4, .45), ts + .02, 1, .2)
                if s in (4, 12): drums.add(tick(.7), ts, 1, .3)
                if s == 0: bass.add(sub(N(r + 12), BAR * .9, .35), ts)
            elif m == "doubt":
                if first: harm.add(pad(notes, BAR, 900, 1), ts)
                if s % 2 == 0: bass.add(sub(N(r + 12), S16 * 1.6, .45), ts)
                if s % 4 == 0: drums.add(tick(.8), ts, 1, .35)
                if s == 0: drums.add(kick(.45), ts)
                if s in hook: mel.add(ep(N(hook[s] - 12), .8, .55), ts, 1, -.1)
            elif m == "tense":
                if first: harm.add(pad(notes, BAR, 700, 1.1), ts)
                if s % 2 == 0: bass.add(sub(N(r + 12), S16 * 1.5, .55), ts)
                drums.add(tick(.5 + .35 * (s % 2 == 0)), ts, 1, .35)
                if s in (0, 3): drums.add(kick(.65 if s == 0 else .45), ts)
                if s in (0, 6, 12): mel.add(pluck(N(notes[(s // 6) % 4] + 12), .25, .6), ts, 1, .3)
            elif m == "rise":
                if first: harm.add(pad(notes, BAR, 1800, 1), ts); harm.add(ooh(notes[:3], BAR, .9), ts)
                if s % 2 == 0: mel.add(pluck(N(notes[(s // 2) % 4] + 12), .3, .35 + .5 * (ts - T["rise"]) / max(.1, T["drive"] - T["rise"])), ts, 1, (-.3, .3)[s // 2 % 2])
                if s == 0: bass.add(sub(N(r), BAR * .95, .55), ts)
            elif m in ("drive", "light"):
                drive = m == "drive"
                if first: harm.add(pad([n + 12 for n in notes], BAR, 1900 if drive else 1500, .9), ts); harm.add(ooh(notes[:3], BAR, .5), ts)
                # piano elettrico sui controtempi
                if s in (2, 6, 10, 14) and drive: [harm.add(ep(N(n), .35, .5), ts, 1, (i - 1.5) * .25) for i, n in enumerate(notes)]
                if not drive and s in (0, 6, 10): [harm.add(ep(N(n), 1.0, .5), ts, 1, (i - 1.5) * .2) for i, n in enumerate(notes)]
                # arpeggio filtrato con eco
                arp = [notes[0], notes[2], notes[1] + 12, notes[3], notes[2] + 12, notes[1] + 12, notes[3], notes[2]]
                if drive or s % 2 == 0:
                    y = pluck(N(arp[s % 8] + 12), .28, .5)
                    mel.add(y, ts, 1, (-.35, .35)[s % 2])
                    mel.add(y * .35, ts + 3 * S16, 1, (.35, -.35)[s % 2])
                # il gancio di vetro
                if s in hook: mel.add(glass(N(hook[s]), .9, 1 if drive else .8), ts, 1, .05)
                # basso
                if drive and s % 4 == 2: bass.add(sub(N(r + 12), S16 * 1.8, 1), ts)
                if not drive and s == 0: bass.add(sub(N(r + 12), BAR * .9, .7), ts)
                # batteria
                if drive:
                    if s % 4 == 0: drums.add(kick(1), ts); duck(ts)
                    if s in (4, 12): drums.add(clap(1), ts)
                    if s % 4 == 2: drums.add(hat(True, .9), ts, 1, .2)
                    elif s % 2 == 1: drums.add(hat(False, .8), ts, 1, -.2)
                    drums.add(shaker(.7), ts, 1, .35)
                else:
                    if s in (0, 10): drums.add(kick(.75), ts); duck(ts, .55)
                    if s in (4, 12): drums.add(clap(.6), ts)
                    if s % 2 == 1: drums.add(shaker(.9), ts, 1, .35)
    # passaggi (sempre a tempo con i cambi di umore)
    st = T.get("stop"); ri = T.get("rise"); dr = T.get("drive"); li = T.get("light"); en = T.get("end")
    if st:
        fx.add(riser(2.4), st - 2.4, 1)
        fx.add(boom(1), st, 1)
    if ri: fx.add(swell(1.2), ri - 1.1, 1)
    if dr:
        fx.add(riser(1.8), dr - 1.8, .9)
        tt_ = dr - 1.8
        while tt_ < dr - 1e-3:
            drums.add(clap(.15 + .6 * (tt_ - (dr - 1.8)) / 1.8), tt_, .7)
            tt_ += S16 if tt_ < dr - .9 else S16 / 2
        fx.add(boom(.45), dr, .7); fx.add(hat(True, 1.6), dr, .6); fx.add(downlift(1.8), dr + .05, 1)
    if li: fx.add(swell(.9), li - .85, .8)
    if en:
        # chiusura coerente: un respiro che sale, poi il Do che si apre e resta (ritorno a casa)
        fx.add(riser(1.6), en - 1.6, .7)
        fx.add(boom(.7), en, .8)
        home = [48, 55, 60, 62, 64, 67, 72, 76]
        harm.add(pad([60, 64, 67, 74], 4.2, 1600, 1.3), en)
        harm.add(ooh([60, 64, 67], 4.0, 1), en)
        for i, k in enumerate(home[2:]): harm.add(ep(N(k), 3.6, .55), en + i * .03, 1, (i - 3) * .15)
        mel.add(glass(N(79), 3.2, 1), en + .25, 1)
        bass.add(sub(N(36), 3.0, .9), en)

    for bus in (harm, bass, mel): bus.x *= side[:, None]
    # riverbero
    t = tt(2.4)
    ir = np.stack([lp(rng.normal(size=len(t)), 7000) * np.exp(-t * 2.6), lp(rng.normal(size=len(t)), 7000) * np.exp(-t * 2.6)], 1)
    ir /= np.sqrt(np.sum(ir ** 2, 0))
    send = mel.x * .55 + harm.x * .6 + fx.x * .5 + drums.x * .1
    wet = np.stack([fftconvolve(send[:, c], ir[:, c])[: len(send)] for c in (0, 1)], 1) * .32
    mix = mel.x + harm.x * .9 + bass.x + drums.x * .7 + fx.x * .9 + wet
    for c in (0, 1): mix[:, c] = hp(mix[:, c], 30)
    mix = mix[: int(LEN * SR)]
    fd = int(.5 * SR); mix[-fd:] *= np.linspace(1, 0, fd)[:, None]
    pk = np.max(np.abs(mix)); mix = np.tanh(mix / pk * 1.5) / np.tanh(1.5) * .9
    return mix

if __name__ == "__main__":
    mix = render()
    raw = "/tmp/film-score.f32"; mix.astype(np.float32).tofile(raw)
    out = os.path.join(os.path.dirname(__file__), "..", "public", "sfx", "film-web.mp3")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "192k", out], check=True)
    print("ok", round(LEN, 2), MOODS)
