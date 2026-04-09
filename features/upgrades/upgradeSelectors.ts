import type { GameState, PathType, ResourceKey } from "@/features/game/gameTypes";
import type { RuneSchool } from "@/features/mastery/runeMasteryTypes";
import { RUNE_SCHOOLS } from "@/features/mastery/runeMasteryTypes";
import {
  computeInstallCost,
  canAffordCapacityCost,
  MAX_MINORS_PER_SCHOOL,
} from "@/features/mastery/runeMasteryLogic";
import {
  canUnlockL3RareRuneSet,
  canGrantRuneCrafterLicense,
  canPrimeConvergence,
  meetsRecipeMythicGate,
} from "@/features/progression/mythicAscensionLogic";
import { craftRecipes } from "@/features/crafting/recipeData";
import type { UpgradeOption, UpgradeReadySummary } from "./upgradeTypes";

// Planned beats before they exist in state: `features/upgrades/upgradeRoadmapData.ts`.

// ---------------------------------------------------------------------------
// Rank-up
// ---------------------------------------------------------------------------

function rankUpOption(state: GameState): UpgradeOption {
  const p = state.player;
  const pct =
    p.rankXpToNext > 0
      ? Math.min(100, Math.round((p.rankXp / p.rankXpToNext) * 100))
      : 100;
  const remaining = Math.max(0, p.rankXpToNext - p.rankXp);
  return {
    id: "rank-up",
    kind: "rank-up",
    title: `Rank ${p.rankLevel + 1}`,
    reward: "Unlocks new routes, missions, and mythic gate requirements.",
    progressPct: pct,
    gap: pct >= 100 ? "Ready to claim" : `${remaining} XP remaining`,
    href: "/missions",
    ctaLabel: "Run contracts",
    pathAccent: null,
    ready: pct >= 100,
  };
}

// ---------------------------------------------------------------------------
// Rune installs (one per affordable school)
// ---------------------------------------------------------------------------

function runeInstallOptions(state: GameState): UpgradeOption[] {
  const p = state.player;
  const results: UpgradeOption[] = [];

  for (const school of RUNE_SCHOOLS) {
    if (p.runeMastery.minorCountBySchool[school] >= MAX_MINORS_PER_SCHOOL) {
      continue;
    }

    const cost = computeInstallCost({
      alignment: p.factionAlignment,
      school,
    });
    const canAfford = canAffordCapacityCost(p.runeMastery.capacity, cost);

    // Calculate proximity: how close are we to affording this?
    const poolKeys = ["blood", "frame", "resonance"] as const;
    let metCount = 0;
    let totalReqs = 0;
    for (const k of poolKeys) {
      if (cost[k] > 0) {
        totalReqs++;
        if (p.runeMastery.capacity[k] >= cost[k]) metCount++;
      }
    }
    const pct = canAfford ? 100 : totalReqs > 0 ? Math.round((metCount / totalReqs) * 100) : 0;

    const schoolLabel = school === "pure" ? "Pure" : school === "bio" ? "Bio" : "Mecha";
    const nextDepth = p.runeMastery.minorCountBySchool[school] + 2; // depth = 1 + minors

    results.push({
      id: `rune-install-${school}`,
      kind: "rune-install",
      title: `${schoolLabel} Rune L${nextDepth}`,
      reward: `Deepen ${schoolLabel} mastery to depth ${nextDepth}. Unlocks executional tier bonuses.`,
      progressPct: pct,
      gap: canAfford
        ? "Capacity available — install now"
        : `Need more ${poolKeys.filter((k) => cost[k] > 0 && p.runeMastery.capacity[k] < cost[k]).join("/")} capacity`,
      href: "/mastery",
      ctaLabel: "Open Mastery",
      pathAccent: school as PathType,
      ready: canAfford,
      school,
      costs: poolKeys
        .filter((k) => cost[k] > 0)
        .map((k) => ({
          key: k as unknown as ResourceKey,
          need: cost[k],
          have: p.runeMastery.capacity[k],
        })),
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Craftable recipes (material check)
// ---------------------------------------------------------------------------

function craftableRecipeOptions(state: GameState): UpgradeOption[] {
  const p = state.player;
  const results: UpgradeOption[] = [];

  for (const recipe of craftRecipes) {
    // Skip mythic-gated recipes player hasn't unlocked
    if (!meetsRecipeMythicGate(p, recipe.mythicGate)) continue;

    const matEntries = Object.entries(recipe.materials) as [ResourceKey, number][];
    let metCount = 0;
    const totalMats = matEntries.length;
    const costs: UpgradeOption["costs"] = [];

    for (const [key, need] of matEntries) {
      const have = p.resources[key] ?? 0;
      costs.push({ key, need, have });
      if (have >= need) metCount++;
    }

    const pct = totalMats > 0 ? Math.round((metCount / totalMats) * 100) : 0;
    const canCraft = metCount === totalMats;

    // Only show recipes that are at least 50% achievable (reduces noise)
    if (pct < 50) continue;

    results.push({
      id: `craft-${recipe.id}`,
      kind: "craft-recipe",
      title: recipe.name,
      reward:
        recipe.output.kind === "item"
          ? `${recipe.output.item.rarity} ${recipe.output.item.kind} — ${recipe.output.item.name}`
          : `Resource yield from refining`,
      progressPct: canCraft ? 100 : pct,
      gap: canCraft
        ? `${Math.round(recipe.successChance * 100)}% success — craft now`
        : `Missing: ${costs.filter((c) => c.have < c.need).map((c) => `${c.need - c.have} ${c.key}`).join(", ")}`,
      href: "/bazaar/crafting-district",
      ctaLabel: "Crafting District",
      pathAccent: null,
      ready: canCraft,
      recipeId: recipe.id,
      costs,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Mythic ascension gates
// ---------------------------------------------------------------------------

function mythicGateOptions(state: GameState): UpgradeOption[] {
  const p = state.player;
  const m = p.mythicAscension;
  const results: UpgradeOption[] = [];

  // L3 Rare Rune Set
  if (!m.l3RareRuneSetUnlocked) {
    const ready = canUnlockL3RareRuneSet(p);
    const reqs = [
      { met: p.rankLevel >= 4, label: `Rank 4+ (${p.rankLevel})` },
      {
        met: Math.max(
          p.runeMastery.depthBySchool.bio,
          p.runeMastery.depthBySchool.mecha,
          p.runeMastery.depthBySchool.pure,
        ) >= 4,
        label: "Rune depth 4+",
      },
      { met: p.resources.ironHeart >= 1, label: `1× Ironheart (${p.resources.ironHeart})` },
      { met: p.resources.runeDust >= 30, label: `30 Rune Dust (${p.resources.runeDust})` },
    ];
    const metCount = reqs.filter((r) => r.met).length;
    results.push({
      id: "mythic-l3",
      kind: "mythic-gate",
      title: "L3 Rare Rune Cycle",
      reward: "Unlocks restricted forge, deeper mythic recipes, and the Rune Crafter path.",
      progressPct: ready ? 100 : Math.round((metCount / reqs.length) * 100),
      gap: ready
        ? "All requirements met — claim on Mastery"
        : reqs.filter((r) => !r.met).map((r) => r.label).join(" · "),
      href: "/mastery",
      ctaLabel: "Mastery Ladder",
      pathAccent: null,
      ready,
    });
  }

  // Rune Crafter License
  if (m.l3RareRuneSetUnlocked && !m.runeCrafterLicense) {
    const ready = canGrantRuneCrafterLicense(p);
    const reqs = [
      { met: p.rankLevel >= 5, label: `Rank 5+ (${p.rankLevel})` },
      { met: p.resources.ironHeart >= 2, label: `2× Ironheart (${p.resources.ironHeart})` },
    ];
    const metCount = reqs.filter((r) => r.met).length;
    results.push({
      id: "mythic-crafter",
      kind: "mythic-gate",
      title: "Rune Crafter License",
      reward: "Profession recognition, hybrid drain relief, convergence filing access.",
      progressPct: ready ? 100 : Math.round((metCount / reqs.length) * 100),
      gap: ready
        ? "Claim on Mastery"
        : reqs.filter((r) => !r.met).map((r) => r.label).join(" · "),
      href: "/mastery",
      ctaLabel: "Claim License",
      pathAccent: null,
      ready,
    });
  }

  // Convergence Prime
  if (m.runeCrafterLicense && !m.convergencePrimed) {
    const ready = canPrimeConvergence(p);
    const schools = RUNE_SCHOOLS.filter(
      (s) => p.runeMastery.depthBySchool[s] >= 3,
    ).length;
    const reqs = [
      { met: p.rankLevel >= 5, label: `Rank 5+ (${p.rankLevel})` },
      { met: schools >= 2, label: `2 schools depth 3+ (${schools})` },
    ];
    const metCount = reqs.filter((r) => r.met).length;
    results.push({
      id: "mythic-convergence",
      kind: "mythic-gate",
      title: "Convergence Prime",
      reward: "Tri-school hybrid, Knight valor ladder, extra capacity relief.",
      progressPct: ready ? 100 : Math.round((metCount / reqs.length) * 100),
      gap: ready
        ? "File convergence on Mastery"
        : reqs.filter((r) => !r.met).map((r) => r.label).join(" · "),
      href: "/mastery",
      ctaLabel: "File Convergence",
      pathAccent: null,
      ready,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Quick actions (rations, vent heat)
// ---------------------------------------------------------------------------

function quickActionOptions(state: GameState): UpgradeOption[] {
  const p = state.player;
  const results: UpgradeOption[] = [];

  // Consume moss ration
  if (p.resources.mossRations > 0 && p.hunger < 80) {
    results.push({
      id: "consume-ration",
      kind: "consume-ration",
      title: "Consume Ration",
      reward: "+25 hunger, +5 condition",
      progressPct: 100,
      gap: `${p.resources.mossRations} rations available`,
      href: "/status",
      ctaLabel: "Open Vitals",
      pathAccent: null,
      ready: true,
    });
  }

  // Vent heat
  if (p.runInstability >= 40 && p.resources.credits >= 150 && p.resources.scrapAlloy >= 12) {
    results.push({
      id: "vent-heat",
      kind: "vent-heat",
      title: "Vent Run Heat",
      reward: `−24% heat (currently ${Math.round(p.runInstability)}%)`,
      progressPct: 100,
      gap: "150 credits + 12 scrap alloy",
      href: "/home",
      ctaLabel: "Vent on Strip",
      pathAccent: null,
      ready: true,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main selector
// ---------------------------------------------------------------------------

export function getUpgradeReadySummary(state: GameState): UpgradeReadySummary {
  const all: UpgradeOption[] = [
    rankUpOption(state),
    ...runeInstallOptions(state),
    ...craftableRecipeOptions(state),
    ...mythicGateOptions(state),
    ...quickActionOptions(state),
  ];

  // Sort: ready first, then by progressPct descending
  all.sort((a, b) => {
    if (a.ready !== b.ready) return a.ready ? -1 : 1;
    return b.progressPct - a.progressPct;
  });

  const readyCount = all.filter((u) => u.ready).length;
  const closest = all[0] ?? null;

  return { readyCount, closest, all };
}

export function getClosestUpgrade(state: GameState): UpgradeOption | null {
  return getUpgradeReadySummary(state).closest;
}
