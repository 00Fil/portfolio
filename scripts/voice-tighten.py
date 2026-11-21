"""
Accorcia i tempi morti della voce: ogni silenzio piu lungo di 0.42 s viene ridotto (le pause brevi, quelle naturali, restano).
Riscrive vo-it[-none].mp3 e le parole (vo-it[-none]-words.json); poi: FILM_VAR=... python3 scripts/film-voice.py cut
Uso: python3 scripts/voice-tighten.py [none]
"""
import numpy as np, json, subprocess, sys, os
SR = 44100
HERE = os.path.join(os.path.dirname(__file__), "voice")
suf = "-none" if len(sys.argv) > 1 and sys.argv[1] == "none" else ""
src = os.path.join(HERE, f"vo-it{suf}.mp3")
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
v = np.frombuffer(raw, dtype=np.float32).copy()
w = SR // 100
e = np.array([np.sqrt(np.mean(v[i:i + w] ** 2)) for i in range(0, len(v) - w, w)])
q = e < e.max() * 0.03
runs, s = [], None
for i, x in enumerate(q):
    if x and s is None: s = i
    if (not x) and s is not None:
        if i - s >= 42: runs.append((s / 100, i / 100))
        s = None
cuts = []  # tratti tolti (secondi della ripresa vecchia)
for a, b in runs:
    g = b - a
    T = 0.34 + 0.25 * (g - 0.42)
    cuts.append((a + T / 2, b - T / 2))
print("tolti", round(sum(b - a for a, b in cuts), 2), "s in", len(cuts), "pause")
out, prev = [], 0
for a, b in cuts:
    out.append(v[int(prev * SR): int(a * SR)]); prev = b
out.append(v[int(prev * SR):])
f = int(0.006 * SR)
parts = []
for k, x in enumerate(out):
    x = x.copy()
    if k > 0: x[:f] *= np.linspace(0, 1, f)
    if k < len(out) - 1: x[-f:] *= np.linspace(1, 0, f)
    parts.append(x)
nv = np.concatenate(parts)
def mp(t):
    return t - sum(min(max(t - a, 0), b - a) for a, b in cuts)
W = json.load(open(os.path.join(HERE, f"vo-it{suf}-words.json")))
W = [[round(mp(a), 2), round(mp(b), 2), t] for a, b, t in W]
json.dump(W, open(os.path.join(HERE, f"vo-it{suf}-words.json"), "w"))
tmp = "/tmp/vo-tight.f32"; nv.astype(np.float32).tofile(tmp)
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", tmp, "-b:a", "192k", src], check=True)
print("ok", round(len(v) / SR, 1), "->", round(len(nv) / SR, 1))
