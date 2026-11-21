"""
Voce narrante italiana del film (scripts/voice/vo-it.mp3, una sola ripresa continua).
1) python3 scripts/film-voice.py cut   -> dalle parole di faster-whisper (/tmp/vo-words.json) scrive
                                         src/components/services/film-words.ts: quando inizia e finisce ogni parola nella ripresa.
                                         Il film mette ogni scritta e ogni movimento sulla parola che lo dice.
2) python3 scripts/film-voice.py       -> legge dal video (/tmp/film-marks.json, window.__film.vo) dove la ripresa si apre
                                         per lasciare respiro alle scene: [parola, spostamento]. Taglia la ripresa nei silenzi
                                         prima di quelle parole e sposta ogni pezzo di tanto: la voce resta quella vera, mai accelerata.
                                         Poi abbassa la musica sotto e scrive public/sfx/film-web-it.mp3
"""
import numpy as np, json, subprocess, os, sys
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
HERE = os.path.dirname(__file__)
def load(path, ch):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()

# variante del film: "" (ha già un sito) oppure "none" (non ha un sito): FILM_VAR=none python3 scripts/film-voice.py ...
VAR = os.environ.get("FILM_VAR", "")
SUF = f"-{VAR}" if VAR else ""
vo = load(os.path.join(HERE, "voice", f"vo-it{SUF}.mp3"), 1)[:, 0]
WORDS = os.path.join(HERE, "voice", f"vo-it{SUF}-words.json")
# prima parola di ogni frase del copione
B = [0, 17, 35, 52, 61, 75, 84, 94, 105, 114, 117, 125, 129, 138, 152, 163, 185, 194] if not VAR else [0, 17, 21, 32, 35, 52, 61, 75, 84, 94, 105, 114, 117, 125, 129, 138, 152, 163, 185, 194]
# correzioni a mano dove whisper sbaglia l'attacco (secondi nella ripresa)
FIX: dict[int, float] = {}

w = int(0.01 * SR)
e = np.array([np.sqrt(np.mean(vo[i:i + w] ** 2)) for i in range(0, len(vo) - w, w)])
quiet = e < e.max() * 0.03
on = np.where(~quiet)[0]
FIRST, LAST = on[0] / 100, (on[-1] + 1) / 100
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

if len(sys.argv) > 1 and sys.argv[1] == "cut":
    W = json.load(open(f"/tmp/vo-words{SUF}.json"))
    json.dump(W, open(WORDS, "w"))
    s, en = [], []
    for k, b in enumerate(B):
        nb = B[k + 1] if k + 1 < len(B) else len(W)
        p0 = FIRST if k == 0 else gap(W[b - 1][1] - 0.15, W[b][0] + 0.6)[1]
        p1 = LAST if k == len(B) - 1 else gap(W[nb - 1][1] - 0.15, W[nb][0] + 0.6)[0]
        b0 = b
        for i in range(b, nb):
            a = max(W[i][0], p0)
            if i > b0:
                # dopo una pausa la parola parte dove finisce il silenzio, non dove la mette whisper
                g0, g1 = gap(W[i - 1][1] - 0.15, W[i][0] + 0.3)
                if g1 - g0 >= 0.08 and g1 < W[i][1] - 0.05: a = max(a, g1)
            a = FIX.get(i, a)
            z = min(W[i][1], p1) if i == nb - 1 else min(W[i][1], W[i + 1][0])
            s.append(round(a, 2)); en.append(round(max(z, a + 0.08), 2))
    out = os.path.join(HERE, "..", "src", "components", "services", f"film-words{SUF}.ts")
    open(out, "w").write(
        "// Scritto da scripts/film-voice.py cut: inizio e fine di ogni parola nella ripresa della voce (secondi).\n"
        f"export const VW = {{ s: {json.dumps(s)}, e: {json.dumps(en)} }};\n"
        f"/** prima parola di ogni frase del copione */\nexport const VP = {json.dumps(B)};\n")
    print("ok", len(s), "parole")
    sys.exit()

W = json.load(open(WORDS))
music = load(os.path.join(HERE, "..", "public", "sfx", "film-web.mp3"), 2)
pieces = json.load(open(f"/tmp/film-marks{SUF}.json"))["vo"]  # [[parola, spostamento], ...] in ordine
cuts = []
for i, (s, off) in enumerate(pieces):
    a = FIRST - 0.04 if s == 0 else gap(W[s - 1][1] - 0.15, W[s][0] + 0.6)[1] - 0.04
    cuts.append((a, off))
voice = np.zeros(len(music))
for i, (a, off) in enumerate(cuts):
    b = (cuts[i + 1][0] + 0.04 if i + 1 < len(cuts) else LAST + 0.1)
    x = vo[int(max(0, a) * SR): int(b * SR)].copy()
    f = int(0.04 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    j = int((a + off) * SR)
    if j + len(x) > len(voice): voice = np.concatenate([voice, np.zeros(j + len(x) - len(voice))])
    voice[j:j + len(x)] += x
    print(f"pezzo da «{W[pieces[i][0]][2].strip()}»: {a:.2f}-{b:.2f} s della ripresa, nel film a {a + off:.2f} s, silenzio prima {0 if i == 0 else round(a + 0.04 - gap(W[pieces[i][0] - 1][1] - 0.15, W[pieces[i][0]][0] + 0.6)[0], 2)} s")
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
out = os.path.join(HERE, "..", "public", "sfx", f"film-web-it{SUF}.mp3")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "192k", out], check=True)
print("ok")
