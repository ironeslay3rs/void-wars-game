import type { PlayerState } from "@/features/game/gameTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";
import type {
  GuildMember,
  GuildPledge,
  GuildRosterState,
  LocalGuildRivalSnapshot,
  SharedGuildContract,
} from "@/features/social/guildLiveTypes";

const SAFE_NAME_MAX = 24;
const MAX_MEMBERS = 24;
const MAX_CONTRACTS = 6;

export const GUILD_CONTRACT_TEMPLATES: Array<{
  id: string;
  zoneId: VoidZoneId;
  title: string;
  description: string;
  targetContributionDelta: number;
  reward: SharedGuildContract["reward"];
}> = [
  {
    id: "scar-purge",
    zoneId: "howling-scar",
    title: "Purge the Scar Line",
    description:
      "Keep the trench mouth clear. Record strike contributions and route salvage to the guild pool.",
    targetContributionDelta: 40,
    reward: { credits: 60, bioSamples: 4, runeDust: 2 },
  },
  {
    id: "relay-salvage",
    zoneId: "ash-relay",
    title: "Relay Salvage Sweep",
    description:
      "Strip relay corridors, tag usable plates, and push alloy to the collective.",
    targetContributionDelta: 55,
    reward: { credits: 70, scrapAlloy: 8, runeDust: 2 },
  },
  {
    id: "ruins-echo",
    zoneId: "echo-ruins",
    title: "Echo Capture Run",
    description:
      "Contain memory flare and bring back stabilised residue before rivals bottle it.",
    targetContributionDelta: 55,
    reward: { credits: 60, emberCore: 1, runeDust: 6 },
  },
  {
    id: "maw-pressure",
    zoneId: "rift-maw",
    title: "Hold Rift Pressure",
    description:
      "Boss-adjacent work. Maintain pressure so the guild doesn’t lose its corridor claims.",
    targetContributionDelta: 75,
    reward: { credits: 85, runeDust: 8, emberCore: 1 },
  },
];

export function initialGuildRoster(): GuildRosterState {
  return { kind: "none" };
}

function safeName(input: string): string {
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 0) return "Unnamed";
  return trimmed.slice(0, SAFE_NAME_MAX);
}

function makeId(prefix: string) {
  const n = Math.floor(Math.random() * 1_000_000);
  return `${prefix}-${Date.now()}-${n}`;
}

export function normalizeGuildRoster(raw: unknown): GuildRosterState {
  if (!raw || typeof raw !== "object") return initialGuildRoster();
  const o = raw as Record<string, unknown>;
  if (o.kind !== "inGuild") return initialGuildRoster();
  if (
    typeof o.guildId !== "string" ||
    typeof o.guildCode !== "string" ||
    typeof o.guildName !== "string"
  ) {
    return initialGuildRoster();
  }

  const pledge: GuildPledge =
    o.pledge === "bio" ||
    o.pledge === "mecha" ||
    o.pledge === "pure" ||
    o.pledge === "unbound"
      ? o.pledge
      : "unbound";

  const membersRaw = Array.isArray(o.members) ? o.members : [];
  const members: GuildMember[] = membersRaw
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const mm = m as Record<string, unknown>;
      if (typeof mm.id !== "string" || typeof mm.callsign !== "string") return null;
      const role =
        mm.role === "Founder" || mm.role === "Officer" || mm.role === "Member"
          ? mm.role
          : "Member";
      const joinedAt =
        typeof mm.joinedAt === "number" && Number.isFinite(mm.joinedAt)
          ? mm.joinedAt
          : Date.now();
      return { id: mm.id, callsign: mm.callsign, role, joinedAt } as GuildMember;
    })
    .filter((x): x is GuildMember => x !== null)
    .slice(0, MAX_MEMBERS);

  const ensuredMembers =
    members.length > 0
      ? members
      : ([
          {
            id: makeId("m"),
            callsign: "Operative",
            role: "Founder",
            joinedAt: Date.now(),
          },
        ] satisfies GuildMember[]);

  return {
    kind: "inGuild",
    guildId: o.guildId,
    guildCode: o.guildCode,
    guildName: safeName(o.guildName),
    pledge,
    rivalGuildId: typeof o.rivalGuildId === "string" ? o.rivalGuildId : null,
    members: ensuredMembers,
  };
}

export function normalizeGuildContracts(raw: unknown): SharedGuildContract[] {
  if (!Array.isArray(raw)) return [];
  const out: SharedGuildContract[] = [];
  for (const c of raw) {
    if (!c || typeof c !== "object") continue;
    const o = c as Record<string, unknown>;
    if (typeof o.id !== "string") continue;
    if (typeof o.templateId !== "string") continue;
    const zoneId: VoidZoneId | null =
      o.zoneId === "howling-scar" ||
      o.zoneId === "ash-relay" ||
      o.zoneId === "echo-ruins" ||
      o.zoneId === "rift-maw"
        ? o.zoneId
        : null;
    if (!zoneId) continue;
    const status = o.status === "claimed" ? "claimed" : "active";
    const postedAt =
      typeof o.postedAt === "number" && Number.isFinite(o.postedAt)
        ? o.postedAt
        : Date.now();
    const startContribution =
      typeof o.startContribution === "number" && Number.isFinite(o.startContribution)
        ? o.startContribution
        : 0;
    const targetContributionDelta =
      typeof o.targetContributionDelta === "number" &&
      Number.isFinite(o.targetContributionDelta) &&
      o.targetContributionDelta > 0
        ? o.targetContributionDelta
        : 40;
    const title = typeof o.title === "string" ? o.title : "Contract";
    const description = typeof o.description === "string" ? o.description : "";
    const rewardRaw =
      o.reward && typeof o.reward === "object"
        ? (o.reward as Record<string, unknown>)
        : {};

    out.push({
      id: o.id,
      templateId: o.templateId,
      zoneId,
      title,
      description,
      postedAt,
      startContribution,
      targetContributionDelta,
      status,
      reward: rewardRaw as SharedGuildContract["reward"],
    });
    if (out.length >= MAX_CONTRACTS) break;
  }
  return out;
}

export function createGuild(player: PlayerState, guildName: string): GuildRosterState {
  const name = safeName(guildName);
  const guildId = makeId("g");
  const guildCode = String(Math.floor(100000 + Math.random() * 900000));
  const self: GuildMember = {
    id: makeId("m"),
    callsign: player.playerName || "Operative",
    role: "Founder",
    joinedAt: Date.now(),
  };
  return {
    kind: "inGuild",
    guildId,
    guildCode,
    guildName: name,
    pledge: player.factionAlignment === "unbound" ? "unbound" : player.factionAlignment,
    rivalGuildId: null,
    members: [self],
  };
}

export function joinGuildByCode(player: PlayerState, code: string): GuildRosterState | null {
  const safeCode = code.trim().slice(0, 12);
  if (!/^\d{6}$/.test(safeCode)) return null;
  const guildId = `g-join-${safeCode}`;
  const self: GuildMember = {
    id: makeId("m"),
    callsign: player.playerName || "Operative",
    role: "Member",
    joinedAt: Date.now(),
  };
  return {
    kind: "inGuild",
    guildId,
    guildCode: safeCode,
    guildName: `Joined Guild ${safeCode}`,
    pledge: player.factionAlignment === "unbound" ? "unbound" : player.factionAlignment,
    rivalGuildId: null,
    members: [self],
  };
}

export function setGuildPledge(roster: GuildRosterState, pledge: GuildPledge): GuildRosterState {
  if (roster.kind !== "inGuild") return roster;
  return { ...roster, pledge };
}

export function addGuildMember(roster: GuildRosterState, callsign: string): GuildRosterState {
  if (roster.kind !== "inGuild") return roster;
  const name = safeName(callsign);
  if (!name) return roster;
  const next: GuildMember = {
    id: makeId("m"),
    callsign: name,
    role: "Member",
    joinedAt: Date.now(),
  };
  return { ...roster, members: [...roster.members, next].slice(0, MAX_MEMBERS) };
}

export function removeGuildMember(roster: GuildRosterState, memberId: string): GuildRosterState {
  if (roster.kind !== "inGuild") return roster;
  const remaining = roster.members.filter((m) => m.id !== memberId);
  const founders = remaining.filter((m) => m.role === "Founder");
  if (founders.length <= 0) return roster;
  return { ...roster, members: remaining };
}

export function postGuildContract(player: PlayerState, templateId: string): SharedGuildContract | null {
  if (player.guild.kind !== "inGuild") return null;
  const t = GUILD_CONTRACT_TEMPLATES.find((x) => x.id === templateId) ?? null;
  if (!t) return null;
  return {
    id: makeId("gc"),
    templateId: t.id,
    zoneId: t.zoneId,
    title: t.title,
    description: t.description,
    postedAt: Date.now(),
    startContribution: player.guildContributionTotal ?? 0,
    targetContributionDelta: t.targetContributionDelta,
    status: "active",
    reward: t.reward,
  };
}

export function getContractProgressPct(player: PlayerState, c: SharedGuildContract): number {
  const cur = player.guildContributionTotal ?? 0;
  const delta = Math.max(0, cur - c.startContribution);
  const pct = c.targetContributionDelta > 0 ? (delta / c.targetContributionDelta) * 100 : 0;
  return Math.max(0, Math.min(100, Math.floor(pct)));
}

export function buildLocalRivalTable(player: PlayerState): LocalGuildRivalSnapshot[] {
  const base = Math.max(0, player.guildContributionTotal ?? 0);
  const rivals: LocalGuildRivalSnapshot[] = [
    {
      guildId: "r-verdant-chain",
      guildName: "Verdant Chain",
      pledge: "bio",
      contribution: base + 22,
    },
    {
      guildId: "r-synod-ironline",
      guildName: "Synod Ironline",
      pledge: "mecha",
      contribution: Math.max(0, base - 14),
    },
    {
      guildId: "r-ember-covenant",
      guildName: "Ember Covenant",
      pledge: "pure",
      contribution: base + 6,
    },
  ];
  if (player.guild.kind === "inGuild") {
    rivals.push({
      guildId: player.guild.guildId,
      guildName: player.guild.guildName,
      pledge: player.guild.pledge,
      contribution: base,
    });
  }
  return rivals.sort((a, b) => b.contribution - a.contribution);
}

