"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Hammer,
  Package,
  Shield,
  Wrench,
  ArrowLeft,
  Flame,
} from "lucide-react";
import { useGame } from "@/features/game/gameContext";
import { getCraftingDistrictScreenData } from "@/features/crafting-district/craftingDistrictScreenData";
import {
  FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST,
  FIELD_RATIONS_CRAFT_CREDITS_COST,
} from "@/features/status/survival";

const craftingStations = [
  {
    title: "Weapon Forge",
    desc: "Craft blades, guns, and combat gear.",
    icon: Hammer,
  },
  {
    title: "Armor Bench",
    desc: "Reinforce armor, shields, and plating.",
    icon: Shield,
  },
  {
    title: "Rune Socketing",
    desc: "Insert runes and enhance item effects.",
    icon: Flame,
  },
  {
    title: "Material Storage",
    desc: "Manage ore, scraps, cores, and reagents.",
    icon: Package,
  },
  {
    title: "Repair Bay",
    desc: "Restore durability and rebuild damaged gear.",
    icon: Wrench,
  },
];

export default function CraftingDistrictPage() {
  const { state, dispatch } = useGame();
  const screenData = getCraftingDistrictScreenData(state);
  const [craftResult, setCraftResult] = useState<string | null>(null);

  const { credits, bioSamples, ironOre, scrapAlloy, runeDust, emberCore } =
    state.player.resources;
  const { fieldRations, hunger } = state.player.survival;
  const canCraftFieldRations =
    credits >= FIELD_RATIONS_CRAFT_CREDITS_COST &&
    bioSamples >= FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST;

  function craftFieldRations() {
    if (!canCraftFieldRations) {
      setCraftResult(
        `Need ${FIELD_RATIONS_CRAFT_CREDITS_COST} Credits and ${FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST} Bio Sample to pack 1 Field Ration.`,
      );
      return;
    }

    dispatch({ type: "CRAFT_FIELD_RATION" });
    setCraftResult(
      "Pack sealed. The district quartermaster prepared 1 Field Ration for your next run.",
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(120,30,10,0.22),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-orange-300/70">
              Bazaar / District
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Crafting District
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              The industrial core of the Bazaar. This first survival pass keeps
              the district focused on one grounded provisioning lane instead of
              a full-system overhaul.
            </p>
          </div>

          <Link
            href="/bazaar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-orange-400/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bazaar
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {screenData.cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                  {card.label}
                </div>
                <div className="text-sm font-bold text-orange-300">
                  {card.value}
                </div>
              </div>
              <p className="mt-3 text-sm text-white/65">{card.hint}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {craftingStations.map((station) => {
            const Icon = station.icon;

            return (
              <div
                key={station.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_25px_rgba(0,0,0,0.22)] transition hover:border-orange-400/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                    <Icon className="h-5 w-5 text-orange-300" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]">
                      {station.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/65">{station.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Provisioning
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Quartermaster Prep</h2>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-orange-400/20 bg-orange-500/8 p-4">
                <div className="text-sm font-semibold text-white">Field Rations</div>
                <div className="mt-2 text-sm text-white/65">
                  Compact travel packs assembled from market staples and usable
                  biomass. This is the only survival crafting path in the
                  foundation pass.
                </div>

                <button
                  type="button"
                  onClick={craftFieldRations}
                  disabled={!canCraftFieldRations}
                  className="mt-4 w-full rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-left text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Craft 1 Field Ration
                  <div className="mt-1 text-xs text-white/60">
                    Costs {FIELD_RATIONS_CRAFT_CREDITS_COST} Credits / {" "}
                    {FIELD_RATIONS_CRAFT_BIO_SAMPLES_COST} Bio Sample
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {craftResult ??
                    "Quartermaster ready. Pack rations only when you need hunger coverage for another run."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Resources
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Current Stock</h2>
            <div className="mt-4 space-y-3 text-sm text-white/75">
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Credits</span>
                <span>{credits}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Bio Samples</span>
                <span>{bioSamples}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Field Rations</span>
                <span>{fieldRations}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Hunger</span>
                <span>{hunger}%</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Iron Ore</span>
                <span>{ironOre}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Scrap Alloy</span>
                <span>{scrapAlloy}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Rune Dust</span>
                <span>{runeDust}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Ember Core</span>
                <span>{emberCore}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
