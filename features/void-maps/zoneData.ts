export type VoidZoneId =
  | "void-frontier"
  | "rust-trench"
  | "ash-docks"
  | "glass-ruins"
  | "grave-circuit";

export type VoidZone = {
  id: VoidZoneId;
  label: string;
  threatBand: "low" | "medium" | "high";
  spawnTableId: VoidZoneId;
  backdropClassName: string;
};

export const DEFAULT_HOME_DEPLOY_ZONE_ID: VoidZoneId = "void-frontier";

export const voidZones: VoidZone[] = [
  {
    id: "void-frontier",
    label: "Void Frontier",
    threatBand: "low",
    spawnTableId: "void-frontier",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(30,110,120,0.25),rgba(8,10,18,0.95)_58%)]",
  },
  {
    id: "rust-trench",
    label: "Rust Trench",
    threatBand: "medium",
    spawnTableId: "rust-trench",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(140,80,40,0.24),rgba(12,10,14,0.95)_58%)]",
  },
  {
    id: "ash-docks",
    label: "Ash Docks",
    threatBand: "medium",
    spawnTableId: "ash-docks",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(120,40,40,0.24),rgba(10,8,14,0.95)_60%)]",
  },
  {
    id: "glass-ruins",
    label: "Glass Ruins",
    threatBand: "high",
    spawnTableId: "glass-ruins",
    backdropClassName:
      "bg-[radial-gradient(circle_at_top,rgba(70,55,130,0.28),rgba(8,8,18,0.96)_60%)]",
  },
  {
    id: "grave-circuit",
    label: "Grave Circuit",
    threatBand: "high",
    spawnTableId: "grave-circuit",
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
