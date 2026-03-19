export type PathType = "Bio" | "Mecha" | "Spirit";

export type MissionStatus = "locked" | "available" | "active" | "completed";

export type InventoryItem = {
  id: string;
  name: string;
  type: "resource" | "gear" | "consumable" | "quest";
  quantity: number;
  description?: string;
};

export type BazaarDistrict =
  | "biotech-labs"
  | "spirit-enclave"
  | "crafting-district"
  | "arena"
  | "mecha-foundry"
  | "mercenary-guild"
  | "faction-hqs"
  | "teleport-gate";

export type MissionReward = {
  credits?: number;
  voidCrystals?: number;
  bioEssence?: number;
  condition?: number;
  masteryProgress?: number;
  rankXp?: number;
  items?: InventoryItem[];
  unlockDistricts?: BazaarDistrict[];
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  rewards: MissionReward;
};

export type PlayerState = {
  name: string;
  rank: string;
  rankLevel: number;
  rankXp: number;
  rankXpToNext: number;
  condition: number;
  path: PathType | null;
  credits: number;
  voidCrystals: number;
  bioEssence: number;
  masteryProgress: number;
  activeMissionId: string | null;
  unlockedDistricts: BazaarDistrict[];
  inventory: InventoryItem[];
  missions: Mission[];
};