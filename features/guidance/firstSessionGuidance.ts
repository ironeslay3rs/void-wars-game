import { initialGameState } from "@/features/game/initialGameState";
import type { GameState } from "@/features/game/gameTypes";

export type FirstSessionGuidanceAction = "explore" | "hunt" | "recover";
const RECOVERY_GUIDANCE_THRESHOLD = 60;

export type FirstSessionGuidance = {
  stateLabel: string;
  objective: string;
  detail: string;
  nextStepLabel: string;
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
        stateLabel: "Hunt Resolved / Survival Pressure",
        objective: "Bank the haul. Stabilize before the next sweep.",
        detail:
          "The specimen payout is already secured, but the body came back strained. Recover first so the next sweep does not start from a deficit.",
        nextStepLabel: "Open Status and stabilize",
        nextAction: "recover",
        isFirstTimePlayer,
      };
    }

    return {
      stateLabel: "Hunt Resolved",
      objective: "Haul secured. Open the next exploration sweep.",
      detail:
        "The last specimen run paid out cleanly and your field state is still stable enough to keep pressure on the loop.",
      nextStepLabel: "Return home and start the next sweep",
      nextAction: "explore",
      isFirstTimePlayer,
    };
  }

  if (player.hasBiotechSpecimenLead) {
    return {
      stateLabel: "Specimen Lead Active",
      objective: "Biotech signal detected. Initiate hunt.",
      detail:
        "A viable specimen trace is locked. Biotech Labs can convert it into rewards right now.",
      nextStepLabel: "Open Biotech Labs and run the hunt",
      nextAction: "hunt",
      isFirstTimePlayer,
    };
  }

  return {
    stateLabel: "Exploration Ready",
    objective: "Explore the wasteland to locate a biotech signal.",
    detail: isFirstTimePlayer
      ? "Start your first sweep to uncover a specimen lead and open the biotech hunt."
      : "Begin another sweep to recover a fresh specimen lead.",
    nextStepLabel: "Start exploration",
    nextAction: "explore",
    isFirstTimePlayer,
  };
}
