import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type MobSpawnEntry = {
  id: string;
  label: string;
  weight: number;
  minPack: number;
  maxPack: number;
};

export const voidZoneSpawnTables: Record<VoidZoneId, MobSpawnEntry[]> = {
  "void-frontier": [
    { id: "vf-scavenger-drone", label: "Scavenger Drone", weight: 40, minPack: 1, maxPack: 3 },
    { id: "vf-rust-hound", label: "Rust Hound", weight: 35, minPack: 2, maxPack: 4 },
    { id: "vf-void-mite", label: "Void Mite", weight: 25, minPack: 3, maxPack: 6 },
  ],
  "rust-trench": [
    { id: "rt-burrower", label: "Scrapyard Burrower", weight: 34, minPack: 1, maxPack: 2 },
    { id: "rt-scrap-raider", label: "Scrap Raider", weight: 38, minPack: 2, maxPack: 4 },
    { id: "rt-rustfang", label: "Rustfang Pack", weight: 28, minPack: 2, maxPack: 5 },
  ],
  "ash-docks": [
    { id: "ad-smoke-stalker", label: "Smoke Stalker", weight: 36, minPack: 1, maxPack: 3 },
    { id: "ad-cinder-runner", label: "Cinder Runner", weight: 34, minPack: 2, maxPack: 4 },
    { id: "ad-char-swarmer", label: "Char Swarmer", weight: 30, minPack: 3, maxPack: 6 },
  ],
  "glass-ruins": [
    { id: "gr-lens-watcher", label: "Lens Watcher", weight: 32, minPack: 1, maxPack: 2 },
    { id: "gr-shard-lurker", label: "Shard Lurker", weight: 36, minPack: 2, maxPack: 3 },
    { id: "gr-prism-maw", label: "Prism Maw", weight: 32, minPack: 2, maxPack: 4 },
  ],
  "grave-circuit": [
    { id: "gc-wire-specter", label: "Wire Specter", weight: 34, minPack: 1, maxPack: 3 },
    { id: "gc-circuit-ghoul", label: "Circuit Ghoul", weight: 36, minPack: 2, maxPack: 4 },
    { id: "gc-null-sentinel", label: "Null Sentinel", weight: 30, minPack: 1, maxPack: 2 },
  ],
};
