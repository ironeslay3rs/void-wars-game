"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type MutableRefObject,
  type PointerEvent,
} from "react";
import {
  buildSpawnEncounter,
  type SpawnEncounter,
} from "@/features/void-maps/spawnSim";
import { voidZoneById, type VoidZoneId } from "@/features/void-maps/zoneData";
import type { FactionAlignment } from "@/features/game/gameTypes";
import type {
  MobEntity,
  PlayerPresence,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";
import {
  VOID_FIELD_SPAWN_HISTORY_LIMIT,
  voidFieldHashStringToInt,
} from "@/features/void-maps/voidFieldUtils";
import VoidFieldCombatEffects from "@/components/void-field/VoidFieldCombatEffects";
import VoidFieldLootDrops from "@/components/void-field/VoidFieldLootDrops";
import VoidFieldMobs from "@/components/void-field/VoidFieldMobs";
import VoidFieldPlayer from "@/components/void-field/VoidFieldPlayer";
import VoidFieldPlayers from "@/components/void-field/VoidFieldPlayers";
import type { NormalizedVec2 } from "@/components/void-field/useVoidFieldLocalPlayer";
import type { VoidFieldLootDropVfx } from "@/features/void-maps/voidFieldLootDrops";
import type {
  VoidFieldDamageFloatFx,
  VoidFieldSlashFx,
} from "@/features/void-maps/useVoidFieldCombatFeedback";

type ThreatBand = "low" | "medium" | "high";

function offlineMarkerClasses(threatBand: ThreatBand) {
  if (threatBand === "high") {
    return "border-red-400/45 bg-red-500/15 text-red-100";
  }
  if (threatBand === "medium") {
    return "border-amber-400/45 bg-amber-500/14 text-amber-50";
  }
  return "border-emerald-400/35 bg-emerald-500/10 text-emerald-100";
}

export default function VoidFieldCanvas({
  zoneId,
  fieldMapSrc,
  backdropFallbackClassName,
  threatBand,
  huntStatus,
  multiplayerEnabled,
  isRunning,
  fieldMobs,
  realtimePlayers,
  selfClientId,
  localPlayerNorm,
  fieldPointerActive,
  onFieldPointerDown,
  selfFactionAlignment,
  combatSlashes,
  combatFloats,
  mobHitUntilById,
  tryDirectMobAttack,
  targetedMobEntityId,
  onMobTarget,
  lootDrops,
  lootPlayerPctRef,
  onLootConsumed,
  lootCollectPulse,
}: {
  zoneId: VoidZoneId;
  fieldMapSrc: string | null;
  backdropFallbackClassName: string;
  threatBand: ThreatBand;
  huntStatus: "running" | "complete" | null;
  multiplayerEnabled: boolean;
  isRunning: boolean;
  /** Realtime mobs or shell stand-ins with client HP (from screen). */
  fieldMobs: MobEntity[];
  realtimePlayers: PlayerPresence[];
  selfClientId: string;
  localPlayerNorm: NormalizedVec2;
  /** When true, show crosshair; local move is controlled in the hook, not here */
  fieldPointerActive: boolean;
  onFieldPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  selfFactionAlignment: FactionAlignment;
  combatSlashes: VoidFieldSlashFx[];
  combatFloats: VoidFieldDamageFloatFx[];
  mobHitUntilById: Record<string, number>;
  tryDirectMobAttack: (mobEntityId: string) => void;
  targetedMobEntityId: string | null;
  onMobTarget: (mobEntityId: string | null) => void;
  lootDrops: VoidFieldLootDropVfx[];
  lootPlayerPctRef: MutableRefObject<{ x: number; y: number }>;
  onLootConsumed: (id: string) => void;
  lootCollectPulse: number;
}) {
  const spawnIntervalMs =
    threatBand === "high" ? 2800 : threatBand === "medium" ? 4000 : 5500;
  const [spawnHistory, setSpawnHistory] = useState<SpawnEncounter[]>(() => [
    buildSpawnEncounter(zoneId, Date.now()),
  ]);
  useEffect(() => {
    if (multiplayerEnabled) return;
    if (huntStatus !== "running") return;

    const interval = window.setInterval(() => {
      setSpawnHistory((prev) => {
        const next = buildSpawnEncounter(zoneId, Date.now());
        return [next, ...prev].slice(0, VOID_FIELD_SPAWN_HISTORY_LIMIT);
      });
    }, spawnIntervalMs);

    return () => window.clearInterval(interval);
  }, [multiplayerEnabled, huntStatus, zoneId, spawnIntervalMs]);

  const om = offlineMarkerClasses(threatBand);
  const mapInteractive = fieldPointerActive
    ? "cursor-crosshair touch-none"
    : "";

  const zoneLabel = voidZoneById[zoneId].label;

  return (
    <div
      role="application"
      aria-label={`Void hunt field — ${zoneLabel}`}
      onPointerDown={onFieldPointerDown}
      className={`relative h-full min-h-0 w-full overflow-hidden ${mapInteractive}`}
    >
      {fieldMapSrc ? (
        <Image
          src={fieldMapSrc}
          alt={`${zoneLabel} — void field`}
          fill
          priority
          className="pointer-events-none select-none object-cover object-center"
          sizes="100vw"
          draggable={false}
        />
      ) : (
        <div
          className={`pointer-events-none absolute inset-0 ${backdropFallbackClassName}`}
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]"
        aria-hidden
      />
      <div
        className="void-field-atmosphere pointer-events-none absolute inset-0"
        aria-hidden
      />

      {multiplayerEnabled ? (
        <>
          <VoidFieldPlayers
            players={realtimePlayers}
            selfClientId={selfClientId}
          />
          <VoidFieldMobs
            zoneId={zoneId}
            mobs={fieldMobs}
            targetedMobEntityId={targetedMobEntityId}
            onMobActivate={tryDirectMobAttack}
            onMobTarget={onMobTarget}
            mobHitUntilById={mobHitUntilById}
          />
          <VoidFieldCombatEffects
            slashes={combatSlashes}
            floats={combatFloats}
          />
          <VoidFieldLootDrops
            drops={lootDrops}
            playerPctRef={lootPlayerPctRef}
            onConsumed={onLootConsumed}
          />
          <VoidFieldPlayer
            xNorm={localPlayerNorm.x}
            yNorm={localPlayerNorm.y}
            label="You"
            isSelf
            factionAlignment={selfFactionAlignment}
            lootCollectPulse={lootCollectPulse}
          />
        </>
      ) : (
        <>
          <VoidFieldPlayer
            xNorm={0.5}
            yNorm={0.82}
            label="You"
            isSelf
            factionAlignment={selfFactionAlignment}
          />
          {spawnHistory.slice(0, 8).map((entry, idx) => {
            const seed = `${entry.mobId}-${entry.spawnedAt}-${idx}`;
            const h1 = voidFieldHashStringToInt(seed);
            const h2 = voidFieldHashStringToInt(`${seed}-b`);
            const x = 10 + (h1 % 81);
            const y = 12 + (h2 % 76);
            return (
              <div
                key={`${entry.spawnedAt}-${entry.mobId}-${idx}-off`}
                className={`absolute z-[5] -translate-x-1/2 -translate-y-1/2 rounded-full border ${om}`}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${entry.mobLabel} (x${entry.packSize})`}
              >
                <div className="flex h-10 w-10 items-center justify-center md:h-11 md:w-11">
                  <span className="text-[10px] font-black uppercase tracking-[0.06em]">
                    x{entry.packSize}
                  </span>
                </div>
              </div>
            );
          })}
        </>
      )}

      {!isRunning ? (
        <div className="pointer-events-none absolute inset-0 z-[28] flex items-center justify-center p-6">
          <div
            className={`max-w-md rounded-xl border px-4 py-4 text-center backdrop-blur-sm ${
              huntStatus === "complete"
                ? "pointer-events-auto border-emerald-400/25 bg-black/70"
                : "pointer-events-none border-white/15 bg-black/60"
            }`}
          >
            {huntStatus === "complete" ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200/80">
                  Run complete
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  Contract timer stopped — payout is finalizing.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/65">
                  Open{" "}
                  <span className="text-emerald-100/90">Hunt Result</span> for
                  base contract rewards, realtime bonus (if linked), and final
                  totals tied to this run.
                </p>
                <Link
                  href="/bazaar/biotech-labs/result"
                  className="mt-4 inline-flex rounded-lg border border-emerald-400/35 bg-emerald-950/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-100 hover:border-emerald-300/50 hover:bg-emerald-950/55"
                >
                  Open Hunt Result
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/75">
                Hunt timer not running — field is quiet.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
