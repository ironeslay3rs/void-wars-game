import { PlayerState } from "./gameTypes";

export const initialGameState: PlayerState = {
  name: "Iron",
  rank: "Initiate",
  rankLevel: 1,
  rankXp: 0,
  rankXpToNext: 100,
  condition: 72,
  path: null,
  credits: 12450,
  voidCrystals: 350,
  bioEssence: 1180,
  masteryProgress: 12,
  activeMissionId: null,
  unlockedDistricts: ["crafting-district"],
  inventory: [
    {
      id: "starter-ration",
      name: "Starter Ration",
      type: "consumable",
      quantity: 2,
      description: "Basic field ration used to stabilize condition.",
    },
  ],
  missions: [
    {
      id: "prologue-entry",
      title: "Prologue Entry",
      description: "Choose your evolutionary path and enter the Void.",
      status: "locked",
      rewards: {
        credits: 250,
        masteryProgress: 3,
        rankXp: 100,
      },
    },
    {
      id: "first-assignment",
      title: "First Assignment",
      description: "Complete your first field contract and secure supply rewards.",
      status: "locked",
      rewards: {
        credits: 500,
        voidCrystals: 25,
        bioEssence: 50,
        masteryProgress: 5,
        rankXp: 200,
        items: [
          {
            id: "scrap-core",
            name: "Scrap Core",
            type: "resource",
            quantity: 1,
            description: "Recovered tech-material from a low-tier contract.",
          },
          {
            id: "void-shard",
            name: "Void Shard",
            type: "resource",
            quantity: 2,
            description: "A crystalline fragment infused with unstable energy.",
          },
        ],
        unlockDistricts: ["biotech-labs"],
      },
    },
    {
      id: "district-access",
      title: "District Access",
      description: "Unlock your first advanced district in the Nexus Bazaar.",
      status: "locked",
      rewards: {
        credits: 300,
        masteryProgress: 4,
        rankXp: 150,
        unlockDistricts: ["spirit-enclave"],
      },
    },
  ],
};