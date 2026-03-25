import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type MobSpawnEntry = {
  id: string;
  label: string;
  weight: number;
  minPack: number;
  maxPack: number;
};

export const voidZoneSpawnTables: Record<VoidZoneId, MobSpawnEntry[]> = {
  "howling-scar": [
    { id: "vf-scavenger-drone", label: "Scavenger Drone", weight: 40, minPack: 1, maxPack: 3 },
    { id: "vf-rust-hound", label: "Rust Hound", weight: 35, minPack: 2, maxPack: 4 },
    { id: "vf-void-mite", label: "Void Mite", weight: 25, minPack: 3, maxPack: 6 },
  ],
  "ash-relay": [
    { id: "rt-burrower", label: "Scrapyard Burrower", weight: 34, minPack: 1, maxPack: 2 },
    { id: "rt-scrap-raider", label: "Scrap Raider", weight: 38, minPack: 2, maxPack: 4 },
    { id: "rt-rustfang", label: "Rustfang Pack", weight: 28, minPack: 2, maxPack: 5 },
  ],
  "echo-ruins": [
    { id: "gr-lens-watcher", label: "Lens Watcher", weight: 32, minPack: 1, maxPack: 2 },
    { id: "gr-shard-lurker", label: "Shard Lurker", weight: 36, minPack: 2, maxPack: 3 },
    { id: "gr-prism-maw", label: "Prism Maw", weight: 32, minPack: 2, maxPack: 4 },
  ],
  "rift-maw": [
    { id: "gc-wire-specter", label: "Wire Specter", weight: 34, minPack: 1, maxPack: 3 },
    { id: "gc-circuit-ghoul", label: "Circuit Ghoul", weight: 36, minPack: 2, maxPack: 4 },
    { id: "gc-null-sentinel", label: "Null Sentinel", weight: 30, minPack: 1, maxPack: 2 },
  ],
};
