import type { BrokerDialogueTree } from "@/features/broker-dialogue/brokerDialogueTypes";
import { larsDialogueTree } from "@/features/broker-dialogue/larsDialogueTree";
import { mamaSolDialogueTree } from "@/features/broker-dialogue/mamaSolDialogueTree";
import { glassDialogueTree } from "@/features/broker-dialogue/glassDialogueTree";
import { kessler9DialogueTree } from "@/features/broker-dialogue/kessler9DialogueTree";
import { hazelDialogueTree } from "@/features/broker-dialogue/hazelDialogueTree";
import { ashveilDialogueTree } from "@/features/broker-dialogue/ashveilDialogueTree";

/**
 * Registry of broker dialogue trees.
 *
 * V2 ships 6 brokers with branching dialogue: Discount Lars, Mama Sol,
 * Glass, Kessler-9, Hazel, Ashveil. Each has a 3-tier rapport arc
 * (Acquainted / Familiar / Trusted) that culminates in an unlock key
 * consumed by a deeper `BrokerInteraction` offer.
 *
 * The Warden (silent by canon) and Nails (terse by character) stay
 * outside the system — a design choice, not a missing slice.
 *
 * Adding more brokers is a data-only change — import the tree and slot
 * it into the registry.
 */
const REGISTRY: Record<string, BrokerDialogueTree> = {
  [larsDialogueTree.brokerId]: larsDialogueTree,
  [mamaSolDialogueTree.brokerId]: mamaSolDialogueTree,
  [glassDialogueTree.brokerId]: glassDialogueTree,
  [kessler9DialogueTree.brokerId]: kessler9DialogueTree,
  [hazelDialogueTree.brokerId]: hazelDialogueTree,
  [ashveilDialogueTree.brokerId]: ashveilDialogueTree,
};

export function getBrokerDialogueTree(brokerId: string): BrokerDialogueTree | null {
  return REGISTRY[brokerId] ?? null;
}

export function hasBrokerDialogue(brokerId: string): boolean {
  return brokerId in REGISTRY;
}

/** All registered dialogue trees — used by tests and devtools. */
export function getAllBrokerDialogueTrees(): BrokerDialogueTree[] {
  return Object.values(REGISTRY);
}
