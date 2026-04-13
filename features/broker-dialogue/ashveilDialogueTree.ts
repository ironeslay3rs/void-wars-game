import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Ashveil — Thousand Hands Relic Smuggler.
 *
 * Game-specific NPC. Former vault-keeper for Vishrava's spiritual hoard.
 * Guilt-ridden; treats every fragment like stolen heritage. Theme:
 * moral weight of the Greed-empire fall.
 *
 * Arc:
 * - Stranger: precise about provenance, careful with language.
 * - Acquainted (rapport ≥ 10): she names the vault she kept.
 * - Familiar (rapport ≥ 30): she reveals the rule she broke.
 * - Trusted (rapport ≥ 50): she offers to sell a piece she's never
 *   sold — something she kept for herself. Unlock:
 *   `ashveil-personal-piece`.
 */

export const ASHVEIL_UNLOCK_PERSONAL_PIECE = "ashveil-personal-piece";

export const ashveilDialogueTree: BrokerDialogueTree = {
  brokerId: "ashveil",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "The Golden Bazaar glitters; Ashveil's corner is the quietest part of it. Her pieces are wrapped individually.",
      speakerLine:
        "Every piece was stolen from someone who needed it more. Including this one. What are you looking for?",
      choices: [
        {
          id: "ask_vault",
          text: '"Which vault did you keep?"',
          nextNodeId: "vault_gate",
        },
        {
          id: "ask_browse",
          text: "Browse the wrapped pieces.",
          nextNodeId: "browse",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    browse: {
      id: "browse",
      speakerLine:
        "Thousand Hands resonance shards. Provenance is real. I won't lie about that. Prices are fair — which means high.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    vault_gate: {
      id: "vault_gate",
      speakerLine:
        "That is not a question I answer on first visits.",
      choices: [
        {
          id: "ask_acquainted",
          text: '"I\'ve been back. Which vault?"',
          nextNodeId: "vault_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    vault_acquainted: {
      id: "vault_acquainted",
      flavor: "She pauses with her hands on a wrapped fragment. She doesn't unwrap it.",
      speakerLine:
        "The Seventh Repository. Vishrava-Ledger owned the title but the Thousand Hands kept the actual artifacts. I sealed it every night. When Greed moved in, the Ledger sold the seals to the highest bidder. I walked out with as much as I could carry.",
      choices: [
        {
          id: "press_familiar",
          text: '"What rule did you break?"',
          nextNodeId: "rule_familiar",
          rapportGate: 30,
        },
        {
          id: "understand",
          text: '"Understood."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 5 }],
        },
      ],
    },
    rule_familiar: {
      id: "rule_familiar",
      flavor: "She looks at the wrapped fragment for a long moment before speaking.",
      speakerLine:
        "Vault-keepers don't carry. That's the rule. Our hands stay empty; the vault's hands stay full. I carried. Every piece I sell is proof that I broke the rule. I won't pretend I'm not the reason some of this is lost forever.",
      choices: [
        {
          id: "honor",
          text: "Say nothing. Let her finish.",
          nextNodeId: "personal_piece_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    personal_piece_offer: {
      id: "personal_piece_offer",
      flavor: "She reaches behind the counter and pulls out a piece wrapped in silk. Not ash-cloth. Silk.",
      speakerLine:
        "This one I haven't been able to sell. I've been waiting for the right hands. I don't know if yours are right. But you asked, and that counts.",
      choices: [
        {
          id: "accept",
          text: "Accept the personal piece line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: ASHVEIL_UNLOCK_PERSONAL_PIECE },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
