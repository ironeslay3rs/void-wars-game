import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Discount Lars — Bonehowl Deserter.
 *
 * Canon source: Evolution Puppy Vol.1, Ep. 1 — Lars sells Elias a cut
 * Lycan strain; signature line: "Pure Lycan Strain. Uncut. Moon-blessed.
 * Fresh from the Bonehowl labs."
 *
 * Arc:
 * - Stranger: the pitch. Lars is cheerful, dishonest, sells cut stock.
 * - Acquainted (rapport ≥ 10): offer to talk about the desertion.
 * - Familiar (rapport ≥ 30): Lars drops the fake cheer and names the
 *   unit he lost.
 * - Trusted (rapport ≥ 50): the "moon-blessed" premium stock unlocks.
 *   This is the canon Puppy line — kept uncorrupted.
 */

export const LARS_UNLOCK_PREMIUM = "lars-premium-stock";

export const larsDialogueTree: BrokerDialogueTree = {
  brokerId: "discount-lars",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Lars leans against the crate he's using as a counter. The vials behind him catch the lamplight badly.",
      speakerLine:
        "Friend! Bonehowl stock, fresh off the transport. No refunds, no questions. What'll it be?",
      choices: [
        {
          id: "browse",
          text: "Browse the stock.",
          nextNodeId: "pitch",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "ask_name",
          text: '"How\'d you end up here, Lars?"',
          nextNodeId: "desertion_gate",
        },
        {
          id: "leave",
          text: "Walk away.",
          nextNodeId: null,
        },
      ],
    },
    pitch: {
      id: "pitch",
      speakerLine:
        "Grade two Bonehowl tissue. Probably. Maybe grade one on a good day. You wouldn't believe the prices uptown.",
      choices: [
        {
          id: "compliment",
          text: '"You\'re a better salesman than you look."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 3 }],
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    desertion_gate: {
      id: "desertion_gate",
      speakerLine:
        "*shrugs* Walked south. Found the Black Market. Stayed.",
      choices: [
        {
          id: "press_acquainted",
          text: '"That\'s not the whole story."',
          nextNodeId: "desertion_acquainted",
          rapportGate: 10,
        },
        {
          id: "accept",
          text: '"Fair enough."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 1 }],
        },
      ],
    },
    desertion_acquainted: {
      id: "desertion_acquainted",
      flavor: "Lars drops the grin for the first time.",
      speakerLine:
        "Fenrir's third cadre. Wrath-surge went bad. Half my unit came back mutated past recognition. I took what I could carry and I walked. That's the whole story.",
      choices: [
        {
          id: "press_familiar",
          text: '"Name them."',
          nextNodeId: "desertion_familiar",
          rapportGate: 30,
        },
        {
          id: "thanks",
          text: '"Thanks for telling me."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 5 }],
        },
      ],
    },
    desertion_familiar: {
      id: "desertion_familiar",
      flavor: "He looks at the vials. Not at you.",
      speakerLine:
        "Vetr. Skadi. Eiri. Bjorn, though Bjorn made it back mostly intact — he just doesn't sleep anymore. The others I won't say.",
      choices: [
        {
          id: "witness",
          text: "Say nothing. Listen.",
          nextNodeId: "trust_offer",
          effects: [{ kind: "rapport_delta", amount: 10 }],
        },
      ],
    },
    trust_offer: {
      id: "trust_offer",
      flavor: "Lars reaches under the crate. Pulls out a vial with a moon-silver seal.",
      speakerLine:
        "Pure Lycan Strain. Uncut. Moon-blessed. Fresh from the Bonehowl labs. This one's the real thing. I don't sell it to browsers.",
      choices: [
        {
          id: "accept_premium",
          text: "Take the offer.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: LARS_UNLOCK_PREMIUM },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
