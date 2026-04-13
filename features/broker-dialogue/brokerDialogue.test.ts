import { describe, expect, it } from "vitest";
import { gameReducer } from "@/features/game/gameActions";
import { initialGameState } from "@/features/game/initialGameState";
import {
  getBrokerDialogueTree,
  hasBrokerDialogue,
} from "@/features/broker-dialogue/brokerDialogueData";
import {
  LARS_UNLOCK_PREMIUM,
  larsDialogueTree,
} from "@/features/broker-dialogue/larsDialogueTree";
import { getRapportBand } from "@/features/broker-dialogue/brokerDialogueTypes";

describe("broker dialogue registry", () => {
  it("has Lars registered", () => {
    expect(hasBrokerDialogue("discount-lars")).toBe(true);
    expect(getBrokerDialogueTree("discount-lars")).toBe(larsDialogueTree);
  });

  it("returns null for unknown broker", () => {
    expect(getBrokerDialogueTree("nobody")).toBeNull();
  });
});

describe("Lars dialogue tree integrity", () => {
  it("root node exists in nodes map", () => {
    expect(larsDialogueTree.nodes[larsDialogueTree.rootNodeId]).toBeDefined();
  });

  it("every non-null nextNodeId resolves to an actual node", () => {
    for (const node of Object.values(larsDialogueTree.nodes)) {
      for (const choice of node.choices) {
        if (choice.nextNodeId !== null) {
          expect(larsDialogueTree.nodes[choice.nextNodeId]).toBeDefined();
        }
      }
    }
  });

  it("node id field matches map key", () => {
    for (const [key, node] of Object.entries(larsDialogueTree.nodes)) {
      expect(node.id).toBe(key);
    }
  });

  it("unlock is gated behind a rapport path (not on root)", () => {
    const root = larsDialogueTree.nodes[larsDialogueTree.rootNodeId];
    const rootGrantsUnlock = root.choices.some((c) =>
      (c.effects ?? []).some(
        (e) => e.kind === "grant_unlock" && e.unlockKey === LARS_UNLOCK_PREMIUM,
      ),
    );
    expect(rootGrantsUnlock).toBe(false);
  });
});

describe("ADJUST_BROKER_RAPPORT reducer", () => {
  it("initializes missing broker to 0 then applies delta", () => {
    const next = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "discount-lars", delta: 5 },
    });
    expect(next.player.brokerRapport["discount-lars"]).toBe(5);
  });

  it("clamps to [0, 100]", () => {
    const high = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "x", delta: 200 },
    });
    expect(high.player.brokerRapport["x"]).toBe(100);

    const low = gameReducer(high, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "x", delta: -500 },
    });
    expect(low.player.brokerRapport["x"]).toBe(0);
  });

  it("zero delta leaves rapport untouched", () => {
    const next = gameReducer(initialGameState, {
      type: "ADJUST_BROKER_RAPPORT",
      payload: { brokerId: "x", delta: 0 },
    });
    expect(next.player.brokerRapport).toEqual(
      initialGameState.player.brokerRapport,
    );
  });
});

describe("GRANT_BROKER_DIALOGUE_UNLOCK reducer", () => {
  it("adds unlock key to the broker's set", () => {
    const next = gameReducer(initialGameState, {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK",
      payload: { brokerId: "discount-lars", unlockKey: LARS_UNLOCK_PREMIUM },
    });
    expect(next.player.brokerDialogueUnlocks["discount-lars"]).toContain(
      LARS_UNLOCK_PREMIUM,
    );
  });

  it("is idempotent — granting twice does not duplicate", () => {
    const once = gameReducer(initialGameState, {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK",
      payload: { brokerId: "b", unlockKey: "k" },
    });
    const twice = gameReducer(once, {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK",
      payload: { brokerId: "b", unlockKey: "k" },
    });
    expect(twice.player.brokerDialogueUnlocks["b"]).toEqual(["k"]);
    expect(twice.player.brokerDialogueUnlocks).toEqual(
      once.player.brokerDialogueUnlocks,
    );
  });

  it("preserves existing unlocks when adding a new one", () => {
    const first = gameReducer(initialGameState, {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK",
      payload: { brokerId: "b", unlockKey: "k1" },
    });
    const second = gameReducer(first, {
      type: "GRANT_BROKER_DIALOGUE_UNLOCK",
      payload: { brokerId: "b", unlockKey: "k2" },
    });
    expect(second.player.brokerDialogueUnlocks["b"]).toEqual(["k1", "k2"]);
  });
});

describe("getRapportBand", () => {
  it("maps rapport to canonical bands", () => {
    expect(getRapportBand(0).label).toBe("Stranger");
    expect(getRapportBand(9).label).toBe("Stranger");
    expect(getRapportBand(10).label).toBe("Acquainted");
    expect(getRapportBand(29).label).toBe("Acquainted");
    expect(getRapportBand(30).label).toBe("Familiar");
    expect(getRapportBand(59).label).toBe("Familiar");
    expect(getRapportBand(60).label).toBe("Trusted");
    expect(getRapportBand(100).label).toBe("Trusted");
  });
});
