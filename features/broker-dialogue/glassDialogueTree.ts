import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Glass — Mirror House Intel Broker.
 *
 * Game-specific NPC. Former Olympus flesh-sculptor; now sells secrets
 * instead of faces. Signature line: "The mirrors don't reflect you. They
 * reflect who's watching you."
 *
 * Arc:
 * - Stranger: she's all surface. Cool. Observant.
 * - Acquainted (rapport ≥ 10): she drops a free observation about you —
 *   cold-read. A taste of what she does.
 * - Familiar (rapport ≥ 30): she admits what she fled from in Greece.
 * - Trusted (rapport ≥ 50): she offers the deep-intel line — better
 *   tips, longer horizon. Unlock: `glass-deep-intel`.
 */

export const GLASS_UNLOCK_DEEP_INTEL = "glass-deep-intel";

export const glassDialogueTree: BrokerDialogueTree = {
  brokerId: "glass",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "The Mirror House is exactly what it claims — surfaces, reflections, no clear line of sight to Glass herself until she decides.",
      speakerLine:
        "The mirrors don't reflect you. They reflect who's watching you. What did you come here to learn?",
      choices: [
        {
          id: "what_do_you_sell",
          text: '"What do you actually sell?"',
          nextNodeId: "pitch",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "ask_read",
          text: '"Read me. Free sample."',
          nextNodeId: "cold_read_gate",
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
        "Observations. Patterns. Who bought what, from whom, and who asked about it after. The schools and empires don't connect their data. I do. That's the margin.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    cold_read_gate: {
      id: "cold_read_gate",
      speakerLine:
        "*a slight smile* Free samples build trust, and trust is my inventory. Come back when we've talked more.",
      choices: [
        {
          id: "acquainted_read",
          text: "Wait for the read.",
          nextNodeId: "cold_read_acquainted",
          rapportGate: 10,
        },
        {
          id: "leave",
          text: "Accept. Leave.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
      ],
    },
    cold_read_acquainted: {
      id: "cold_read_acquainted",
      flavor: "She looks at you for exactly three seconds. Not longer.",
      speakerLine:
        "You walked in fast and looked at the exit before you looked at me. You've been burned. Not fatal — recently. You trust cadence over promises. Am I close?",
      choices: [
        {
          id: "ask_why_fled",
          text: '"Why did you leave Greece?"',
          nextNodeId: "greece_familiar",
          rapportGate: 30,
        },
        {
          id: "impressed",
          text: '"Close."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 4 }],
        },
      ],
    },
    greece_familiar: {
      id: "greece_familiar",
      flavor: "For the first time since you walked in, she looks at a mirror and not at you.",
      speakerLine:
        "Olympus-Concord ran a contest. Envy in marble. The judges were the patrons who paid to be sculpted into their rivals' faces. Three of my clients killed each other in the gallery. I took my tools and left. Faces heal. Secrets don't.",
      choices: [
        {
          id: "understand",
          text: "Don't press further.",
          nextNodeId: "deep_intel_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    deep_intel_offer: {
      id: "deep_intel_offer",
      flavor: "She reaches under the counter. A second ledger. This one is ash-bound.",
      speakerLine:
        "Different tier of intel. Longer horizon, sharper edge. Not for browsers. For people who understand what secrets cost.",
      choices: [
        {
          id: "accept",
          text: "Accept the deep intel line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: GLASS_UNLOCK_DEEP_INTEL },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
