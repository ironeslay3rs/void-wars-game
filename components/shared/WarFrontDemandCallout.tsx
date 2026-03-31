"use client";

import type { FactionAlignment } from "@/features/game/gameTypes";
import { formatFactionLabel } from "@/features/arena/arenaView";
import { getContestedZoneMeta } from "@/features/world/contestedZone";
import { getWarFrontContributionLine } from "@/features/world/warFrontContribution";
import type { GuildPledge } from "@/features/social/guildLiveTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

type WarFrontDemandCalloutProps = {
  nowMs: number;
  playerFaction: FactionAlignment;
  /** Optional — unlocks contribution-tier line from influence alone. */
  influence?: number;
  /** When in a guild, pass pledge for Phase 8 pledge-theater mercenary hint. */
  guildPledge?: GuildPledge | null;
  /** When set and matches the contested sector, emphasize deploy synergy. */
  deployZoneId?: VoidZoneId | null;
};

function schoolCopy(path: "bio" | "mecha" | "pure"): string {
  if (path === "bio") return "Bio";
  if (path === "mecha") return "Mecha";
  return "Pure";
}

export default function WarFrontDemandCallout({
  nowMs,
  playerFaction,
  influence,
  guildPledge,
  deployZoneId,
}: WarFrontDemandCalloutProps) {
  const meta = getContestedZoneMeta(nowMs);
  const deployIsHot = deployZoneId !== undefined && deployZoneId === meta.zoneId;
  const pledgeTheater =
    guildPledge !== undefined &&
    guildPledge !== null &&
    guildPledge !== "unbound" &&
    guildPledge === meta.school;
  const daysLeft = Math.max(
    0,
    Math.ceil((meta.rotationEndsAt - nowMs) / (24 * 60 * 60 * 1000)),
  );

  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3 text-sm",
        deployIsHot
          ? "border-orange-400/35 bg-orange-950/28 text-orange-50/95"
          : "border-indigo-400/25 bg-indigo-950/20 text-indigo-100/88",
      ].join(" ")}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
        Phase 6 · Faction war front
      </div>
      <p className="mt-2 leading-relaxed">
        <span className="font-semibold text-white/95">{meta.label}</span> is the
        contested void sector this cycle (~{daysLeft}d left). Broker demand adds a
        small buy and sell adjustment on most materials;{" "}
        <span className="font-semibold text-amber-200/90">
          {schoolCopy(meta.school)}
        </span>
        -tagged lanes spike further. {playerFaction !== "unbound" ? (
          <>
            As {formatFactionLabel(playerFaction)}, you shave a minor break on your own
            school&apos;s hot lines when buying from the Exchange.
          </>
        ) : (
          <>Unbound operators pay theater rates without school rebates.</>
        )}
      </p>
      {typeof influence === "number" ? (
        <p className="mt-2 text-xs text-white/55">{getWarFrontContributionLine(influence)}</p>
      ) : null}
      {deployIsHot ? (
        <p className="mt-2 text-xs font-semibold text-orange-200/90">
          You are staged on the contested sector — extraction returns stay normal; broker
          pricing reflects off-world demand for this lane.
        </p>
      ) : null}
      {pledgeTheater ? (
        <p className="mt-2 text-xs leading-relaxed text-emerald-200/85">
          Guild pledge matches this theater school — hunts in the{" "}
          <span className="font-semibold text-emerald-100/95">{meta.label}</span> corridor
          earn extra mercenary ledger credit (
          <span className="font-semibold">pledge theater</span>, Phase 8).
        </p>
      ) : null}
    </div>
  );
}
