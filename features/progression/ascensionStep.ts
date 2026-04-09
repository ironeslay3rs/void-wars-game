import type { GameState, PlayerState } from "@/features/game/gameTypes";
import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";
import {
  canGrantRuneCrafterLicense,
  canPrimeConvergence,
  canUnlockL3RareRuneSet,
  countRuneSchoolsAtLeastDepth,
  getConvergenceArcBrief,
} from "@/features/progression/mythicAscensionLogic";

const PHASE_TOTAL = 4;

/** Overmortal-style mythic ladder: one obvious “current gate” for the UI. */
export type AscensionStep = {
  phaseIndex: number;
  phaseTotal: number;
  /** Short ladder band label (readable, not a skill tree). */
  phaseLabel: string;
  /** Name of the active gate (breakthrough target). */
  gateName: string;
  /** Single clearest line: what to do next (or that you may claim). */
  nextRequirement: string;
  /** What unlocking this gate gives — tangible payoff copy. */
  gateRewardLine: string;
  title: string;
  detail: string;
  /** Optional compact checklist / status (may duplicate nextRequirement lightly). */
  gateLine: string | null;
  /** When the next breakthrough is one meaningful action away — Home / HUD tension. */
  nearBreakthroughLine: string | null;
  /** Requirements satisfied; player should claim on Mastery. */
  claimReady: boolean;
  href: string;
  ctaLabel: string;
};

function l3NextRequirement(
  p: GameState["player"],
  depth: number,
): { next: string; checklist: string | null } {
  const dust = p.resources.runeDust ?? 0;
  const iron = p.resources.ironHeart ?? 0;
  const missing: string[] = [];
  if (p.rankLevel < 4) missing.push(`rank ${p.rankLevel}/4+`);
  if (depth < 4) missing.push(`rune depth ${depth}/4+`);
  if (iron < 1) missing.push("Ironheart tithe");
  if (dust < 30) missing.push("30+ Rune Dust");
  let next = "Claim the L3 cycle on Mastery.";
  if (p.rankLevel < 4) next = `Reach rank 4+ (currently ${p.rankLevel}).`;
  else if (depth < 4)
    next = `Reach rune depth 4+ on the ladder (currently ${depth}).`;
  else if (iron < 1) next = "Hold 1× Ironheart for the tithe.";
  else if (dust < 30)
    next = `Pay 30+ Rune Dust tithe (currently ${dust}).`;
  return {
    next,
    checklist: missing.length ? `Still need: ${missing.join(" · ")}` : null,
  };
}

function l3NearBreakthrough(
  p: GameState["player"],
  depth: number,
): string | null {
  const dust = p.resources.runeDust ?? 0;
  const iron = p.resources.ironHeart ?? 0;
  const metRank = p.rankLevel >= 4;
  const metDepth = depth >= 4;
  const metIron = iron >= 1;
  const metDust = dust >= 30;
  const missing = [!metRank, !metDepth, !metIron, !metDust].filter(Boolean)
    .length;
  if (missing !== 1) {
    if (
      missing === 2 &&
      p.rankLevel === 3 &&
      depth === 3 &&
      metIron &&
      metDust
    ) {
      return "Rank and depth each need one more step — the lattice is almost in reach.";
    }
    return null;
  }
  if (!metRank && p.rankLevel === 3)
    return "One more rank level breaks the L3 gate.";
  if (!metDepth && depth === 3)
    return "One more rune depth breaks the lattice seal.";
  if (!metIron && metRank && metDepth && metDust)
    return "One Ironheart tithe stands between you and breakthrough.";
  if (!metDust && metRank && metDepth && metIron) {
    if (dust >= 25) return "A thin slice of Rune Dust finishes the tithe.";
    if (dust >= 18) return "Gather a little more Rune Dust — the tithe is close.";
  }
  return null;
}

function crafterNextRequirement(p: GameState["player"]): {
  next: string;
  checklist: string | null;
} {
  const missing: string[] = [];
  if (p.rankLevel < 5) missing.push(`rank ${p.rankLevel}/5+`);
  if ((p.resources.ironHeart ?? 0) < 2) missing.push("2× Ironheart");
  let next = "Claim the Rune Crafter license on Mastery.";
  if (p.rankLevel < 5)
    next = `Reach rank 5+ (currently ${p.rankLevel}).`;
  else if ((p.resources.ironHeart ?? 0) < 2)
    next = `Pay 2× Ironheart tithe (currently ${p.resources.ironHeart ?? 0}).`;
  return {
    next,
    checklist: missing.length ? `Still need: ${missing.join(" · ")}` : null,
  };
}

function crafterNearBreakthrough(p: GameState["player"]): string | null {
  const iron = p.resources.ironHeart ?? 0;
  if (p.rankLevel === 4 && iron >= 2)
    return "One more rank level unlocks the Crafter seal.";
  if (p.rankLevel >= 5 && iron === 1)
    return "One more Ironheart earns the Crafter stamp.";
  return null;
}

function convergenceNextRequirement(
  p: GameState["player"],
): { next: string; checklist: string | null } {
  const m = p.mythicAscension;
  const schools = countRuneSchoolsAtLeastDepth(p, 3);
  const missing: string[] = [];
  if (!m.runeCrafterLicense) missing.push("Rune Crafter license");
  if (p.rankLevel < 5) missing.push(`rank ${p.rankLevel}/5+`);
  if (schools < 2) missing.push(`2 schools depth 3+ (have ${schools})`);
  let next = "File convergence on Mastery.";
  if (!m.runeCrafterLicense)
    next = "Earn the Rune Crafter license first.";
  else if (p.rankLevel < 5)
    next = `Reach rank 5+ (currently ${p.rankLevel}).`;
  else if (schools < 2)
    next = `Deepen ${2 - schools} more rune school(s) to depth 3+.`;
  return {
    next,
    checklist: missing.length ? `Still need: ${missing.join(" · ")}` : null,
  };
}

function convergenceNearBreakthrough(p: GameState["player"]): string | null {
  const m = p.mythicAscension;
  if (!m.runeCrafterLicense || p.rankLevel < 5) return null;
  const schools = countRuneSchoolsAtLeastDepth(p, 3);
  if (schools === 1)
    return "One more school at depth 3 — convergence is within reach.";
  if (schools >= 2 && p.rankLevel === 4)
    return "One more rank level — then hybrid resonance can be filed.";
  return null;
}

function knightNearBreakthrough(p: GameState["player"]): string | null {
  const m = p.mythicAscension;
  if (!m.convergencePrimed) return null;
  if (m.runeKnightValor === 0)
    return "Bank your first Knight valor — one ranked win breaks the silence.";
  if (m.runeKnightValor === 1)
    return "One more arena win — valor stacks toward your first boon.";
  if (m.runeKnightValor === 4)
    return "One more valor — the mastery boon unlocks.";
  return null;
}

export function getCurrentAscensionStep(state: GameState): AscensionStep {
  const p = state.player;
  const m = p.mythicAscension;
  const depth = maxRuneDepthAcrossSchools(p.runeMastery);

  if (!m.l3RareRuneSetUnlocked) {
    const { next, checklist } = l3NextRequirement(p, depth);
    const near = l3NearBreakthrough(p, depth);
    if (canUnlockL3RareRuneSet(p)) {
      return {
        phaseIndex: 1,
        phaseTotal: PHASE_TOTAL,
        phaseLabel: "Foundation",
        gateName: "Obsidian lattice · L3 Rare Rune cycle",
        nextRequirement: "All requirements met — claim on Mastery.",
        gateRewardLine:
          "Unlocks the L3 rare rune rotation, restricted forge actions, and the next ascension gate.",
        title: "Mythic ladder · L3 Rare Rune cycle",
        detail:
          "File the obsidian lattice unlock — it opens restricted forge actions and the next ascension gate.",
        gateLine: "Requirements met. Claim the L3 cycle on Mastery.",
        nearBreakthroughLine: null,
        claimReady: true,
        href: "/mastery",
        ctaLabel: "Open Mastery",
      };
    }
    return {
      phaseIndex: 1,
      phaseTotal: PHASE_TOTAL,
      phaseLabel: "Foundation",
      gateName: "Obsidian lattice · L3 Rare Rune cycle",
      nextRequirement: next,
      gateRewardLine:
        "Opens L3 rare runes, deeper mythic recipes, and the Rune Crafter path.",
      title: "Ascension · L3 Rare Rune cycle",
      detail:
        "Formal mythic work begins here: prove depth, pay the tithe, and unlock the L3 Rare Rune rotation.",
      gateLine: checklist,
      nearBreakthroughLine: near,
      claimReady: false,
      href: "/mastery",
      ctaLabel: "Mastery ladder",
    };
  }

  if (!m.runeCrafterLicense) {
    const { next, checklist } = crafterNextRequirement(p);
    const near = crafterNearBreakthrough(p);
    if (canGrantRuneCrafterLicense(p)) {
      return {
        phaseIndex: 2,
        phaseTotal: PHASE_TOTAL,
        phaseLabel: "Profession seal",
        gateName: "Rune Crafter license",
        nextRequirement: "All requirements met — claim on Mastery.",
        gateRewardLine:
          "Profession recognition, hybrid drain relief, and access to convergence filing.",
        title: "Rune Crafter license",
        detail:
          "Central Command will stamp your registry — hybrid filings and convergence prep assume this standing.",
        gateLine: "Requirements met — claim on Mastery.",
        nearBreakthroughLine: null,
        claimReady: true,
        href: "/mastery",
        ctaLabel: "Claim license",
      };
    }
    return {
      phaseIndex: 2,
      phaseTotal: PHASE_TOTAL,
      phaseLabel: "Profession seal",
      gateName: "Rune Crafter license",
      nextRequirement: next,
      gateRewardLine:
        "Crafter standing on the registry and relief on hybrid drain stacks.",
      title: "Ascension · Rune Crafter license",
      detail:
        "After L3, the ladder wants proof you can bind war metals without warping the crew.",
      gateLine: checklist,
      nearBreakthroughLine: near,
      claimReady: false,
      href: "/mastery",
      ctaLabel: "Mastery ladder",
    };
  }

  if (!m.convergencePrimed) {
    const brief = getConvergenceArcBrief(m, p);
    const { next, checklist } = convergenceNextRequirement(p);
    const near = convergenceNearBreakthrough(p);
    if (canPrimeConvergence(p)) {
      return {
        phaseIndex: 3,
        phaseTotal: PHASE_TOTAL,
        phaseLabel: "Hybrid filing",
        gateName: "Convergence",
        nextRequirement: "All requirements met — file convergence on Mastery.",
        gateRewardLine:
          "Field loot multiplier, Knight valor ladder, and extra hybrid capacity relief.",
        title: "Prime Convergence",
        detail: brief.body,
        gateLine: "Hybrid depth satisfied — file convergence on Mastery.",
        nearBreakthroughLine: null,
        claimReady: true,
        href: "/mastery",
        ctaLabel: "File convergence",
      };
    }
    return {
      phaseIndex: 3,
      phaseTotal: PHASE_TOTAL,
      phaseLabel: "Hybrid filing",
      gateName: "Convergence",
      nextRequirement: next,
      gateRewardLine:
        "Registers hybrid resonance: valor economy, loot posture, and capacity forgiveness.",
      title: brief.title,
      detail: brief.body,
      gateLine: checklist,
      nearBreakthroughLine: near,
      claimReady: false,
      href: "/mastery",
      ctaLabel: "Mastery ladder",
    };
  }

  const knightNear = knightNearBreakthrough(p);
  return {
    phaseIndex: 4,
    phaseTotal: PHASE_TOTAL,
    phaseLabel: "Knight prestige",
    gateName: "Knight valor arc",
    nextRequirement:
      m.runeKnightValor < 3
        ? "Win ranked or tournament arena rounds to bank Knight valor."
        : "Spend Knight valor on Mythic ladder boons or Arena Edge Sigils.",
    gateRewardLine:
      "Converts prestige into mastery progress, influence, arena edge, and Ivory rites.",
    title: "Knight prestige arc",
    detail:
      m.runeKnightValor < 3
        ? "Bank Knight valor from ranked or tournament arena wins — then spend it on Mythic ladder boons."
        : "Spend Knight valor on ladder boons, Arena Edge Sigils, or Ivory Tower prestige rites.",
    gateLine: `Valor ${m.runeKnightValor}/99 · arena SR ${m.arenaRankedSeason1Rating}`,
    nearBreakthroughLine: knightNear,
    claimReady: false,
    href: "/mastery",
    ctaLabel: "Mythic ladder",
  };
}

const BREAKTHROUGH_TTL_MS = 120_000;

/** Ephemeral UI: recent mythic gate clear (banner + pulse). */
export function getActiveMythicGateBreakthrough(
  player: PlayerState,
  nowMs: number,
): { headline: string; detail: string } | null {
  const b = player.lastMythicGateBreakthrough;
  if (!b) return null;
  if (nowMs - b.at > BREAKTHROUGH_TTL_MS) return null;
  return { headline: b.headline, detail: b.detail };
}

/** One-line ascension tension for compact HUD chips (void field, etc.). */
export function getAscensionTensionChipLine(state: GameState): string | null {
  const step = getCurrentAscensionStep(state);
  return step.nearBreakthroughLine;
}
