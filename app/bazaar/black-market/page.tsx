"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Flame, Wallet } from "lucide-react";
import { useGame } from "@/features/game/gameContext";

const FEAST_HALL_CREDIT_COST = 40;
const FEAST_HALL_SAMPLE_COST = 2;
const FEAST_HALL_CONDITION_GAIN = 12;
const FEAST_HALL_INFLUENCE_GAIN = 1;

export default function BlackMarketPage() {
  const { state, dispatch } = useGame();
  const [laneResult, setLaneResult] = useState<string | null>(null);

  const { credits, bioSamples } = state.player.resources;
  const canRunFeastHallLane =
    credits >= FEAST_HALL_CREDIT_COST && bioSamples >= FEAST_HALL_SAMPLE_COST;

  function runFeastHallLane() {
    if (!canRunFeastHallLane) {
      setLaneResult("Need 40 Credits and 2 Bio Samples to run this lane.");
      return;
    }

    dispatch({
      type: "SPEND_RESOURCE",
      payload: { key: "credits", amount: FEAST_HALL_CREDIT_COST },
    });
    dispatch({
      type: "SPEND_RESOURCE",
      payload: { key: "bioSamples", amount: FEAST_HALL_SAMPLE_COST },
    });
    dispatch({
      type: "ADJUST_CONDITION",
      payload: FEAST_HALL_CONDITION_GAIN,
    });
    dispatch({
      type: "ADD_INFLUENCE",
      payload: FEAST_HALL_INFLUENCE_GAIN,
    });

    setLaneResult(
      "Feast Hall lane completed: +12 Condition and +1 Influence.",
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(110,10,45,0.22),rgba(5,8,18,1)_55%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-rose-300/70">
              Bazaar / Black Market
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Feast Hall
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              First active lane: buy a fast recovery feast through smugglers.
            </p>
          </div>

          <Link
            href="/bazaar"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-rose-400/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bazaar
          </Link>
        </div>

        <section className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <Flame className="h-5 w-5 text-rose-200" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-rose-200/80">
                Lane 01
              </div>
              <h2 className="mt-1 text-xl font-black uppercase">
                Smuggler Feast Run
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Spend Credits + Bio Samples to run one feast cycle.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={runFeastHallLane}
            disabled={!canRunFeastHallLane}
            className="mt-5 w-full rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-left text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Run Feast Hall Lane
            <div className="mt-1 text-xs text-white/65">
              Costs 40 Credits + 2 Bio Samples / Grants +12 Condition +1 Influence
            </div>
          </button>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/80">
            {laneResult ?? "Lane idle. Run once whenever you can afford it."}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            <span className="inline-flex items-center gap-2 text-white/75">
              <Wallet className="h-4 w-4 text-rose-200" /> Credits
            </span>
            <span className="font-semibold">{credits}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
            <span className="text-white/75">Bio Samples</span>
            <span className="font-semibold">{bioSamples}</span>
          </div>
        </section>
      </div>
    </main>
  );
}
