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
import {
  RATION_SYNTHESIS_BIO_SAMPLE_COST,
  RATION_SYNTHESIS_CREDIT_COST,
  RATION_SYNTHESIS_OUTPUT,
} from "@/config/survival";
import { useGame } from "@/features/game/gameContext";
import { getCraftingDistrictScreenData } from "@/features/crafting-district/craftingDistrictScreenData";

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
  const [refineResult, setRefineResult] = useState<string | null>(null);
  const [rationResult, setRationResult] = useState<string | null>(null);

  const {
    ironOre,
    scrapAlloy,
    runeDust,
    emberCore,
    bioSamples,
    fieldRations,
  } = state.player.resources;
  const canRefineScrapAlloy = ironOre >= 3;
  const canSynthesizeFieldRations =
    bioSamples >= RATION_SYNTHESIS_BIO_SAMPLE_COST &&
    state.player.resources.credits >= RATION_SYNTHESIS_CREDIT_COST;

  function refineScrapAlloy() {
    if (!canRefineScrapAlloy) {
      setRefineResult("Need 3 Iron Ore to refine 1 Scrap Alloy.");
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: { key: "ironOre", amount: 3 },
    });
    dispatch({
      type: "ADD_RESOURCE",
      payload: { key: "scrapAlloy", amount: 1 },
    });
    setRefineResult("Refinement complete. 3 Iron Ore became 1 Scrap Alloy.");
  }

  function synthesizeFieldRations() {
    if (!canSynthesizeFieldRations) {
      setRationResult(
        `Need ${RATION_SYNTHESIS_BIO_SAMPLE_COST} Bio Samples and ${RATION_SYNTHESIS_CREDIT_COST} Credits to press new field rations.`,
      );
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "bioSamples",
        amount: RATION_SYNTHESIS_BIO_SAMPLE_COST,
      },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "credits",
        amount: RATION_SYNTHESIS_CREDIT_COST,
      },
    });
    dispatch({
      type: "ADD_RESOURCE",
      payload: {
        key: "fieldRations",
        amount: RATION_SYNTHESIS_OUTPUT,
      },
    });

    setRationResult(
      `Synthesis complete. ${RATION_SYNTHESIS_OUTPUT} field rations packed for the next push beyond the walls.`,
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
              The industrial core of the Bazaar. Here players forge equipment,
              repair items, socket runes, and prepare for deeper progression.
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
              District Production
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Refinery Bay</h2>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-orange-400/20 bg-orange-500/8 p-4">
                <div className="mt-2 text-sm font-semibold text-white">
                  Convert raw ore into usable alloy plating.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Immediate district function for M1: refine 3 Iron Ore into 1 Scrap Alloy.
                </div>

                <button
                  type="button"
                  onClick={refineScrapAlloy}
                  disabled={!canRefineScrapAlloy}
                  className="mt-4 w-full rounded-xl border border-orange-400/30 bg-orange-500/10 px-4 py-3 text-left text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Refine Scrap Alloy
                  <div className="mt-1 text-xs text-white/60">
                    Costs 3 Iron Ore / Produces 1 Scrap Alloy
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {refineResult ?? "Refinery idle. Process raw ore whenever you need alloy."}
                </div>
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-500/8 p-4">
                <div className="mt-2 text-sm font-semibold text-white">
                  Press survival packs for wasteland deployment.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Bio slurry, district binders, and sealed ash-wraps become field rations used by exploration and mission deployment.
                </div>

                <button
                  type="button"
                  onClick={synthesizeFieldRations}
                  disabled={!canSynthesizeFieldRations}
                  className="mt-4 w-full rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-left text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Synthesize Field Rations
                  <div className="mt-1 text-xs text-white/60">
                    Costs {RATION_SYNTHESIS_BIO_SAMPLE_COST} Bio Samples +{" "}
                    {RATION_SYNTHESIS_CREDIT_COST} Credits / Produces{" "}
                    {RATION_SYNTHESIS_OUTPUT} Field Rations
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {rationResult ??
                    "Provision press idle. Package ration stock here before taking on extended loops."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
            <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
              Resources
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Material Stock</h2>
            <div className="mt-4 space-y-3 text-sm text-white/75">
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
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Bio Samples</span>
                <span>{bioSamples}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <span>Field Rations</span>
                <span>{fieldRations}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
