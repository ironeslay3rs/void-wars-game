import { describe, expect, it } from "vitest";

import { CONTRACT_TEMPLATES } from "@/features/guild/contractRegistry";
import { recordContribution } from "@/features/guild/contributionLedger";
import {
  advanceRank,
  claimContract,
  completeContract,
  createGuild,
  expireContract,
  joinGuild,
  leaveGuild,
} from "@/features/guild/guildActions";
import type { Guild } from "@/features/guild/guildTypes";

function freshGuild(): Guild {
  return createGuild({
    id: "g1",
    name: "Ash Wardens",
    founder: { id: "m1", displayName: "Ryn", joinedAt: 100 },
  });
}

describe("createGuild", () => {
  it("sets founder member + probationary rank + default slots", () => {
    const g = freshGuild();
    expect(g.members).toHaveLength(1);
    expect(g.members[0].role).toBe("founder");
    expect(g.rank).toBe("probationary");
    expect(g.baseContractSlots).toBe(2);
    expect(g.totalContribution).toBe(0);
    expect(g.allegiance).toBe("black_city");
  });
});

describe("joinGuild", () => {
  it("adds a new member with role=initiate by default", () => {
    const g = freshGuild();
    const step = joinGuild(g, { id: "m2", displayName: "Vex", joinedAt: 200 });
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.members).toHaveLength(2);
    expect(step.guild.members[1].role).toBe("initiate");
  });

  it("rejects duplicate member id", () => {
    const g = freshGuild();
    const step = joinGuild(g, { id: "m1", displayName: "Ryn-dup", joinedAt: 300 });
    expect(step.outcome.ok).toBe(false);
    expect(step.guild.members).toHaveLength(1);
  });

  it("is pure — source guild unchanged", () => {
    const g = freshGuild();
    joinGuild(g, { id: "m2", displayName: "Vex", joinedAt: 200 });
    expect(g.members).toHaveLength(1);
  });
});

describe("leaveGuild", () => {
  it("removes the member", () => {
    const g = joinGuild(freshGuild(), { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
    const step = leaveGuild(g, "m2");
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.members.map((m) => m.id)).toEqual(["m1"]);
  });

  it("is idempotent — second leave fails cleanly, not crashing", () => {
    const g = joinGuild(freshGuild(), { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
    const once = leaveGuild(g, "m2");
    const twice = leaveGuild(once.guild, "m2");
    expect(twice.outcome.ok).toBe(false);
    expect(twice.guild.members).toHaveLength(1);
  });

  it("is pure — source guild unchanged", () => {
    const g = joinGuild(freshGuild(), { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
    leaveGuild(g, "m2");
    expect(g.members).toHaveLength(2);
  });
});

describe("claimContract", () => {
  const t0 = CONTRACT_TEMPLATES[0];
  const t1 = CONTRACT_TEMPLATES[1];
  const t2 = CONTRACT_TEMPLATES[2];

  it("adds an instantiated contract with stamped expiresAt", () => {
    const g = freshGuild();
    const step = claimContract(g, t0, 5_000);
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.contracts).toHaveLength(1);
    expect(step.guild.contracts[0].expiresAt).toBe(5_000 + t0.durationMs);
    expect(step.guild.contracts[0].status).toBe("active");
  });

  it("respects base slot cap (2) for probationary guild", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    g = claimContract(g, t1, 0).guild;
    const third = claimContract(g, t2, 0);
    expect(third.outcome.ok).toBe(false);
    if (!third.outcome.ok) expect(third.outcome.code).toBe("slots_full");
    expect(third.guild.contracts).toHaveLength(2);
  });

  it("rejects duplicate active contract of the same template", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    const step = claimContract(g, t0, 0);
    expect(step.outcome.ok).toBe(false);
  });

  it("is pure — source guild unchanged", () => {
    const g = freshGuild();
    claimContract(g, t0, 0);
    expect(g.contracts).toHaveLength(0);
  });
});

describe("completeContract", () => {
  const t0 = CONTRACT_TEMPLATES[0];

  it("rejects when progress below cap", () => {
    let g = freshGuild();
    g = joinGuild(g, { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
    g = claimContract(g, t0, 0).guild;
    g = recordContribution(g, "m1", t0.id, 5).guild;
    const step = completeContract(g, t0.id);
    expect(step.outcome.ok).toBe(false);
  });

  it("splits rewards by contribution share and marks completed", () => {
    let g = freshGuild();
    g = joinGuild(g, { id: "m2", displayName: "Vex", joinedAt: 200 }).guild;
    g = claimContract(g, t0, 0).guild;
    const half = Math.floor(t0.cap / 2);
    const rest = t0.cap - half;
    g = recordContribution(g, "m1", t0.id, half).guild;
    g = recordContribution(g, "m2", t0.id, rest).guild;
    const step = completeContract(g, t0.id);
    expect(step.outcome.ok).toBe(true);
    expect(step.reward).toBeDefined();
    expect(step.guild.contracts[0].status).toBe("completed");
    const credits0 = t0.reward.resources.credits ?? 0;
    // At probationary the multiplier is 1.
    expect(step.reward!.multiplierApplied).toBe(1);
    const m1Credits = step.reward!.perMember["m1"]?.credits ?? 0;
    const m2Credits = step.reward!.perMember["m2"]?.credits ?? 0;
    expect(m1Credits + m2Credits).toBeLessThanOrEqual(credits0);
    // m2 contributed more (or equal) so should get at least as many credits.
    expect(m2Credits).toBeGreaterThanOrEqual(m1Credits);
  });

  it("banks contributionGrant onto members' lifetime totals", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    g = recordContribution(g, "m1", t0.id, t0.cap).guild;
    const before = g.members[0].contribution;
    const step = completeContract(g, t0.id);
    const after = step.guild.members[0].contribution;
    expect(after).toBe(before + t0.reward.contributionGrant);
    expect(step.guild.totalContribution).toBe(
      g.totalContribution + t0.reward.contributionGrant,
    );
  });

  it("is pure — source guild unchanged", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    g = recordContribution(g, "m1", t0.id, t0.cap).guild;
    const snapshot = JSON.stringify(g);
    completeContract(g, t0.id);
    expect(JSON.stringify(g)).toBe(snapshot);
  });

  it("rejects unknown contract id", () => {
    const g = freshGuild();
    const step = completeContract(g, "nope");
    expect(step.outcome.ok).toBe(false);
  });
});

describe("advanceRank", () => {
  it("promotes when total contribution crosses threshold", () => {
    const g = freshGuild();
    g.totalContribution = 240;
    const step = advanceRank(g);
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.rank).toBe("bonded");
    expect(step.newRank).toBe("bonded");
  });

  it("does nothing when already at correct rank", () => {
    const g = freshGuild();
    const step = advanceRank(g);
    expect(step.outcome.ok).toBe(false);
    expect(step.guild.rank).toBe("probationary");
  });

  it("is pure — source guild unchanged when advancing", () => {
    const g = freshGuild();
    g.totalContribution = 900;
    const snapshot = JSON.stringify(g);
    advanceRank(g);
    expect(JSON.stringify(g)).toBe(snapshot);
  });
});

describe("expireContract", () => {
  const t0 = CONTRACT_TEMPLATES[0];

  it("marks contract expired when now >= expiresAt", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    const step = expireContract(g, t0.id, t0.durationMs + 1);
    expect(step.outcome.ok).toBe(true);
    expect(step.guild.contracts[0].status).toBe("expired");
  });

  it("rejects when contract still has time left", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    const step = expireContract(g, t0.id, 1);
    expect(step.outcome.ok).toBe(false);
    expect(step.guild.contracts[0].status).toBe("active");
  });

  it("rejects missing contract and non-active contract", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    expect(expireContract(g, "nope", 0).outcome.ok).toBe(false);
    g.contracts[0].status = "completed";
    expect(expireContract(g, t0.id, t0.durationMs + 1).outcome.ok).toBe(false);
  });

  it("is pure — source guild unchanged", () => {
    let g = freshGuild();
    g = claimContract(g, t0, 0).guild;
    const snapshot = JSON.stringify(g);
    expireContract(g, t0.id, t0.durationMs + 1);
    expect(JSON.stringify(g)).toBe(snapshot);
  });
});
