import type { FactionAlignment, PlayerState } from "@/features/game/gameTypes";
import type {
  DoctrinePressure,
  GuildContributionLogEntry,
} from "@/features/factions/factionWorldTypes";
import {
  voidZoneById,
  type VoidZoneId,
} from "@/features/void-maps/zoneData";
import { getContestedZoneMeta } from "@/features/world/contestedZone";

const ZONE_IDS: VoidZoneId[] = [
  "howling-scar",
  "ash-relay",
  "echo-ruins",
  "rift-maw",
];

export type { DoctrinePressure, GuildContributionLogEntry } from "@/features/factions/factionWorldTypes";

export const FACTION_HQ_STIPEND_COOLDOWN_MS = 4 * 60 * 60 * 1000;

const MAX_GUILD_LOG = 18;

function normalizeGuildLog(value: unknown): GuildContributionLogEntry[] {
  if (!Array.isArray(value)) return [];
  const out: GuildContributionLogEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (
      typeof o.at !== "number" ||
      typeof o.amount !== "number" ||
      typeof o.reason !== "string"
    ) {
      continue;
    }
    out.push({ at: o.at, amount: o.amount, reason: o.reason });
  }
  return out.slice(0, MAX_GUILD_LOG);
}

export function normalizePlayerFactionWorldSlice(
  raw: Partial<PlayerState>,
): Pick<
  PlayerState,
  | "zoneDoctrinePressure"
  | "guildContributionTotal"
  | "guildContributionLog"
  | "lastFactionHqStipendAt"
> {
  return {
    zoneDoctrinePressure: mergeZoneDoctrineRecord(raw.zoneDoctrinePressure),
    guildContributionTotal:
      typeof raw.guildContributionTotal === "number" &&
      Number.isFinite(raw.guildContributionTotal)
        ? Math.max(0, raw.guildContributionTotal)
        : 0,
    guildContributionLog: normalizeGuildLog(raw.guildContributionLog),
    lastFactionHqStipendAt:
      typeof raw.lastFactionHqStipendAt === "number" &&
      Number.isFinite(raw.lastFactionHqStipendAt)
        ? raw.lastFactionHqStipendAt
        : 0,
  };
}

function isVoidZoneId(id: string): id is VoidZoneId {
  return (ZONE_IDS as string[]).includes(id);
}

export function parseVoidZoneId(id: unknown): VoidZoneId | undefined {
  if (typeof id !== "string") return undefined;
  return isVoidZoneId(id) ? id : undefined;
}

export function defaultDoctrinePressure(): DoctrinePressure {
  return { bio: 34, mecha: 33, pure: 33 };
}

export function initialZoneDoctrineRecord(): Record<VoidZoneId, DoctrinePressure> {
  const r = {} as Record<VoidZoneId, DoctrinePressure>;
  for (const id of ZONE_IDS) {
    r[id] = defaultDoctrinePressure();
  }
  return r;
}

export function normalizeDoctrinePressure(
  input: Partial<DoctrinePressure> | undefined,
): DoctrinePressure {
  const base = defaultDoctrinePressure();
  if (!input) return base;
  let bio =
    typeof input.bio === "number" && Number.isFinite(input.bio)
      ? Math.max(0, input.bio)
      : base.bio;
  let mecha =
    typeof input.mecha === "number" && Number.isFinite(input.mecha)
      ? Math.max(0, input.mecha)
      : base.mecha;
  let pure =
    typeof input.pure === "number" && Number.isFinite(input.pure)
      ? Math.max(0, input.pure)
      : base.pure;
  const sum = bio + mecha + pure;
  if (sum <= 0) return base;
  const scale = 100 / sum;
  bio = Math.round(bio * scale);
  mecha = Math.round(mecha * scale);
  pure = Math.max(0, 100 - bio - mecha);
  return { bio, mecha, pure };
}

export function mergeZoneDoctrineRecord(
  raw: unknown,
): Record<VoidZoneId, DoctrinePressure> {
  const out = initialZoneDoctrineRecord();
  if (!raw || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  for (const id of ZONE_IDS) {
    const chunk = o[id];
    if (chunk && typeof chunk === "object") {
      out[id] = normalizeDoctrinePressure(chunk as DoctrinePressure);
    }
  }
  return out;
}

export function dominantDoctrinePath(
  p: DoctrinePressure,
): "bio" | "mecha" | "pure" {
  if (p.bio >= p.mecha && p.bio >= p.pure) return "bio";
  if (p.mecha >= p.pure) return "mecha";
  return "pure";
}

export type SchoolPressureKind = "reinforced" | "contested" | "balanced";

export function getSchoolPressureKind(params: {
  factionAlignment: FactionAlignment;
  pressure: DoctrinePressure;
}): SchoolPressureKind {
  const { factionAlignment, pressure } = params;
  if (factionAlignment === "unbound") return "balanced";
  const dom = dominantDoctrinePath(pressure);
  const top = Math.max(pressure.bio, pressure.mecha, pressure.pure);
  const mine = pressure[factionAlignment];
  if (factionAlignment === dom) return "reinforced";
  if (top - mine >= 12) return "contested";
  return "balanced";
}

export function aggregateRegionalPressureKind(params: {
  factionAlignment: FactionAlignment;
  byZone: Record<VoidZoneId, DoctrinePressure>;
}): SchoolPressureKind {
  const { factionAlignment, byZone } = params;
  if (factionAlignment === "unbound") return "balanced";
  let contested = false;
  let reinforced = false;
  for (const id of ZONE_IDS) {
    const k = getSchoolPressureKind({
      factionAlignment,
      pressure: byZone[id],
    });
    if (k === "contested") contested = true;
    if (k === "reinforced") reinforced = true;
  }
  if (contested) return "contested";
  if (reinforced) return "reinforced";
  return "balanced";
}

export function shiftDoctrinePressureForHunt(params: {
  pressure: DoctrinePressure;
  zoneId: VoidZoneId;
  playerFaction: FactionAlignment;
  intensity: number;
}): DoctrinePressure {
  const zone = voidZoneById[params.zoneId];
  const w = clampInt(params.intensity, 1, 22);
  let pushBio = 0;
  let pushMecha = 0;
  let pushPure = 0;

  if (zone.lootTheme === "bio_rot") pushBio += w;
  else if (zone.lootTheme === "ash_mecha") pushMecha += w;
  else pushPure += w;

  if (params.playerFaction === "bio") pushBio += Math.ceil(w * 0.55);
  else if (params.playerFaction === "mecha") pushMecha += Math.ceil(w * 0.55);
  else if (params.playerFaction === "pure") pushPure += Math.ceil(w * 0.55);
  else {
    const spread = Math.max(1, Math.floor(w / 3));
    pushBio += spread;
    pushMecha += spread;
    pushPure += spread;
  }

  let sumBio = params.pressure.bio + pushBio;
  let sumMecha = params.pressure.mecha + pushMecha;
  let sumPure = params.pressure.pure + pushPure;

  const interim: DoctrinePressure = {
    bio: sumBio,
    mecha: sumMecha,
    pure: sumPure,
  };
  const dom = dominantDoctrinePath(interim);
  const sorted = [sumBio, sumMecha, sumPure].sort((a, b) => b - a);
  const margin = sorted[0] - sorted[1];

  /** +1 to ledger after base hunt push — small, client-only territorial feedback (M1). */
  if (params.playerFaction !== "unbound") {
    if (params.playerFaction !== dom && margin >= 8) {
      if (dom === "bio") sumBio += 1;
      else if (dom === "mecha") sumMecha += 1;
      else sumPure += 1;
    } else if (params.playerFaction === dom && margin >= 3) {
      if (params.playerFaction === "bio") sumBio += 1;
      else if (params.playerFaction === "mecha") sumMecha += 1;
      else sumPure += 1;
    }
  }

  return normalizeDoctrinePressure({
    bio: sumBio,
    mecha: sumMecha,
    pure: sumPure,
  });
}

function clampInt(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Math.floor(n)));
}

export function huntIntensityFromMissionRankReward(
  rankXp: number,
  influence: number,
) {
  return clampInt(rankXp / 8 + influence * 3, 3, 18);
}

export function huntIntensityFromRealtimeTotals(params: {
  totalDamageDealt: number;
  mobsKilled: number;
  exposedKills: number;
}) {
  const raw =
    Math.floor(params.totalDamageDealt / 45) +
    params.mobsKilled * 2 +
    params.exposedKills * 4;
  return clampInt(raw, 4, 24);
}

export function guildPointsFromIntensity(intensity: number) {
  return clampInt(intensity / 2, 1, 12);
}

/**
 * Stacks contested-sector + guild-contract multipliers on a base mercenary award (Phase 6–8).
 */
export function applyTheaterGuildBonusesToBase(
  player: PlayerState,
  zoneId: string | null | undefined,
  baseDelta: number,
  nowMs: number,
): { delta: number; reasonTags: string[] } {
  let guildDelta = clampInt(baseDelta, 1, 22);
  const reasonTags: string[] = [];

  if (zoneId && isVoidZoneId(zoneId)) {
    const contested = getContestedZoneMeta(nowMs);
    if (zoneId === contested.zoneId) {
      const extra = Math.max(1, Math.ceil(guildDelta * 0.35));
      guildDelta += extra;
      reasonTags.push("contested sector");
    }
    const activeContract = (player.guildContracts ?? []).find(
      (c) => c.status === "active",
    );
    if (activeContract && zoneId === activeContract.zoneId) {
      const extra = Math.max(2, Math.ceil(guildDelta * 0.22));
      guildDelta += extra;
      reasonTags.push("guild contract zone");
    }
    if (
      player.guild.kind === "inGuild" &&
      player.guild.pledge !== "unbound" &&
      contested.school === player.guild.pledge &&
      zoneId === contested.zoneId
    ) {
      const extra = Math.max(1, Math.ceil(guildDelta * 0.12));
      guildDelta += extra;
      reasonTags.push("pledge theater");
    }
  }

  guildDelta = clampInt(guildDelta, 1, 22);
  return { delta: guildDelta, reasonTags };
}

/** Ledger-only (no doctrine drift) — use for supplemental awards after the main hunt settlement. */
export function appendGuildLedgerEntry(
  player: PlayerState,
  entry: { amount: number; reason: string; at?: number },
): PlayerState {
  const at = entry.at ?? Date.now();
  const amt = clampInt(entry.amount, 0, 22);
  if (amt <= 0) return player;

  const nextLog: GuildContributionLogEntry[] = [
    { at, amount: amt, reason: entry.reason },
    ...(player.guildContributionLog ?? []),
  ].slice(0, MAX_GUILD_LOG);

  return {
    ...player,
    guildContributionTotal: (player.guildContributionTotal ?? 0) + amt,
    guildContributionLog: nextLog,
  };
}

/**
 * Apply doctrine drift + mercenary guild ledger after a hunt slice resolves.
 */
export function withWorldProgressAfterHunt(
  player: PlayerState,
  args: {
    zoneId?: string | null;
    intensity: number;
    reason: string;
    nowMs?: number;
  },
): PlayerState {
  const { zoneId, intensity, reason } = args;
  const now = args.nowMs ?? Date.now();
  const baseGp = guildPointsFromIntensity(intensity);
  const { delta: guildDelta, reasonTags } = applyTheaterGuildBonusesToBase(
    player,
    zoneId ?? null,
    baseGp,
    now,
  );

  const logReason =
    reasonTags.length > 0 ? `${reason} · ${reasonTags.join(", ")}` : reason;

  const nextLog: GuildContributionLogEntry[] = [
    {
      at: now,
      amount: guildDelta,
      reason: logReason,
    },
    ...(player.guildContributionLog ?? []),
  ].slice(0, MAX_GUILD_LOG);

  let zoneDoctrinePressure = player.zoneDoctrinePressure;

  if (zoneId && isVoidZoneId(zoneId)) {
    const z = zoneId;
    const prev = zoneDoctrinePressure[z] ?? defaultDoctrinePressure();
    zoneDoctrinePressure = {
      ...zoneDoctrinePressure,
      [z]: shiftDoctrinePressureForHunt({
        pressure: prev,
        zoneId: z,
        playerFaction: player.factionAlignment,
        intensity,
      }),
    };
  }

  return {
    ...player,
    zoneDoctrinePressure,
    guildContributionTotal:
      (player.guildContributionTotal ?? 0) + guildDelta,
    guildContributionLog: nextLog,
  };
}

export function computeFactionHqStipend(player: PlayerState): {
  credits: number;
  influence: number;
} {
  const aligned = player.factionAlignment !== "unbound";
  const rankBonus = Math.min(12, player.rankLevel * 2);
  const inflBonus = Math.min(8, Math.floor(player.influence / 25));
  const dominantZones = aligned
    ? ZONE_IDS.filter(
        (id) =>
          dominantDoctrinePath(player.zoneDoctrinePressure[id]) ===
          player.factionAlignment,
      ).length
    : 0;
  const territoryBonus = dominantZones * 4;
  return {
    credits: 20 + rankBonus + inflBonus + territoryBonus,
    influence: aligned ? 1 + (dominantZones > 0 ? 1 : 0) : 0,
  };
}
