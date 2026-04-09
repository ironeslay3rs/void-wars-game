import type { PlayerState, ResourcesState } from "@/features/game/gameTypes";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export type CraftWorkOrderDefinition =
  | {
      id: string;
      title: string;
      blurb: string;
      kind: "recipe";
      targetRecipeId: string;
      targetCount: number;
      rewardCredits: number;
      rewardResources?: Partial<ResourcesState>;
    }
  | {
      id: string;
      title: string;
      blurb: string;
      kind: "moss-bind";
      targetCount: number;
      rewardCredits: number;
      rewardResources?: Partial<ResourcesState>;
    };

/** Real-time period for which the same rotating trio of offers is stable (~1 week). */
export const CRAFT_WORK_ORDER_ROTATION_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Full broker board; a subset is offered via `getRotatingWorkOrderCatalog`. */
export const ALL_CRAFT_WORK_ORDER_DEFINITIONS: CraftWorkOrderDefinition[] = [
  {
    id: "wo-scrap-blade",
    title: "Arms bench: Scrap Blades",
    blurb: "District security needs a run of common blades.",
    kind: "recipe",
    targetRecipeId: "scrap-blade",
    targetCount: 1,
    rewardCredits: 45,
    rewardResources: { runeDust: 3 },
  },
  {
    id: "wo-refine-ore",
    title: "Refinery: ore wash",
    blurb: "Process granulate wash batches into broker-ready alloy.",
    kind: "recipe",
    targetRecipeId: "refine-ore-granulate",
    targetCount: 2,
    rewardCredits: 40,
    rewardResources: { scrapAlloy: 4 },
  },
  {
    id: "wo-moss-line",
    title: "Kitchen: moss line",
    blurb: "Bind moss rations through the district kitchen flow.",
    kind: "moss-bind",
    targetCount: 2,
    rewardCredits: 30,
    rewardResources: { bioSamples: 5 },
  },
  {
    id: "wo-bone-plating",
    title: "Bench: Bone plating run",
    blurb: "Armor templates for scavenger teams rotating the Outer Wastes.",
    kind: "recipe",
    targetRecipeId: "bone-plating",
    targetCount: 1,
    rewardCredits: 50,
    rewardResources: { scrapAlloy: 5 },
  },
  {
    id: "wo-rune-sigil",
    title: "Arc: Rune sigil bind",
    blurb: "Vault-readiness sigils for patrol wards.",
    kind: "recipe",
    targetRecipeId: "rune-sigil",
    targetCount: 1,
    rewardCredits: 55,
    rewardResources: { runeDust: 4, emberCore: 1 },
  },
  {
    id: "wo-bio-serum",
    title: "Hybrid: serum vials",
    blurb: "Stabilizer stock for coil-adjacent clinics.",
    kind: "recipe",
    targetRecipeId: "bio-serum",
    targetCount: 1,
    rewardCredits: 48,
    rewardResources: { bioSamples: 6 },
  },
  {
    id: "wo-refine-ember-channel",
    title: "Refinery: ember channel",
    blurb: "High-yield scrap channeling into cores.",
    kind: "recipe",
    targetRecipeId: "refine-scrap-ember-channel",
    targetCount: 1,
    rewardCredits: 52,
    rewardResources: { emberCore: 1 },
  },
  {
    id: "wo-refine-slurry",
    title: "Refinery: biomass slurry",
    blurb: "Slurry pulls dust for Pure-side brokers.",
    kind: "recipe",
    targetRecipeId: "refine-bio-slurry-rift",
    targetCount: 2,
    rewardCredits: 44,
    rewardResources: { runeDust: 5 },
  },
  {
    id: "wo-blade-mk2",
    title: "Arms bench: Mk-II blade",
    blurb: "War-grade upgrade line — failures burn expensive alloy.",
    kind: "recipe",
    targetRecipeId: "scrap-blade-upgrade",
    targetCount: 1,
    rewardCredits: 85,
    rewardResources: { scrapAlloy: 8, runeDust: 4 },
  },
];

export function getCraftWorkOrderById(id: string): CraftWorkOrderDefinition | null {
  return ALL_CRAFT_WORK_ORDER_DEFINITIONS.find((d) => d.id === id) ?? null;
}

/** Deterministic three-offer subset per rotation epoch (no server). */
export function getRotatingWorkOrderCatalog(
  nowMs: number,
): CraftWorkOrderDefinition[] {
  const epoch = Math.floor(nowMs / CRAFT_WORK_ORDER_ROTATION_PERIOD_MS);
  const rng = mulberry32(epoch);
  const pool = [...ALL_CRAFT_WORK_ORDER_DEFINITIONS];
  const pick: CraftWorkOrderDefinition[] = [];
  while (pick.length < 3 && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    pick.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return pick;
}

export function normalizeCraftWorkOrderSlot(
  raw: unknown,
): PlayerState["craftWorkOrder"] {
  if (!isRecord(raw)) return null;
  const definitionId =
    typeof raw.definitionId === "string" ? raw.definitionId : "";
  if (!getCraftWorkOrderById(definitionId)) return null;
  const progress =
    typeof raw.progress === "number" && Number.isFinite(raw.progress)
      ? Math.max(0, Math.floor(raw.progress))
      : 0;
  return { definitionId, progress };
}

export function withCraftWorkOrderProgress(
  player: PlayerState,
  trigger: { type: "recipe"; recipeId: string } | { type: "moss-bind" },
): PlayerState {
  const wo = player.craftWorkOrder;
  if (!wo) return player;
  const def = getCraftWorkOrderById(wo.definitionId);
  if (!def || wo.progress >= def.targetCount) return player;
  let matches = false;
  if (trigger.type === "recipe") {
    matches =
      def.kind === "recipe" && def.targetRecipeId === trigger.recipeId;
  } else {
    matches = def.kind === "moss-bind";
  }
  if (!matches) return player;
  return {
    ...player,
    craftWorkOrder: { ...wo, progress: wo.progress + 1 },
  };
}
