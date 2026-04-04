"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import { getRegionalWarBriefForNow } from "@/features/world/regionalWarEvents";
import { getDoctrinePressureStrip } from "@/features/world/missionDoctrineStrip";
import { getContestedZoneMeta } from "@/features/world/contestedZone";
import { voidZones } from "@/features/void-maps/zoneData";
import {
  getGuildMercenaryRank,
  getGuildRivalInsight,
} from "@/features/social/guildLiveLogic";
import { getGuildRoutineBriefForNow } from "@/features/social/guildRoutineBrief";
import {
  checkCapacity,
  getOverflowPenalty,
  INVENTORY_CAPACITY_MAX,
} from "@/features/resources/inventoryLogic";
import { CARGO_INFUSION_HEADING } from "@/features/status/voidInfusionMetaphor";
import WarFrontSnapshotCallout from "@/components/shared/WarFrontSnapshotCallout";

function getConditionColor(condition: number) {
  if (condition >= 65) return "bg-emerald-500";
  if (condition >= 40) return "bg-amber-400";
  return "bg-red-500";
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getFactionAccentChip(faction: string) {
  switch (faction) {
    case "bio":
      return "border-emerald-500/40 bg-emerald-500/12 text-emerald-100";
    case "mecha":
      return "border-cyan-400/40 bg-cyan-500/12 text-cyan-100";
    case "pure":
      return "border-fuchsia-400/40 bg-fuchsia-500/12 text-fuchsia-100";
    default:
      return "border-white/15 bg-white/5 text-white/75";
  }
}

function getFactionLabel(faction: string) {
  switch (faction) {
    case "bio": return "Bio · Verdant Coil";
    case "mecha": return "Mecha · Chrome Synod";
    case "pure": return "Pure · Ember Vault";
    default: return "Unbound";
  }
}

export default function MissionPanel() {
  const { state } = useGame();
  const { player } = state;
  const [briefNow, setBriefNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setBriefNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const regionalBrief = getRegionalWarBriefForNow(briefNow);
  const doctrineStrip = getDoctrinePressureStrip(player, briefNow);
  const guildContract =
    player.guild.kind === "inGuild"
      ? (player.guildContracts ?? []).find((c) => c.status === "active") ?? null
      : null;
  const contestedMeta = getContestedZoneMeta(briefNow);
  const guildContractZoneLabel =
    guildContract
      ? voidZones.find((z) => z.id === guildContract.zoneId)?.label ??
        guildContract.zoneId
      : null;
  const guildContractIsTheaterHot =
    guildContract && guildContract.zoneId === contestedMeta.zoneId;
  const guildRivalLine =
    player.guild.kind === "inGuild" ? getGuildRivalInsight(player) : null;
  const guildRoutine =
    player.guild.kind === "inGuild"
      ? getGuildRoutineBriefForNow(briefNow)
      : null;
  const guildRank =
    player.guild.kind === "inGuild"
      ? getGuildMercenaryRank(player.guildContributionTotal ?? 0)
      : null;
  const capacity = checkCapacity(player.resources, INVENTORY_CAPACITY_MAX);
  const overload = capacity.isOverloaded ? getOverflowPenalty(capacity) : null;
  const xpPct = player.rankXpToNext > 0
    ? Math.min(100, (player.rankXp / player.rankXpToNext) * 100)
    : 0;
  const condColor = getConditionColor(player.condition);
  const condLabel = getConditionLabel(player.condition);
  const factionChip = getFactionAccentChip(player.factionAlignment);

  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,26,0.94),rgba(7,9,15,0.97))] p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.3)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
            Operative
          </div>
          <div className="mt-0.5 truncate text-base font-black uppercase tracking-[0.06em] text-white">
            {player.playerName}
          </div>
        </div>
        <span className={["shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]", factionChip].join(" ")}>
          {getFactionLabel(player.factionAlignment)}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
          Theater brief
        </div>
        <div className="mt-1 text-xs font-semibold text-white/88">{regionalBrief.title}</div>
        <p className="mt-1 text-[11px] leading-relaxed text-white/55">{regionalBrief.detail}</p>
      </div>

      <div className="mt-3 rounded-xl border border-rose-400/22 bg-rose-950/14 px-3 py-2.5">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
          {doctrineStrip.title}
        </div>
        <div className="mt-1 text-[11px] font-semibold text-rose-100/90">
          {doctrineStrip.contestedLine}
        </div>
        {doctrineStrip.stakesLine ? (
          <p className="mt-1 text-[11px] leading-relaxed text-rose-50/80">
            {doctrineStrip.stakesLine}
          </p>
        ) : null}
        <p className="mt-1 text-[11px] leading-relaxed text-white/55">
          {doctrineStrip.pressureLine}
        </p>
        {doctrineStrip.commodityLine ? (
          <p className="mt-1 text-[11px] leading-relaxed text-amber-200/85">
            {doctrineStrip.commodityLine}
          </p>
        ) : null}
        {doctrineStrip.sectorWinnerLine ? (
          <div className="mt-2 rounded-lg border border-amber-300/20 bg-black/25 px-2 py-1.5">
            <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-amber-200/65">
              {doctrineStrip.sectorControlTitle}
            </div>
            <p className="mt-0.5 text-[10px] font-semibold text-amber-50/92">
              {doctrineStrip.sectorWinnerLine}
            </p>
            {doctrineStrip.warConsequenceLine ? (
              <p className="mt-1 text-[10px] leading-relaxed text-rose-100/80">
                {doctrineStrip.warConsequenceLine}
              </p>
            ) : null}
            {doctrineStrip.warMechanicalLine ? (
              <p className="mt-1 text-[9px] leading-relaxed text-white/50">
                {doctrineStrip.warMechanicalLine}
              </p>
            ) : null}
          </div>
        ) : null}
        {doctrineStrip.warFrontSnapshot ? (
          <WarFrontSnapshotCallout
            snapshot={doctrineStrip.warFrontSnapshot}
            showZoneTitle={false}
            className="mt-2 border-rose-400/18 bg-black/22"
          />
        ) : null}
        <Link
          href="/bazaar/war-exchange"
          className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200/85 underline decoration-amber-400/35 underline-offset-2"
        >
          War Exchange pricing
        </Link>
      </div>

      {player.guild.kind === "inGuild" &&
      (!guildContract || !guildContractZoneLabel) &&
      guildRank ? (
        <div className="mt-3 rounded-xl border border-cyan-400/18 bg-cyan-950/14 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200/80">
            Mercenary standing · {guildRank.label}
          </div>
          <p className="mt-1 text-[11px] text-white/55">{guildRank.hint}</p>
          <Link
            href="/guild"
            className="mt-2 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200/85 underline decoration-cyan-400/35 underline-offset-2"
          >
            Post a shared contract
          </Link>
        </div>
      ) : null}

      {guildContract && guildContractZoneLabel ? (
        <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-950/20 px-3 py-2.5">
          {guildRank ? (
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200/80">
              Standing · {guildRank.label}
            </div>
          ) : null}
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Guild objective
          </div>
          <div className="mt-1 text-xs font-semibold text-cyan-100/95">
            {guildContract.title}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/58">
            Sector: {guildContractZoneLabel}
            {guildContractIsTheaterHot
              ? " — matches the contested void sector; hunts here pay bonus mercenary credit to the guild ledger."
              : " — close hunts in this sector to advance shared contract progress."}
          </p>
          <Link
            href="/guild"
            className="mt-2 inline-flex rounded-lg border border-cyan-300/35 bg-cyan-500/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100 hover:border-cyan-200/50"
          >
            Guild board
          </Link>
        </div>
      ) : null}

      {guildRivalLine ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Rival read
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/58">
            {guildRivalLine}
          </p>
          <Link
            href="/guild"
            className="mt-2 inline-flex rounded-lg border border-white/15 bg-white/6 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70 hover:border-white/25"
          >
            Open standings
          </Link>
        </div>
      ) : null}

      {guildRoutine ? (
        <div className="mt-3 rounded-xl border border-emerald-400/22 bg-emerald-950/18 px-3 py-2.5">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            Guild routine
          </div>
          <div className="mt-1 text-xs font-semibold text-emerald-100/95">
            {guildRoutine.title}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/58">
            {guildRoutine.detail}
          </p>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Rank</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.rank}</div>
          <div className="text-[10px] text-white/50">Lv {player.rankLevel}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Influence</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.influence}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2 text-center">
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Mastery</div>
          <div className="mt-0.5 text-sm font-black text-white">{player.masteryProgress}%</div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-white/45">
            <span className="uppercase tracking-[0.16em]">Condition</span>
            <span className="font-semibold text-white/70">{player.condition}% · {condLabel}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className={["h-full rounded-full transition-[width] duration-300", condColor].join(" ")}
              style={{ width: `${player.condition}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] text-white/45">
            <span className="uppercase tracking-[0.16em]">Rank XP</span>
            <span className="tabular-nums text-white/60">{player.rankXp} / {player.rankXpToNext}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400 transition-[width] duration-300"
              style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {player.condition < 40 ? (
        <div className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
          Condition critical — recover before next run.
        </div>
      ) : null}

      {overload ? (
        <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/12 px-3 py-2 text-[11px] leading-relaxed text-red-100/95">
          <div className="font-bold uppercase tracking-[0.12em] text-red-200">
            {CARGO_INFUSION_HEADING} · hold over capacity
          </div>
          <div className="mt-1 text-red-100/90">
            Queue still runs, but mission timers ×{overload.missionSpeedPenalty.toFixed(1)}, field
            movement −{overload.movementPenaltyPct}%, rewards −{overload.missionRewardPenaltyPct}%.
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-50/95">
            <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
              Time ×{overload.missionSpeedPenalty.toFixed(1)}
            </span>
            <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
              Move −{overload.movementPenaltyPct}%
            </span>
            <span className="rounded-md border border-red-200/35 bg-black/25 px-2 py-0.5">
              Pay −{overload.missionRewardPenaltyPct}%
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/inventory"
              className="rounded-lg border border-red-300/40 bg-red-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-50 hover:border-red-200/60"
            >
              Inventory
            </Link>
            <Link
              href="/bazaar/war-exchange"
              className="rounded-lg border border-red-200/45 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red-50 hover:border-red-100/70"
            >
              Sell surplus
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Link href="/status"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.97]">
          Status
        </Link>
        <Link href="/missions"
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.97]">
          Missions
        </Link>
      </div>
    </div>
  );
}
