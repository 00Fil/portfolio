"""
Voce narrante italiana del film (Antonio Farina, ElevenLabs): una sola ripresa con pause (scripts/voice/vo-it.mp3),
tagliata in frasi sui silenzi e messa al tempo esatto di ogni frase del video (/tmp/film-marks.json, da window.__film).
La musica (public/sfx/film-web.mp3) si abbassa sotto la voce. Uscita: public/sfx/film-web-it.mp3
Uso: python3 scripts/film-score.py && python3 scripts/film-voice.py
"""
import numpy as np, json, subprocess, os
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
HERE = os.path.dirname(__file__)
def load(path, ch):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).copy()

vo = load(os.path.join(HERE, "voice", "vo-it.mp3"), 1)[:, 0]
music = load(os.path.join(HERE, "..", "public", "sfx", "film-web.mp3"), 2)

# frasi: segmenti di voce separati da silenzi lunghi
w = int(0.02 * SR)
e = np.array([np.sqrt(np.mean(vo[i:i + w] ** 2)) for i in range(0, len(vo) - w, w)])
on = e > e.max() * 0.04
segs, start, gap, end = [], None, 0, 0
for i, v in enumerate(on):
    if v:
        start = i if start is None else start; gap = 0; end = i
    elif start is not None:
        gap += 1
        if gap * 0.02 > 0.6: segs.append([start * 0.02, (end + 1) * 0.02]); start = None; gap = 0
if start is not None: segs.append([start * 0.02, (end + 1) * 0.02])
if len(segs) == 16:  # due frasi lunghe escono spezzate sulla virgola: le riunisco
    segs[12] = [segs[12][0], segs[13][1]]; del segs[13]
    segs[8] = [segs[8][0], segs[9][1]]; del segs[9]
print("segmenti", len(segs), [round(b - a, 2) for a, b in segs])
assert len(segs) == 14, len(segs)

marks = json.load(open("/tmp/film-marks.json"))["marks"]
def at(prefix):
    for m in marks:
        if m["what"].lower().startswith(prefix.lower()): return m["t"]
    raise KeyError(prefix)
WHEN = [
    at("frase: Un cliente"), at("frase: Ma sei"), at("frase: Ti trova"), at("frase in scena: il cliente si"),
    at("frase: Cliente perso"), at("frase: Con il nuovo"), at("frase: E si aprirà"), at("frase in scena: il cliente resta"),
    at("frase: Lo costruiremo"), at("frase: Perfetto"), at("frase: Lo cambierai"), at("frase: Anche"),
    at("frase finale") - 0.35, at("firma"),
]

def bp_sos(a, b): return butter(2, [a, b], "band", fs=SR, output="sos")
voice = np.zeros(len(music))
def stretch(x, r):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-af", f"atempo={r}", "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()
NEXT = WHEN[1:] + [WHEN[-1] + 3.0]
for (a, b), t, nx in zip(segs, WHEN, NEXT):
    x = vo[int(max(0, a - 0.03) * SR): int((b + 0.12) * SR)].copy()
    room = nx - t - 0.15
    if len(x) / SR > room:
        r = min(1.25, len(x) / SR / room); x = stretch(x, r); print("accelero", round(r, 2), round(t, 2))
    f = int(0.01 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    i = int((t + 0.06) * SR)
    voice[i:i + len(x)] += x[: max(0, len(voice) - i)]
# voce: un filo di presenza e di stanza
voice = voice + 0.25 * sosfilt(bp_sos(2500, 6000), voice)
rt = np.arange(int(0.8 * SR)) / SR
ir = np.random.default_rng(3).normal(size=len(rt)) * np.exp(-rt * 7); ir /= np.sqrt(np.sum(ir ** 2))
voice = voice + 0.08 * fftconvolve(voice, ir)[: len(voice)]
# la musica si abbassa sotto la voce (inviluppo lento, ~ -9 dB)
ev = np.abs(voice); k = int(0.15 * SR)
ev = np.convolve(ev, np.ones(k) / k, mode="same")
duck = 1 - 0.8 * np.clip(ev / (ev.max() * 0.15 + 1e-9), 0, 1)
mix = music * duck[:, None] * 0.5 + voice[:, None] * 2.6
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) / np.tanh(1.3) * 0.92
raw = "/tmp/film-it.f32"; mix.astype(np.float32).tofile(raw)
out = os.path.join(HERE, "..", "public", "sfx", "film-web-it.mp3")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", raw, "-b:a", "192k", out], check=True)
print("ok", [round(t, 2) for t in WHEN])
