import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import type { MythicRecipeGate } from "@/features/crafting/recipeData";
import type { PlayerState } from "@/features/game/gameTypes";
import type { MythicAscensionState } from "@/features/progression/mythicAscensionTypes";

export function initialMythicAscension(): MythicAscensionState {
  return {
    l3RareRuneSetUnlocked: false,
    runeCrafterLicense: false,
    convergencePrimed: false,
    convergenceRevealed: false,
    runeKnightValor: 0,
    arenaRankedSeason1Rating: 1180,
    arenaEdgeSigils: 0,
  };
}

export function normalizeMythicAscension(raw: unknown): MythicAscensionState {
  const base = initialMythicAscension();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    l3RareRuneSetUnlocked: o.l3RareRuneSetUnlocked === true,
    runeCrafterLicense: o.runeCrafterLicense === true,
    convergencePrimed: o.convergencePrimed === true,
    convergenceRevealed: o.convergenceRevealed === true,
    runeKnightValor:
      typeof o.runeKnightValor === "number" && Number.isFinite(o.runeKnightValor)
        ? Math.max(0, Math.min(99, Math.floor(o.runeKnightValor)))
        : base.runeKnightValor,
    arenaRankedSeason1Rating:
      typeof o.arenaRankedSeason1Rating === "number" &&
      Number.isFinite(o.arenaRankedSeason1Rating)
        ? Math.max(0, Math.floor(o.arenaRankedSeason1Rating))
        : base.arenaRankedSeason1Rating,
    arenaEdgeSigils:
      typeof o.arenaEdgeSigils === "number" && Number.isFinite(o.arenaEdgeSigils)
        ? Math.max(0, Math.min(12, Math.floor(o.arenaEdgeSigils)))
        : base.arenaEdgeSigils,
  };
}

/** Schools at or above this rune depth (Phase 9 hybrid / convergence gate). */
export function countRuneSchoolsAtLeastDepth(
  player: PlayerState,
  minDepth: number,
): number {
  const d = player.runeMastery.depthBySchool;
  return RUNE_SCHOOLS.filter((s) => d[s] >= minDepth).length;
}

export function canPrimeConvergence(player: PlayerState): boolean {
  const m = player.mythicAscension;
  if (m.convergencePrimed) return false;
  if (!m.runeCrafterLicense) return false;
  if (player.rankLevel < 5) return false;
  return countRuneSchoolsAtLeastDepth(player, 3) >= 2;
}

export function canUnlockL3RareRuneSet(player: PlayerState): boolean {
  if (player.mythicAscension.l3RareRuneSetUnlocked) return false;
  const depth = maxRuneDepthAcrossSchools(player.runeMastery);
  if (player.rankLevel < 4 || depth < 4) return false;
  if (player.resources.ironHeart < 1) return false;
  if (player.resources.runeDust < 30) return false;
  return true;
}

export function canGrantRuneCrafterLicense(player: PlayerState): boolean {
  if (!player.mythicAscension.l3RareRuneSetUnlocked) return false;
  if (player.mythicAscension.runeCrafterLicense) return false;
  return player.rankLevel >= 5 && player.resources.ironHeart >= 2;
}

export function meetsRecipeMythicGate(
  player: PlayerState,
  gate: MythicRecipeGate | undefined,
): boolean {
  if (!gate) return true;
  if (gate === "l3RareRuneSet") {
    return player.mythicAscension.l3RareRuneSetUnlocked;
  }
  return player.mythicAscension.runeCrafterLicense;
}

export function getRecipeMythicGateHint(gate: MythicRecipeGate): string {
  if (gate === "l3RareRuneSet") {
    return "Requires L3 Rare Rune cycle unlock — Mastery → Mythic ladder (rank 4+, depth 4+, Ironheart + dust tithe).";
  }
  return "Requires Rune Crafter license — after L3 unlock: rank 5+ and 2× Ironheart tithe on the same ladder.";
}

/** Phase 7 exit bookmark — formal Rune Knight trials stay beyond Book 1. */
export function getRuneKnightReadiness(player: PlayerState): {
  title: string;
  body: string;
} {
  const m = player.mythicAscension;
  if (!m.l3RareRuneSetUnlocked) {
    return {
      title: "Rune Knight path — dormant",
      body: "Clear the L3 Rare Rune cycle first. Knight registry reads obsidian lattice work, not raw field rank alone.",
    };
  }
  if (!m.runeCrafterLicense) {
    return {
      title: "Rune Knight path — waiting on license",
      body: "Earn the Rune Crafter title; the Knight cadence assumes you can bind war metals without warping the crew.",
    };
  }
  if (m.convergencePrimed) {
    return {
      title: "Rune Knight path — convergence primed",
      body: `Hybrid resonance is filed on your registry row. Ranked arena wins accrue Knight valor (${m.runeKnightValor}/99) for prestige staging; Golden Bazaar sell quotes read your seal. Deeper oaths stay queued for Phase 9.`,
    };
  }
  return {
    title: "Rune Knight path — reserved",
    body: "Crafter standing locks your registry row. Prime convergence when two schools hold depth 3+ — then the ladder admits Knight prestige staging without cost.",
  };
}

/** Phase 9 — surface copy for the Mythic ladder (bookmark only until full arc ships). */
export function getConvergenceArcBrief(
  m: MythicAscensionState,
  player: PlayerState,
): { title: string; body: string } {
  if (m.convergencePrimed) {
    return {
      title: "Convergence — registered",
      body: "Tri-school pressure reads cleanly on the Saint lattice. Hybrid capacity ceilings forgive one extra drain stack (stacks with Rune Crafter relief). Earn Knight valor from ranked or tournament victories — see tally below.",
    };
  }
  if (!m.runeCrafterLicense) {
    return {
      title: "Convergence — locked",
      body: "Earn the Rune Crafter license first; convergence is filed only for operatives who already bind war metals safely.",
    };
  }
  if (player.rankLevel < 5) {
    return {
      title: "Convergence — field rank",
      body: "Reach rank 5+ so Central Command will file hybrid resonance without downgrading your survival clearance.",
    };
  }
  if (countRuneSchoolsAtLeastDepth(player, 3) < 2) {
    return {
      title: "Convergence — needs hybrid depth",
      body: "Deepen at least two rune schools to depth 3+ (minors on both paths). The arc wants body/frame/soul disagreement on record, not a single-school spike.",
    };
  }
  return {
    title: "Convergence — ready to file",
    body: "Registry clerks will stamp your hybrid ladder. No tithe — this is recognition, not a purchase.",
  };
}

export function getSaintRuneL5Panel(
  m: MythicAscensionState,
): { title: string; body: string } {
  if (!m.l3RareRuneSetUnlocked) {
    return {
      title: "Saint gate — sealed",
      body: "Unlock the L3 Rare Rune cycle to breach the first Saint seal.",
    };
  }
  if (!m.runeCrafterLicense) {
    return {
      title: "Saint trial",
      body: "Earn the Rune Crafter license; only crafters may read L5 lattice schematics.",
    };
  }
  return {
    title: "Ascendant lattice — reserved",
    body: "L5 Saint Rune forging is slated beyond Book 1. Your ladder position is reserved when content lands.",
  };
}
