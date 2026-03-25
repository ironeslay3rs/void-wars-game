export type VoidZoneId = "howling-scar" | "ash-relay" | "echo-ruins" | "rift-maw";

export type VoidZoneCategory = "standard" | "danger" | "special";

export type VoidZone = {
  id: VoidZoneId;
  label: string;
  description: string;
  category: VoidZoneCategory;
  threatLevel: number;
  dropType: "bio" | "mecha" | "spirit";
  bossEnabled: boolean;
  recommendedCondition: number;

  // Back-compat fields used by the realtime void map sim + UI.
  threatBand: "low" | "medium" | "high";
  spawnTableId: VoidZoneId;
  backdropClassName: string;
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
    recommendedCondition: 80,
    threatBand: threatLevelToBand(1),
    spawnTableId: "howling-scar",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(30,110,120,0.25),rgba(8,10,18,0.95)_58%)]",
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
    recommendedCondition: 75,
    threatBand: threatLevelToBand(2),
    spawnTableId: "ash-relay",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(140,80,40,0.24),rgba(12,10,14,0.95)_58%)]",
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
    recommendedCondition: 75,
    threatBand: threatLevelToBand(2),
    spawnTableId: "echo-ruins",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(70,55,130,0.28),rgba(8,8,18,0.96)_60%)]",
  },
  {
    id: "rift-maw",
    label: "Rift Maw",
    description: "Unstable void tear where bosses frequently emerge.",
    category: "special",
    threatLevel: 4,
    dropType: "bio",
    bossEnabled: true,
    recommendedCondition: 90,
    threatBand: threatLevelToBand(4),
    spawnTableId: "rift-maw",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(40,120,95,0.24),rgba(6,10,16,0.96)_58%)]",
  },
];

export const voidZoneById: Record<VoidZoneId, VoidZone> = voidZones.reduce(
  (acc, zone) => {
    acc[zone.id] = zone;
    return acc;
  },
  {} as Record<VoidZoneId, VoidZone>,
);
