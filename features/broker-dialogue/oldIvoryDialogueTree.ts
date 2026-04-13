import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Old Ivory — Ivory Tower Prestige Dealer.
 *
 * Game-specific NPC. Former Pharos aesthetician who built beauty into
 * war machines; now sells prestige and impression in the Black Market.
 * Theme: the value of surface vs substance — and his own slow
 * reckoning with which one he actually sold.
 *
 * Arc:
 * - Stranger: elegant, performative, believes beauty is power.
 * - Acquainted (rapport ≥ 10): he admits prestige is easier to sell
 *   than the real thing.
 * - Familiar (rapport ≥ 30): he tells you about the last war machine
 *   he finished before he walked out.
 * - Trusted (rapport ≥ 50): he offers a Prestige Mark — a real
 *   influence-grant tier, not the decorative kind. Unlock:
 *   `old-ivory-prestige-mark`.
 */

export const OLD_IVORY_UNLOCK_PRESTIGE_MARK = "old-ivory-prestige-mark";

export const oldIvoryDialogueTree: BrokerDialogueTree = {
  brokerId: "old-ivory",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Old Ivory stands behind a display of polished insignia. Everything he touches looks valuable.",
      speakerLine:
        "The Pharos built divine machines. I build divine impressions. The effect is the same, friend. The effect is the same.",
      choices: [
        {
          id: "ask_effect",
          text: '"Is the effect really the same?"',
          nextNodeId: "effect_gate",
        },
        {
          id: "browse",
          text: "Look at the insignia.",
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
        "Pharos minor marks. Genuine provenance. Worn by fourth-tier officers; the patina sells itself.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    effect_gate: {
      id: "effect_gate",
      speakerLine:
        "*a small, elegant pause* The effect is the same when the audience is the same. Let's establish that first.",
      choices: [
        {
          id: "press_acquainted",
          text: '"What if the audience knows?"',
          nextNodeId: "audience_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    audience_acquainted: {
      id: "audience_acquainted",
      flavor: "He sets the polishing cloth down. This is unusual for him.",
      speakerLine:
        "Then the effect is different. Better, actually — the knowing ones pay more for the performance because the performance is honest. The tourists pay for the surface. The connoisseurs pay for the wink.",
      choices: [
        {
          id: "press_familiar",
          text: '"What was the last machine you finished?"',
          nextNodeId: "last_machine_familiar",
          rapportGate: 30,
        },
        {
          id: "respect",
          text: '"Fair."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 4 }],
        },
      ],
    },
    last_machine_familiar: {
      id: "last_machine_familiar",
      flavor: "He looks past you, at something the room doesn't contain.",
      speakerLine:
        "A personal shell for Ra-architect Nefret. I spent eleven months on the inlays. She wore it to three battles. She came back from the third in six pieces and every piece was still beautiful. That was the day I decided beauty without function is a lie I had been telling for profit. I came here to tell a more honest lie.",
      choices: [
        {
          id: "honor",
          text: "Don't speak. Let the line stand.",
          nextNodeId: "prestige_mark_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    prestige_mark_offer: {
      id: "prestige_mark_offer",
      flavor: "He reaches into a drawer and pulls out a real mark — not one of the display pieces.",
      speakerLine:
        "This one is a functional prestige mark. People who see it pay attention the next time they see you. The effect is real because the mark is real. Wear it. Earn the attention it brings.",
      choices: [
        {
          id: "accept",
          text: "Accept the prestige mark line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: OLD_IVORY_UNLOCK_PRESTIGE_MARK },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
