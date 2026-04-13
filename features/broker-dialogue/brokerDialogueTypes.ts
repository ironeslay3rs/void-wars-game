import type { ResourceKey } from "@/features/game/gameTypes";

/**
 * Broker dialogue — Block 2 kickoff. Each broker that has depth beyond
 * the one-shot `BrokerInteraction` transaction exposes a `BrokerDialogueTree`.
 *
 * Design:
 * - Trees are pure data. No code lives in the tree; consequences are
 *   declarative effects the reducer handles.
 * - Rapport is per-broker (0-100). Gates unlock deeper offers or lines.
 * - Unlocks are named keys kept on the player (`brokerDialogueUnlocks`)
 *   so a new interaction offer can check `unlocks.includes("premium")`.
 *
 * V1 ships one broker (Discount Lars). The shape is designed so adding
 * the remaining 12 brokers is data, not code.
 */

export type BrokerDialogueEffect =
  | { kind: "rapport_delta"; amount: number }
  | { kind: "grant_unlock"; unlockKey: string }
  | { kind: "grant_resource"; resourceKey: ResourceKey; amount: number }
  | { kind: "spend_resource"; resourceKey: ResourceKey; amount: number };

export type BrokerDialogueChoice = {
  id: string;
  text: string;
  nextNodeId: string | null;
  effects?: BrokerDialogueEffect[];
  /** Optional rapport gate — choice is hidden until rapport ≥ amount. */
  rapportGate?: number;
  /** Optional unlock gate — requires an unlock key to appear. */
  requiresUnlock?: string;
};

export type BrokerDialogueNode = {
  id: string;
  speakerLine: string;
  /** Flavor line above the speaker — internal monologue or description. */
  flavor?: string;
  choices: BrokerDialogueChoice[];
};

export type BrokerDialogueTree = {
  brokerId: string;
  rootNodeId: string;
  nodes: Record<string, BrokerDialogueNode>;
};

/** Rapport bands for UI display. */
export function getRapportBand(rapport: number): {
  label: string;
  hint: string;
} {
  if (rapport >= 60) return { label: "Trusted", hint: "They save their best stock for you." };
  if (rapport >= 30) return { label: "Familiar", hint: "They remember your face." };
  if (rapport >= 10) return { label: "Acquainted", hint: "You've done enough business to register." };
  return { label: "Stranger", hint: "Just another Black Market face." };
}
