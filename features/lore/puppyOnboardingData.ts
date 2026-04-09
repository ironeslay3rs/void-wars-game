import type { PathType } from "@/features/game/gameTypes";

/**
 * Puppy onboarding narrative — the "first bad deal" story.
 *
 * CANON STATUS: CANONICAL
 * "Puppy" is a canonical term from Evolution: Puppy (Elias Korr spinoff series).
 * The onboarding narrative mirrors Elias Korr's actual story:
 *   - Heard a rumor about cheap evolution blood
 *   - Bought a cut vial from Discount Lars (Bonehowl Syndicate)
 *   - Injected it, got half-evolved (patchy fur, amber eyes, sharper smell)
 *   - Became a "Puppy" — a newcomer learning to survive in the Black Market
 *
 * SOURCE: Evolution_Puppy_Volume1_COMPLETE.docx (lore-canon/02 Books/)
 * "Down here, a puppy was learning to walk." — Episode 1 closing line
 *
 * This is a narrative SKIN on top of the existing mechanical flow.
 * SchoolSelector, characterCreated, playerFactory all keep working.
 */

export type OnboardingStep = 1 | 2 | 3 | 4;

export type OnboardingBeat = {
  step: OnboardingStep;
  title: string;
  eyebrow: string;
  flavor: string;
  guidance: string;
};

/** Step 1 and 4 are school-independent. */
export const onboardingNarrativeBeats: Record<1 | 4, OnboardingBeat> = {
  1: {
    step: 1,
    title: "The Rumor",
    eyebrow: "Blackcity · Lower Ring",
    flavor:
      "You heard about it three days ago — a broker in the Lower Ring of Blackcity " +
      "with something rare, something cheap, something that smells like a trap. " +
      "You came anyway. Blackcity doesn't judge why people show up. It only judges " +
      "what they do after they arrive.",
    guidance: "Enter your operative name. This is how the market will know you.",
  },
  4: {
    step: 4,
    title: "Welcome to Blackcity",
    eyebrow: "Blackcity · Registration",
    flavor:
      "You're a Puppy now. That's what they call the new ones — hungry, " +
      "hopeful, easy to bait. The market doesn't care what happened at that " +
      "stall. It only cares what you do next. The broker already forgot your " +
      "name. The thing inside you hasn't.",
    guidance: "Your first run is waiting. The market records your oath, then sends you to the hub.",
  },
};

/** Step 2: broker descriptions (school selection moment). */
export type BrokerOffer = {
  school: PathType;
  brokerName: string;
  stallLocation: string;
  /** The item on the stall — what the player is buying. */
  offerTitle: string;
  /** What it looks like, what it does, why it's suspicious. */
  offerFlavor: string;
  /** What the broker says (one line of dialogue). */
  brokerLine: string;
  /** The consequence preview — what will happen if you take this deal. */
  consequenceHint: string;
};

export const brokerOffers: BrokerOffer[] = [
  {
    school: "bio",
    brokerName: "Discount Lars",
    stallLocation: "Stall 7, Lower Ring",
    offerTitle: "Fenrir Pup Blood — Grade Two",
    offerFlavor:
      "A vial of something red and warm. The broker says it's Fenrir pup blood — " +
      "grade two, Bonehowl stock. Probably fake. Your hands are already sweating. " +
      "The vial pulses when you hold it, like a heartbeat that isn't yours.",
    brokerLine:
      "\"Bonehowl stock, fresh off the transport. Grade two — maybe three if the beast " +
      "was angry when they took it. Fifty credits. No refunds. No questions.\"",
    consequenceHint:
      "The Verdant Coil path. Your body becomes the weapon. Mutation, hunting, " +
      "DNA absorption. The blood remembers what it was.",
  },
  {
    school: "mecha",
    brokerName: "The Pharos Defector",
    stallLocation: "Stall 14, Foundry Edge",
    offerTitle: "Neural Interface Chip — Pharos Sealed",
    offerFlavor:
      "A neural interface chip, still sealed in Pharos packaging. The broker says " +
      "it fell off a transport. The serial number's been filed off. It hums when " +
      "you touch it — a clean, mathematical vibration that makes your thoughts sharper.",
    brokerLine:
      "\"Pharos engineering. Divine-grade neural bridge. The serial is gone but the " +
      "architecture is flawless. Plug it in and your mind gets an upgrade it didn't " +
      "know it needed. One hundred credits. Take it or someone else will.\"",
    consequenceHint:
      "The Chrome Synod path. Your mind becomes the weapon. Precision, structure, " +
      "cybernetic integration. The machine remembers everything.",
  },
  {
    school: "pure",
    brokerName: "The Candle Row Dealer",
    stallLocation: "Ember Vault, Candle Row",
    offerTitle: "Memory Shard — Ash-Wrapped",
    offerFlavor:
      "A memory shard wrapped in ash-cloth. The dealer says it holds a rune-smith's " +
      "last thought. When you unwrap it, you hear a voice that isn't yours — quiet, " +
      "patient, speaking in a language you almost understand.",
    brokerLine:
      "\"Mouth of Inti origin. The rune-smith who made this burned out trying to hold " +
      "too many memories at once. This is the one that survived. Touch it and you'll " +
      "know something you didn't know before. That's the price and the product.\"",
    consequenceHint:
      "The Ember Vault path. Your soul becomes the weapon. Rune-craft, memory, " +
      "inherited wisdom. The fire remembers what reality once was.",
  },
];

/** Step 3: consequence text per school (the deal goes sideways). */
export const consequenceBeats: Record<PathType, OnboardingBeat> = {
  bio: {
    step: 3,
    title: "The Consequence",
    eyebrow: "Something Changed",
    flavor:
      "The vial cracked in your hand — or maybe you cracked it. The blood didn't " +
      "spill. It moved. Up your fingers, across your palm, into the skin. For three " +
      "seconds you couldn't breathe. Then you could breathe better than you ever have. " +
      "Your teeth feel sharper. Your eyes adjust to the dark too fast. " +
      "Discount Lars is already gone. The stall is empty. Whatever was in that vial " +
      "is in you now, and it's not leaving.",
    guidance:
      "The Verdant Coil has taken root. Your body is the crucible. The first mutation is free — the rest you'll have to earn.",
  },
  mecha: {
    step: 3,
    title: "The Consequence",
    eyebrow: "Something Changed",
    flavor:
      "You didn't plug it in. It plugged itself in. The moment the chip touched the " +
      "skin behind your ear, it dissolved the surface and bonded to the neural sheath " +
      "underneath. For two seconds your vision went white. Then everything became " +
      "clearer — literally. You can see the structural stress in the walls. You can " +
      "hear the frequency of the overhead lighting. The Pharos Defector watches you " +
      "from across the stall and nods, once, like she expected this.",
    guidance:
      "The Chrome Synod integration has begun. Your mind is the architecture. The first upgrade is free — the rest will be engineered.",
  },
  pure: {
    step: 3,
    title: "The Consequence",
    eyebrow: "Something Changed",
    flavor:
      "The memory hit you like a wall of heat. For one second you were someone else — " +
      "standing in a forge that doesn't exist anymore, holding a rune that burned with " +
      "a color you've never seen. Then you were yourself again, on the floor of the " +
      "Ember Vault, with ash on your fingers and a word in your mouth that you can't " +
      "quite pronounce. The candle row dealer hasn't moved. The candles are brighter " +
      "than they were before. One of them is burning in a color that matches the rune " +
      "from the memory.",
    guidance:
      "The Ember Vault has spoken. Your soul is the vessel. The first flame is free — the rest you'll have to earn through fire.",
  },
};

export function getBrokerOffer(school: PathType): BrokerOffer {
  return brokerOffers.find((b) => b.school === school)!;
}
