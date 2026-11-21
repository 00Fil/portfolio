"""
Voce narrante italiana del film (scripts/voice/vo-it.mp3, una sola ripresa continua).
1) python3 scripts/film-voice.py cut   -> taglia le 16 frasi sui silenzi (parole: /tmp/vo-words.json, da faster-whisper)
                                         e stampa le durate da copiare in VO dentro WebCinema.tsx
2) python3 scripts/film-voice.py       -> mette ogni frase al suo segnaposto "voce N" del video (/tmp/film-marks.json),
                                         mai sovrapposte e mai accelerate, abbassa la musica sotto e scrive public/sfx/film-web-it.mp3
"""
import numpy as np, json, subprocess, os, sys
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
HERE = os.path.dirname(__file__)
def load(path, ch):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()

vo = load(os.path.join(HERE, "voice", "vo-it.mp3"), 1)[:, 0]
CUTS = os.path.join(HERE, "voice", "vo-it-cuts.json")

if len(sys.argv) > 1 and sys.argv[1] == "cut":
    W = json.load(open("/tmp/vo-words.json"))
    # prima parola di ogni frase del copione
    B = [0, 17, 35, 43, 52, 61, 75, 84, 94, 108, 117, 128, 152, 163, 185, 194]
    w = int(0.01 * SR)
    e = np.array([np.sqrt(np.mean(vo[i:i + w] ** 2)) for i in range(0, len(vo) - w, w)])
    quiet = e < e.max() * 0.03
    def gap(t0, t1):
        # il silenzio più lungo tra t0 e t1: (inizio, fine) in secondi
        a, b = int(max(0, t0) * 100), int(min(len(e) - 1, t1 * 100))
        best, run = (a, a), None
        for i in range(a, b + 1):
            if quiet[i]:
                run = i if run is None else run
                if i - run > best[1] - best[0]: best = (run, i + 1)
            else: run = None
        return best[0] / 100, best[1] / 100
    on = np.where(~quiet)[0]
    first, last = on[0] / 100, (on[-1] + 1) / 100
    ph = []
    for k, b in enumerate(B):
        s0 = first if k == 0 else gap(W[b - 1][1] - 0.15, W[b][0] + 0.6)[1]
        s1 = last if k == len(B) - 1 else gap(W[B[k + 1] - 1][1] - 0.15, W[B[k + 1]][0] + 0.6)[0]
        ph.append([round(s0, 2), round(s1, 2)])
    json.dump(ph, open(CUTS, "w"))
    print("VO =", [round(b - a, 2) for a, b in ph])
    sys.exit()

ph = json.load(open(CUTS))
music = load(os.path.join(HERE, "..", "public", "sfx", "film-web.mp3"), 2)
marks = json.load(open("/tmp/film-marks.json"))["marks"]
def at(name):
    if name == "voce 15": name = "firma: il tuo nome"
    for m in marks:
        if m["what"] == name: return m["t"]
    raise KeyError(name)

voice = np.zeros(len(music))
free, late = 0.0, []
for k, (a, b) in enumerate(ph):
    t = max(at(f"voce {k}"), free + 0.12)
    if t - at(f"voce {k}") > 0.05: late.append((k, round(t - at(f"voce {k}"), 2)))
    x = vo[int(max(0, a - 0.04) * SR): int((b + 0.08) * SR)].copy()
    f = int(0.012 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int(t * SR)
    if i + len(x) > len(voice): voice = np.concatenate([voice, np.zeros(i + len(x) - len(voice))])
    voice[i:i + len(x)] += x
    free = t + (b - a)
if len(voice) > len(music): music = np.concatenate([music, np.zeros((len(voice) - len(music), 2))])
# voce: un filo di presenza e di stanza, poi compressa perché resti sempre davanti
voice = voice + 0.2 * sosfilt(butter(2, [2500, 6000], "band", fs=SR, output="sos"), voice)
rt = np.arange(int(0.6 * SR)) / SR
ir = np.random.default_rng(3).normal(size=len(rt)) * np.exp(-rt * 9); ir /= np.sqrt(np.sum(ir ** 2))
voice = voice + 0.05 * fftconvolve(voice, ir)[: len(voice)]
voice = np.tanh(voice / (np.max(np.abs(voice)) + 1e-9) * 1.6) / np.tanh(1.6)
# la musica si abbassa sotto la voce
k = int(0.2 * SR)
ev = np.convolve(np.abs(voice), np.ones(k) / k, mode="same")
duck = 1 - 0.7 * np.clip(ev / (ev.max() * 0.12 + 1e-9), 0, 1)
k = int(0.12 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")
mix = music / (np.max(np.abs(music)) + 1e-9) * 0.42 * duck[:, None] + voice[:, None] * 0.92
mix = np.tanh(mix * 1.15) / np.tanh(1.15) * 0.95
raw = "/tmp/film-it.f32"; mix.astype(np.float32).tofile(raw)
out = os.path.join(HERE, "..", "public", "sfx", "film-web-it.mp3")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "192k", out], check=True)
print("ok, in ritardo sul segnaposto:", late)
