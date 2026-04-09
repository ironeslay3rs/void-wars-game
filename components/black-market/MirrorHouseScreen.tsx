"use client";

import { useState } from "react";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import BrokerCard from "@/components/shared/BrokerCard";
import { getBrokersByDistrict } from "@/features/lore/brokerData";
import { resourceCostShortfall } from "@/features/black-market/sinLaneDealHelpers";
import { useGame } from "@/features/game/gameContext";
import type { ResourceKey } from "@/features/game/gameTypes";

type Deal = {
  id: string;
  title: string;
  lore: string;
  cost: { credits?: number; runeDust?: number; bioSamples?: number };
  grant: { condition?: number; hunger?: number; runeDust?: number; bioSamples?: number; emberCore?: number };
};

const DEALS: Deal[] = [
  {
    id: "fabricate-mask",
    title: "Fabricate Mask",
    lore: "A false face sourced from the dead. Your stats read clean to any scanner for 6 cycles.",
    cost: { credits: 80 },
    grant: { condition: 10 },
  },
  {
    id: "identity-bleed",
    title: "Identity Bleed",
    lore: "Drain another's resonance print. Their loss becomes your raw material.",
    cost: { credits: 50, runeDust: 5 },
    grant: { emberCore: 5, bioSamples: 5 },
  },
  {
    id: "persona-loan",
    title: "Persona Loan",
    lore: "Borrow a stronger identity. Borrowed strength heals borrowed wounds.",
    cost: { credits: 120 },
    grant: { condition: 20, hunger: 10 },
  },
];

function formatCost(cost: Deal["cost"]): string {
  return Object.entries(cost)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) =>
      k === "credits" ? `${v} Credits` : k === "runeDust" ? `${v} Rune Dust` : `${v} Bio Samples`,
    )
    .join(" + ");
}

function formatGrant(grant: Deal["grant"]): string[] {
  const lines: string[] = [];
  if (grant.condition) lines.push(`+${grant.condition} Condition`);
  if (grant.hunger) lines.push(`+${grant.hunger} Hunger`);
  if (grant.runeDust) lines.push(`+${grant.runeDust} Rune Dust`);
  if (grant.bioSamples) lines.push(`+${grant.bioSamples} Bio Samples`);
  if (grant.emberCore) lines.push(`+${grant.emberCore} Ember Core`);
  return lines;
}

export default function MirrorHouseScreen() {
  const { state, dispatch } = useGame();
  const [toast, setToast] = useState<string | null>(null);
  const credits = state.player.resources.credits ?? 0;
  const runeDust = state.player.resources.runeDust ?? 0;
  const bioSamples = state.player.resources.bioSamples ?? 0;

  function canAfford(cost: Deal["cost"]) {
    if ((cost.credits ?? 0) > credits) return false;
    if ((cost.runeDust ?? 0) > runeDust) return false;
    if ((cost.bioSamples ?? 0) > bioSamples) return false;
    return true;
  }

  function handlePurchase(deal: Deal) {
    if (!canAfford(deal.cost)) return;
    if (deal.cost.credits) dispatch({ type: "ADD_RESOURCE", payload: { key: "credits", amount: -deal.cost.credits } });
    if (deal.cost.runeDust) dispatch({ type: "ADD_RESOURCE", payload: { key: "runeDust", amount: -deal.cost.runeDust } });
    if (deal.cost.bioSamples) dispatch({ type: "ADD_RESOURCE", payload: { key: "bioSamples", amount: -deal.cost.bioSamples } });
    if (deal.grant.condition) dispatch({ type: "ADJUST_CONDITION", payload: deal.grant.condition });
    if (deal.grant.hunger) dispatch({ type: "ADJUST_HUNGER", payload: deal.grant.hunger });
    if (deal.grant.runeDust) dispatch({ type: "ADD_RESOURCE", payload: { key: "runeDust", amount: deal.grant.runeDust } });
    if (deal.grant.bioSamples) dispatch({ type: "ADD_RESOURCE", payload: { key: "bioSamples", amount: deal.grant.bioSamples } });
    if (deal.grant.emberCore) dispatch({ type: "ADD_RESOURCE", payload: { key: "emberCore", amount: deal.grant.emberCore } });
    setToast(`${deal.title} — deal struck.`);
    window.setTimeout(() => setToast(null), 3000);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,100,80,0.22),_rgba(5,8,18,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
        <BazaarSubpageNav
          accentClassName="hover:border-teal-300/40"
          backHref="/bazaar/black-market"
          backLabel="Back to Black Market"
        />

        <ScreenHeader
          eyebrow="Black Market / Envy Lane"
          title="Mirror House"
          subtitle="Buy another's face. Sell your own. Identity is the oldest currency in the waste."
        />

        {toast && (
          <div className="rounded-2xl border border-teal-400/30 bg-teal-500/10 px-5 py-4 text-sm text-teal-100">
            {toast}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          {DEALS.map((deal) => {
            const affordable = canAfford(deal.cost);
            const grants = formatGrant(deal.grant);
            return (
              <div
                key={deal.id}
                className="flex flex-col rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5"
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-teal-400/70">
                  Envy Lane
                </div>
                <h3 className="mt-2 text-lg font-black text-white">{deal.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                  {deal.lore}
                </p>
                <div className="mt-4 space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Cost</div>
                  <div className="text-sm text-amber-200">{formatCost(deal.cost)}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {grants.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-teal-500/25 bg-teal-500/10 px-2.5 py-1 text-[10px] text-teal-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => handlePurchase(deal)}
                  className="mt-4 h-10 w-full rounded-xl border border-teal-400/35 bg-teal-500/15 text-xs font-black uppercase tracking-[0.14em] text-teal-200 transition hover:bg-teal-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {affordable ? "Strike Deal" : "Insufficient Funds"}
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
        {getBrokersByDistrict("mirror-house").length > 0 ? (
          <div className="mt-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Brokers</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {getBrokersByDistrict("mirror-house").map((b) => (
                <BrokerCard key={b.id} broker={b} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
