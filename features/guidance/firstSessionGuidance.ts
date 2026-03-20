import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

export type FirstSessionGuidanceAction = "explore" | "hunt" | "recover";
const RECOVERY_GUIDANCE_THRESHOLD = 60;

export type FirstSessionGuidance = {
  objective: string;
  detail: string;
  nextAction: FirstSessionGuidanceAction;
  isFirstTimePlayer: boolean;
};

function hasPriorProgression(state: GameState) {
  const { player } = state;
  const initialPlayer = initialGameState.player;

  return (
    player.rankLevel > initialPlayer.rankLevel ||
    player.rankXp > initialPlayer.rankXp ||
    player.masteryProgress > initialPlayer.masteryProgress ||
    player.influence > initialPlayer.influence
  );
}

export function getFirstSessionGuidance(
  state: GameState,
): FirstSessionGuidance {
  const { player } = state;
  const isFirstTimePlayer =
    !hasPriorProgression(state) &&
    !player.hasBiotechSpecimenLead &&
    player.lastHuntResult === null;

  if (player.lastHuntResult) {
    if (player.condition < RECOVERY_GUIDANCE_THRESHOLD) {
      return {
        objective: "Stabilize condition before the next sweep.",
        detail:
          "Your condition is running low. Open Status, recover, then return home to begin the next exploration sweep.",
        nextAction: "recover",
        isFirstTimePlayer,
      };
    }

    return {
      objective: "Condition stable. Continue exploration.",
      detail:
        "Your last hunt is resolved and condition is holding. Return home and begin another exploration sweep for a fresh biotech lead.",
      nextAction: "explore",
      isFirstTimePlayer,
    };
  }

  if (player.hasBiotechSpecimenLead) {
    return {
      objective: "Biotech signal detected. Initiate hunt.",
      detail:
        "A viable specimen trace is active. Open Biotech Labs and resolve the hunt to convert the lead into rewards.",
      nextAction: "hunt",
      isFirstTimePlayer,
    };
  }

  return {
    objective: "Explore the wasteland to locate a biotech signal.",
    detail: isFirstTimePlayer
      ? "Start your first exploration sweep to uncover a specimen lead."
      : "Begin another exploration sweep to recover a fresh specimen lead.",
    nextAction: "explore",
    isFirstTimePlayer,
  };
}
