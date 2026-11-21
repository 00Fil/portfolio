"""
Effetti sonori del film, in stile Apple: corti, puliti, morbidi, con un filo di stanza.
Ognuno è disegnato qui (niente campioni esterni) e salvato in public/sfx/film/<nome>.mp3.
Uso: python3 scripts/film-sfx.py
"""
import numpy as np, subprocess, os
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
rng = np.random.default_rng(11)
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx", "film")
os.makedirs(OUT, exist_ok=True)

def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)
def noise(d): return rng.normal(size=int(d * SR))
def sweep(f0, f1, d, curve=1.0):
    t = tt(d); f = f0 + (f1 - f0) * (t / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)

def room(x, size=0.6, wet=0.18, bright=7000):
    t = tt(size)
    irl = lp(rng.normal(size=len(t)), bright) * np.exp(-t * 6 / size)
    irr = lp(rng.normal(size=len(t)), bright) * np.exp(-t * 6 / size)
    irl /= np.sqrt(np.sum(irl ** 2)); irr /= np.sqrt(np.sum(irr ** 2))
    n = len(x) + len(t) - 1
    dry = np.pad(x, (0, len(t) - 1))
    L = dry + wet * fftconvolve(x, irl)[:n]
    R = dry + wet * fftconvolve(x, irr)[:n]
    return np.stack([L, R], 1)

def stereo_pan(x, pan):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1) * 1.414

def save(name, y, peak=0.8):
    if y.ndim == 1: y = np.stack([y, y], 1)
    # coda pulita
    f = int(0.01 * SR); y[-f:] *= np.linspace(1, 0, f)[:, None]
    y = y / (np.max(np.abs(y)) + 1e-9) * peak
    raw = "/tmp/sfx.f32"; y.astype(np.float32).tofile(raw)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "160k", os.path.join(OUT, name + ".mp3")], check=True)

# clic del mouse/trackpad: un tocco secco e corto, con corpo
def click():
    t = tt(0.06)
    a = bp(noise(0.06), 2500, 7000) * np.exp(-t * 400)
    b = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 180) * 0.35
    c = np.sin(2 * np.pi * 420 * t) * np.exp(-t * 120) * 0.25
    return room(a + b + c, 0.3, 0.12)

# tasto: «thock» morbido, tre varianti
def key(seed):
    r = np.random.default_rng(seed); t = tt(0.09)
    f = 170 + r.uniform(-15, 15)
    thock = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 80))) / SR) * np.exp(-t * 70) * 0.7
    tick = bp(r.normal(size=len(t)), 1800, 6500) * np.exp(-t * 300) * 0.6
    return room(thock + tick, 0.25, 0.1)

# pop: bolla che si apre
def pop():
    t = tt(0.16)
    x = sweep(260, 980, 0.16, 0.5) * np.exp(-t * 28) * np.minimum(1, t / 0.002)
    x += bp(noise(0.16), 2000, 6000) * np.exp(-t * 250) * 0.2
    return room(x, 0.4, 0.2)

# swoosh: aria che passa, filtro che si apre e si chiude, attraversa lo stereo
def swoosh(up=True, d=0.55):
    t = tt(d); n = noise(d)
    out = np.zeros(len(t))
    centers = np.linspace(500, 3200, 12) if up else np.linspace(3200, 500, 12)
    seg = len(t) // 12
    for i, cf in enumerate(centers):
        a = i * seg; b = len(t) if i == 11 else (i + 1) * seg
        chunk = bp(n, cf * 0.7, min(cf * 1.4, 18000))[a:b]
        out[a:b] = chunk
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    out = lp(out, 9000) * env
    pan = np.linspace(-0.6, 0.6, len(t)) if up else np.linspace(0.6, -0.6, len(t))
    y = np.stack([out * np.cos((pan + 1) * np.pi / 4), out * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
    tail = room(out, 0.6, 0.25)[:, :]
    tail[: len(y)] = tail[: len(y)] * 0.4 + y * 0.6
    return tail

# chime: conferma, due note che salgono, calde (stile notifica Apple)
def chime():
    d = 1.6; t = tt(d); x = np.zeros(len(t))
    for start, f, a in ((0.0, 880.0, 1.0), (0.09, 1318.5, 0.8)):
        tt_ = np.clip(t - start, 0, None); on = (t >= start)
        tone = np.sin(2 * np.pi * f * tt_) + 0.12 * np.sin(2 * np.pi * f * 2 * tt_) + 0.04 * np.sin(2 * np.pi * f * 3.01 * tt_)
        x += on * tone * np.exp(-tt_ * 3.2) * np.minimum(1, tt_ / 0.004) * a
    return room(lp(x, 6000), 1.2, 0.3)

# vetro: una pagina che appare, luccichio breve
def glass():
    d = 0.9; t = tt(d); x = np.zeros(len(t))
    for i, f in enumerate((2093, 2637, 3136, 3951)):
        s = i * 0.025; tt_ = np.clip(t - s, 0, None)
        x += (t >= s) * np.sin(2 * np.pi * f * tt_) * np.exp(-tt_ * 6) * 0.3
    x += bp(noise(d), 5000, 12000) * np.exp(-t * 9) * 0.15
    return room(x * np.minimum(1, t / 0.01), 1.0, 0.35)

# thump: colpo profondo e morbido (stacchi, cliente perso)
def thump(big=False):
    d = 2.2 if big else 1.0; t = tt(d)
    f = 38 + 70 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (1.6 if big else 3.5))
    x += lp(noise(d), 500) * np.exp(-t * 9) * 0.4
    x = np.tanh(x * 1.6)
    return room(x, 1.6 if big else 0.8, 0.25, 3000)

# riser: aria che sale e si apre, liscia
def riser(d=1.6):
    t = tt(d); n = noise(d)
    lo = bp(n, 300, 1500); hi = bp(n, 2500, 9000)
    k = (t / d) ** 2
    x = (lo * (1 - k) + hi * k) * k * 0.6
    x += sweep(220, 880, d, 2) * k * 0.12
    return room(x, 0.8, 0.3)

# shine: la firma, un respiro luminoso che si apre e svanisce
def shine():
    d = 4.2; t = tt(d); x = np.zeros(len(t))
    for m in (60, 64, 67, 71, 74, 79):
        f = 440 * 2 ** ((m - 69) / 12)
        for det in (-0.003, 0.003):
            x += np.sin(2 * np.pi * f * (1 + det) * t) * (0.6 if m < 70 else 0.3)
    env = np.minimum(1, t / 0.9) * np.exp(-np.clip(t - 1.5, 0, None) * 1.4)
    x = lp(x, 3000) * env * 0.15
    x += bp(noise(d), 4000, 12000) * np.exp(-((t - 0.6) / 0.35) ** 2) * 0.06
    return room(x, 2.0, 0.5, 5000)

# sbuffo: «pfff» di chi si è stufato, aria tra le labbra
def sigh():
    d = 1.25; t = tt(d); n = noise(d)
    p = lp(n, 500) * np.exp(-t * 60) * 0.8
    env = np.minimum(1, t / 0.09) * np.exp(-np.clip(t - 0.25, 0, None) * 3.5)
    breath = np.zeros(len(t))
    seg = len(t) // 10
    for i in range(10):
        a = i * seg; b = len(t) if i == 9 else (i + 1) * seg
        c1 = 1400 - 80 * i; c2 = 2500 - 120 * i
        breath[a:b] = (bp(n, c1 * 0.75, c1 * 1.25) + 0.6 * bp(n, c2 * 0.8, c2 * 1.2))[a:b]
    voice = np.sin(2 * np.pi * np.cumsum(np.linspace(150, 100, len(t))) / SR)
    voice = bp(voice + 0.5 * np.sign(voice), 400, 1200) * np.exp(-((t - 0.45) / 0.3) ** 2) * 0.08
    return room(p + lp(breath, 5000) * env * 0.5 + voice, 0.5, 0.12)

if __name__ == "__main__":
    save("click", click(), 0.7)
    for i in range(3): save(f"key{i+1}", key(i + 3), 0.55)
    save("pop", pop(), 0.6)
    save("swoosh-up", swoosh(True), 0.6)
    save("swoosh-down", swoosh(False), 0.6)
    save("chime", chime(), 0.6)
    save("glass", glass(), 0.5)
    save("thump", thump(False), 0.85)
    save("thump-big", thump(True), 0.95)
    save("riser", riser(1.6), 0.6)
    save("shine", shine(), 0.6)
    save("sigh", sigh(), 0.8)
    print("ok")
