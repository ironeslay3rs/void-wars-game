"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/features/game/gameContext";
import {
  CRAFT_WORK_ORDER_ROTATION_PERIOD_MS,
  getCraftWorkOrderById,
  getRotatingWorkOrderCatalog,
  type CraftWorkOrderDefinition,
} from "@/features/economy/craftWorkOrderData";
import { getStallArrearsPayoffTotal } from "@/features/economy/stallUpkeep";

function rewardSummary(def: CraftWorkOrderDefinition): string {
  const parts: string[] = [`${def.rewardCredits} credits`];
  if (def.rewardResources) {
    for (const [k, v] of Object.entries(def.rewardResources)) {
      if (typeof v === "number" && v > 0) {
        parts.push(`+${v} ${k}`);
      }
    }
  }
  return parts.join(" · ");
}

function targetSummary(def: CraftWorkOrderDefinition): string {
  if (def.kind === "recipe") {
    return `Console recipe "${def.targetRecipeId}" × ${def.targetCount} successful craft${def.targetCount === 1 ? "" : "s"}`;
  }
  return `District moss bind × ${def.targetCount}`;
}

const ROTATION_REFRESH_MS = 60_000;
const rotationDays = CRAFT_WORK_ORDER_ROTATION_PERIOD_MS / (24 * 60 * 60 * 1000);

export default function CraftWorkOrderPanel() {
  const { state, dispatch } = useGame();
  const active = state.player.craftWorkOrder;
  const activeDef = active ? getCraftWorkOrderById(active.definitionId) : null;
  const arrears = state.player.stallArrearsCount ?? 0;
  const payoff = getStallArrearsPayoffTotal(arrears);
  const credits = state.player.resources.credits;
  const canPayArrears = arrears > 0 && credits >= payoff;

  const [catalogNow, setCatalogNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setCatalogNow(Date.now()), ROTATION_REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const catalog = useMemo(
    () => getRotatingWorkOrderCatalog(catalogNow),
    [catalogNow],
  );

  return (
    <div className="rounded-2xl border border-amber-400/22 bg-amber-950/12 p-6">
      <div className="text-[11px] uppercase tracking-[0.22em] text-amber-200/70">
        Phase 4 · Broker work order
      </div>
      <h2 className="mt-2 text-lg font-black uppercase tracking-[0.06em] text-white">
        District contracts
      </h2>
      <p className="mt-2 text-sm text-white/65">
        One active quota at a time. Progress counts successful crafts from the console or moss
        binds from the kitchen flow. Claim pays credits (+ cargo when noted). The board shows{" "}
        <span className="font-semibold text-amber-100/90">three offers</span> that rotate on a{" "}
        <span className="font-semibold text-amber-100/90">{rotationDays}-day</span> wall-clock
        epoch.
      </p>

      {arrears > 0 ? (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-950/20 px-4 py-3 text-sm text-red-100/90">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-200/80">
            Stall arrears — contracts locked
          </div>
          <p className="mt-2 text-xs leading-relaxed text-red-100/85">
            The broker will not issue new work orders until arrears are cleared ({payoff}{" "}
            credits). Pay from the stall banner on this page or at the War Exchange.
          </p>
          <button
            type="button"
            disabled={!canPayArrears}
            onClick={() => dispatch({ type: "PAY_STALL_ARREARS" })}
            className="mt-3 rounded-lg border border-red-300/35 bg-red-500/12 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-red-50 hover:border-red-200/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Pay {payoff} credits
          </button>
        </div>
      ) : null}

      {active && activeDef ? (
        <div className="mt-4 rounded-xl border border-amber-300/35 bg-black/30 p-4">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-amber-100">
            Active: {activeDef.title}
          </div>
          <p className="mt-2 text-sm text-white/70">{activeDef.blurb}</p>
          <div className="mt-2 text-xs text-white/55">{targetSummary(activeDef)}</div>
          <div className="mt-2 text-sm font-semibold text-white">
            Progress: {active.progress} / {activeDef.targetCount}
          </div>
          <div className="mt-1 text-xs text-emerald-200/85">
            Payout: {rewardSummary(activeDef)}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {active.progress >= activeDef.targetCount ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "CLAIM_CRAFT_WORK_ORDER" })}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100 hover:border-emerald-300/60"
              >
                Claim payout
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dispatch({ type: "ABANDON_CRAFT_WORK_ORDER" })}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 hover:border-white/25"
            >
              Abandon order
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-1 md:grid-cols-3">
          {catalog.map((def) => {
            const locked = arrears > 0;
            return (
              <div
                key={def.id}
                className="rounded-xl border border-white/12 bg-black/25 p-4"
              >
                <div className="text-sm font-bold text-white">{def.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-white/60">{def.blurb}</p>
                <div className="mt-2 text-[11px] text-white/50">{targetSummary(def)}</div>
                <div className="mt-2 text-[11px] text-emerald-200/80">
                  {rewardSummary(def)}
                </div>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() =>
                    dispatch({
                      type: "ACCEPT_CRAFT_WORK_ORDER",
                      payload: { definitionId: def.id },
                    })
                  }
                  className="mt-3 w-full rounded-lg border border-amber-300/35 bg-amber-500/12 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-50 hover:border-amber-200/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {locked ? "Clear arrears first" : "Accept order"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
