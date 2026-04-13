import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";
import { larsDialogueTree } from "@/features/broker-dialogue/larsDialogueTree";

/**
 * Registry of broker dialogue trees. V1 ships one broker (Discount Lars).
 * Adding more brokers is a data-only change — import the tree and slot it
 * into the registry.
 */
const REGISTRY: Record<string, BrokerDialogueTree> = {
  [larsDialogueTree.brokerId]: larsDialogueTree,
};

export function getBrokerDialogueTree(brokerId: string): BrokerDialogueTree | null {
  return REGISTRY[brokerId] ?? null;
}

export function hasBrokerDialogue(brokerId: string): boolean {
  return brokerId in REGISTRY;
}
