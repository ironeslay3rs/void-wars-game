import type { FactionAlignment } from "@/features/game/gameTypes";

/**
 * School-voiced narration beats during hunt resolution.
 * Played in sequence during the ~2.5s combat timer to make hunts
 * feel like dangerous encounters, not loading bars.
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK
 * School voice patterns consistent with vault: Bio=body/instinct,
 * Mecha=precision/analysis, Pure=memory/soul/fire.
 */

export type NarrationTiming = "early" | "mid" | "late" | "climax";
export type NarrationTone = "neutral" | "danger" | "triumph";

export type NarrationBeat = {
  text: string;
  timing: NarrationTiming;
  tone: NarrationTone;
};

const bioBeats: NarrationBeat[] = [
  { text: "Your blood surges. The beast lunges. You move before you think.", timing: "early", tone: "neutral" },
  { text: "Instinct takes over. Your muscles coil. The body knows what to do.", timing: "early", tone: "neutral" },
  { text: "Impact. Pain. But the pain tells you where the opening is.", timing: "mid", tone: "danger" },
  { text: "The creature's blood is warm. Yours is hotter.", timing: "mid", tone: "neutral" },
  { text: "Something in its tissue reaches for yours. The Coil stirs.", timing: "late", tone: "danger" },
  { text: "One last strike. The flesh knows when it's over.", timing: "climax", tone: "triumph" },
];

const mechaBeats: NarrationBeat[] = [
  { text: "Target acquired. Frame integrity nominal. Engaging.", timing: "early", tone: "neutral" },
  { text: "Calculating optimal strike pattern. Variance: acceptable.", timing: "early", tone: "neutral" },
  { text: "Impact registered. Structural damage: minor. Recalibrating.", timing: "mid", tone: "danger" },
  { text: "Frame stress rising. The creature doesn't follow predicted behavior.", timing: "mid", tone: "danger" },
  { text: "Override engaged. Precision kills. Inefficiency is treason.", timing: "late", tone: "neutral" },
  { text: "Target neutralized. Components intact. Diagnostic: satisfactory.", timing: "climax", tone: "triumph" },
];

const pureBeats: NarrationBeat[] = [
  { text: "The runes flare. A memory of fire guides your hand.", timing: "early", tone: "neutral" },
  { text: "Resonance building. The creature doesn't understand what's happening.", timing: "early", tone: "neutral" },
  { text: "Soul-fire dims. The cost of each strike is real.", timing: "mid", tone: "danger" },
  { text: "A borrowed memory surfaces — someone fought this before. You remember how.", timing: "mid", tone: "neutral" },
  { text: "The ember burns brighter. One truth: fire remembers what flesh forgets.", timing: "late", tone: "neutral" },
  { text: "The last flame speaks. The creature falls into ash.", timing: "climax", tone: "triumph" },
];

const unboundBeats: NarrationBeat[] = [
  { text: "You don't have a school. You have a survival instinct. That's enough.", timing: "early", tone: "neutral" },
  { text: "The creature charges. No technique — just motion and reflex.", timing: "early", tone: "neutral" },
  { text: "Hurt. But still moving. Still thinking. Barely.", timing: "mid", tone: "danger" },
  { text: "Something inside you shifts. Not a school. Not yet. Something older.", timing: "mid", tone: "neutral" },
  { text: "The thing you don't have a name for pushes you forward.", timing: "late", tone: "neutral" },
  { text: "It's over. You're still here. That's the only victory that matters.", timing: "climax", tone: "triumph" },
];

const schoolBeats: Record<FactionAlignment, NarrationBeat[]> = {
  bio: bioBeats,
  mecha: mechaBeats,
  pure: pureBeats,
  unbound: unboundBeats,
};

/**
 * Get narration beats for a given school, ordered by timing.
 * Returns beats in presentation order: early → mid → late → climax.
 */
export function getHuntNarrationBeats(alignment: FactionAlignment): NarrationBeat[] {
  return schoolBeats[alignment];
}

/**
 * Get the appropriate beat for a given progress (0-1).
 * Maps the progress to timing phases and picks the right beat.
 */
export function getBeatForProgress(
  alignment: FactionAlignment,
  progress: number,
): NarrationBeat {
  const beats = schoolBeats[alignment];
  const timing: NarrationTiming =
    progress < 0.25 ? "early"
    : progress < 0.55 ? "mid"
    : progress < 0.85 ? "late"
    : "climax";
  const candidates = beats.filter((b) => b.timing === timing);
  if (candidates.length === 0) return beats[0];
  const idx = Math.floor(progress * 100) % candidates.length;
  return candidates[idx];
}
