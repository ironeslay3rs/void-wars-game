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

type Deal = {
  id: string;
  title: string;
  lore: string;
  cost: { credits?: number; runeDust?: number };
  grant: { condition?: number; runeDust?: number; emberCore?: number };
};

const DEALS: Deal[] = [
  {
    id: "prestige-mark",
    title: "Prestige Mark",
    lore: "The pride of the ascended heals what ordinary medicine cannot. Status becomes stamina.",
    cost: { credits: 200 },
    grant: { condition: 15 },
  },
  {
    id: "secrets-archive",
    title: "Secrets Archive",
    lore: "Distilled knowledge from those who ascended before you. Their ambition, now yours.",
    cost: { credits: 150, runeDust: 5 },
    grant: { emberCore: 10 },
  },
  {
    id: "status-protocol",
    title: "Status Protocol",
    lore: "A full ritual of ascension rites. Expensive. Transformative. Worth every credit.",
    cost: { credits: 300 },
    grant: { condition: 8, runeDust: 8, emberCore: 5 },
  },
];

function formatCost(cost: Deal["cost"]): string {
  return Object.entries(cost)
    .filter(([, v]) => v && v > 0)
    .map(([k, v]) => (k === "credits" ? `${v} Credits` : `${v} Rune Dust`))
    .join(" + ");
}

function formatGrant(grant: Deal["grant"]): string[] {
  const lines: string[] = [];
  if (grant.condition) lines.push(`+${grant.condition} Condition`);
  if (grant.runeDust) lines.push(`+${grant.runeDust} Rune Dust`);
  if (grant.emberCore) lines.push(`+${grant.emberCore} Ember Core`);
  return lines;
}

export default function IvoryTowerScreen() {
  const { state, dispatch } = useGame();
  const [toast, setToast] = useState<string | null>(null);
  const credits = state.player.resources.credits ?? 0;
  const runeDust = state.player.resources.runeDust ?? 0;
  const mythic = state.player.mythicAscension;
  const ivoryValorAffordable =
    mythic.convergencePrimed &&
    mythic.runeKnightValor >= 4 &&
    credits >= 120;

  function canAfford(cost: Deal["cost"]) {
    if ((cost.credits ?? 0) > credits) return false;
    if ((cost.runeDust ?? 0) > runeDust) return false;
    return true;
  }

  function handlePurchase(deal: Deal) {
    if (!canAfford(deal.cost)) return;
    if (deal.cost.credits) dispatch({ type: "ADD_RESOURCE", payload: { key: "credits", amount: -deal.cost.credits } });
    if (deal.cost.runeDust) dispatch({ type: "ADD_RESOURCE", payload: { key: "runeDust", amount: -deal.cost.runeDust } });
    if (deal.grant.condition) dispatch({ type: "ADJUST_CONDITION", payload: deal.grant.condition });
    if (deal.grant.runeDust) dispatch({ type: "ADD_RESOURCE", payload: { key: "runeDust", amount: deal.grant.runeDust } });
    if (deal.grant.emberCore) dispatch({ type: "ADD_RESOURCE", payload: { key: "emberCore", amount: deal.grant.emberCore } });
    setToast(`${deal.title} — ascension recorded.`);
    window.setTimeout(() => setToast(null), 3000);
  }

  function handleKnightPrestigeRite() {
    if (!ivoryValorAffordable) return;
    dispatch({
      type: "REDEEM_RUNE_KNIGHT_VALOR",
      payload: "ivory-prestige-rite",
    });
    setToast("Knight prestige rite — pride buys condition under seal.");
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <main className="safe-min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,100,20,0.22),_rgba(5,8,18,1)_58%)] px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-[max(1.5rem,env(safe-area-inset-top,0px))] text-white sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:gap-8">
        <BazaarSubpageNav
          accentClassName="hover:border-yellow-300/40"
          backHref="/bazaar/black-market"
          backLabel="Back to Black Market"
        />

        <ScreenHeader
          eyebrow="Black Market / Pride Lane"
          title="Ivory Tower"
          subtitle="Ascend, or be consumed by the gap. The Tower sells what lesser vaults cannot hold."
        />

        <OpenFaceLink laneId="ivory-tower" />

        {toast && (
          <div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-100">
            {toast}
          </div>
        )}

        {mythic.convergencePrimed ? (
          <div className="rounded-2xl border border-amber-400/30 bg-[linear-gradient(135deg,rgba(80,60,10,0.35),rgba(12,10,8,0.85))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300/80">
              Knight channel — convergence filed
            </div>
            <h3 className="mt-2 text-lg font-black text-white">Knight prestige rite</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Spend Rune Knight valor and credits together. The Tower records the exchange — no free
              glory.
            </p>
            <div className="mt-4 space-y-1">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Cost</div>
              <div className="text-sm text-amber-200">
                4 Knight valor · 120 credits
              </div>
              <div className="text-[11px] text-white/45">
                You hold {mythic.runeKnightValor} valor · {credits.toLocaleString()} credits
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-100">
                +15 Condition (capped 100)
              </span>
            </div>
            <button
              type="button"
              disabled={!ivoryValorAffordable}
              onClick={handleKnightPrestigeRite}
              className="mt-4 min-h-[44px] w-full touch-manipulation rounded-xl border border-amber-400/45 bg-amber-500/20 text-xs font-black uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 sm:max-w-md"
            >
              {ivoryValorAffordable ? "Record rite" : "Need 4 valor and 120 credits"}
            </button>
            {!ivoryValorAffordable ? (
              <p className="mt-2 text-[11px] leading-snug text-rose-200/80">
                {[
                  mythic.runeKnightValor < 4
                    ? `Knight valor ${mythic.runeKnightValor}/4`
                    : null,
                  credits < 120 ? `Credits ${credits}/120` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white/55">
            Knight valor rites unlock after Convergence is filed (Career → Mythic ladder).
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {DEALS.map((deal) => {
            const affordable = canAfford(deal.cost);
            const grants = formatGrant(deal.grant);
            return (
              <div
                key={deal.id}
                className="flex flex-col rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5"
              >
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-400/70">
                  Pride Lane
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
                      className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-1 text-[10px] text-yellow-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={!affordable}
                  onClick={() => handlePurchase(deal)}
                  className="mt-4 min-h-[44px] w-full touch-manipulation rounded-xl border border-yellow-400/35 bg-yellow-500/15 text-xs font-black uppercase tracking-[0.14em] text-yellow-200 transition hover:bg-yellow-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {affordable ? "Ascend" : "Insufficient Funds"}
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
        {getBrokersByDistrict("ivory-tower").length > 0 ? (
          <div className="mt-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Brokers</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {getBrokersByDistrict("ivory-tower").map((b) => (
                <BrokerCard key={b.id} broker={b} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
