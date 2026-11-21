"""
Colonna sonora del film "Siti web" — arrangiamento originale sul tema della Serenata in Sol maggiore
"Eine kleine Nachtmusik" K. 525, I. Allegro di Mozart (1787, pubblico dominio).
Renderizzata da zero: ogni strumento è sintetizzato qui (pizzicato, pianoforte, piano elettrico, archi, pad, sub, batteria),
poi mix con compressione a respiro sulla cassa, riverbero a convoluzione e limitatore.
128 bpm, sincronizzata ai tempi del video (vedi MOODS). Uscita: public/sfx/film-web.mp3
Uso: python3 scripts/film-score.py
"""
import numpy as np, subprocess, os
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
BPM = 128
BEAT = 60 / BPM
BAR = 4 * BEAT
LEN = 49.0
rng = np.random.default_rng(7)

# quando cambia umore il video (secondi), dai segnaposto del film
MOODS = [(0.0, "calm"), (2.81, "doubt"), (7.97, "tense"), (14.77, "stop"), (16.41, "rise"), (20.16, "drive"), (33.98, "light"), (45.23, "end")]
def mood(t):
    m = "calm"
    for s, n in MOODS:
        if t >= s: m = n
    return m

N = lambda m: 440 * 2 ** ((m - 69) / 12)

def buf(): return np.zeros((int(LEN * SR) + SR * 6, 2))

def place(dst, x, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i < 0 or i >= len(dst): return
    x = x[: len(dst) - i]
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    dst[i:i + len(x), 0] += x * gain * l * 1.414
    dst[i:i + len(x), 1] += x * gain * r * 1.414

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)
def adsr(n, a, d, s, r, sus):
    e = np.ones(n) * s
    A = int(a * SR); D = int(d * SR); R = int(r * SR); S = max(0, n - A - D - R)
    e[:A] = np.linspace(0, 1, A, endpoint=False) if A else e[:A]
    e[A:A + D] = np.linspace(1, s, D, endpoint=False) if D else e[A:A + D]
    e[A + D + S:] = np.linspace(s, 0, n - (A + D + S))
    return e

# ───────── strumenti ─────────
def pizz(f, d=0.5):
    """corda pizzicata: Karplus-Strong, con un filo di corpo"""
    n = int(d * SR); p = max(2, int(SR / f))
    line = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        v = line[i % p]; out[i] = v
        line[i % p] = 0.5 * (v + line[(i + 1) % p]) * 0.994
    out = lp(out, 3500) * np.exp(-tt(d) * 5)
    return out / (np.max(np.abs(out)) + 1e-9)

def piano(f, d=1.2, vel=1.0):
    t = tt(d); x = np.zeros_like(t)
    for h, a, k in [(1, 1, 2.2), (2, .45, 3.5), (3, .22, 5), (4, .12, 7), (5, .06, 9)]:
        fh = f * h * np.sqrt(1 + 0.0004 * h * h)
        x += a * np.sin(2 * np.pi * fh * t) * np.exp(-t * k * (0.6 + f / 900))
    x += 0.02 * lp(rng.normal(size=len(t)), 2500) * np.exp(-t * 60)
    x *= np.minimum(1, t / 0.004)
    return x * vel * 0.5

def rhodes(f, d=1.0, vel=1.0):
    t = tt(d); idx = 2.2 * np.exp(-t * 5)
    x = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * np.exp(-t * 2.2)
    x += 0.25 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t * 30)
    x *= np.minimum(1, t / 0.003) * (1 + 0.15 * np.sin(2 * np.pi * 5 * t))
    return x * vel * 0.4

def saw(f, t, det=0.0):
    ph = (f * (1 + det) * t) % 1.0
    return 2 * ph - 1

def strings(notes, d, vel=1.0):
    t = tt(d); x = np.zeros_like(t)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t)
    for m in notes:
        f = N(m)
        for dt in (-0.004, 0, 0.0045):
            x += saw(f * vib, t, dt)
    x = lp(x, 2200, 2) * adsr(len(t), 0.25, 0.3, 0.85, 0.4, 0)
    return x * vel * 0.05

def pad(notes, d, vel=1.0, bright=1600):
    t = tt(d); x = np.zeros_like(t)
    for m in notes:
        for dt in (-0.006, -0.002, 0.003, 0.007):
            x += saw(N(m), t, dt)
    x = lp(x, bright, 2) * adsr(len(t), 0.6, 0.5, 0.8, 0.8, 0)
    return x * vel * 0.03

def pluck(f, d=0.35, vel=1.0):
    t = tt(d)
    x = saw(f, t, -0.004) + saw(f, t, 0.004)
    cut = 600 + 4000 * np.exp(-t * 14)
    # filtro che si chiude: approssimato con due passate a frequenze diverse mescolate
    x = lp(x, 4200) * np.exp(-t * 14) + lp(x, 800) * (1 - np.exp(-t * 14))
    x *= np.exp(-t * 6) * np.minimum(1, t / 0.003)
    return x * vel * 0.22

def sub(f, d, vel=1.0):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * lp(saw(f, t), 400)
    return x * adsr(len(t), 0.006, 0.05, 0.9, 0.05, 0) * vel * 0.45

def kick(vel=1.0):
    t = tt(0.45); f = 45 + 85 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7) + 0.3 * hp(rng.normal(size=len(t)), 3000) * np.exp(-t * 250)
    return np.tanh(x * 1.5) * vel * 0.9

def clap(vel=1.0):
    n = rng.normal(size=int(0.3 * SR)); t = tt(0.3)
    env = np.zeros_like(t)
    for o in (0, 0.011, 0.022): env += (t >= o) * np.exp(-(t - o).clip(0) * 140)
    env += np.exp(-t * 18) * 0.5
    return bp(n, 800, 2600) * env * vel * 0.3

def hat(open_=False, vel=1.0):
    d = 0.22 if open_ else 0.05; t = tt(d)
    return lp(hp(rng.normal(size=len(t)), 7000), 12000) * np.exp(-t * (16 if open_ else 80)) * vel * 0.1

def shaker(vel=1.0):
    t = tt(0.12)
    return bp(rng.normal(size=len(t)), 5000, 11000) * np.sin(np.pi * t / 0.12) ** 2 * vel * 0.045

def snap(vel=1.0):
    t = tt(0.12)
    return bp(rng.normal(size=len(t)), 1800, 5000) * np.exp(-t * 60) * vel * 0.35

def tick(vel=1.0):
    t = tt(0.03)
    return bp(rng.normal(size=len(t)), 3500, 6000) * np.exp(-t * 200) * vel * 0.2

def riser(d):
    t = tt(d)
    n = rng.normal(size=len(t))
    a = hp(n, 300) * 0.3; b = hp(n, 2500) * 0.6
    mix = t / d
    x = (a * (1 - mix) + b * mix) * (mix ** 2)
    x += 0.15 * np.sin(2 * np.pi * np.cumsum(120 + 900 * mix ** 2) / SR) * mix ** 2
    return lp(x, 6000) * 0.16

def impact(vel=1.0):
    t = tt(2.5)
    f = 30 + 60 * np.exp(-t * 6)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    x += lp(rng.normal(size=len(t)), 700) * np.exp(-t * 4) * 0.5
    return np.tanh(x * 1.4) * vel * 0.8

def rev_swell(d=1.2):
    t = tt(d); x = bp(rng.normal(size=len(t)), 1500, 7000) * (t / d) ** 3
    return x * 0.07

# ───────── il tema di Mozart (battute 1-4) e una risposta ─────────
# (battito d'inizio, durata in battiti, nota)
THEME = [
    [(0, 1, 67), (1.5, .5, 62), (2, 1, 67), (3.5, .5, 62)],
    [(0, .5, 67), (.5, .5, 62), (1, .5, 67), (1.5, .5, 71), (2, 2, 74)],
    [(0, 1, 72), (1.5, .5, 69), (2, 1, 72), (3.5, .5, 69)],
    [(0, .5, 72), (.5, .5, 69), (1, .5, 66), (1.5, .5, 69), (2, 2, 62)],
    [(0, 1, 79), (1.5, .5, 74), (2, 1, 79), (3.5, .5, 74)],
    [(0, .5, 79), (.5, .5, 74), (1, .5, 79), (1.5, .5, 83), (2, 2, 86)],
    [(0, 1, 84), (1.5, .5, 81), (2, 1, 84), (3.5, .5, 81)],
    [(0, .5, 84), (.5, .5, 81), (1, .5, 78), (1.5, .5, 81), (2, 2, 79)],
]
CHORD = {"G": (43, [55, 59, 62, 67]), "D7": (38, [54, 57, 60, 62]), "Gm": (43, [55, 58, 62, 67]), "C": (36, [52, 55, 60, 64]), "Em": (40, [52, 55, 59, 64])}
HARM = ["G", "G", "D7", "D7", "G", "G", "D7", "G"]

def minorize(m):  # nel problema il tema è in Sol minore: Si → Si bemolle
    return m - 1 if m % 12 == 11 else m

def render():
    mel, harm, bass, drums, fx = buf(), buf(), buf(), buf(), buf()
    side = np.ones(len(mel))  # respiro della cassa
    nbars = int(LEN / BAR) + 1
    for b in range(nbars):
        t0 = b * BAR
        if t0 > LEN: break
        th = THEME[b % 8]
        # accordo della battuta (minore nel problema)
        for half in (0, 1):
            ts = t0 + half * 2 * BEAT
            m = mood(ts)
            if m in ("stop", "end"): continue
            minor = m in ("doubt", "tense")
            hname = HARM[b % 8]
            if minor and hname == "G": hname = "Gm"
            root, notes = CHORD[hname]
            if half == 0:
                if m == "calm": place(harm, pad(notes, BAR, .8, 1200), ts, .9)
                elif m == "doubt": place(harm, pad(notes, BAR, .9, 900), ts, 1)
                elif m == "tense": place(harm, strings(notes, BAR, .8), ts, .9)
                elif m == "rise": place(harm, strings([n + 12 for n in notes], BAR, 1), ts, 1)
                elif m == "drive": place(harm, pad([n + 12 for n in notes], BAR, 1, 1700), ts, .8)
                elif m == "light": place(harm, pad(notes, BAR, .8, 1800), ts, .8)
            # basso
            for q in range(4 if m in ("drive", "light") else 2):
                tq = ts + q * BEAT / 2 + (BEAT / 2 if m == "drive" else 0) * 0
                if m == "drive":
                    tq = ts + (q * 2 + 1) * BEAT / 2  # sul controtempo
                    if tq < ts + 2 * BEAT: place(bass, sub(N(root + 12), BEAT * .45, 1), tq, 1)
                elif m == "light":
                    if q == 0: place(bass, sub(N(root + 12), BEAT * 1.8, .8), ts, 1)
                elif m in ("doubt", "tense"):
                    for e in range(4):
                        place(bass, sub(N(root + 12), BEAT * .4, .55 if m == "doubt" else .7), ts + e * BEAT / 2, 1)
                    break
                elif m == "rise":
                    place(bass, sub(N(root), BEAT * 1.9, .7), ts, 1); break
                elif m == "calm":
                    place(bass, sub(N(root + 12), BEAT * 1.9, .35), ts, 1); break
        # tema
        for (bt, dur, note) in th:
            ts = t0 + bt * BEAT
            m = mood(ts)
            if m in ("stop", "end"): continue
            n = minorize(note) if m in ("doubt", "tense") else note
            d = dur * BEAT
            if m == "calm":
                place(mel, piano(N(n), d + .6, .7), ts, .8, -.1)
            elif m == "doubt":
                place(mel, piano(N(n - 12), d + .5, .6), ts, .7, -.1)
                place(mel, pizz(N(n), .4), ts, .25, .3)
            elif m == "tense":
                place(mel, pizz(N(n - 12), .35), ts, .4, -.2)
                place(mel, pizz(N(n), .35), ts, .25, .25)
            elif m == "rise":
                place(mel, piano(N(n), d + .5, .9), ts, .9)
                place(mel, piano(N(n - 4 if n % 12 in (2, 7, 11) else n - 3), d + .5, .5), ts, .5)
            elif m == "drive":
                place(mel, pizz(N(n), .45), ts, .55, -.25)
                place(mel, pluck(N(n), .4, .9), ts, .8, .2)
                place(mel, pluck(N(n - 12), .35, .5), ts, .5, -.2)
            elif m == "light":
                place(mel, rhodes(N(n), d + .4, .9), ts, .9)
                place(mel, rhodes(N(n - 12), d + .4, .4), ts, .5)
        # batteria, a sedicesimi
        for s in range(16):
            ts = t0 + s * BEAT / 4
            if ts > LEN: break
            m = mood(ts)
            if m == "calm":
                if s in (4, 12): place(drums, snap(.6), ts, .7, .3)
            elif m == "doubt":
                if s == 0: place(drums, kick(.45), ts, 1)
                if s % 2 == 0: place(drums, tick(.6), ts, 1, .4)
            elif m == "tense":
                if s in (0, 3): place(drums, kick(.7 if s == 0 else .5), ts, 1)
                place(drums, tick(.35 + .2 * (s % 2 == 0)), ts, 1, .35)
            elif m == "rise":
                if s % 4 == 0 and b >= 10: place(drums, kick(.7), ts, 1)
            elif m == "drive":
                if s % 4 == 0:
                    place(drums, kick(1), ts, 1); i = int(ts * SR); side[i:i + int(.24 * SR)] *= np.linspace(.35, 1, int(.24 * SR))
                if s in (4, 12): place(drums, clap(.9), ts, 1)
                if s % 4 == 2: place(drums, hat(True, .8), ts, 1, .25)
                elif s % 2 == 1: place(drums, hat(False, .6), ts, 1, -.2)
                place(drums, shaker(.5), ts, 1, .4)
            elif m == "light":
                if s in (0, 8):
                    place(drums, kick(.7), ts, 1); i = int(ts * SR); side[i:i + int(.24 * SR)] *= np.linspace(.55, 1, int(.24 * SR))
                if s in (4, 12): place(drums, snap(.7), ts, 1, .2)
                if s % 2 == 1: place(drums, shaker(.6), ts, 1, .4)
                if s % 4 == 2: place(drums, hat(True, .5), ts, 1, -.2)
    # passaggi
    place(fx, riser(14.77 - 12.6), 12.6, .9)
    place(fx, impact(1), 14.77, 1)
    place(fx, rev_swell(1.4), 16.41 - 1.2, .8)
    # rullo che sale nella salita
    t = 18.3
    while t < 20.16:
        step = BEAT / 4 if t < 19.2 else BEAT / 8
        place(drums, clap(.25 + .6 * (t - 18.3) / 1.86), t, .8)
        t += step
    place(fx, impact(.6), 20.16, .7)
    place(fx, hat(True, 1.0), 20.16, .5)
    for tc in (25.31, 30.70, 34.22, 38.91):
        place(fx, rev_swell(.9), tc - .9, .6)
    # fine: colpo e accordo che resta
    place(fx, impact(1), 45.23, 1)
    root, notes = CHORD["G"]
    for k in notes + [74, 79]:
        place(harm, piano(N(k), 4.0, .7), 45.23, .8)
    place(harm, pad([n + 12 for n in notes], 3.8, 1, 1800), 45.23, 1)
    place(bass, sub(N(root), 3.0, .8), 45.23, 1)

    # mix: respiro della cassa su armonia, basso e melodia; riverbero; limitatore
    for x in (harm, bass, mel): x *= side[:, None]
    ir_t = tt(2.2)
    ir = np.stack([rng.normal(size=len(ir_t)) * np.exp(-ir_t * 3.2), rng.normal(size=len(ir_t)) * np.exp(-ir_t * 3.2)], 1)
    ir[:, 0] = lp(ir[:, 0], 6000); ir[:, 1] = lp(ir[:, 1], 6000)
    ir /= np.sqrt(np.sum(ir ** 2, 0))
    wet_in = mel * .5 + harm * .7 + fx * .6 + drums * .12
    wet = np.stack([fftconvolve(wet_in[:, c], ir[:, c])[: len(mel)] for c in (0, 1)], 1) * .35
    mix = mel * 1.0 + harm * .9 + bass * 1.0 + drums * .6 + fx * .7 + wet
    mix[:, 0] = hp(mix[:, 0], 28); mix[:, 1] = hp(mix[:, 1], 28)
    mix = mix[: int(LEN * SR)]
    # coda: sfuma gli ultimi 0,6 s
    fade = int(.6 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    peak = np.max(np.abs(mix)); mix = np.tanh(mix / peak * 1.6) / np.tanh(1.6) * .9
    return mix

if __name__ == "__main__":
    mix = render()
    raw = "/tmp/film-score.f32"
    mix.astype(np.float32).tofile(raw)
    out = os.path.join(os.path.dirname(__file__), "..", "public", "sfx", "film-web.mp3")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "192k", out], check=True)
    print("ok", out)
