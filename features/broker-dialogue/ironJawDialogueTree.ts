import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Iron Jaw — Mercenary Guild Recruiter.
 *
 * Game-specific NPC. Former Bonehowl enforcer; lost half his jaw to a
 * Verdant Coil beast and replaced it with Ironheart. Now runs guild
 * recruitment. Theme: a fighter who decided who fights next instead
 * of fighting himself.
 *
 * Arc:
 * - Stranger: blunt. Efficient. Judges by record.
 * - Acquainted (rapport ≥ 10): he admits the jaw was a choice, not an
 *   accident.
 * - Familiar (rapport ≥ 30): he tells you why he picked Ironheart
 *   over a regrown mandible.
 * - Trusted (rapport ≥ 50): he offers priority contract listings —
 *   the kind the guild doesn't post publicly. Unlock:
 *   `iron-jaw-priority-contracts`.
 */

export const IRON_JAW_UNLOCK_PRIORITY_CONTRACTS = "iron-jaw-priority-contracts";

export const ironJawDialogueTree: BrokerDialogueTree = {
  brokerId: "iron-jaw",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Iron Jaw is seated behind a table stacked with contract folders. The metal of his jaw catches the light.",
      speakerLine:
        "The contract doesn't care about your feelings. Neither do I. What's your record look like?",
      choices: [
        {
          id: "ask_jaw",
          text: '"Why Ironheart for the jaw?"',
          nextNodeId: "jaw_gate",
        },
        {
          id: "ask_contracts",
          text: '"What\'s on the board?"',
          nextNodeId: "board",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    board: {
      id: "board",
      speakerLine:
        "Hunts. Bounties. Extraction work. The public listings are fair. The non-public ones are fairer. You qualify for public. Come back when you don't.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    jaw_gate: {
      id: "jaw_gate",
      speakerLine:
        "Not a story for first meetings.",
      choices: [
        {
          id: "press_acquainted",
          text: '"I\'ve been back. Tell me."',
          nextNodeId: "jaw_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    jaw_acquainted: {
      id: "jaw_acquainted",
      flavor: "He leans back. The chair creaks. Iron Jaw does not move quietly.",
      speakerLine:
        "A Verdant Coil beast took half my mandible in the Fenrir cadre's third push. Field surgeon said I could grow it back — new cartilage, new bone, six months in a vat. I told him to fit an Ironheart instead. He thought I was delirious. I wasn't.",
      choices: [
        {
          id: "press_familiar",
          text: '"Why choose Ironheart?"',
          nextNodeId: "why_familiar",
          rapportGate: 30,
        },
        {
          id: "understand",
          text: "Nod. Move on.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 4 }],
        },
      ],
    },
    why_familiar: {
      id: "why_familiar",
      flavor: "He taps the metal, twice. It sounds exactly like what it is.",
      speakerLine:
        "Because a regrown jaw is still a jaw. Still a thing that can be chewed through. Ironheart is a promise — if a beast takes me again, it takes effort. And I wanted to stop fighting. You cannot stop fighting if the thing that makes you a fighter can be taken. So I made the thing harder to take. Then I sat down and started reading contracts instead.",
      choices: [
        {
          id: "honor",
          text: "Don't interrupt. Nod once.",
          nextNodeId: "priority_contracts_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    priority_contracts_offer: {
      id: "priority_contracts_offer",
      flavor: "He pulls a folder from the bottom of the stack. It's thicker than the others and bound in dark leather.",
      speakerLine:
        "Priority listings. Not for the board. Higher pay, higher expectation. I only hand them to people I've watched come back. I've watched you. You qualify.",
      choices: [
        {
          id: "accept",
          text: "Accept the priority contract line.",
          nextNodeId: "greet",
          effects: [
            {
              kind: "grant_unlock",
              unlockKey: IRON_JAW_UNLOCK_PRIORITY_CONTRACTS,
            },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
