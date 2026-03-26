"use client";

import Image from "next/image";
import { useState } from "react";
import { assets } from "@/lib/assets";
import { voidExpeditionZoneLayout } from "@/features/void-maps/expeditionMapLayout";
import { voidZones, type VoidZoneId } from "@/features/void-maps/zoneData";
import VoidZoneNode from "@/components/void-expedition/VoidZoneNode";

export default function VoidExpeditionMap({
  selectedZoneId,
  rankLevel,
  onSelectZone,
}: {
  selectedZoneId: VoidZoneId;
  rankLevel: number;
  onSelectZone: (id: VoidZoneId) => void;
}) {
  const [hoverZoneId, setHoverZoneId] = useState<VoidZoneId | null>(null);
  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden">
      <Image
        src={assets.backgrounds.voidRealmExpeditionMap}
        alt="Realm expedition chart: Howling Scar, Ash Relay, Echo Ruins, Rift Maw"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40"
        aria-hidden
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />

      <div className="absolute inset-0">
        {voidZones.map((zone) => {
          const layout = voidExpeditionZoneLayout[zone.id];
          const unlocked = rankLevel >= zone.threatLevel;
          const isSelected = selectedZoneId === zone.id;
          const isHovered = hoverZoneId === zone.id;
          const isDimmed = selectedZoneId !== zone.id && hoverZoneId !== zone.id;

          return (
            <VoidZoneNode
              key={zone.id}
              zone={zone}
              layout={layout}
              isSelected={isSelected}
              isHovered={isHovered}
              isDimmed={isDimmed}
              unlocked={unlocked}
              onSelect={() => onSelectZone(zone.id)}
              onHover={(h) => setHoverZoneId(h ? zone.id : null)}
            />
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-[max(260px,32vh)] left-4 right-4 z-[5] md:bottom-[min(40%,280px)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45 md:text-[11px]">
          Realm chart · selection only
        </p>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/55 md:text-sm">
          River path links are visual only — deployment uses the highlighted realm
          and the same hunt queue as before.
        </p>
      </div>
    </div>
  );
}
