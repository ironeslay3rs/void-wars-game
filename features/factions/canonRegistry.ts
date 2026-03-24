export type StableFactionId = "bio" | "mecha" | "spirit";

export type CanonPathFactionRecord = {
  name: string;
  description: string;
  tagline: string;
};

export const canonPathFactions: Record<StableFactionId, CanonPathFactionRecord> = {
  bio: {
    name: "Verdant Coil",
    description: "Bio doctrine of adaptive growth, grafting, and predatory evolution",
    tagline: "Bio supremacy through adaptation",
  },
  mecha: {
    name: "Chrome Synod",
    description: "Mecha doctrine of frame precision, hardened armor, and engineered control",
    tagline: "Mecha order through machinery",
  },
  spirit: {
    name: "Ember Vault",
    description: "Pure doctrine of ember rites, soul resonance, and ritual refinement",
    tagline: "Pure ascent through ember rites",
  },
};
