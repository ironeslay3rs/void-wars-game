import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Hazel — Memory Ash Dealer.
 *
 * Game-specific NPC. Absorbed too many fragmented souls during a Mouth
 * of Inti excavation; speaks in half-finished sentences because three
 * other people's memories interrupt her own. Theme: memory theft, the
 * cost of the Inti-aligned Pure path.
 *
 * Arc:
 * - Stranger: she's scattered. Sentences don't finish.
 * - Acquainted (rapport ≥ 10): she names one of the voices.
 * - Familiar (rapport ≥ 30): she admits she *chose* not to purge them.
 * - Trusted (rapport ≥ 50): she offers a memory-true relic at cost.
 *   Unlock: `hazel-true-fragment`.
 */

export const HAZEL_UNLOCK_TRUE_FRAGMENT = "hazel-true-fragment";

export const hazelDialogueTree: BrokerDialogueTree = {
  brokerId: "hazel",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Hazel's stall is stacked with rune-dust in labeled vials. She finishes other people's sentences under her breath.",
      speakerLine:
        "The rune-smith who made this… she was… the fire was…",
      choices: [
        {
          id: "wait",
          text: "Wait for her to finish.",
          nextNodeId: "finish_trails_off",
          effects: [{ kind: "rapport_delta", amount: 3 }],
        },
        {
          id: "prompt",
          text: '"Hazel. Focus."',
          nextNodeId: "focus",
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    finish_trails_off: {
      id: "finish_trails_off",
      flavor: "She doesn't finish. She smiles, apologetically.",
      speakerLine:
        "Sorry. Three of them were talking. The one who made this vial is the quietest. I only catch pieces.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    focus: {
      id: "focus",
      speakerLine:
        "Focus. Yes. I try. The others… don't. *she laughs, short* What did you need?",
      choices: [
        {
          id: "ask_voices_gate",
          text: '"Who are the others?"',
          nextNodeId: "voices_gate",
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 1 }],
        },
      ],
    },
    voices_gate: {
      id: "voices_gate",
      speakerLine:
        "People I… met. At a dig. Not dead. Not alive either. Finishing — requires knowing each other longer than we've known each other.",
      choices: [
        {
          id: "press_acquainted",
          text: '"Name one."',
          nextNodeId: "voice_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    voice_acquainted: {
      id: "voice_acquainted",
      flavor: "Her eyes focus somewhere that isn't the stall.",
      speakerLine:
        "Mayari. She was the fire-keeper at the dig. She's the one who keeps finishing my sentences about sunlight. She didn't make it out. Three of us did. Seven didn't.",
      choices: [
        {
          id: "press_familiar",
          text: '"Why didn\'t you purge them?"',
          nextNodeId: "chose_familiar",
          rapportGate: 30,
        },
        {
          id: "listen",
          text: "Don't press further.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 5 }],
        },
      ],
    },
    chose_familiar: {
      id: "chose_familiar",
      flavor: "She looks at you directly. Possibly the most direct thing about her.",
      speakerLine:
        "I chose. The Inti rites could've cleared them out. I would've been — sharper. Cleaner. Alone. Seven people wouldn't remember sunlight anymore. I decided I'd carry them. The scattered is the cost.",
      choices: [
        {
          id: "honor",
          text: "Say nothing. Nod.",
          nextNodeId: "true_fragment_offer",
          effects: [{ kind: "rapport_delta", amount: 10 }],
        },
      ],
    },
    true_fragment_offer: {
      id: "true_fragment_offer",
      flavor: "She pulls a single vial from under a stack. The label is handwritten, not printed.",
      speakerLine:
        "Memory-true fragment. From my dig. I don't sell these. Today I do. You pay what it's worth. Not what the market says.",
      choices: [
        {
          id: "accept",
          text: "Accept the true fragment line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: HAZEL_UNLOCK_TRUE_FRAGMENT },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
