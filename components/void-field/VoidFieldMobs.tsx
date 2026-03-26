"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import type { MobEntity } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import { voidFieldEnemySpriteSrc } from "@/features/void-maps/voidFieldEnemyAssets";
import {
  isVoidFieldShellBossMobId,
  isVoidFieldShellMobId,
} from "@/features/void-maps/voidFieldShellMobs";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import type { VoidZoneId } from "@/features/void-maps/zoneData";
import {
  voidZoneEnemyFaction,
  type EnemyFaction,
} from "@/features/void-maps/zoneEnemyMapping";

export type { EnemyFaction };

const FIELD_MOB_CAP = 4;

/** Lower on field = slightly larger (foreground). Subtle range to avoid distortion. */
function depthScaleFromY(y: number): number {
  const t = Math.max(0, Math.min(100, y)) / 100;
  return 0.92 + t * 0.14;
}

function factionMotionClass(faction: EnemyFaction) {
  switch (faction) {
    case "bio":
      return "void-enemy-bio-motion";
    case "mecha":
      return "void-enemy-mecha-motion";
    case "spirit":
      return "void-enemy-spirit-motion";
    case "infernal":
      return "void-enemy-infernal-motion";
  }
}

function hpBarClass(faction: EnemyFaction) {
  switch (faction) {
    case "bio":
      return "from-emerald-500/95 via-lime-400/85 to-teal-500/80";
    case "mecha":
      return "from-cyan-500/95 via-sky-400/85 to-slate-400/80";
    case "spirit":
      return "from-violet-500/95 via-fuchsia-400/80 to-indigo-500/75";
    case "infernal":
      return "from-red-600/95 via-orange-500/90 to-amber-400/80";
  }
}

/** Target ring color — high contrast; pulse glow from `.void-field-mob-targeted`. */
function targetRingClass(faction: EnemyFaction, isBoss: boolean): string {
  if (isBoss) {
    return "ring-[3px] ring-fuchsia-200/95";
  }
  switch (faction) {
    case "bio":
      return "ring-[3px] ring-emerald-200/90";
    case "mecha":
      return "ring-[3px] ring-cyan-100/95";
    case "spirit":
      return "ring-[3px] ring-violet-200/90";
    case "infernal":
      return "ring-[3px] ring-amber-200/90";
  }
}

function organicOffsetPx(mobEntityId: string): { ox: number; oy: number } {
  const h1 = voidFieldHashStringToInt(`${mobEntityId}-org`);
  const h2 = voidFieldHashStringToInt(`${mobEntityId}-org2`);
  return { ox: (h1 % 7) - 3, oy: (h2 % 7) - 3 };
}

export default function VoidFieldMobs({
  zoneId,
  mobs,
  targetedMobEntityId,
  onMobActivate,
  onMobTarget,
  mobHitUntilById = {},
}: {
  zoneId: VoidZoneId;
  mobs: MobEntity[];
  targetedMobEntityId: string | null;
  onMobActivate: (mobEntityId: string) => void;
  onMobTarget: (mobEntityId: string | null) => void;
  /** Client combat feedback: mobs get a brief flinch while `until` > now. */
  mobHitUntilById?: Record<string, number>;
}) {
  const enemyFaction = voidZoneEnemyFaction(zoneId);
  const spriteSrc = voidFieldEnemySpriteSrc(enemyFaction);
  const visible = mobs.slice(0, FIELD_MOB_CAP);

  return (
    <>
      {visible.map((mob) => {
        const hpPct = mob.maxHp > 0 ? (mob.hp / mob.maxHp) * 100 : 0;
        const isBoss =
          mob.isBoss === true ||
          mob.mobLabel === "Void Boss" ||
          isVoidFieldShellBossMobId(mob.mobEntityId);
        const shell = isVoidFieldShellMobId(mob.mobEntityId);
        const postureMax = mob.shellPostureMax ?? 0;
        const postureCur = mob.shellPosture ?? 0;
        const posturePct =
          postureMax > 0 ? Math.min(100, (postureCur / postureMax) * 100) : 0;
        const exposedHits = mob.shellExposedHitsRemaining ?? 0;
        const motion = factionMotionClass(enemyFaction);
        const hpGrad = hpBarClass(enemyFaction);
        const { ox, oy } =
          enemyFaction === "bio" ? organicOffsetPx(mob.mobEntityId) : { ox: 0, oy: 0 };
        const depth = depthScaleFromY(mob.y);
        const targeted = targetedMobEntityId === mob.mobEntityId;
        const z = 14 + Math.round(mob.y * 0.12);

        const title = `${mob.mobLabel} · x${mob.packSize} · ${Math.round(hpPct)}% HP${
          postureMax > 0 ? ` · posture ${Math.round(posturePct)}%` : ""
        }${exposedHits > 0 ? ` · EXPOSED ×${exposedHits}` : ""}${shell ? " · drill" : ""}`;
        const hitUntil = mobHitUntilById[mob.mobEntityId];
        const hitActive = hitUntil !== undefined;
        const spriteMotionKey = hitActive
          ? `${mob.mobEntityId}-hit-${hitUntil}`
          : `${mob.mobEntityId}-idle`;

        return (
          <div
            key={mob.mobEntityId}
            className="absolute"
            style={{
              left: `${mob.x}%`,
              top: `${mob.y}%`,
              zIndex: z,
              transform: `translate(-50%, -50%) scale(${depth})`,
            }}
          >
            <button
              type="button"
              title={title}
              aria-label={title}
              aria-pressed={targeted}
              className={`group relative flex flex-col items-center border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-0 ${
                mob.hp > 0 ? "opacity-100" : "opacity-[0.34]"
              } ${mob.hp > 0 ? "cursor-pointer" : "cursor-default"}`}
              onPointerDown={(ev: PointerEvent<HTMLButtonElement>) => {
                ev.stopPropagation();
              }}
              onClick={() => {
                if (mob.hp <= 0) return;
                const nextTarget =
                  targetedMobEntityId === mob.mobEntityId ? null : mob.mobEntityId;
                onMobTarget(nextTarget);
                if (nextTarget === null) return;
                onMobActivate(mob.mobEntityId);
              }}
            >
              {/* Sprite stack only — anchor shadow + target ring do not wrap HP (no “card”). */}
              <div className="relative flex w-[52px] flex-col items-center md:w-[58px]">
                <div
                  className="pointer-events-none absolute left-1/2 top-[82%] z-0 h-[9px] w-[72%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-[10px] md:h-[10px] md:w-[74%]"
                  aria-hidden
                />

                <div
                  className={`relative z-[1] flex flex-col items-center rounded-full p-[2px] ${
                    targeted ? targetRingClass(enemyFaction, isBoss) : ""
                  }`}
                >
                  {targeted ? (
                    <span
                      className="void-field-mob-targeted pointer-events-none absolute inset-0 z-0 rounded-full"
                      aria-hidden
                    />
                  ) : null}
                  <div
                    className="relative z-[1]"
                    style={
                      enemyFaction === "bio"
                        ? { transform: `translate(${ox}px, ${oy}px)` }
                        : undefined
                    }
                  >
                    <div
                      key={spriteMotionKey}
                      className={
                        hitActive ? "void-field-mob-hit-flinch inline-block" : "inline-block"
                      }
                    >
                      <div
                        className={`void-field-mob-ambient-glint relative flex h-[50px] w-[50px] items-center justify-center md:h-[56px] md:w-[56px] ${motion}`}
                      >
                      <Image
                        src={spriteSrc}
                        alt=""
                        width={56}
                        height={56}
                        className="h-[50px] w-[50px] object-contain object-bottom select-none drop-shadow-[0_5px_12px_rgba(0,0,0,0.82)] md:h-[56px] md:w-[56px]"
                        draggable={false}
                      />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="mt-1 h-1 w-11 overflow-hidden rounded-full bg-black/75 md:w-12"
                aria-hidden
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${hpGrad} transition-[width] duration-200 ease-out`}
                  style={{
                    width: `${mob.hp <= 0 ? 0 : Math.max(4, hpPct)}%`,
                  }}
                />
              </div>

              {postureMax > 0 && mob.hp > 0 ? (
                <div
                  className="mt-0.5 h-0.5 w-11 overflow-hidden rounded-full bg-black/80 md:w-12"
                  aria-hidden
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400/95 to-amber-200/70 transition-[width] duration-200 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(3, posturePct))}%`,
                    }}
                  />
                </div>
              ) : null}

              <span
                className="pointer-events-none mt-0.5 max-w-[76px] truncate text-center text-[7px] font-medium uppercase tracking-[0.14em] text-white/70 opacity-[0.14] transition-opacity duration-200 group-hover:opacity-100 md:max-w-[84px]"
                aria-hidden
              >
                {mob.hp <= 0 ? "Down" : mob.mobLabel}
              </span>
              {mob.shellTag && mob.hp > 0 ? (
                <span className="pointer-events-none mt-0.5 text-[6px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                  {exposedHits > 0 ? "EXPOSED" : mob.shellTag}
                </span>
              ) : null}
            </button>
          </div>
        );
      })}
    </>
  );
}
