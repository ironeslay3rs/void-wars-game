"use client";

import Image from "next/image";
import { assets } from "@/lib/assets";

export type AbilitySlot = {
  id: string;
  name: string;
  manaCost: number;
  /** True when the player can afford + the ability is off cooldown. */
  canActivate: boolean;
  /** If on cooldown, seconds remaining (rounded). Null when ready. */
  cooldownSecondsLeft: number | null;
  /** Short tooltip. */
  tooltip: string;
  /** Accent color class for the button border/bg. */
  accentClass: string;
  /** Accent color class when disabled. */
  disabledClass: string;
};

export default function VoidFieldControls({
  connected,
  isRunning,
  shellPracticeActive,
  onAttack,
  autoStrikeEngaged,
  autoStrikeActive,
  onAutoStrikeToggle,
  mana,
  manaMax,
  manaDisplayName,
  abilities,
  onActivateAbility,
}: {
  connected: boolean;
  isRunning: boolean;
  shellPracticeActive: boolean;
  onAttack: () => void;
  autoStrikeEngaged: boolean;
  autoStrikeActive: boolean;
  onAutoStrikeToggle: () => void;
  /** Current mana for the field HUD bar. */
  mana: number;
  manaMax: number;
  manaDisplayName: string;
  /** Up to 2 ability slots to show in the control bar. */
  abilities: AbilitySlot[];
  onActivateAbility: (abilityId: string) => void;
}) {
  const canUse = (connected && isRunning) || shellPracticeActive;
  const manaPercent = manaMax > 0 ? Math.round((mana / manaMax) * 100) : 0;

  return (
    <div
      className={[
        "relative z-50 flex shrink-0 flex-wrap items-center justify-center gap-2 border-t border-white/15 bg-black/75 px-2 py-2 backdrop-blur-md",
        "pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-3 sm:py-3",
        "md:flex-nowrap md:gap-3 md:px-6",
      ].join(" ")}
    >
      {/* Mana bar — compact inline readout */}
      <div className="flex min-w-[80px] flex-col items-center gap-0.5 px-2">
        <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-sky-200/70">
          {manaDisplayName}
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,rgba(56,189,248,0.7),rgba(14,165,233,1))] transition-[width] duration-300"
            style={{ width: `${manaPercent}%` }}
          />
        </div>
        <div className="text-[9px] font-bold tabular-nums text-sky-100/80">
          {mana}/{manaMax}
        </div>
      </div>

      {/* Attack button */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAttack();
        }}
        disabled={!canUse}
        title={
          canUse
            ? shellPracticeActive && !(connected && isRunning)
              ? "Strike shell mobs in range — local practice (Space)"
              : "Strike target in range, else nearest mob (Space)"
            : "No mobs in range or field unavailable"
        }
        className={[
          "touch-manipulation active:scale-[0.99] flex min-h-[56px] min-w-[104px] items-center justify-center gap-2 rounded-xl border px-4 py-3 md:min-h-[48px] md:min-w-[108px] md:px-3 md:py-2",
          canUse
            ? "border-cyan-400/45 bg-cyan-500/20 text-cyan-50 hover:border-cyan-300/55 hover:bg-cyan-500/28"
            : "cursor-not-allowed border-white/10 bg-black/30 text-white/35",
        ].join(" ")}
      >
        <Image
          src={assets.icons.emberSlash}
          alt=""
          width={26}
          height={26}
          className={
            canUse
              ? "opacity-95 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
              : "opacity-35"
          }
        />
        <span className="text-sm font-black uppercase tracking-[0.12em]">
          Attack
        </span>
      </button>

      {/* Auto strike toggle */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAutoStrikeToggle();
        }}
        title={
          autoStrikeActive
            ? "Auto strike on — click to stop"
            : autoStrikeEngaged
              ? "Auto armed — starts when hunt and link are active"
              : canUse
                ? "Auto strike — repeats strikes while a mob is in range"
                : "Toggle auto (arms for next hunt when field is idle)"
        }
        aria-pressed={autoStrikeEngaged}
        className={[
          "touch-manipulation active:scale-[0.99] min-h-[56px] min-w-[96px] rounded-xl border px-4 py-3 text-sm font-black uppercase tracking-[0.12em] md:min-h-[48px] md:min-w-[72px] md:px-3 md:py-2 md:text-xs md:font-bold",
          autoStrikeActive
            ? "border-amber-400/55 bg-amber-500/25 text-amber-50 shadow-[0_0_14px_rgba(251,191,36,0.25)]"
            : autoStrikeEngaged
              ? "border-amber-400/35 bg-amber-950/40 text-amber-200/70 hover:border-amber-400/50"
              : canUse
                ? "border-white/20 bg-white/5 text-white/75 hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-50"
                : "border-white/10 bg-black/25 text-white/40 hover:border-white/20 hover:text-white/55",
        ].join(" ")}
      >
        Auto
      </button>

      {/* Ability slots — Surge + Wolf-Leap (replaces the old placeholders) */}
      {abilities.map((ab) => (
        <button
          key={ab.id}
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onActivateAbility(ab.id);
          }}
          disabled={!ab.canActivate}
          title={ab.tooltip}
          className={[
            "touch-manipulation active:scale-[0.99] min-h-[56px] min-w-[88px] rounded-xl border px-3 py-2 md:min-h-[48px] md:min-w-[80px]",
            ab.canActivate ? ab.accentClass : ab.disabledClass,
          ].join(" ")}
        >
          <span className="block text-xs font-black uppercase tracking-[0.1em]">
            {ab.name}
          </span>
          <span className="block text-[9px] font-normal opacity-70">
            {ab.cooldownSecondsLeft !== null
              ? `${ab.cooldownSecondsLeft}s`
              : `${ab.manaCost} mana`}
          </span>
        </button>
      ))}

      <p className="ml-auto hidden max-w-[220px] text-[10px] leading-4 text-white/45 lg:block">
        WASD / Arrows to move. Space to strike. AFK timer still pays out.
      </p>
    </div>
  );
}
