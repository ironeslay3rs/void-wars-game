"use client";

import Image from "next/image";
import { assets } from "@/lib/assets";
import { voidFieldHashStringToInt } from "@/features/void-maps/voidFieldUtils";
import type {
  VoidFieldDamageFloatFx,
  VoidFieldSlashFx,
} from "@/features/void-maps/useVoidFieldCombatFeedback";

function floatNudgeX(id: string): number {
  const h = voidFieldHashStringToInt(`${id}-dmgx`);
  return (h % 5) - 2;
}

export default function VoidFieldCombatEffects({
  slashes,
  floats,
}: {
  slashes: VoidFieldSlashFx[];
  floats: VoidFieldDamageFloatFx[];
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[24] overflow-hidden">
      {slashes.map((s) => (
        <div
          key={s.id}
          className="void-field-hit-slash absolute"
          style={{
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
          }}
        >
          <span className="void-field-hit-slash-bloom" aria-hidden />
          <span className="void-field-hit-impact-core" aria-hidden />
          <Image
            src={assets.voidField.vfx.hitSlash}
            alt=""
            width={72}
            height={72}
            className="relative z-[1] h-[72px] w-[72px] max-w-none select-none drop-shadow-[0_0_20px_rgba(34,211,238,0.82),0_0_38px_rgba(8,145,178,0.42),0_2px_6px_rgba(0,0,0,0.9)]"
            priority={false}
          />
        </div>
      ))}

      {floats.map((f) => {
        const dx = floatNudgeX(f.id);
        const tierClass = f.isCrit
          ? "void-field-damage-float-crit"
          : f.heavy
            ? "void-field-damage-float-heavy"
            : "void-field-damage-float";
        const boostedClass = f.boosted
          ? "drop-shadow-[0_0_14px_rgba(217,70,239,0.6),0_0_26px_rgba(168,85,247,0.35),0_2px_4px_rgba(0,0,0,0.85)]"
          : "";
        return (
          <div
            key={f.id}
            className={`pointer-events-none absolute text-center font-black tabular-nums ${tierClass}`}
            style={{
              left: `${f.xPct + dx * 0.35}%`,
              top: `${f.yPct}%`,
            }}
          >
            <span
              className={
                f.isCrit
                  ? "text-[16px] leading-none tracking-tight text-amber-50 drop-shadow-[0_0_12px_rgba(251,191,36,0.85),0_0_22px_rgba(245,158,11,0.4)] md:text-[18px]"
                  : f.heavy
                    ? "text-[15px] leading-none text-cyan-50 drop-shadow-[0_0_10px_rgba(34,211,238,0.72),0_0_20px_rgba(14,165,233,0.35),0_2px_4px_rgba(0,0,0,0.9)] md:text-[16px]"
                    : `text-[13px] leading-none text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.55),0_1px_3px_rgba(0,0,0,0.85)] md:text-sm ${boostedClass}`.trim()
              }
            >
              {f.isCrit ? `${f.damage}!` : `−${f.damage}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
