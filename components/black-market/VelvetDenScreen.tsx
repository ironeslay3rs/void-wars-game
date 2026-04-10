"use client";

import { useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import BrokerCard from "@/components/shared/BrokerCard";
import OpenFaceLink from "@/components/schools/OpenFaceLink";
import { getBrokersByDistrict } from "@/features/lore/brokerData";
import { resourceCostShortfall } from "@/features/black-market/sinLaneDealHelpers";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey } from "@/features/game/gameTypes";
import { getAstarteVeilTaxMultiplier } from "@/features/institutions/institutionalPressure";

type Deal = {
  id: string;
  title: string;
  lore: string;
  cost: { credits?: number; bioSamples?: number };
  grant: { condition?: number; hunger?: number };
};

const DEALS: Deal[] = [
  {
    id: "hunger-sate",
    title: "Hunger Sate",
    lore: "Satisfy the flesh. The Velvet Den feeds what the void starves. No questions asked.",
    cost: { credits: 60 },
    grant: { hunger: 50 },
  },
  {
    id: "desire-binding",
    title: "Desire Binding",
    lore: "A will contract. Your desire becomes their binding. Their strength — yours.",
    cost: { credits: 100 },
    grant: { condition: 15, hunger: 25 },
  },
  {
    id: "flesh-contract",
    title: "Flesh Contract",
    lore: "Trade a measure of biomass for the warmth it carries. The body remembers even when the mind forgets.",
    cost: { credits: 40, bioSamples: 3 },
    grant: { hunger: 30, condition: 5 },
  },
];

function formatCost(cost: Deal["cost"]): string {
  return Object.entries(cost)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => (k === "credits" ? `${v} Credits` : `${v} Bio Samples`))
    .join(" + ");
}

function formatGrant(grant: Deal["grant"]): string[] {
  const lines: string[] = [];
  if (grant.condition) lines.push(`+${grant.condition} Condition`);
  if (grant.hunger) lines.push(`+${grant.hunger} Hunger`);
  return lines;
}

export default function VelvetDenScreen() {
  const { state, dispatch } = useGame();
  const [toast, setToast] = useState<string | null>(null);
  const credits = state.player.resources.credits ?? 0;
  const bioSamples = state.player.resources.bioSamples ?? 0;

  // Astarte Veil cleansing tax: every Velvet Den deal pays a small Veil
  // surcharge on top of the listed cost. Bio-aligned operatives pay the
  // smallest premium because the Veil is their institution.
  const veilTaxMult = getAstarteVeilTaxMultiplier(state.player.factionAlignment);

  function adjustedCost(cost: Deal["cost"]): Deal["cost"] {
    return {
      credits:
        cost.credits !== undefined
          ? Math.ceil(cost.credits * veilTaxMult)
          : undefined,
      bioSamples:
        cost.bioSamples !== undefined
          ? Math.ceil(cost.bioSamples * veilTaxMult)
          : undefined,
    };
  }

  function canAfford(cost: Deal["cost"]) {
    const adj = adjustedCost(cost);
    if ((adj.credits ?? 0) > credits) return false;
    if ((adj.bioSamples ?? 0) > bioSamples) return false;
    return true;
  }

  function handlePurchase(deal: Deal) {
    if (!canAfford(deal.cost)) return;
    // Atomic STRIKE_BLACK_MARKET_DEAL — Astarte Veil cleansing tax has
    // already been applied to the cost in the screen's `adjustedCost`
    // helper. Reducer just spends + grants.
    const adj = adjustedCost(deal.cost);
    dispatch({
      type: "STRIKE_BLACK_MARKET_DEAL",
      payload: {
        dealId: `velvet-${deal.id}`,
        costs: adj as Partial<Record<ResourceKey, number>>,
        conditionGain: deal.grant.condition,
        hungerGain: deal.grant.hunger,
      },
    });
    setToast(`${deal.title} — fulfilled (Veil cleansing tax applied).`);
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(100,20,60,0.22),_rgba(5,8,18,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <BazaarSubpageNav
          accentClassName="hover:border-rose-300/40"
          backHref="/bazaar/black-market"
          backLabel="Back to Black Market"
        />

        <ScreenHeader
          eyebrow="Black Market / Lust Lane"
          title="Velvet Den"
          subtitle="Pay for presence. Desire costs extra. The Den feeds every hunger the void creates."
        />

        <OpenFaceLink laneId="velvet-den" />

        {toast && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
            {toast}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {DEALS.map((deal) => {
            const affordable = canAfford(deal.cost);
            const grants = formatGrant(deal.grant);
            const adjCost = adjustedCost(deal.cost);
            return (
              <div
                key={deal.id}
                className="flex flex-col rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5"
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-rose-400/70">
                  Lust Lane
                </div>
                <h3 className="mt-2 text-lg font-black text-white">{deal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                  {deal.lore}
                </p>
                <div className="mt-4 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Cost</div>
                  <div className="text-sm text-amber-200">{formatCost(adjCost)}</div>
                  {veilTaxMult > 1 ? (
                    <div className="text-[9px] text-rose-200/65">
                      Veil cleansing tax ×{veilTaxMult.toFixed(2)}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {grants.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-rose-500/25 bg-rose-500/10 px-2.5 py-1 text-[10px] text-rose-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => handlePurchase(deal)}
                  className="mt-4 h-10 w-full rounded-xl border border-rose-400/35 bg-rose-500/15 text-xs font-black uppercase tracking-[0.14em] text-rose-200 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {affordable ? "Fulfill Desire" : "Insufficient Funds"}
                </button>
                {!affordable ? (
                  <p className="mt-2 text-[10px] leading-snug text-rose-200/80">
                    {resourceCostShortfall(
                      deal.cost as Partial<Record<ResourceKey, number>>,
                      state.player.resources,
                    )}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        {getBrokersByDistrict("velvet-den").length > 0 ? (
          <div className="mt-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Brokers</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {getBrokersByDistrict("velvet-den").map((b) => (
                <BrokerCard key={b.id} broker={b} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
