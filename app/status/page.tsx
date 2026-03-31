"use client";

import Image from "next/image";
import Link from "next/link";
import SectionCard from "@/components/shared/SectionCard";
import StatusHeroCard from "@/components/status/StatusHeroCard";
import StatusScreenSummary from "@/components/status/StatusScreenSummary";
import StatusResourcesCard from "@/components/status/StatusResourcesCard";
import StatusSystemsCard from "@/components/status/StatusSystemsCard";
import VoidInstabilityReadout from "@/components/status/VoidInstabilityReadout";
import { canonNavigationItems } from "@/features/canonRegistry";
import { assets } from "@/lib/assets";

export default function StatusPage() {
  const statusNavItems = [
    canonNavigationItems.inventory,
    canonNavigationItems.status,
    canonNavigationItems.missions,
    canonNavigationItems.factions,
    canonNavigationItems.bazaar,
    canonNavigationItems.arena,
    canonNavigationItems.guild,
    canonNavigationItems.settings,
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a12] px-4 py-6 text-white md:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src={assets.home.background}
          alt=""
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(120,20,20,0.28),_rgba(7,10,18,0.92)_38%,_rgba(4,6,12,0.98)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,16,0.96)_0%,rgba(7,10,18,0.72)_34%,rgba(7,10,18,0.72)_68%,rgba(5,8,16,0.96)_100%)]" />
      </div>

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6">
        <div className="rounded-[28px] border border-white/10 bg-black/35 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.4)] backdrop-blur-md md:p-6">
          <div className="grid gap-6 xl:grid-cols-[240px_1fr_360px]">
            <aside className="hidden xl:flex xl:flex-col xl:gap-4">
              <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(24,26,38,0.92),rgba(8,10,16,0.96))] p-4">
                <div className="text-[11px] uppercase tracking-[0.26em] text-white/40">
                  Operative Menu
                </div>
                <div className="mt-4 space-y-3">
                  {statusNavItems.map((item) => {
                    const isActive = item.id === "status";

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={[
                          "flex items-center justify-between rounded-[18px] border px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition",
                          isActive
                            ? "border-red-400/40 bg-red-500/12 text-white shadow-[0_0_24px_rgba(220,38,38,0.18)]"
                            : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        <span>{item.label}</span>
                        <span className="text-[10px] tracking-[0.18em] text-white/35">
                          {isActive ? "LIVE" : "OPEN"}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="flex flex-col gap-6">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,16,28,0.82),rgba(6,8,14,0.92))] px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.34)] md:px-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4">
                      <Link
                        href="/home"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/80 transition hover:border-white/20 hover:bg-white/10"
                      >
                        <span aria-hidden>←</span>
                        Back to Home
                      </Link>
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-red-200/55">
                      Operative Status
                    </div>
                    <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.08em] text-white md:text-5xl">
                      Status
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/68 md:text-base">
                      Confirm path identity, survival pressure, and whether the
                      next step is recovery or another push into the Void.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-black/25 px-4 py-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
                      <Image
                        src={assets.home.crest}
                        alt="Void Wars crest"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Void Wars
                      </div>
                      <div className="mt-1 text-xl font-black uppercase tracking-[0.14em] text-white">
                        Oblivion
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <StatusHeroCard />
            </div>

            <div className="grid gap-6">
              <StatusScreenSummary />
              <VoidInstabilityReadout />
              <StatusSystemsCard />
              <SectionCard
                title="Loadout Snapshot"
                description="Reserved for weapon, armor, core, and rune-slot exposure once the current status shell is locked."
              >
                <div className="grid gap-3">
                  {[
                    "Weapon Slot",
                    "Armor Slot",
                    "Core Slot",
                    "Rune Set",
                    "Profession Bind",
                  ].map((entry) => (
                    <div
                      key={entry}
                      className="flex items-center justify-between rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm uppercase tracking-[0.08em] text-white/60">
                        {entry}
                      </span>
                      <span className="text-sm font-semibold text-white/35">
                        Empty
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="mt-6">
            <StatusResourcesCard />
          </div>
        </div>
      </div>
    </main>
  );
}
