import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Sable — Velvet Den Influence Broker.
 *
 * Game-specific NPC. Former Astarte-Veil / Crimson Altar asset —
 * engineered as a pheromone-based social weapon before she decided to
 * weaponize herself on her own terms. Theme: consent and the long
 * game of turning a tool back on its makers.
 *
 * Arc:
 * - Stranger: she's magnetic. Two moves ahead in every conversation.
 * - Acquainted (rapport ≥ 10): she points out that you're probably
 *   already under some influence right now, and accepts it without
 *   moralizing.
 * - Familiar (rapport ≥ 30): she names the Astarte project she was
 *   conceived for and why she walked.
 * - Trusted (rapport ≥ 50): she offers a neural-bond catalyst —
 *   a real social leverage item. Unlock: `sable-bond-catalyst`.
 */

export const SABLE_UNLOCK_BOND_CATALYST = "sable-bond-catalyst";

export const sableDialogueTree: BrokerDialogueTree = {
  brokerId: "sable",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "The Velvet Den is thick with perfumed air. Sable doesn't move when you approach — she lets you move to her.",
      speakerLine:
        "Everyone in this room wants something from everyone else. I'm the only one who admits it. What do you want?",
      choices: [
        {
          id: "ask_trade",
          text: '"What do you trade in?"',
          nextNodeId: "pitch",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "push_back",
          text: '"I\'m not being influenced by you."',
          nextNodeId: "influence_gate",
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    pitch: {
      id: "pitch",
      speakerLine:
        "Leverage. Introductions. Neural-bond catalysts when the relationship is worth the chemistry. I don't trade in affection — I trade in alignment.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    influence_gate: {
      id: "influence_gate",
      speakerLine:
        "*small smile* You are, and the fact that you said it out loud means it's not working on you the way my makers designed it to. I like that.",
      choices: [
        {
          id: "press_acquainted",
          text: '"Your makers?"',
          nextNodeId: "makers_acquainted",
          rapportGate: 10,
        },
        {
          id: "accept",
          text: "Accept her read.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 3 }],
        },
      ],
    },
    makers_acquainted: {
      id: "makers_acquainted",
      flavor: "She reaches for a glass that doesn't seem to have been there a moment ago.",
      speakerLine:
        "Astarte-Veil. They designed me before I was born. I was a three-generation project — grandmother, mother, me. The goal was a perfect social operative. I decided to be imperfect on purpose.",
      choices: [
        {
          id: "press_familiar",
          text: '"Why did you walk?"',
          nextNodeId: "walk_familiar",
          rapportGate: 30,
        },
        {
          id: "compliment",
          text: '"You chose well."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 5 }],
        },
      ],
    },
    walk_familiar: {
      id: "walk_familiar",
      flavor: "She doesn't answer right away. The perfumed air seems to thin.",
      speakerLine:
        "The Veil wanted me to seduce a Crimson Altar heir into a political marriage. I spent six months with him. He was kind. He read books to his sister. I realized if I did the job, I would erase someone who deserved to be let alone. I walked with the catalysts. They can find someone else.",
      choices: [
        {
          id: "honor",
          text: "Say nothing. Hold her gaze.",
          nextNodeId: "catalyst_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    catalyst_offer: {
      id: "catalyst_offer",
      flavor: "She opens a small lacquered case. Inside: three vials. The middle one glows faintly.",
      speakerLine:
        "Neural-bond catalyst. For when you need someone to remember you the way you want to be remembered. Sparingly. With consent. I'll know if you don't.",
      choices: [
        {
          id: "accept",
          text: "Accept the catalyst line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: SABLE_UNLOCK_BOND_CATALYST },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
