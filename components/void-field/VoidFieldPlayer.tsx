"use client";

import Image from "next/image";
import type { FactionAlignment } from "@/features/game/gameTypes";
import { assets } from "@/lib/assets";
import type { PlayerPresence } from "@/features/void-maps/realtime/voidRealtimeProtocol";

function toneFor(faction: PlayerPresence["factionAlignment"] | FactionAlignment) {
  switch (faction) {
    case "bio":
      return {
        border: "border-emerald-400/40",
        ring: "ring-emerald-400/25",
        glow: "shadow-[0_0_36px_rgba(52,211,153,0.5),0_0_56px_rgba(16,185,129,0.22),0_4px_20px_rgba(0,0,0,0.65)]",
        radial:
          "bg-[radial-gradient(circle,rgba(52,211,153,0.38),transparent_58%)]",
      };
    case "mecha":
      return {
        border: "border-cyan-400/42",
        ring: "ring-cyan-400/28",
        glow: "shadow-[0_0_36px_rgba(34,211,238,0.48),0_0_54px_rgba(14,165,233,0.2),0_4px_20px_rgba(0,0,0,0.65)]",
        radial:
          "bg-[radial-gradient(circle,rgba(34,211,238,0.32),transparent_58%)]",
      };
    case "pure":
      return {
        border: "border-fuchsia-400/40",
        ring: "ring-fuchsia-400/26",
        glow: "shadow-[0_0_34px_rgba(232,121,249,0.44),0_0_52px_rgba(192,38,211,0.18),0_4px_20px_rgba(0,0,0,0.65)]",
        radial:
          "bg-[radial-gradient(circle,rgba(232,121,249,0.3),transparent_58%)]",
      };
    default:
      return {
        border: "border-white/28",
        ring: "ring-white/18",
        glow: "shadow-[0_0_32px_rgba(255,255,255,0.22),0_4px_18px_rgba(0,0,0,0.6)]",
        radial: "bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_60%)]",
      };
  }
}

function fieldIconSrc(
  faction: PlayerPresence["factionAlignment"] | FactionAlignment,
): string {
  switch (faction) {
    case "bio":
      return assets.icons.bioVial;
    case "mecha":
      return assets.icons.blueCore;
    case "pure":
      return assets.icons.emberCoreDevice;
    default:
      return assets.icons.voidOrb;
  }
}

export default function VoidFieldPlayer({
  xNorm,
  yNorm,
  label,
  isSelf,
  factionAlignment,
  showLabel = false,
  lootCollectPulse = 0,
}: {
  xNorm: number;
  yNorm: number;
  label: string;
  isSelf: boolean;
  factionAlignment: PlayerPresence["factionAlignment"] | FactionAlignment;
  /** M1 default: icon-first; set true to show text tag under marker */
  showLabel?: boolean;
  /** Incremented when local loot is absorbed; drives a short self-marker ping. */
  lootCollectPulse?: number;
}) {
  const t = toneFor(factionAlignment);
  const icon = fieldIconSrc(factionAlignment);
  const y = yNorm * 100;
  const zBase = isSelf ? 34 : 12;
  const z = zBase + Math.round(y * 0.1);
  /** Self reads larger than mobs at the same Y (presence). */
  const depth = isSelf ? 1.02 + yNorm * 0.1 : 0.96 + yNorm * 0.09;

  const lootRingKey = isSelf ? `loot-ring-${lootCollectPulse}` : `other-${label}`;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${xNorm * 100}%`,
        top: `${yNorm * 100}%`,
        zIndex: z,
        transform: `translate(-50%, -50%) scale(${depth})`,
      }}
      title={label}
    >
      <div className="relative flex flex-col items-center">
        <div
          className={`pointer-events-none absolute left-1/2 top-[80%] z-0 h-[12px] w-[68%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-[11px] md:h-[13px] md:w-[70%]`}
          aria-hidden
        />

        <div
          key={lootRingKey}
          className={`relative z-[1] rounded-full border bg-black/25 p-[3px] ${t.border} ${t.ring} ring-1 ${isSelf ? t.glow : "shadow-[0_6px_20px_rgba(0,0,0,0.58)]"} ${isSelf && lootCollectPulse > 0 ? "void-field-player-loot-ping" : ""}`}
        >
          <div
            className={`relative flex items-center justify-center rounded-full bg-black/35 ${isSelf ? "h-[48px] w-[48px] md:h-[54px] md:w-[54px]" : "h-[42px] w-[42px] md:h-[46px] md:w-[46px]"}`}
          >
            <span
              className={`pointer-events-none absolute inset-[-12px] rounded-full ${t.radial} md:inset-[-14px]`}
              aria-hidden
            />
            <div
              className={`relative z-[1] flex items-center justify-center ${isSelf ? "void-field-player-idle h-10 w-10 md:h-11 md:w-11" : `void-field-player-idle-other h-9 w-9 md:h-10 md:w-10`}`}
            >
              <Image
                src={icon}
                alt=""
                width={44}
                height={44}
                className={`object-contain object-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.88)] ${isSelf ? "h-10 w-10 md:h-11 md:w-11" : "h-9 w-9 md:h-10 md:w-10"}`}
              />
            </div>
          </div>
        </div>
        {showLabel ? (
          <span className="mt-1 max-w-[72px] truncate text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-white/50 opacity-90">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
