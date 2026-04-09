import type { FactionAlignment, PathType } from "@/features/game/gameTypes";

/**
 * Anomaly flavor lines — shown ONCE when a player first touches off-school material.
 * After that, tracking is silent. The player should notice "something odd" once,
 * then forget about it until convergence reveals itself much later.
 *
 * CANON STATUS: GAME-SPECIFIC CREATIVE WORK
 * Convergence/fusion is canonical (Book 06 revelation). The hidden tracking
 * approach is consistent with the vault's design that fusion is the "deeper
 * truth" not revealed until late-game. Flavor lines are game-specific.
 */

/** Cross-school only — exclude same-school combinations. */
type CrossSchoolKey =
  | "bio-touches-mecha"
  | "bio-touches-pure"
  | "mecha-touches-bio"
  | "mecha-touches-pure"
  | "pure-touches-bio"
  | "pure-touches-mecha";

const anomalyLines: Record<CrossSchoolKey, string> = {
  "bio-touches-mecha":
    "Something hums in the frame component. Your blood doesn't know what to do with it.",
  "bio-touches-pure":
    "A whisper in the memory shard. Your instincts can't parse it.",
  "mecha-touches-bio":
    "The tissue sample resists integration. Diagnostic inconclusive.",
  "mecha-touches-pure":
    "Resonance signature detected. No matching schema in frame architecture.",
  "pure-touches-bio":
    "The blood carries a memory your runes can't read.",
  "pure-touches-mecha":
    "The precision chip broadcasts on a frequency your soul doesn't recognize.",
};

/**
 * Get the one-time anomaly flavor line for a cross-school encounter.
 * Returns null if the player is unbound or if both schools are the same.
 */
export function getAnomalyFlavorLine(
  playerAlignment: FactionAlignment,
  touchedSchool: PathType,
): string | null {
  if (playerAlignment === "unbound") return null;
  if (playerAlignment === touchedSchool) return null;
  const key = `${playerAlignment}-touches-${touchedSchool}` as CrossSchoolKey;
  return anomalyLines[key] ?? null;
}
