export type VoidZoneId = "howling-scar" | "ash-relay" | "echo-ruins" | "rift-maw";

export type VoidZoneCategory = "standard" | "danger" | "special";

export type VoidZoneBossSpawnConfig = {
  /** Cooldown after boss death before any spawn checks begin. */
  cooldownMs: number;
  /** How often we roll a spawn attempt after cooldown. */
  rollIntervalMs: number;
  /** Chance per roll (0..1). */
  spawnChancePerRoll: number;
  /** Guaranteed spawn if no boss has spawned by this time since death/start. */
  forceSpawnAfterMs: number;
};

export type VoidZoneLootTheme = "ash_mecha" | "bio_rot" | "void_pure";

export type VoidZone = {
  id: VoidZoneId;
  label: string;
  description: string;
  category: VoidZoneCategory;
  threatLevel: number;
  dropType: "bio" | "mecha" | "spirit";
  bossEnabled: boolean;
  bossSpawn?: VoidZoneBossSpawnConfig;
  lootTheme: VoidZoneLootTheme;
  /** Optional: deepest school rune depth must be ≥ this to deploy (mastery spine). */
  minRuneDepth?: number;
  /**
   * Optional: school matching `lootTheme` must have Executional tier ≥ this
   * (see `getExecutionalTier`: L2 = 1, L3 = 2).
   */
  minExecutionalTier?: 1 | 2;
  recommendedCondition: number;

  // Back-compat fields used by the realtime void map sim + UI.
  threatBand: "low" | "medium" | "high";
  spawnTableId: VoidZoneId;
  backdropClassName: string;
  /** Normalized extraction marker for deploy field layer map. */
  extractionPositionPct: { x: number; y: number };
};

function threatLevelToBand(threatLevel: number): "low" | "medium" | "high" {
  if (threatLevel <= 1) return "low";
  if (threatLevel <= 2) return "medium";
  return "high";
}

export const DEFAULT_HOME_DEPLOY_ZONE_ID: VoidZoneId = "howling-scar";

export const voidZones: VoidZone[] = [
  {
    id: "howling-scar",
    label: "Howling Scar",
    description: "A living bio-field of teeth, flesh, and hunger.",
    category: "standard",
    threatLevel: 1,
    dropType: "bio",
    bossEnabled: false,
    bossSpawn: undefined,
    lootTheme: "bio_rot",
    recommendedCondition: 80,
    threatBand: threatLevelToBand(1),
    spawnTableId: "howling-scar",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(30,110,120,0.25),rgba(8,10,18,0.95)_58%)]",
    extractionPositionPct: { x: 94, y: 10 },
  },
  {
    id: "ash-relay",
    label: "Ash Relay",
    description:
      "Collapsed mecha relay filled with salvage and broken frames.",
    category: "standard",
    threatLevel: 2,
    dropType: "mecha",
    bossEnabled: false,
    bossSpawn: undefined,
    lootTheme: "ash_mecha",
    minRuneDepth: 2,
    recommendedCondition: 75,
    threatBand: threatLevelToBand(2),
    spawnTableId: "ash-relay",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(140,80,40,0.24),rgba(12,10,14,0.95)_58%)]",
    extractionPositionPct: { x: 10, y: 12 },
  },
  {
    id: "echo-ruins",
    label: "Echo Ruins",
    // Canon-safe wording: Pure aligns with the Pure path (not Spirit).
    description:
      "Pure-saturated ruins where memory echoes manifest.",
    category: "standard",
    threatLevel: 2,
    dropType: "spirit",
    bossEnabled: false,
    bossSpawn: undefined,
    lootTheme: "void_pure",
    minRuneDepth: 2,
    recommendedCondition: 75,
    threatBand: threatLevelToBand(2),
    spawnTableId: "echo-ruins",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(70,55,130,0.28),rgba(8,8,18,0.96)_60%)]",
    extractionPositionPct: { x: 88, y: 88 },
  },
  {
    id: "rift-maw",
    label: "Rift Maw",
    description: "Unstable void tear where bosses frequently emerge.",
    category: "special",
    threatLevel: 4,
    dropType: "bio",
    bossEnabled: true,
    minRuneDepth: 3,
    minExecutionalTier: 1,
    bossSpawn: {
      cooldownMs: 5 * 60 * 1000,
      rollIntervalMs: 10 * 1000,
      spawnChancePerRoll: 0.22,
      forceSpawnAfterMs: 8 * 60 * 1000,
    },
    lootTheme: "void_pure",
    recommendedCondition: 90,
    threatBand: threatLevelToBand(4),
    spawnTableId: "rift-maw",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(40,120,95,0.24),rgba(6,10,16,0.96)_58%)]",
    extractionPositionPct: { x: 50, y: 12 },
  },
];

export const voidZoneById: Record<VoidZoneId, VoidZone> = voidZones.reduce(
  (acc, zone) => {
    acc[zone.id] = zone;
    return acc;
  },
  {} as Record<VoidZoneId, VoidZone>,
);
