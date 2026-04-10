import { describe, expect, it } from "vitest";

import {
  LOADOUT_FRAGILITIES,
  PRESSURE_FRAGILITY_INSTABILITY_NUDGE,
  getFragilityInstabilityNudge,
  isLoadoutFragileTo,
} from "@/features/loadout/loadoutPressureCompatibility";
import type { PressureIdentity } from "@/features/schools/schoolTypes";

describe("LOADOUT_FRAGILITIES table", () => {
  it("each loadout has exactly two fragility pressures", () => {
    expect(LOADOUT_FRAGILITIES.assault.size).toBe(2);
    expect(LOADOUT_FRAGILITIES.support.size).toBe(2);
    expect(LOADOUT_FRAGILITIES.breach.size).toBe(2);
  });

  it("assault is fragile to delay and exposure", () => {
    expect(LOADOUT_FRAGILITIES.assault.has("delay")).toBe(true);
    expect(LOADOUT_FRAGILITIES.assault.has("exposure")).toBe(true);
  });

  it("support is fragile to consumption and temptation", () => {
    expect(LOADOUT_FRAGILITIES.support.has("consumption")).toBe(true);
    expect(LOADOUT_FRAGILITIES.support.has("temptation")).toBe(true);
  });

  it("breach is fragile to hoarding and escalation", () => {
    expect(LOADOUT_FRAGILITIES.breach.has("hoarding")).toBe(true);
    expect(LOADOUT_FRAGILITIES.breach.has("escalation")).toBe(true);
  });

  it("comparison (envy/Olympus) is the neutral pressure no loadout is fragile to", () => {
    expect(LOADOUT_FRAGILITIES.assault.has("comparison")).toBe(false);
    expect(LOADOUT_FRAGILITIES.support.has("comparison")).toBe(false);
    expect(LOADOUT_FRAGILITIES.breach.has("comparison")).toBe(false);
  });

  it("the 6 fragilities cover all 7 pressures except comparison", () => {
    const all = new Set<PressureIdentity>();
    for (const set of Object.values(LOADOUT_FRAGILITIES)) {
      for (const pressure of set) {
        all.add(pressure);
      }
    }
    expect(all.size).toBe(6);
    expect(all.has("comparison")).toBe(false);
  });
});

describe("isLoadoutFragileTo", () => {
  it("true when the pressure is in the fragility set", () => {
    expect(isLoadoutFragileTo("assault", "delay")).toBe(true);
    expect(isLoadoutFragileTo("support", "temptation")).toBe(true);
    expect(isLoadoutFragileTo("breach", "hoarding")).toBe(true);
  });

  it("false otherwise", () => {
    expect(isLoadoutFragileTo("assault", "comparison")).toBe(false);
    expect(isLoadoutFragileTo("support", "delay")).toBe(false);
    expect(isLoadoutFragileTo("breach", "exposure")).toBe(false);
  });
});

describe("getFragilityInstabilityNudge", () => {
  it("returns the nudge value when the loadout is fragile to the pressure", () => {
    expect(getFragilityInstabilityNudge("assault", "delay")).toBe(
      PRESSURE_FRAGILITY_INSTABILITY_NUDGE,
    );
  });

  it("returns 0 when the loadout is NOT fragile to the pressure", () => {
    expect(getFragilityInstabilityNudge("assault", "comparison")).toBe(0);
  });

  it("returns 0 when pressure is null (no dominant zone school)", () => {
    expect(getFragilityInstabilityNudge("assault", null)).toBe(0);
  });

  it("nudge value is in a small positive band", () => {
    expect(PRESSURE_FRAGILITY_INSTABILITY_NUDGE).toBeGreaterThan(0);
    expect(PRESSURE_FRAGILITY_INSTABILITY_NUDGE).toBeLessThanOrEqual(10);
  });
});
