import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";

/**
 * Kessler-9 — Pharos Defector.
 *
 * Game-specific NPC. Fourth-tier frame architect who kept the Pharos
 * serial number as a name because she doesn't remember the one her
 * parents gave her. Theme: identity erasure under Pride-empire obsession
 * with aesthetic perfection.
 *
 * Arc:
 * - Stranger: clinical. Every sentence is a diagnostic report.
 * - Acquainted (rapport ≥ 10): she admits the number isn't a
 *   designation — it's her name, now.
 * - Familiar (rapport ≥ 30): she reveals what she kept.
 * - Trusted (rapport ≥ 50): she offers the precision-tuned calibration
 *   service, a deeper instability relief than the base diagnostic.
 *   Unlock: `kessler-precision-tuning`.
 */

export const KESSLER_UNLOCK_PRECISION_TUNING = "kessler-precision-tuning";

export const kessler9DialogueTree: BrokerDialogueTree = {
  brokerId: "kessler-9",
  rootNodeId: "greet",
  nodes: {
    greet: {
      id: "greet",
      flavor: "Kessler-9 is seated at a bench of salvaged servomotors. She does not look up immediately.",
      speakerLine:
        "Frame status: nominal. Approach purpose: specify.",
      choices: [
        {
          id: "ask_name",
          text: '"Kessler-9. Is that a real name?"',
          nextNodeId: "name_gate",
        },
        {
          id: "ask_work",
          text: '"What are you working on?"',
          nextNodeId: "work",
          effects: [{ kind: "rapport_delta", amount: 2 }],
        },
        {
          id: "leave",
          text: "Leave.",
          nextNodeId: null,
        },
      ],
    },
    work: {
      id: "work",
      speakerLine:
        "Ra-architecture compatibility diagnostics. Pharos serial 9 — mine. The frame remembers its maker.",
      choices: [
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    name_gate: {
      id: "name_gate",
      speakerLine:
        "Designation accurate. Further context requires prior engagement.",
      choices: [
        {
          id: "ask_name_acquainted",
          text: '"It\'s your name, isn\'t it?"',
          nextNodeId: "name_acquainted",
          rapportGate: 10,
        },
        {
          id: "back",
          text: "Back.",
          nextNodeId: "greet",
        },
      ],
    },
    name_acquainted: {
      id: "name_acquainted",
      flavor: "She stops working. Her hands rest on the bench. This is the only signal she gives.",
      speakerLine:
        "Affirmative. The previous one is not retrievable. Pride's aesthetic protocols erased the birth register for fourth-tier architects. My parents were fourth-tier. The serial remains.",
      choices: [
        {
          id: "press_familiar",
          text: '"What did you keep?"',
          nextNodeId: "kept_familiar",
          rapportGate: 30,
        },
        {
          id: "withdraw",
          text: '"I\'m sorry."',
          nextNodeId: "greet",
          effects: [{ kind: "rapport_delta", amount: 5 }],
        },
      ],
    },
    kept_familiar: {
      id: "kept_familiar",
      flavor: "She opens a panel on the bench. A small calibration tool, hand-built, not regulation.",
      speakerLine:
        "This. My mother's tuning fork. She worked on Ra-heart chassis before the purge. When I run a real diagnostic — not the one I sell to strangers — I use this. The frame sounds right when it's tuned correctly.",
      choices: [
        {
          id: "honor",
          text: "Don't interrupt.",
          nextNodeId: "precision_offer",
          effects: [{ kind: "rapport_delta", amount: 8 }],
        },
      ],
    },
    precision_offer: {
      id: "precision_offer",
      flavor: "She picks the tool up.",
      speakerLine:
        "Offer: precision tuning. Uses my mother's fork. Deeper instability reduction than the standard diagnostic. Requires trust. You have it.",
      choices: [
        {
          id: "accept",
          text: "Accept precision tuning.",
          nextNodeId: "greet",
          effects: [
            { kind: "grant_unlock", unlockKey: KESSLER_UNLOCK_PRECISION_TUNING },
            { kind: "rapport_delta", amount: 5 },
          ],
        },
      ],
    },
  },
};
