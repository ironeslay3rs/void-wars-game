import type { RouteDefinition } from "@/features/navigation/navigationTypes";

export const ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    id: "home",
    label: "Home District",
    description: "Primary command layer and local operations hub.",
  },
  {
    id: "bazaar",
    label: "Black Bazaar",
    description: "Trade, contracts, and faction-side exchanges.",
  },
  {
    id: "forge",
    label: "Forge Quarter",
    description: "Crafting, refinement, and rune assembly.",
    requirement: {
      requiredRankLevel: 2,
    },
  },
  {
    id: "arena",
    label: "Arena",
    description: "Combat trials, ranked clashes, and prestige gains.",
    requirement: {
      requiredRankLevel: 3,
    },
  },
  {
    id: "mecha-foundry",
    label: "Mecha Foundry",
    description: "Machine augmentation and chrome systems access.",
    requirement: {
      requiredRankLevel: 2,
    },
  },
  {
    id: "spirit-sanctum",
    label: "Pure Sanctum",
    description: "Attunement, resonance, and Pure-aligned rites.",
    requirement: {
      requiredRankLevel: 2,
    },
  },
  {
    id: "gate",
    label: "Gate Nexus",
    description: "Travel junction for wider world route progression.",
    requirement: {
      requiredRankLevel: 4,
      requiredRoutes: ["bazaar"],
    },
  },
];