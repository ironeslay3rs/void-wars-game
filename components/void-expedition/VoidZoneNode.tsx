"use client";

import type { VoidZone } from "@/features/void-maps/zoneData";
import type { ExpeditionZoneRegion } from "@/features/void-maps/expeditionMapLayout";

export default function VoidZoneNode({
  zone,
  layout,
  isSelected,
  isHovered,
  isDimmed,
  unlocked,
  onSelect,
  onHover,
}: {
  zone: VoidZone;
  layout: ExpeditionZoneRegion;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  unlocked: boolean;
  onSelect: () => void;
  onHover: (hovering: boolean) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={`${zone.label}${unlocked ? "" : " — locked"}`}
        disabled={!unlocked}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onClick={() => unlocked && onSelect()}
        className={[
          "absolute inset-0 transition-[background-color,box-shadow,opacity] duration-200",
          !unlocked
            ? "cursor-not-allowed bg-black/55 opacity-90"
            : isSelected
              ? "cursor-pointer bg-cyan-400/20 shadow-[inset_0_0_0_3px_rgba(34,211,238,0.85)]"
              : isHovered
                ? "cursor-pointer bg-white/15 opacity-100 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]"
                : isDimmed
                  ? "cursor-pointer bg-black/45 opacity-75 hover:bg-black/35 hover:opacity-95"
                  : "cursor-pointer bg-black/25 opacity-90 hover:bg-white/10 hover:opacity-100",
        ].join(" ")}
        style={{ clipPath: layout.hitPolygon }}
      />
      <div
        className="pointer-events-none absolute z-10 max-w-[28vw] md:max-w-[200px]"
        style={{
          left: layout.labelPosition.left,
          top: layout.labelPosition.top,
        }}
      >
        <div
          className={[
            "rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] shadow-lg backdrop-blur-sm md:text-[11px]",
            isSelected
              ? "border-cyan-300/60 bg-black/70 text-cyan-50"
              : unlocked
                ? "border-white/25 bg-black/60 text-white/90"
                : "border-white/15 bg-black/70 text-white/45",
          ].join(" ")}
        >
          {zone.label}
          {!unlocked ? (
            <span className="ml-1 text-white/40">· L{zone.threatLevel}</span>
          ) : null}
        </div>
      </div>
    </>
  );
}
