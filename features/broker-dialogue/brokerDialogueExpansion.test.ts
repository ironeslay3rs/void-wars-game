/**
 * V2 expansion coverage — 5 new brokers + the unlock-gated interaction
 * layer. Complements brokerDialogue.test.ts (V1 Lars base).
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
import { LARS_UNLOCK_PREMIUM } from "@/features/broker-dialogue/larsDialogueTree";
import { MAMA_SOL_UNLOCK_SECOND_BOWL } from "@/features/broker-dialogue/mamaSolDialogueTree";
import { GLASS_UNLOCK_DEEP_INTEL } from "@/features/broker-dialogue/glassDialogueTree";
import { KESSLER_UNLOCK_PRECISION_TUNING } from "@/features/broker-dialogue/kessler9DialogueTree";
import { HAZEL_UNLOCK_TRUE_FRAGMENT } from "@/features/broker-dialogue/hazelDialogueTree";
import { ASHVEIL_UNLOCK_PERSONAL_PIECE } from "@/features/broker-dialogue/ashveilDialogueTree";

const V2_BROKERS = [
  "discount-lars",
  "mama-sol",
  "glass",
  "kessler-9",
  "hazel",
  "ashveil",
] as const;

describe("V2 dialogue registry", () => {
  it("registers all 6 brokers", () => {
    for (const id of V2_BROKERS) {
      expect(hasBrokerDialogue(id)).toBe(true);
      expect(getBrokerDialogueTree(id)).not.toBeNull();
    }
  });

  it("The Warden and Nails stay silent (no tree by canon/character)", () => {
    expect(hasBrokerDialogue("the-warden")).toBe(false);
    expect(hasBrokerDialogue("nails")).toBe(false);
  });

  it("getAllBrokerDialogueTrees at least covers V2 set (expansion-safe)", () => {
    const all = getAllBrokerDialogueTrees();
    expect(all.length).toBeGreaterThanOrEqual(V2_BROKERS.length);
    const ids = new Set(all.map((t) => t.brokerId));
    for (const id of V2_BROKERS) {
      expect(ids.has(id)).toBe(true);
    }
  });
});

describe("Every V2 tree passes integrity checks", () => {
  it.each([...V2_BROKERS])("tree for %s is structurally valid", (id) => {
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
    ["discount-lars", LARS_UNLOCK_PREMIUM],
    ["mama-sol", MAMA_SOL_UNLOCK_SECOND_BOWL],
    ["glass", GLASS_UNLOCK_DEEP_INTEL],
    ["kessler-9", KESSLER_UNLOCK_PRECISION_TUNING],
    ["hazel", HAZEL_UNLOCK_TRUE_FRAGMENT],
    ["ashveil", ASHVEIL_UNLOCK_PERSONAL_PIECE],
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

describe("Unlock-gated BrokerInteraction layer", () => {
  it("getBrokerInteraction (legacy) returns the base offer, ignoring unlocks", () => {
    const base = getBrokerInteraction("discount-lars");
    expect(base).toBeDefined();
    expect(base?.requiresUnlock).toBeUndefined();
  });

  it("getBestUnlockedBrokerInteraction returns base when unlock not present", () => {
    const result = getBestUnlockedBrokerInteraction("discount-lars", []);
    expect(result?.actionLabel).toBe("Buy Lars's Special");
    expect(result?.requiresUnlock).toBeUndefined();
  });

  it("getBestUnlockedBrokerInteraction returns unlocked offer when key present", () => {
    const result = getBestUnlockedBrokerInteraction("discount-lars", [
      LARS_UNLOCK_PREMIUM,
    ]);
    expect(result?.actionLabel).toBe("Moon-Blessed Vial");
    expect(result?.requiresUnlock).toBe(LARS_UNLOCK_PREMIUM);
  });

  it.each([
    ["mama-sol", MAMA_SOL_UNLOCK_SECOND_BOWL, "Take the second bowl"],
    ["glass", GLASS_UNLOCK_DEEP_INTEL, "Deep intel line"],
    ["kessler-9", KESSLER_UNLOCK_PRECISION_TUNING, "Precision tuning"],
    ["hazel", HAZEL_UNLOCK_TRUE_FRAGMENT, "Buy the true fragment"],
    ["ashveil", ASHVEIL_UNLOCK_PERSONAL_PIECE, "Buy the personal piece"],
  ])(
    "%s unlock %s surfaces action label %s",
    (brokerId, unlockKey, expectedLabel) => {
      const result = getBestUnlockedBrokerInteraction(brokerId, [unlockKey]);
      expect(result?.actionLabel).toBe(expectedLabel);
      expect(result?.requiresUnlock).toBe(unlockKey);
    },
  );

  it("every unlocked offer has a higher cost than the matching base offer", () => {
    const pairs: Array<[string, string]> = [
      ["discount-lars", LARS_UNLOCK_PREMIUM],
      ["mama-sol", MAMA_SOL_UNLOCK_SECOND_BOWL],
      ["glass", GLASS_UNLOCK_DEEP_INTEL],
      ["kessler-9", KESSLER_UNLOCK_PRECISION_TUNING],
      ["hazel", HAZEL_UNLOCK_TRUE_FRAGMENT],
      ["ashveil", ASHVEIL_UNLOCK_PERSONAL_PIECE],
    ];
    for (const [brokerId, unlockKey] of pairs) {
      const base = getBestUnlockedBrokerInteraction(brokerId, []);
      const unlocked = getBestUnlockedBrokerInteraction(brokerId, [unlockKey]);
      expect(base).toBeDefined();
      expect(unlocked).toBeDefined();
      expect(unlocked!.cost).toBeGreaterThan(base!.cost);
    }
  });
});

describe("Hazel promoted to active (removed from PASSIVE_BROKER_IDS)", () => {
  it("hazel has a real interaction now", () => {
    expect(getBrokerInteraction("hazel")).toBeDefined();
  });

  it("hazel is no longer in PASSIVE_BROKER_IDS", () => {
    expect(PASSIVE_BROKER_IDS.has("hazel")).toBe(false);
  });
});
