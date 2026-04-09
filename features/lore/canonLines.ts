/**
 * Lore quotes for the Sevenfold Rune universe.
 * Use for: loading screens, tooltips, NPC dialogue, item descriptions,
 * doctrine encounters, ambient market flavor.
 *
 * CANON STATUS: MIXED
 * - 3 quotes are CANONICAL from Evolution: Puppy Volume 1
 * - Remaining quotes are GAME-SPECIFIC creative work (no book source)
 * - Game-specific quotes are valid adaptation-layer content
 */

export type CanonLine = {
  id: string;
  text: string;
  /** Optional attribution (NPC, doctrine, location). */
  source?: string;
  /** Tags for contextual filtering. */
  tags: CanonLineTag[];
};

export type CanonLineTag =
  | "market"
  | "bio"
  | "mecha"
  | "pure"
  | "convergence"
  | "survival"
  | "identity"
  | "combat"
  | "doctrine"
  | "economy";

export const canonLines: CanonLine[] = [
  {
    id: "market-value",
    text: "In the Black Market, value is personal.",
    tags: ["market", "economy"],
  },
  {
    id: "market-unforgettable",
    text: "The Black Market does not create the best evolutions. It creates the most unforgettable ones.",
    tags: ["market", "identity"],
  },
  {
    id: "borrowed-power",
    text: "Borrowed power can imitate a result, but not the native truth behind it.",
    tags: ["convergence", "doctrine"],
  },
  {
    id: "purity-conflict",
    text: "Purity scales. Conflict transforms.",
    source: "Black Market proverb",
    tags: ["convergence", "doctrine", "market"],
  },
  {
    id: "negotiated-survivals",
    text: "The greatest Black Market creations are not balanced. They are negotiated survivals.",
    tags: ["market", "identity"],
  },
  {
    id: "arena-truth",
    text: "If there is truth left in them, the arena will reveal it.",
    source: "Arena Warden",
    tags: ["combat", "identity"],
  },
  {
    id: "arena-broken",
    text: "The arena does not heal the broken. It forces them to become whatever they truly are.",
    source: "Arena Warden",
    tags: ["combat", "identity"],
  },
  {
    id: "skill-survival",
    text: "A person does not gain a skill just by becoming stronger. They gain it by surviving the thing that teaches it.",
    tags: ["doctrine", "survival"],
  },
  {
    id: "soul-shards",
    text: "Soul shards do not store spells. They store the memory of when reality once listened.",
    tags: ["pure", "doctrine"],
  },
  {
    id: "alive-for-free",
    text: "No one in the Black Market stays alive for free.",
    tags: ["market", "survival"],
  },
  {
    id: "school-sleep",
    text: "Bio sleeps in hunger. Mecha sleeps in silence. Pure sleeps in memory.",
    tags: ["bio", "mecha", "pure", "doctrine"],
  },
  {
    id: "two-loyalties",
    text: "The Black Market respects two kinds of loyalty: what you pay, and what you survive for it.",
    tags: ["market", "survival"],
  },
  {
    id: "proof-first",
    text: "Do not draw the world. Draw the proof of the world first.",
    tags: ["doctrine", "identity"],
  },
  {
    id: "verdant-coil-creed",
    text: "We are what survives.",
    source: "Verdant Coil creed",
    tags: ["bio", "doctrine"],
  },
  {
    id: "chrome-synod-creed",
    text: "Perfection is property — and we own it.",
    source: "Chrome Synod creed",
    tags: ["mecha", "doctrine"],
  },
  {
    id: "ember-vault-creed",
    text: "Fire remembers.",
    source: "Ember Vault creed",
    tags: ["pure", "doctrine"],
  },
  {
    id: "seed-accident",
    text: "Every puppy's first mistake becomes the seed of their identity.",
    source: "Black Market saying",
    tags: ["market", "identity", "survival"],
  },
  {
    id: "mutation-hunger",
    text: "The Verdant Coil survives by harvesting what the war leaves behind.",
    tags: ["bio", "survival"],
  },
  {
    id: "frame-precision",
    text: "Chrome Synod discipline demands systematic extraction. Every sweep recovers materials that feed the forge.",
    tags: ["mecha", "doctrine"],
  },
  {
    id: "soul-slowest-path",
    text: "The Ember Vault walks the slowest path and the deepest one.",
    tags: ["pure", "doctrine"],
  },
  {
    id: "mismatch-negotiate",
    text: "Power sources do not just stack. They negotiate, invade, resist, and rewrite.",
    tags: ["convergence", "doctrine"],
  },
  {
    id: "partition-mutate",
    text: "Four outcomes when blood meets frame meets resonance: Resolve. Stabilize. Partition. Mutate. The Black Market specializes in the last two.",
    tags: ["convergence", "market"],
  },
  // CANON SOURCE: Evolution Puppy Vol.1 — epigraph
  {
    id: "puppy-elias-win",
    text: "Guess evolution's biggest mistake was thinking we all wanted to win. Some of us just wanted to live.",
    source: "Elias Korr",
    tags: ["survival", "market", "identity"],
  },
  // CANON SOURCE: Evolution Puppy Vol.1, Episode 10
  {
    id: "puppy-cook-survive",
    text: "Survive. That's the only currency I accept.",
    source: "The Cook",
    tags: ["survival", "market"],
  },
  // CANON SOURCE: Evolution Puppy Vol.1, Episode 1 — closing line
  {
    id: "puppy-learning-walk",
    text: "Down here, a puppy was learning to walk.",
    source: "Evolution: Puppy",
    tags: ["survival", "identity"],
  },
];

/** Get a random canon line, optionally filtered by tag. */
export function getRandomCanonLine(tag?: CanonLineTag): CanonLine {
  const pool = tag ? canonLines.filter((l) => l.tags.includes(tag)) : canonLines;
  const pick = pool.length > 0 ? pool : canonLines;
  return pick[Math.floor(Math.random() * pick.length)];
}

/** Get a canon line by ID (for deterministic use in doctrine screens etc). */
export function getCanonLineById(id: string): CanonLine | undefined {
  return canonLines.find((l) => l.id === id);
}
