import { describe, expect, it } from "vitest";

import {
  CONTRACT_TEMPLATES,
  getContractTemplate,
  instantiateContract,
  listContractTemplates,
} from "@/features/guild/contractRegistry";

describe("CONTRACT_TEMPLATES", () => {
  it("ships exactly 8 seeded templates", () => {
    expect(CONTRACT_TEMPLATES).toHaveLength(8);
  });

  it("has unique template ids", () => {
    const ids = CONTRACT_TEMPLATES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has title, flavor, objective, reward, cap, durationMs", () => {
    for (const t of CONTRACT_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.flavor).toBeTruthy();
      expect(t.objective).toBeDefined();
      expect(t.objective.kind).toBeTruthy();
      expect(t.reward).toBeDefined();
      expect(t.reward.contributionGrant).toBeGreaterThan(0);
      expect(Object.keys(t.reward.resources).length).toBeGreaterThan(0);
      expect(t.cap).toBeGreaterThan(0);
      expect(t.durationMs).toBeGreaterThan(0);
    }
  });

  it("covers every ContractObjective kind across the 8 templates", () => {
    const kinds = new Set(CONTRACT_TEMPLATES.map((t) => t.objective.kind));
    expect(kinds.has("hunt_zone_theme")).toBe(true);
    expect(kinds.has("craft_items")).toBe(true);
    expect(kinds.has("collect_material")).toBe(true);
    expect(kinds.has("clear_hollowfang")).toBe(true);
    expect(kinds.has("boss_kills")).toBe(true);
  });

  it("uses canon 'Pure' voice — no 'Spirit' anywhere in flavor or titles", () => {
    for (const t of CONTRACT_TEMPLATES) {
      expect(t.title.toLowerCase()).not.toContain("spirit");
      expect(t.flavor.toLowerCase()).not.toContain("spirit");
    }
  });
});

describe("getContractTemplate", () => {
  it("returns a known template by id", () => {
    const t = getContractTemplate("ctr-ashline-sweep");
    expect(t).toBeDefined();
    expect(t?.title).toBe("Ashline Sweep");
  });

  it("returns undefined for missing id", () => {
    expect(getContractTemplate("nope")).toBeUndefined();
  });
});

describe("listContractTemplates", () => {
  it("returns a copy (not the same array reference)", () => {
    const list = listContractTemplates();
    expect(list).not.toBe(CONTRACT_TEMPLATES);
    expect(list).toHaveLength(CONTRACT_TEMPLATES.length);
  });

  it("mutating the returned list does not mutate the registry", () => {
    const list = listContractTemplates();
    list.pop();
    expect(CONTRACT_TEMPLATES).toHaveLength(8);
  });
});

describe("instantiateContract", () => {
  const template = CONTRACT_TEMPLATES[0];

  it("stamps expiresAt = now + durationMs", () => {
    const now = 1_000_000;
    const c = instantiateContract(template, now);
    expect(c.expiresAt).toBe(now + template.durationMs);
  });

  it("starts with progress=0, empty perMember, status=active", () => {
    const c = instantiateContract(template, 0);
    expect(c.progress).toBe(0);
    expect(c.perMember).toEqual({});
    expect(c.status).toBe("active");
  });

  it("carries cap, reward, objective forward intact", () => {
    const c = instantiateContract(template, 0);
    expect(c.cap).toBe(template.cap);
    expect(c.reward.contributionGrant).toBe(template.reward.contributionGrant);
    expect(c.reward.resources).toEqual(template.reward.resources);
    expect(c.objective).toEqual(template.objective);
  });

  it("clones reward.resources so mutations don't leak into the template", () => {
    const c = instantiateContract(template, 0);
    c.reward.resources.credits = 99999;
    const c2 = instantiateContract(template, 0);
    expect(c2.reward.resources.credits).toBe(template.reward.resources.credits);
  });

  it("uses template.id as contract id (deterministic — no randomness)", () => {
    const c1 = instantiateContract(template, 0);
    const c2 = instantiateContract(template, 1);
    expect(c1.id).toBe(template.id);
    expect(c2.id).toBe(template.id);
  });
});
