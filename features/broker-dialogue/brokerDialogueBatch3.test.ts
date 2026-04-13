/**
 * Batch 3 coverage — Sable, Old Ivory, Tomo Wrench, Iron Jaw.
 * Completes the 10-broker set (13 total; Warden + Nails + Root stay
 * outside by canon/character).
 */
import { describe, expect, it } from "vitest";
import {
  getAllBrokerDialogueTrees,
  getBrokerDialogueTree,
  hasBrokerDialogue,
} from "@/features/broker-dialogue/brokerDialogueData";
import {
  getBestUnlockedBrokerInteraction,
  getBrokerInteraction,
  PASSIVE_BROKER_IDS,
} from "@/features/lore/brokerInteractionData";
import { SABLE_UNLOCK_BOND_CATALYST } from "@/features/broker-dialogue/sableDialogueTree";
import { OLD_IVORY_UNLOCK_PRESTIGE_MARK } from "@/features/broker-dialogue/oldIvoryDialogueTree";
import { TOMO_UNLOCK_BESPOKE_ALLOY } from "@/features/broker-dialogue/tomoWrenchDialogueTree";
import { IRON_JAW_UNLOCK_PRIORITY_CONTRACTS } from "@/features/broker-dialogue/ironJawDialogueTree";

const BATCH3_BROKERS = [
  "sable",
  "old-ivory",
  "tomo-wrench",
  "iron-jaw",
] as const;

describe("Batch 3 dialogue registry", () => {
  it("registers all 4 new brokers", () => {
    for (const id of BATCH3_BROKERS) {
      expect(hasBrokerDialogue(id)).toBe(true);
      expect(getBrokerDialogueTree(id)).not.toBeNull();
    }
  });

  it("Warden, Nails, Root stay outside the dialogue system", () => {
    expect(hasBrokerDialogue("the-warden")).toBe(false);
    expect(hasBrokerDialogue("nails")).toBe(false);
    expect(hasBrokerDialogue("root")).toBe(false);
  });

  it("total registry size is now 10 brokers", () => {
    expect(getAllBrokerDialogueTrees().length).toBe(10);
  });
});

describe("Batch 3 tree integrity", () => {
  it.each([...BATCH3_BROKERS])("tree for %s is structurally valid", (id) => {
    const tree = getBrokerDialogueTree(id)!;
    expect(tree.nodes[tree.rootNodeId]).toBeDefined();
    for (const [key, node] of Object.entries(tree.nodes)) {
      expect(node.id).toBe(key);
      for (const choice of node.choices) {
        if (choice.nextNodeId !== null) {
          expect(tree.nodes[choice.nextNodeId]).toBeDefined();
        }
      }
    }
  });

  it.each([
    ["sable", SABLE_UNLOCK_BOND_CATALYST],
    ["old-ivory", OLD_IVORY_UNLOCK_PRESTIGE_MARK],
    ["tomo-wrench", TOMO_UNLOCK_BESPOKE_ALLOY],
    ["iron-jaw", IRON_JAW_UNLOCK_PRIORITY_CONTRACTS],
  ])("%s grants %s somewhere in the tree (but NOT on root)", (id, key) => {
    const tree = getBrokerDialogueTree(id)!;
    const rootGrants = tree.nodes[tree.rootNodeId].choices.some((c) =>
      (c.effects ?? []).some(
        (e) => e.kind === "grant_unlock" && e.unlockKey === key,
      ),
    );
    expect(rootGrants).toBe(false);

    const grantedSomewhere = Object.values(tree.nodes).some((n) =>
      n.choices.some((c) =>
        (c.effects ?? []).some(
          (e) => e.kind === "grant_unlock" && e.unlockKey === key,
        ),
      ),
    );
    expect(grantedSomewhere).toBe(true);
  });
});

describe("Batch 3 promoted to active (removed from PASSIVE_BROKER_IDS)", () => {
  it.each([...BATCH3_BROKERS])("%s has a base interaction", (id) => {
    expect(getBrokerInteraction(id)).toBeDefined();
  });

  it.each([...BATCH3_BROKERS])("%s is no longer passive", (id) => {
    expect(PASSIVE_BROKER_IDS.has(id)).toBe(false);
  });

  it("PASSIVE_BROKER_IDS is now only Root and Nails (terse/silent by design)", () => {
    expect(PASSIVE_BROKER_IDS.size).toBe(2);
    expect(PASSIVE_BROKER_IDS.has("root")).toBe(true);
    expect(PASSIVE_BROKER_IDS.has("nails")).toBe(true);
  });
});

describe("Batch 3 unlock-gated interactions", () => {
  it.each([
    ["sable", SABLE_UNLOCK_BOND_CATALYST, "Buy the bond catalyst"],
    ["old-ivory", OLD_IVORY_UNLOCK_PRESTIGE_MARK, "Buy the prestige mark"],
    ["tomo-wrench", TOMO_UNLOCK_BESPOKE_ALLOY, "Buy bespoke alloy"],
    [
      "iron-jaw",
      IRON_JAW_UNLOCK_PRIORITY_CONTRACTS,
      "Take a priority contract",
    ],
  ])("%s unlock %s surfaces label %s", (brokerId, key, label) => {
    const result = getBestUnlockedBrokerInteraction(brokerId, [key]);
    expect(result?.actionLabel).toBe(label);
    expect(result?.requiresUnlock).toBe(key);
  });

  it("unlocked tier costs strictly more than base for all 4", () => {
    const pairs: Array<[string, string]> = [
      ["sable", SABLE_UNLOCK_BOND_CATALYST],
      ["old-ivory", OLD_IVORY_UNLOCK_PRESTIGE_MARK],
      ["tomo-wrench", TOMO_UNLOCK_BESPOKE_ALLOY],
      ["iron-jaw", IRON_JAW_UNLOCK_PRIORITY_CONTRACTS],
    ];
    for (const [brokerId, key] of pairs) {
      const base = getBestUnlockedBrokerInteraction(brokerId, []);
      const unlocked = getBestUnlockedBrokerInteraction(brokerId, [key]);
      expect(base).toBeDefined();
      expect(unlocked).toBeDefined();
      expect(unlocked!.cost).toBeGreaterThan(base!.cost);
    }
  });
});
