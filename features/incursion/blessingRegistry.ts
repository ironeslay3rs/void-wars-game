/**
 * Void Incursion Blessing Registry.
 *
 * Canon anchors (per blessing):
 *   - Bio / Verdant Coil — lore-canon/01 Master Canon/Schools/The Three
 *     Evolution Schools.md ("adaptation through flesh, DNA, hunting,
 *     mutation, and living power"). Costs lean on condition drain and
 *     blood-capacity stress.
 *   - Mecha / Chrome Synod — same file ("precision, enhancement,
 *     cybernetics, analysis, and engineered perfection"). Costs lean on
 *     frame-capacity stress.
 *   - Pure / Ember Vault — same file ("memory, spirit, fire, wisdom, and
 *     inner law"). Costs lean on resonance-capacity stress and corruption.
 *   - Black City fusion — lore-canon/CLAUDE.md ("Black City = neutral
 *     territory, chaotic, no school owns it"). Pairs two schools; pays two
 *     costs; ceiling is higher, stability is worse.
 *
 * 15 blessings total: 4 per school + 3 Black City fusions.
 */
import type {
  Blessing,
  BlessingSchool,
  FusionBlessing,
} from "./blessingTypes";

export const VERDANT_COIL_BLESSINGS: readonly Blessing[] = [
  {
    id: "bio.predator_fangs",
    name: "Predator's Fangs",
    school: "bio",
    flavor: "Verdant Coil instinct sharpens your strike to a hunter's angle.",
    effect: { damagePct: 25 },
    cost: { kind: "condition", amount: 6 },
    rarity: "common",
  },
  {
    id: "bio.living_suture",
    name: "Living Suture",
    school: "bio",
    flavor: "Coil tissue weaves shut what the Void tears open.",
    effect: { regenPerSec: 1.5 },
    cost: { kind: "capacity", amount: 2, pool: "blood" },
    rarity: "common",
  },
  {
    id: "bio.mutagen_adaptation",
    name: "Mutagen Adaptation",
    school: "bio",
    flavor: "A deliberate mutation softens the mismatch of off-school runes.",
    effect: { mismatchReductionPct: 20, damagePct: 5 },
    cost: { kind: "corruption", amount: 5 },
    rarity: "common",
  },
  {
    id: "bio.predator_instinct",
    name: "Predator Instinct",
    school: "bio",
    flavor: "The Verdant Coil hunter-sense flags weak points before you aim.",
    effect: { precisionPct: 15, damagePct: 10 },
    cost: { kind: "condition", amount: 8 },
    rarity: "rare",
  },
];

export const CHROME_SYNOD_BLESSINGS: readonly Blessing[] = [
  {
    id: "mecha.synod_barrier",
    name: "Synod Barrier",
    school: "mecha",
    flavor: "Chrome Synod plating ripples in front of every hit.",
    effect: { shieldPct: 20 },
    cost: { kind: "capacity", amount: 2, pool: "frame" },
    rarity: "common",
  },
  {
    id: "mecha.targeting_solution",
    name: "Targeting Solution",
    school: "mecha",
    flavor: "Chrome Synod optics lock angles faster than breath.",
    effect: { precisionPct: 20 },
    cost: { kind: "capacity", amount: 2, pool: "frame" },
    rarity: "common",
  },
  {
    id: "mecha.extended_array",
    name: "Extended Array",
    school: "mecha",
    flavor: "Synod servos push reach beyond the Void's usual horizon.",
    effect: { rangePct: 25 },
    cost: { kind: "condition", amount: 5 },
    rarity: "common",
  },
  {
    id: "mecha.overclock",
    name: "Overclock",
    school: "mecha",
    flavor: "A Chrome Synod run-burst — perfect, expensive, and brief.",
    effect: { damagePct: 20, precisionPct: 10 },
    cost: { kind: "capacity", amount: 4, pool: "frame" },
    rarity: "rare",
  },
];

export const EMBER_VAULT_BLESSINGS: readonly Blessing[] = [
  {
    id: "pure.vault_wellspring",
    name: "Vault Wellspring",
    school: "pure",
    flavor: "Ember Vault memory pours mana into your vessel.",
    effect: { manaBonus: 15 },
    cost: { kind: "capacity", amount: 2, pool: "resonance" },
    rarity: "common",
  },
  {
    id: "pure.foresight",
    name: "Ember Foresight",
    school: "pure",
    flavor: "A half-step of future-sight — Pure wisdom through lived pattern.",
    effect: { foresightCharges: 2, dodgePct: 10 },
    cost: { kind: "corruption", amount: 4 },
    rarity: "common",
  },
  {
    id: "pure.soul_echo",
    name: "Soul Echo",
    school: "pure",
    flavor: "An echo of a prior self strikes alongside you.",
    effect: { damagePct: 15, regenPerSec: 0.5 },
    cost: { kind: "corruption", amount: 6 },
    rarity: "common",
  },
  {
    id: "pure.resonance_attunement",
    name: "Resonance Attunement",
    school: "pure",
    flavor: "Ember Vault resonance drowns off-school dissonance for a run.",
    effect: { mismatchReductionPct: 35, manaBonus: 10 },
    cost: { kind: "capacity", amount: 4, pool: "resonance" },
    rarity: "rare",
  },
];

export const BLACK_CITY_FUSION_BLESSINGS: readonly FusionBlessing[] = [
  {
    id: "fusion.coil_synod",
    name: "Coil-Synod Graft",
    flavor:
      "Black City back-alley chop: Verdant flesh sleeved in Chrome Synod plate.",
    pair: "bio+mecha",
    effect: { damagePct: 25, shieldPct: 15, precisionPct: 10 },
    costs: [
      { kind: "condition", amount: 8 },
      { kind: "capacity", amount: 3, pool: "frame" },
    ],
    rarity: "fusion",
  },
  {
    id: "fusion.synod_vault",
    name: "Synod-Vault Protocol",
    flavor:
      "Black City liturgy: Chrome Synod optics parsing Ember Vault memory.",
    pair: "mecha+pure",
    effect: { precisionPct: 15, manaBonus: 20, foresightCharges: 1 },
    costs: [
      { kind: "capacity", amount: 3, pool: "frame" },
      { kind: "corruption", amount: 6 },
    ],
    rarity: "fusion",
  },
  {
    id: "fusion.vault_coil",
    name: "Vault-Coil Rite",
    flavor:
      "Black City rite: Ember Vault soulfire poured through Verdant Coil flesh.",
    pair: "pure+bio",
    effect: { regenPerSec: 2, damagePct: 15, mismatchReductionPct: 15 },
    costs: [
      { kind: "corruption", amount: 5 },
      { kind: "condition", amount: 6 },
    ],
    rarity: "fusion",
  },
];

export const ALL_SCHOOL_BLESSINGS: readonly Blessing[] = [
  ...VERDANT_COIL_BLESSINGS,
  ...CHROME_SYNOD_BLESSINGS,
  ...EMBER_VAULT_BLESSINGS,
];

export function blessingsForSchool(school: BlessingSchool): readonly Blessing[] {
  switch (school) {
    case "bio":
      return VERDANT_COIL_BLESSINGS;
    case "mecha":
      return CHROME_SYNOD_BLESSINGS;
    case "pure":
      return EMBER_VAULT_BLESSINGS;
  }
}

export function getBlessingById(id: string): Blessing | FusionBlessing | null {
  for (const b of ALL_SCHOOL_BLESSINGS) if (b.id === id) return b;
  for (const f of BLACK_CITY_FUSION_BLESSINGS) if (f.id === id) return f;
  return null;
}
