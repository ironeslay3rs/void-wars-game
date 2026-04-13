import { describe, expect, it } from "vitest";

import { CONTRACT_TEMPLATES, instantiateContract } from "@/features/guild/contractRegistry";
import {
  cloneGuild,
  contractShare,
  leaderboard,
  recordContribution,
  totalForContract,
  totalForMember,
} from "@/features/guild/contributionLedger";
import { createGuild, joinGuild } from "@/features/guild/guildActions";
import type { Guild } from "@/features/guild/guildTypes";

function seedGuild(): Guild {
  const g0 = createGuild({
    id: "g1",
    name: "Ash Wardens",
    founder: { id: "m1", displayName: "Ryn", joinedAt: 100 },
  });
  const g1 = joinGuild(g0, { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
  const g2 = joinGuild(g1, { id: "m3", displayName: "Mara", joinedAt: 300 }).guild;
  const contract = instantiateContract(CONTRACT_TEMPLATES[0], 0);
  g2.contracts.push(contract);
  return g2;
}

describe("cloneGuild", () => {
  it("returns a deep-enough clone — mutating clone does not affect source", () => {
    const g = seedGuild();
    const c = cloneGuild(g);
    c.members[0].contribution = 999;
    c.contracts[0].progress = 77;
    c.contracts[0].perMember["m1"] = 50;
    expect(g.members[0].contribution).toBe(0);
    expect(g.contracts[0].progress).toBe(0);
    expect(g.contracts[0].perMember["m1"]).toBeUndefined();
  });
});

describe("recordContribution", () => {
  it("adds progress, member contribution, and guild total together", () => {
    const g = seedGuild();
    const step = recordContribution(g, "m1", g.contracts[0].id, 5);
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.contracts[0].progress).toBe(5);
    expect(step.guild.contracts[0].perMember["m1"]).toBe(5);
    expect(step.guild.members.find((m) => m.id === "m1")!.contribution).toBe(5);
    expect(step.guild.totalContribution).toBe(5);
  });

  it("is additive across multiple calls", () => {
    const g = seedGuild();
    const s1 = recordContribution(g, "m1", g.contracts[0].id, 3);
    const s2 = recordContribution(s1.guild, "m1", g.contracts[0].id, 4);
    expect(s2.guild.contracts[0].progress).toBe(7);
    expect(s2.guild.contracts[0].perMember["m1"]).toBe(7);
  });

  it("is immutable — source guild unchanged after recording", () => {
    const g = seedGuild();
    recordContribution(g, "m1", g.contracts[0].id, 10);
    expect(g.contracts[0].progress).toBe(0);
    expect(g.members[0].contribution).toBe(0);
    expect(g.totalContribution).toBe(0);
  });

  it("clamps amount to remaining cap", () => {
    const g = seedGuild();
    const cap = g.contracts[0].cap;
    const step = recordContribution(g, "m1", g.contracts[0].id, cap + 500);
    expect(step.guild.contracts[0].progress).toBe(cap);
    expect(step.guild.members[0].contribution).toBe(cap);
  });

  it("rejects unknown member / contract / negative amount / full contract", () => {
    const g = seedGuild();
    expect(recordContribution(g, "ghost", g.contracts[0].id, 5).outcome.ok).toBe(false);
    expect(recordContribution(g, "m1", "ghost", 5).outcome.ok).toBe(false);
    expect(recordContribution(g, "m1", g.contracts[0].id, 0).outcome.ok).toBe(false);
    expect(recordContribution(g, "m1", g.contracts[0].id, -1).outcome.ok).toBe(false);
    const full = recordContribution(g, "m1", g.contracts[0].id, g.contracts[0].cap).guild;
    expect(recordContribution(full, "m2", g.contracts[0].id, 5).outcome.ok).toBe(false);
  });

  it("rejects when contract status is not active", () => {
    const g = seedGuild();
    g.contracts[0].status = "completed";
    expect(recordContribution(g, "m1", g.contracts[0].id, 5).outcome.ok).toBe(false);
  });
});

describe("totalForMember / totalForContract", () => {
  it("returns 0 for missing member / contract", () => {
    const g = seedGuild();
    expect(totalForMember(g, "nope")).toBe(0);
    expect(totalForContract(g, "nope")).toBe(0);
  });

  it("tracks totals after contributions", () => {
    const g = seedGuild();
    const cid = g.contracts[0].id;
    const g1 = recordContribution(g, "m1", cid, 7).guild;
    const g2 = recordContribution(g1, "m2", cid, 3).guild;
    expect(totalForMember(g2, "m1")).toBe(7);
    expect(totalForMember(g2, "m2")).toBe(3);
    expect(totalForContract(g2, cid)).toBe(10);
  });
});

describe("leaderboard", () => {
  it("sorts descending by contribution", () => {
    const g = seedGuild();
    const cid = g.contracts[0].id;
    const a = recordContribution(g, "m1", cid, 5).guild;
    const b = recordContribution(a, "m2", cid, 15).guild;
    const c = recordContribution(b, "m3", cid, 10).guild;
    const rows = leaderboard(c);
    expect(rows.map((r) => r.memberId)).toEqual(["m2", "m3", "m1"]);
  });

  it("breaks contribution ties by joinedAt ascending (seniority wins)", () => {
    const g = seedGuild();
    const rows = leaderboard(g);
    expect(rows.map((r) => r.memberId)).toEqual(["m1", "m2", "m3"]);
  });
});

describe("contractShare", () => {
  it("returns 0 when contract missing or progress is zero", () => {
    const g = seedGuild();
    expect(contractShare(g, "nope", "m1")).toBe(0);
    expect(contractShare(g, g.contracts[0].id, "m1")).toBe(0);
  });

  it("weights share by proportion of progress", () => {
    const g = seedGuild();
    const cid = g.contracts[0].id;
    const g1 = recordContribution(g, "m1", cid, 6).guild;
    const g2 = recordContribution(g1, "m2", cid, 2).guild;
    expect(contractShare(g2, cid, "m1")).toBeCloseTo(0.75, 5);
    expect(contractShare(g2, cid, "m2")).toBeCloseTo(0.25, 5);
    expect(contractShare(g2, cid, "m3")).toBe(0);
  });
});
