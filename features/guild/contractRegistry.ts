/**
 * Shared Contract Registry — seed list of Black Market guild contracts.
 *
 * Canon anchors:
 * - lore-canon/01 Master Canon/Locations/Black Market Lanes.md — seven sin
 *   lanes define the survivor culture; contract flavor borrows that voice.
 * - lore-canon/01 Master Canon/Locations/Black Market.md — guild history
 *   and mixed-evolution identity.
 * - lore-canon/CLAUDE.md — apex/Phase 2 material hierarchy, empire names.
 *
 * Pure data + lookup. No randomness. No timers. Callers who instantiate
 * a contract stamp `expiresAt` from their own clock.
 */

import type {
  ContractObjective,
  ContractRewardBundle,
  SharedContract,
} from "@/features/guild/guildTypes";

export type ContractTemplate = {
  id: string;
  title: string;
  flavor: string;
  objective: ContractObjective;
  cap: number;
  reward: ContractRewardBundle;
  /** Duration (ms) the caller adds to its clock to stamp expiresAt. */
  durationMs: number;
};

/**
 * Seed registry — 8 contracts covering every objective kind.
 * Flavor voice matches existing guildScreenData.ts ("organized pressure",
 * "collective claim", etc).
 */
export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "ctr-ashline-sweep",
    title: "Ashline Sweep",
    flavor:
      "Chrome Synod rejects are bleeding down the ash lanes. The crew needs kills logged, not stories.",
    objective: { kind: "hunt_zone_theme", theme: "ash_mecha" },
    cap: 40,
    durationMs: 48 * 60 * 60 * 1000,
    reward: {
      resources: { scrapAlloy: 180, heartIron: 3, credits: 400 },
      contributionGrant: 60,
    },
  },
  {
    id: "ctr-marrow-tithe",
    title: "Marrow Tithe",
    flavor:
      "Verdant Coil blood rites left too many failed vein-sealings in the rot. Bring the shards home.",
    objective: { kind: "collect_material", materialKey: "veinshard" },
    cap: 12,
    durationMs: 72 * 60 * 60 * 1000,
    reward: {
      resources: { bioSamples: 160, veinshard: 2, credits: 350 },
      contributionGrant: 80,
    },
  },
  {
    id: "ctr-ember-vigil",
    title: "Ember Vigil",
    flavor:
      "Ember Vault acolytes left ash unswept. The guild claims the skim before the braziers notice.",
    objective: { kind: "collect_material", materialKey: "veilAsh" },
    cap: 10,
    durationMs: 72 * 60 * 60 * 1000,
    reward: {
      resources: { runeDust: 140, veilAsh: 2, credits: 350 },
      contributionGrant: 80,
    },
  },
  {
    id: "ctr-rift-skim",
    title: "Rift Skim",
    flavor:
      "The Rift Maw is spitting hybrids. Fence the splinters before three schools argue the ownership.",
    objective: { kind: "collect_material", materialKey: "meldshard" },
    cap: 8,
    durationMs: 96 * 60 * 60 * 1000,
    reward: {
      resources: { emberCore: 90, meldshard: 2, credits: 500 },
      contributionGrant: 100,
    },
  },
  {
    id: "ctr-bonehowl-hunt",
    title: "Bonehowl Hunt",
    flavor:
      "Hollowfang marrow pits leak Bonehowl remnants. Drop the big ones; the guild takes its cut of every skull.",
    objective: { kind: "boss_kills" },
    cap: 5,
    durationMs: 72 * 60 * 60 * 1000,
    reward: {
      resources: { coilboundLattice: 1, credits: 600, emberCore: 60 },
      contributionGrant: 120,
    },
  },
  {
    id: "ctr-hollow-settlement",
    title: "Hollow Settlement Clearance",
    flavor:
      "Hollowfang dens keep reopening. Burn one down per rotation, or the crew loses the lane.",
    objective: { kind: "clear_hollowfang" },
    cap: 3,
    durationMs: 96 * 60 * 60 * 1000,
    reward: {
      resources: { bloodvein: 1, credits: 450, runeDust: 50 },
      contributionGrant: 90,
    },
  },
  {
    id: "ctr-forge-quota",
    title: "Forge Quota",
    flavor:
      "The crew's fence-contacts need stock. Any school, any bench — just keep the hammers swinging.",
    objective: { kind: "craft_items" },
    cap: 20,
    durationMs: 48 * 60 * 60 * 1000,
    reward: {
      resources: { scrapAlloy: 120, credits: 300 },
      contributionGrant: 50,
    },
  },
  {
    id: "ctr-void-pure-cleanse",
    title: "Void-Pure Cleanse",
    flavor:
      "Ember Vault patrols won't touch the deep-void shimmer. The guild will — for the right price.",
    objective: { kind: "hunt_zone_theme", theme: "void_pure" },
    cap: 35,
    durationMs: 48 * 60 * 60 * 1000,
    reward: {
      resources: { runeDust: 160, veilAsh: 1, credits: 420 },
      contributionGrant: 65,
    },
  },
];

export function getContractTemplate(id: string): ContractTemplate | undefined {
  return CONTRACT_TEMPLATES.find((c) => c.id === id);
}

export function listContractTemplates(): ContractTemplate[] {
  return CONTRACT_TEMPLATES.slice();
}

/**
 * Materialize a template into an active SharedContract.
 * `now` is caller-supplied to keep the function deterministic.
 */
export function instantiateContract(
  template: ContractTemplate,
  now: number,
): SharedContract {
  return {
    id: template.id,
    title: template.title,
    flavor: template.flavor,
    objective: template.objective,
    progress: 0,
    cap: template.cap,
    reward: {
      resources: { ...template.reward.resources },
      contributionGrant: template.reward.contributionGrant,
    },
    expiresAt: now + template.durationMs,
    perMember: {},
    status: "active",
  };
}
