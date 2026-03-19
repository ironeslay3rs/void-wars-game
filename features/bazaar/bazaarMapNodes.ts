export type BazaarNodeType =
  | "bio"
  | "mecha"
  | "spirit"
  | "market"
  | "combat"
  | "travel";

export type BazaarNodeData = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: BazaarNodeType;
};

export const bazaarMapNodes: BazaarNodeData[] = [
  { id: "void-market", label: "Void Market", x: 50, y: 45, type: "market" },
  { id: "black-market", label: "Black Market", x: 50, y: 65, type: "market" },

  { id: "biotech-labs", label: "Biotech Labs", x: 20, y: 35, type: "bio" },
  { id: "spirit-enclave", label: "Spirit Enclave", x: 20, y: 55, type: "spirit" },
  { id: "crafting-district", label: "Crafting District", x: 25, y: 70, type: "market" },

  { id: "arena", label: "Arena", x: 80, y: 30, type: "combat" },
  { id: "mecha-foundry", label: "Mecha Foundry", x: 75, y: 50, type: "mecha" },
  { id: "mercenary-guild", label: "Mercenary Guild", x: 75, y: 70, type: "combat" },

  { id: "teleport-gate", label: "Teleport Gate", x: 70, y: 85, type: "travel" },
];