import { maxRuneDepthAcrossSchools } from "@/features/mastery/runeMasteryLogic";
import type { PlayerState } from "@/features/game/gameTypes";
import type { MythicAscensionState } from "@/features/progression/mythicAscensionTypes";

export function initialMythicAscension(): MythicAscensionState {
  return {
    l3RareRuneSetUnlocked: false,
    runeCrafterLicense: false,
    arenaRankedSeason1Rating: 1180,
  };
}

export function normalizeMythicAscension(raw: unknown): MythicAscensionState {
  const base = initialMythicAscension();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    l3RareRuneSetUnlocked: o.l3RareRuneSetUnlocked === true,
    runeCrafterLicense: o.runeCrafterLicense === true,
    arenaRankedSeason1Rating:
      typeof o.arenaRankedSeason1Rating === "number" &&
      Number.isFinite(o.arenaRankedSeason1Rating)
        ? Math.max(0, Math.floor(o.arenaRankedSeason1Rating))
        : base.arenaRankedSeason1Rating,
  };
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
