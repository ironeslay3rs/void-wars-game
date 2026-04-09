import type { PathType } from "@/features/game/gameTypes";

/**
 * CANON STATUS: The Seven Flames (Pure/Ember Vault doctrine) are CANONICAL.
 * Flames 1, 2, 3, 5, 7 are explicitly named in the novels.
 * Flames 4 and 6 are CANON GAPS — not yet named in Books 1-7.
 * "The Youngest Day" (Bio) and "Structure Holds" (Mecha) are also canonical.
 *
 * SOURCES: Book 2 (Flames 1-3, Youngest Day), Book 3 (Structure Holds),
 *          Book 5 (Flames 5, 7), Book 6 (Seventh Flame elaboration)
 *
 * Bio teaches through INSTINCT.
 * Mecha teaches through COMPREHENSION.
 * Pure teaches through WISDOM (inherited experience).
 */

export type DoctrineMilestone = {
  depth: number;
  title: string;
  /** The core doctrine truth — one line. */
  truth: string;
  /** How the path delivers this truth (2-3 sentences, school-voiced). */
  teaching: string;
  /** Brief gameplay hint about what this depth unlocks or changes. */
  mechanicHint: string;
};

export type SchoolDoctrine = {
  school: PathType;
  name: string;
  tagline: string;
  embodies: string;
  milestones: DoctrineMilestone[];
};

// ─────────────────────────────────────────────────────
// PURE — The Seven Flames of the Ember Vault
// ─────────────────────────────────────────────────────

const pureFlames: DoctrineMilestone[] = [
  // CANON SOURCE: Book 2 — Richard: "The first flame wakes the material."
  {
    depth: 1,
    title: "Heat Honestly",
    truth: "Heat honestly.",
    teaching:
      "The first flame wakes the material. Before a rune can hold memory, " +
      "it must be heated without deception. The forge reads your intention " +
      "before you speak it.",
    mechanicHint: "Resonance pool opens. First rune slot available.",
  },
  // CANON SOURCE: Book 2 — "the Ember Vault's second flame is Ash Marks the Survivor"
  {
    depth: 2,
    title: "Ash Marks the Survivor",
    truth: "Every wound is a lesson.",
    teaching:
      "The second flame lets the material answer. Ash is not waste — it is " +
      "proof that something endured the fire. Your damage is not a problem " +
      "to be solved. It is a record.",
    mechanicHint: "Executional tier L2 unlocks at 3 minor runes.",
  },
  // CANON SOURCE: Book 2 — Richard: "Remember honestly."
  {
    depth: 3,
    title: "Remember Honestly",
    truth: "Memory is a blade.",
    teaching:
      "The third decides what memory is allowed to remain once the answer " +
      "stops being random. Not all memories deserve to survive the forge. " +
      "The honest ones cut cleanest.",
    mechanicHint: "Depth 3+ required for convergence eligibility.",
  },
  // CANON GAP: Fourth Flame not explicitly named in Books 1-7. Awaiting author confirmation.
  {
    depth: 4,
    title: "The Fourth Flame",
    truth: "The fourth flame is unnamed in the canon.",
    teaching:
      "The fourth flame's name has not yet been revealed. Its doctrine " +
      "waits in the forge, unnamed but not unfelt.",
    mechanicHint: "Depth 4+ required for L3 Rare Rune cycle gate.",
  },
  // CANON SOURCE: Book 5 — "The fifth flame of the Ember Vault: The Ember Smothers in Silk."
  {
    depth: 5,
    title: "The Ember Smothers in Silk",
    truth: "Perfect comfort is the most dangerous fire.",
    teaching:
      "The Velvet Trial's doctrine. A flawed comfort you can leave because " +
      "the flaw provides the reason. A perfect comfort requires a different " +
      "reason — and that reason is: I know which fire is mine. This one is not.",
    mechanicHint: "Executional tier L3 unlocks at 5 minor runes.",
  },
  // CANON GAP: Sixth Flame not explicitly named in Books 1-7. Awaiting author confirmation.
  {
    depth: 6,
    title: "The Sixth Flame",
    truth: "The sixth flame is unnamed in the canon.",
    teaching:
      "The sixth flame's name has not yet been revealed. Between silk and " +
      "solitude, there is a fire that burns without being seen.",
    mechanicHint: "Maximum minor runes per school. Peak single-path power.",
  },
  // CANON SOURCE: Book 5 — "The seventh flame: the last flame is yours alone."
  // CANON SOURCE: Book 6 — "The seventh cannot be found. Only admitted."
  {
    depth: 7,
    title: "The Last Flame Is Yours Alone",
    truth: "Know which fire is yours.",
    teaching:
      "Not resist comfort, not distrust warmth. Know which fire is yours. " +
      "The seventh flame cannot be found — only admitted. It was never external.",
    mechanicHint: "Maximum rune depth. Saint-tier rune forging territory.",
  },
];

// ─────────────────────────────────────────────────────
// BIO — The Seven Truths of Mutation
// ─────────────────────────────────────────────────────

const bioTruths: DoctrineMilestone[] = [
  // CANON SOURCE: Book 2 — "a truth called The Youngest Day, which means: delay is death, evolve now."
  {
    depth: 1,
    title: "The Youngest Day",
    truth: "Delay is death. Evolve now.",
    teaching:
      "Bio doctrine begins with a truth: the youngest day is today. The body " +
      "that hesitates is the body that dies. Speed is not recklessness — it is " +
      "respect for the fact that tomorrow is not guaranteed.",
    mechanicHint: "Blood capacity pool opens. First rune slot available.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 2
  {
    depth: 2,
    title: "Blood Remembers",
    truth: "Adaptations are inherited.",
    teaching:
      "Every creature you absorb carries a record of what killed it. " +
      "Your blood reads those records and writes them into your cells. " +
      "This is not science — it is instinct wearing the mask of memory.",
    mechanicHint: "Executional tier L2 unlocks at 3 minor runes.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 3
  {
    depth: 3,
    title: "Predator's Pact",
    truth: "To take from a beast, you must defeat it.",
    teaching:
      "The Coil does not trade. It hunts. Every power you absorb was earned " +
      "in a fight where you could have died. There is no borrowing in nature — " +
      "only taking, and paying the price of the hunt.",
    mechanicHint: "Depth 3+ required for convergence eligibility.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 4
  {
    depth: 4,
    title: "Flesh is Clay",
    truth: "The body is raw material.",
    teaching:
      "Your body is not who you are. It is what you are shaping. The Coil " +
      "teaches this at the bone level: every cell can be rewritten, every " +
      "organ repurposed, every limit dissolved — if you are willing to pay.",
    mechanicHint: "Depth 4+ required for L3 Rare Rune cycle gate.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 5
  {
    depth: 5,
    title: "No Mercy in the Wild",
    truth: "The strong breed; the weak feed the soil.",
    teaching:
      "Nature is not cruel. It is honest. The fifth truth strips away " +
      "the comfortable lie that everyone deserves to survive. In the Coil, " +
      "you prove your right to exist by existing harder than anything " +
      "that tries to stop you.",
    mechanicHint: "Executional tier L3 unlocks at 5 minor runes.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 6
  {
    depth: 6,
    title: "The Bone Crown",
    truth: "The apex predator owes nothing.",
    teaching:
      "When you stand at the top of the food chain, there is no debt " +
      "above you. The Bone Crown is not a reward — it is a state. You " +
      "do not earn it by winning. You earn it by making everything else lose.",
    mechanicHint: "Maximum minor runes per school. Peak single-path power.",
  },
  // NON-CANON PLACEHOLDER — game-specific Bio doctrine depth 7
  {
    depth: 7,
    title: "Return to the First Hunt",
    truth: "All leads back to origin.",
    teaching:
      "The final truth of mutation is a circle. You have become the " +
      "apex — and now you understand that the very first hunt, the " +
      "fumbling desperate strike of a puppy in the dark, contained " +
      "everything you would ever become.",
    mechanicHint: "Maximum rune depth. Saint-tier rune forging territory.",
  },
];

// ─────────────────────────────────────────────────────
// MECHA — The Seven Truths of Perfection
// ─────────────────────────────────────────────────────

const mechaTruths: DoctrineMilestone[] = [
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 1
  {
    depth: 1,
    title: "The First Gear Turns Alone",
    truth: "Independence before unity.",
    teaching:
      "Before you integrate with the machine, you must prove you can " +
      "function without it. The Chrome Synod demands this: understand " +
      "yourself as a system first. Only then can you be improved.",
    mechanicHint: "Frame capacity pool opens. First rune slot available.",
  },
  // CANON SOURCE: Book 3 — "Structure holds when members fail."
  {
    depth: 2,
    title: "Structure Holds",
    truth: "Structure holds when members fail.",
    teaching:
      "The Chrome Synod builds systems that survive the failure of any " +
      "individual component. Not because individuals don't matter — because " +
      "the structure must outlast the crisis that kills them.",
    mechanicHint: "Executional tier L2 unlocks at 3 minor runes.",
  },
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 3
  {
    depth: 3,
    title: "The Hand that Shapes",
    truth: "Creation is ownership.",
    teaching:
      "When you build something, you own it completely — its function, " +
      "its failure, its future. The Chrome Synod teaches that the maker " +
      "stands above the made. If you can build it, it belongs to you.",
    mechanicHint: "Depth 3+ required for convergence eligibility.",
  },
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 4
  {
    depth: 4,
    title: "Memory in Metal",
    truth: "Flesh forgets; steel remembers.",
    teaching:
      "Your biological memory is unreliable — it edits, distorts, and " +
      "decays. The machine remembers perfectly. The fourth truth is the " +
      "Synod's great bargain: trade the warmth of organic memory for the " +
      "precision of permanent record.",
    mechanicHint: "Depth 4+ required for L3 Rare Rune cycle gate.",
  },
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 5
  {
    depth: 5,
    title: "The Mirror Must Smile",
    truth: "Perfection must be believed.",
    teaching:
      "It is not enough to be perfect. Others must perceive your " +
      "perfection. The Synod's fifth truth is political: power without " +
      "presentation is waste. Your frame must inspire awe in those who " +
      "see it, or the upgrade is incomplete.",
    mechanicHint: "Executional tier L3 unlocks at 5 minor runes.",
  },
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 6
  {
    depth: 6,
    title: "The Tower Without End",
    truth: "Progress never stops.",
    teaching:
      "There is no final upgrade. No complete form. No version that " +
      "cannot be improved. The sixth truth is the Synod's promise and " +
      "its curse: you will never be finished. Perfection is a direction, " +
      "not a destination.",
    mechanicHint: "Maximum minor runes per school. Peak single-path power.",
  },
  // NON-CANON PLACEHOLDER — game-specific Mecha doctrine depth 7
  {
    depth: 7,
    title: "The Machine Ascends",
    truth: "Become infinite.",
    teaching:
      "The final truth of the Chrome Synod is transcendence through " +
      "absolute integration. You do not use the machine. You do not " +
      "control the machine. You ARE the machine — and the machine " +
      "has no ceiling.",
    mechanicHint: "Maximum rune depth. Saint-tier rune forging territory.",
  },
];

// ─────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────

export const schoolDoctrines: Record<PathType, SchoolDoctrine> = {
  pure: {
    school: "pure",
    name: "The Seven Flames of the Ember Vault",
    tagline: "Fire remembers.",
    embodies: "Soul",
    milestones: pureFlames,
  },
  bio: {
    school: "bio",
    name: "The Seven Truths of Mutation",
    tagline: "We are what survives.",
    embodies: "Body",
    milestones: bioTruths,
  },
  mecha: {
    school: "mecha",
    name: "The Seven Truths of Perfection",
    tagline: "Perfection is property — and we own it.",
    embodies: "Mind",
    milestones: mechaTruths,
  },
};

export function getDoctrineMilestone(
  school: PathType,
  depth: number,
): DoctrineMilestone | undefined {
  return schoolDoctrines[school].milestones.find((m) => m.depth === depth);
}

export function getUnlockedDoctrines(
  school: PathType,
  currentDepth: number,
): DoctrineMilestone[] {
  return schoolDoctrines[school].milestones.filter(
    (m) => m.depth <= currentDepth,
  );
}

export function getNextLockedDoctrine(
  school: PathType,
  currentDepth: number,
): DoctrineMilestone | undefined {
  return schoolDoctrines[school].milestones.find(
    (m) => m.depth > currentDepth,
  );
}
