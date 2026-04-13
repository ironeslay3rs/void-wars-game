import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Tomo Wrench — Mandate Salvage Specialist.
 *
 * Game-specific NPC. Former patience-engineer in the Mandate-Bureau's
 * automation division where projects took decades. He defected because
 * he wanted to finish something in his own lifetime. Theme: the value
 * of short time horizons, the joy of small repairs.
 *
 * Arc:
 * - Stranger: methodical, patient. Finds joy in small repairs.
 * - Acquainted (rapport ≥ 10): he explains why the Mandate's pace
 *   broke him.
 * - Familiar (rapport ≥ 30): he shows you what he's finished here
 *   that he never finished there.
 * - Trusted (rapport ≥ 50): he offers bespoke precision alloy — the
 *   kind that requires a relationship, not a transaction. Unlock:
 *   `tomo-bespoke-alloy`.
 */

export const TOMO_UNLOCK_BESPOKE_ALLOY = "tomo-bespoke-alloy";

export const tomoWrenchDialogueTree: BrokerDialogueTree = {
  brokerId: "tomo-wrench",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Tomo's bench is tidy. Tools laid out in rows. He doesn't look rushed, but every motion is efficient.",
      speakerLine:
        "Mandate engineering. Slow to arrive. Impossible to break. What are you bringing me?",
      choices: [
        {
          id: "ask_pace",
          text: '"Why did you leave the Mandate?"',
          nextNodeId: "pace_gate",
        },
        {
          id: "ask_wares",
          text: '"What do you sell?"',
          nextNodeId: "wares",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    wares: {
      id: "wares",
      speakerLine:
        "Alloy. Fittings. Small repairs. Prices are low. My pleasure comes from finishing things, not from pricing them.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    pace_gate: {
      id: "pace_gate",
      speakerLine:
        "Because the Mandate's pace is not mine. More context requires we have known each other longer than one meeting.",
      choices: [
        {
          id: "press_acquainted",
          text: '"I\'ve been back. Say more."',
          nextNodeId: "pace_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    pace_acquainted: {
      id: "pace_acquainted",
      flavor: "He sets down the wrench. Rests both hands on the bench. Methodical.",
      speakerLine:
        "Mandate projects take decades. My primary assignment — a single gear-train for a water-shrine automation — was scheduled to complete in forty-two years. I was the third engineer on it. The original had been dead for eleven years when I started. I could not bear the thought of being the dead engineer on someone else's project.",
      choices: [
        {
          id: "press_familiar",
          text: '"Show me what you\'ve finished here."',
          nextNodeId: "finished_familiar",
          rapportGate: 30,
        },
        {
          id: "understand",
          text: "Nod. Understood.",
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 4 }],
        },
      ],
    },
    finished_familiar: {
      id: "finished_familiar",
      flavor: "He opens a shallow drawer. Inside: small finished pieces. Each one gleams.",
      speakerLine:
        "Seventeen objects. Each started and finished by me, in full. A spoon. A door latch. A signal repeater. A bolt-threader for a shell I'll never own. Each one complete. The Mandate would call each one trivial. I call each one mine.",
      choices: [
        {
          id: "honor",
          text: "Admire them without speaking.",
          nextNodeId: "bespoke_alloy_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    bespoke_alloy_offer: {
      id: "bespoke_alloy_offer",
      flavor: "He closes the drawer. Then opens a different one — sealed, labeled with a personal sigil.",
      speakerLine:
        "Bespoke alloy. I draw and pour it one shell at a time. Not for browsers. For people I've seen come back. Your name is in my head now. Come collect.",
      choices: [
        {
          id: "accept",
          text: "Accept the bespoke alloy line.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: TOMO_UNLOCK_BESPOKE_ALLOY },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
