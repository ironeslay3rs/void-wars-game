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
  hasStabilizationSigil,
  RUNE_CRAFTER_STABILIZATION_SIGIL,
  RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS,
  RUNE_CRAFTER_STABILIZATION_SIGIL_COST,
} from "@/features/status/statusRecovery";

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
  const [sigilResult, setSigilResult] = useState<string | null>(null);

  const { ironOre, scrapAlloy, runeDust, emberCore } = state.player.resources;
  const canRefineScrapAlloy = ironOre >= 3;
  const stabilizationSigilCrafted = hasStabilizationSigil(
    state.player.knownRecipes,
  );
  const canCraftStabilizationSigil =
    !stabilizationSigilCrafted &&
    state.player.resources.credits >=
      RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits &&
    runeDust >= RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust &&
    emberCore >= RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore;

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

  function craftStabilizationSigil() {
    if (stabilizationSigilCrafted) {
      setSigilResult(
        "Stabilization Sigil already inscribed. Recovery routines are permanently reinforced.",
      );
      return;
    }

    if (!canCraftStabilizationSigil) {
      setSigilResult(
        `Need ${RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits} Credits, ${RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust} Rune Dust, and ${RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore} Ember Core.`,
      );
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "credits",
        amount: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits,
      },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "runeDust",
        amount: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust,
      },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: {
        key: "emberCore",
        amount: RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore,
      },
    });
    dispatch({
      type: "ADD_RECIPE",
      payload: RUNE_CRAFTER_STABILIZATION_SIGIL,
    });
    setSigilResult(
      `Sigil bound. All future recovery actions now restore +${RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS} extra condition.`,
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
              Material Refining
            </div>
            <h2 className="mt-2 text-xl font-black uppercase">Refinery Bay</h2>

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border border-orange-400/20 bg-orange-500/8 p-4">
                <div className="mt-2 text-sm font-semibold text-white">
                  Convert raw ore into usable alloy plating.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  Immediate district function for M1: refine 3 Iron Ore into 1
                  Scrap Alloy.
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
                  {refineResult ??
                    "Refinery idle. Process raw ore whenever you need alloy."}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-orange-300/70">
                Rune Crafter Output
              </div>
              <h2 className="mt-2 text-xl font-black uppercase">
                Stabilization Sigil
              </h2>
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/8 p-4">
                <div className="text-sm font-semibold text-white">
                  Inscribe a permanent recovery ward into your field kit.
                </div>
                <div className="mt-2 text-sm text-white/65">
                  This is the first live profession output: Rune Crafter work
                  that directly strengthens the recovery step after exploration
                  and missions drain condition.
                </div>

                <button
                  type="button"
                  onClick={craftStabilizationSigil}
                  disabled={!canCraftStabilizationSigil}
                  className="mt-4 w-full rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-left text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stabilizationSigilCrafted
                    ? "Stabilization Sigil Inscribed"
                    : "Craft Stabilization Sigil"}
                  <div className="mt-1 text-xs text-white/60">
                    Costs {RUNE_CRAFTER_STABILIZATION_SIGIL_COST.credits} Credits /{" "}
                    {RUNE_CRAFTER_STABILIZATION_SIGIL_COST.runeDust} Rune Dust /{" "}
                    {RUNE_CRAFTER_STABILIZATION_SIGIL_COST.emberCore} Ember Core
                  </div>
                </button>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {sigilResult ??
                    (stabilizationSigilCrafted
                      ? `Active. Recovery actions now restore +${RUNE_CRAFTER_STABILIZATION_SIGIL_BONUS} extra condition.`
                      : "Inactive. Craft the sigil to turn Rune Crafter output into a real recovery advantage.")}
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
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
