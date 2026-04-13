import { describe, expect, it } from "vitest";
import {
  applyRapportDecay,
  RAPPORT_DECAY_GRACE_MS,
  RAPPORT_DECAY_PER_DAY,
} from "@/features/broker-dialogue/rapportDecay";

const ONE_DAY = 24 * 60 * 60 * 1000;
const NOW = 1_704_000_000_000;

describe("applyRapportDecay — pure math", () => {
  it("leaves rapport alone when within grace window", () => {
    const result = applyRapportDecay({
      rapport: { lars: 40 },
      lastContactAt: { lars: NOW - (RAPPORT_DECAY_GRACE_MS - ONE_DAY) },
      now: NOW,
    });
    expect(result.changed).toBe(false);
    expect(result.rapport.lars).toBe(40);
  });

  it("decays 1 per day once past grace", () => {
    const result = applyRapportDecay({
      rapport: { lars: 40 },
      lastContactAt: { lars: NOW - RAPPORT_DECAY_GRACE_MS - 3 * ONE_DAY },
      now: NOW,
    });
    expect(result.changed).toBe(true);
    expect(result.rapport.lars).toBe(40 - 3 * RAPPORT_DECAY_PER_DAY);
  });

  it("advances lastContactAt by consumed days so next tick doesn't re-decay", () => {
    const start = NOW - RAPPORT_DECAY_GRACE_MS - 3 * ONE_DAY;
    const first = applyRapportDecay({
      rapport: { lars: 40 },
      lastContactAt: { lars: start },
      now: NOW,
    });
    // Run again with the SAME now — should not decay further.
    const second = applyRapportDecay({
      rapport: first.rapport,
      lastContactAt: first.lastContactAt,
      now: NOW,
    });
    expect(second.changed).toBe(false);
    expect(second.rapport.lars).toBe(first.rapport.lars);
  });

  it("floors at 0, never negative", () => {
    const result = applyRapportDecay({
      rapport: { lars: 2 },
      lastContactAt: { lars: NOW - RAPPORT_DECAY_GRACE_MS - 30 * ONE_DAY },
      now: NOW,
    });
    expect(result.rapport.lars).toBe(0);
  });

  it("ignores brokers already at 0 rapport", () => {
    const result = applyRapportDecay({
      rapport: { lars: 0, glass: 20 },
      lastContactAt: {
        lars: 0,
        glass: NOW - RAPPORT_DECAY_GRACE_MS - 2 * ONE_DAY,
      },
      now: NOW,
    });
    expect(result.rapport.lars).toBe(0);
    expect(result.rapport.glass).toBe(20 - 2);
  });

  it("seeds missing lastContactAt to now so legacy saves don't runaway-decay", () => {
    const result = applyRapportDecay({
      rapport: { lars: 40 },
      lastContactAt: {}, // legacy save shape — no timestamp
      now: NOW,
    });
    expect(result.changed).toBe(true);
    // Rapport should NOT have decayed this tick (just seeded).
    expect(result.rapport.lars).toBe(40);
    expect(result.lastContactAt.lars).toBe(NOW);
  });

  it("is pure — returns new objects, does not mutate inputs", () => {
    const rapport = { lars: 10 };
    const lastContactAt = { lars: NOW - RAPPORT_DECAY_GRACE_MS - 3 * ONE_DAY };
    const input = { rapport, lastContactAt, now: NOW };
    const result = applyRapportDecay(input);
    expect(rapport.lars).toBe(10); // input untouched
    expect(lastContactAt.lars).toBe(
      NOW - RAPPORT_DECAY_GRACE_MS - 3 * ONE_DAY,
    );
    expect(result.rapport).not.toBe(rapport);
    expect(result.lastContactAt).not.toBe(lastContactAt);
  });

  it("handles multiple brokers in one pass", () => {
    const result = applyRapportDecay({
      rapport: { lars: 20, glass: 40, ashveil: 60 },
      lastContactAt: {
        lars: NOW - RAPPORT_DECAY_GRACE_MS - 5 * ONE_DAY,
        glass: NOW - ONE_DAY, // within grace
        ashveil: NOW - RAPPORT_DECAY_GRACE_MS - 2 * ONE_DAY,
      },
      now: NOW,
    });
    expect(result.changed).toBe(true);
    expect(result.rapport.lars).toBe(15);
    expect(result.rapport.glass).toBe(40);
    expect(result.rapport.ashveil).toBe(58);
  });
});
