import { initialGameState } from "@/features/game/initialGameState";
import type { GameState, PathType } from "@/features/game/gameTypes";

export type FirstSessionGuidanceAction = "explore" | "hunt" | "recover";
const RECOVERY_GUIDANCE_THRESHOLD = 60;

export type FirstSessionGuidance = {
  stateLabel: string;
  objective: string;
  detail: string;
  nextStepLabel: string;
  nextAction: FirstSessionGuidanceAction;
  isFirstTimePlayer: boolean;
  schoolHint: string;
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

type SchoolCopy = {
  exploreLabel: string;
  exploreObjective: string;
  exploreDetail: string;
  exploreFirstDetail: string;
  huntLabel: string;
  huntObjective: string;
  huntDetail: string;
  recoveryDetail: string;
  schoolHint: string;
};

const SCHOOL_COPY: Record<PathType | "unbound", SchoolCopy> = {
  bio: {
    exploreLabel: "Field Scan Active",
    exploreObjective: "Sweep the wasteland for a specimen trace.",
    exploreDetail:
      "The Verdant Coil survives by harvesting what the war leaves behind. Run the sweep to surface a live biotech signal.",
    exploreFirstDetail:
      "Verdant Coil operatives survive by hunting — not waiting. Start your first field sweep to locate a biotech specimen lead.",
    huntLabel: "Specimen Lead Active",
    huntObjective: "Biotech signal confirmed. Move on the target.",
    huntDetail:
      "A live specimen trace is locked. Biotech Labs will convert it into samples, influence, and rank progress.",
    recoveryDetail:
      "The body paid a price for that hunt. Verdant Coil doctrine: recover first, then press harder. Open Status to stabilize before the next sweep.",
    schoolHint: "Bio loop: scan → trace → hunt → absorb → evolve.",
  },
  mecha: {
    exploreLabel: "Salvage Sweep Ready",
    exploreObjective: "Run a salvage sweep to recover alloy and components.",
    exploreDetail:
      "Chrome Synod discipline demands systematic extraction. Each sweep recovers materials that feed the forge and widen your operational margin.",
    exploreFirstDetail:
      "Chrome Synod operatives build power through precision — not luck. Start your first salvage sweep to begin recovering alloy and intel.",
    huntLabel: "Contract Target Locked",
    huntObjective: "Target acquired. Execute and extract.",
    huntDetail:
      "A contract target is locked. Resolve it clean — every controlled victory feeds the forge, sharpens the build, and proves Chrome Synod precision.",
    recoveryDetail:
      "Field wear is a systems failure. Chrome Synod doctrine: repair the shell before the next deployment. Open Status to restore operational capacity.",
    schoolHint: "Mecha loop: salvage → refine → forge → upgrade → deploy.",
  },
  pure: {
    exploreLabel: "Attunement Scan Ready",
    exploreObjective: "Sweep the void for rune resonance and ember traces.",
    exploreDetail:
      "The Ember Vault walks the slowest path and the deepest one. Each sweep surfaces resonance anchors that feed the rune work and deepen the soul-path.",
    exploreFirstDetail:
      "Ember Vault doctrine: the flame must be fed before it can be wielded. Start your first attunement sweep to locate rune dust and ember traces.",
    huntLabel: "Resonance Target Active",
    huntObjective: "Target confirmed. Attune and execute under oath.",
    huntDetail:
      "A resonance target is active. The Ember Vault earns its power through ritual precision — resolve this clean for rune dust, influence, and soul-path depth.",
    recoveryDetail:
      "Soul-path integrity requires rest. Ember Vault doctrine: you cannot refine while you are burning. Open Status to stabilize resonance before the next sweep.",
    schoolHint: "Pure loop: attune → resonate → burn → refine → transcend.",
  },
  unbound: {
    exploreLabel: "Exploration Ready",
    exploreObjective: "Explore the wasteland to locate a signal.",
    exploreDetail:
      "The void does not wait for allegiance. Run the sweep, secure the lead, and figure out your path one run at a time.",
    exploreFirstDetail:
      "Start your first sweep to uncover a field lead and open the core hunt loop.",
    huntLabel: "Lead Active",
    huntObjective: "Signal confirmed. Initiate the hunt.",
    huntDetail:
      "A live lead is ready to resolve. Open Biotech Labs to convert it into rewards and progression.",
    recoveryDetail:
      "Condition is the one resource you cannot buy back in bulk. Recover before the next sweep or the next run starts from a deficit.",
    schoolHint: "Explore → hunt → recover → grow.",
  },
};

export function getFirstSessionGuidance(
  state: GameState,
): FirstSessionGuidance {
  const { player } = state;
  const school =
    player.factionAlignment === "unbound"
      ? "unbound"
      : (player.factionAlignment as PathType);
  const copy = SCHOOL_COPY[school];

  const isFirstTimePlayer =
    !hasPriorProgression(state) &&
    !player.hasBiotechSpecimenLead &&
    player.lastHuntResult === null;

  if (player.lastHuntResult) {
    if (player.condition < RECOVERY_GUIDANCE_THRESHOLD) {
      return {
        stateLabel: "Hunt Resolved / Survival Pressure",
        objective: "Haul secured. Stabilize before the next run.",
        detail: copy.recoveryDetail,
        nextStepLabel: "Open Status and stabilize",
        nextAction: "recover",
        isFirstTimePlayer,
        schoolHint: copy.schoolHint,
      };
    }

    return {
      stateLabel: "Hunt Resolved",
      objective: "Payout banked. Open the next sweep.",
      detail:
        "The last run paid out and field state is still stable. Keep the loop moving.",
      nextStepLabel: "Start the next sweep",
      nextAction: "explore",
      isFirstTimePlayer,
      schoolHint: copy.schoolHint,
    };
  }

  if (player.hasBiotechSpecimenLead) {
    return {
      stateLabel: copy.huntLabel,
      objective: copy.huntObjective,
      detail: copy.huntDetail,
      nextStepLabel: "Open Biotech Labs and run the hunt",
      nextAction: "hunt",
      isFirstTimePlayer,
      schoolHint: copy.schoolHint,
    };
  }

  return {
    stateLabel: copy.exploreLabel,
    objective: copy.exploreObjective,
    detail: isFirstTimePlayer ? copy.exploreFirstDetail : copy.exploreDetail,
    nextStepLabel: "Start the sweep",
    nextAction: "explore",
    isFirstTimePlayer,
    schoolHint: copy.schoolHint,
  };
}
