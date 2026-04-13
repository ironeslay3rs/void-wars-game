/**
 * Void Wars sound engine — synthesized game audio via Web Audio API.
 *
 * No audio files required. Every sound is generated from oscillators +
 * gain envelopes at runtime. Works on every browser that supports
 * AudioContext (all modern browsers).
 *
 * Usage: import { playSound } from "@/features/audio/soundEngine";
 *        playSound("hit"); // fire and forget
 *
 * The AudioContext is created lazily on first user interaction (click
 * or keydown) to comply with browser autoplay policies.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let volume = 0.3;
let muted = false;

const VOLUME_STORAGE_KEY = "vw:audio:volume";
const MUTED_STORAGE_KEY = "vw:audio:muted";

if (typeof window !== "undefined") {
  try {
    const storedVol = window.localStorage.getItem(VOLUME_STORAGE_KEY);
    if (storedVol !== null) {
      const parsed = Number.parseFloat(storedVol);
      if (Number.isFinite(parsed)) volume = Math.max(0, Math.min(1, parsed));
    }
    const storedMute = window.localStorage.getItem(MUTED_STORAGE_KEY);
    if (storedMute === "1") muted = true;
  } catch {
    // ignore storage errors
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : volume;
    masterGain.connect(ctx.destination);
    return ctx;
  } catch {
    return null;
  }
}

// Lazy-init on first user gesture.
if (typeof window !== "undefined") {
  const initOnGesture = () => {
    getCtx();
    window.removeEventListener("click", initOnGesture);
    window.removeEventListener("keydown", initOnGesture);
    window.removeEventListener("touchstart", initOnGesture);
  };
  window.addEventListener("click", initOnGesture, { once: true });
  window.addEventListener("keydown", initOnGesture, { once: true });
  window.addEventListener("touchstart", initOnGesture, { once: true });
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      // ignore
    }
  }
}

export function setMuted(m: boolean) {
  muted = m;
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(MUTED_STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // ignore
    }
  }
}

export function getVolume(): number {
  return volume;
}

export function isMuted(): boolean {
  return muted;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  attackMs = 5,
  decayMs?: number,
  vol = 0.5,
) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + attackMs / 1000);
  const decayStart = c.currentTime + (decayMs ?? duration * 1000 * 0.6) / 1000;
  gain.gain.setValueAtTime(vol, decayStart);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    c.currentTime + duration,
  );
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function noise(duration: number, vol = 0.15) {
  const c = getCtx();
  if (!c || !masterGain) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(vol, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(gain);
  gain.connect(masterGain);
  src.start(c.currentTime);
}

export type SoundId =
  | "hit"
  | "hit-heavy"
  | "kill"
  | "loot"
  | "ability-activate"
  | "boss-spawn"
  | "rank-up"
  | "death"
  | "extract"
  | "ui-click";

/** Ambient drone — continuous low tone that plays while on the void field.
 *  Call startAmbient(freq) to begin, stopAmbient() to end.
 *  Different zones pass different frequencies for zone identity. */
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbient(freq: number, vol = 0.06) {
  stopAmbient();
  const c = getCtx();
  if (!c || !masterGain) return;
  ambientOsc = c.createOscillator();
  ambientGain = c.createGain();
  ambientOsc.type = "sine";
  ambientOsc.frequency.value = freq;
  ambientGain.gain.setValueAtTime(0, c.currentTime);
  ambientGain.gain.linearRampToValueAtTime(vol, c.currentTime + 1.5);
  ambientOsc.connect(ambientGain);
  ambientGain.connect(masterGain);
  ambientOsc.start();
}

export function stopAmbient() {
  if (ambientGain) {
    try {
      const c = getCtx();
      if (c) {
        ambientGain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.5);
      }
    } catch { /* ignore */ }
  }
  if (ambientOsc) {
    try {
      ambientOsc.stop(getCtx()?.currentTime ? getCtx()!.currentTime + 0.6 : 0);
    } catch { /* ignore */ }
    ambientOsc = null;
    ambientGain = null;
  }
}

/** Zone → ambient frequency mapping. Lower = more ominous. */
export const ZONE_AMBIENT_FREQ: Record<string, number> = {
  "howling-scar": 55,    // Deep Bio growl
  "ash-relay": 65,       // Mecha hum
  "echo-ruins": 48,      // Pure void resonance
  "rift-maw": 42,        // Deepest — the maw
};

export function playSound(id: SoundId) {
  switch (id) {
    case "hit":
      // Quick metallic tap.
      tone(420, 0.08, "square", 2, 40, 0.25);
      noise(0.04, 0.08);
      break;
    case "hit-heavy":
      // Deeper impact with rumble.
      tone(180, 0.15, "sawtooth", 3, 60, 0.35);
      tone(90, 0.2, "sine", 5, 80, 0.2);
      noise(0.08, 0.15);
      break;
    case "kill":
      // Ascending two-note chime.
      tone(520, 0.12, "triangle", 3, 60, 0.3);
      setTimeout(() => tone(780, 0.18, "triangle", 3, 80, 0.25), 60);
      break;
    case "loot":
      // Sparkly pickup — three quick ascending pips.
      tone(800, 0.06, "sine", 2, 30, 0.2);
      setTimeout(() => tone(1000, 0.06, "sine", 2, 30, 0.18), 40);
      setTimeout(() => tone(1200, 0.1, "sine", 2, 50, 0.15), 80);
      break;
    case "ability-activate":
      // Power-up whoosh.
      tone(200, 0.25, "sawtooth", 5, 100, 0.25);
      tone(400, 0.2, "sine", 10, 80, 0.2);
      noise(0.06, 0.1);
      break;
    case "boss-spawn":
      // Ominous low drone + horn.
      tone(80, 0.6, "sawtooth", 20, 300, 0.35);
      tone(120, 0.5, "square", 30, 250, 0.2);
      setTimeout(() => tone(160, 0.4, "triangle", 10, 200, 0.25), 200);
      break;
    case "rank-up":
      // Triumphant fanfare — ascending major chord.
      tone(440, 0.3, "triangle", 5, 150, 0.3);
      setTimeout(() => tone(554, 0.3, "triangle", 5, 150, 0.25), 100);
      setTimeout(() => tone(659, 0.4, "triangle", 5, 200, 0.3), 200);
      setTimeout(() => tone(880, 0.5, "sine", 5, 250, 0.2), 350);
      break;
    case "death":
      // Low descending tone + static burst.
      tone(300, 0.4, "sawtooth", 5, 200, 0.3);
      setTimeout(() => tone(150, 0.5, "sawtooth", 10, 250, 0.25), 150);
      setTimeout(() => noise(0.3, 0.12), 200);
      break;
    case "extract":
      // Shimmer + ascending sweep.
      tone(600, 0.2, "sine", 5, 100, 0.2);
      setTimeout(() => tone(900, 0.2, "sine", 5, 100, 0.18), 80);
      setTimeout(() => tone(1200, 0.3, "sine", 5, 150, 0.15), 160);
      break;
    case "ui-click":
      // Subtle tick.
      tone(1000, 0.03, "square", 1, 15, 0.1);
      break;
  }
}
