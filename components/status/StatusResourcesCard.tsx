"use client";

import Image from "next/image";
import { useGame } from "@/features/game/gameContext";
import { assets } from "@/lib/assets";

export default function StatusResourcesCard() {
  const { state } = useGame();
  const { resources } = state.player;

  const primaryResources = [
    { label: "Credits", value: resources.credits, icon: assets.icons.voidOrb },
    {
      label: "Bio Samples",
      value: resources.bioSamples,
      icon: assets.icons.bioVial,
    },
    {
      label: "Moss Rations",
      value: resources.mossRations,
      icon: assets.icons.alchemyFlask,
    },
  ];

  const secondaryResources = [
    {
      label: "Iron Ore",
      value: resources.ironOre,
      icon: assets.icons.shatteredPlate,
    },
    {
      label: "Scrap Alloy",
      value: resources.scrapAlloy,
      icon: assets.icons.shatteredSkull,
    },
    {
      label: "Rune Dust",
      value: resources.runeDust,
      icon: assets.icons.voidCluster,
    },
    {
      label: "Ember Core",
      value: resources.emberCore,
      icon: assets.icons.emberCoreDevice,
    },
  ];

  return (
    <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,28,0.92),rgba(8,10,16,0.96))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs uppercase tracking-[0.24em] text-white/40">
          Resource Ledger
        </div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/32">
          Field Stock
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {primaryResources.map((res) => (
          <div
            key={res.label}
            className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <Image
                src={res.icon}
                alt={res.label}
                fill
                className="object-contain p-2"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                {res.label}
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {res.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {secondaryResources.map((res) => (
          <div
            key={res.label}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <Image
                src={res.icon}
                alt={res.label}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">
                {res.label}
              </div>
              <div className="mt-1 text-base font-black text-white">
                {res.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
