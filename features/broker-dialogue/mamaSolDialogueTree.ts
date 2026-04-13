import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Mama Sol — Feast Hall Matron.
 *
 * Canon parallel: "The Cook" from Evolution Puppy Vol.1 — unnamed food
 * stall operator in Lower Sector 9. Key canon line: "Survive. That's the
 * only currency I accept." Mama Sol is the game-side adaptation.
 *
 * Arc:
 * - Stranger: she serves you without questions. Warm. Immovable.
 * - Acquainted (rapport ≥ 10): she names the rule — survive, come back.
 * - Familiar (rapport ≥ 30): she reveals she keeps a log of who walks
 *   back in through her door.
 * - Trusted (rapport ≥ 50): she offers the "second bowl" — the
 *   canonical extended meal that restores more condition than the
 *   base meal. Unlock: `mama-sol-second-bowl`.
 */

export const MAMA_SOL_UNLOCK_SECOND_BOWL = "mama-sol-second-bowl";

export const mamaSolDialogueTree: BrokerDialogueTree = {
  brokerId: "mama-sol",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "The Feast Hall is warm. It shouldn't be — the building is half-scrap. But it is.",
      speakerLine:
        "Sit. Eat. You look like the wind carried you here.",
      choices: [
        {
          id: "ask_why_warm",
          text: '"Why is this place always warm?"',
          nextNodeId: "warm_answer",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "ask_rule",
          text: '"What\'s the rule here, Mama Sol?"',
          nextNodeId: "rule",
        },
        {
          id: "silent",
          text: "Sit down. Eat.",
          nextNodeId: null,
          effects: [{ kind: "rapport_delta", amount: 1 }],
        },
      ],
    },
    warm_answer: {
      id: "warm_answer",
      speakerLine:
        "Because people come in cold. I don't ask what they came from. I ask what they'll eat.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    rule: {
      id: "rule",
      speakerLine:
        "Survive. That's the only currency I accept. Come back through that door, we're square.",
      choices: [
        {
          id: "ack",
          text: '"Understood."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 4 }],
        },
        {
          id: "press_acquainted",
          text: '"You keep track?"',
          nextNodeId: "log_acquainted",
          rapportGate: 10,
        },
      ],
    },
    log_acquainted: {
      id: "log_acquainted",
      flavor: "She taps the counter twice. There's a worn notebook under her hand.",
      speakerLine:
        "Every face. Every return. I don't need the names. I need to know who keeps coming back.",
      choices: [
        {
          id: "why",
          text: '"Why?"',
          nextNodeId: "log_familiar",
          rapportGate: 30,
        },
        {
          id: "respect",
          text: "Nod. Don't press.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 3 }],
        },
      ],
    },
    log_familiar: {
      id: "log_familiar",
      flavor: "She looks at you for a long moment. The noise of the hall seems to step back.",
      speakerLine:
        "Because someone should remember who made it. The schools don't. The empires don't. I do.",
      choices: [
        {
          id: "honor",
          text: "Promise to come back.",
          nextNodeId: "second_bowl_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    second_bowl_offer: {
      id: "second_bowl_offer",
      flavor: "She pulls a second bowl from under the counter. Larger. Warmer. You hadn't seen it.",
      speakerLine:
        "Second bowl's for people who come back. Keep doing that. I'll keep serving it.",
      choices: [
        {
          id: "accept",
          text: "Accept the second bowl.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: MAMA_SOL_UNLOCK_SECOND_BOWL },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
