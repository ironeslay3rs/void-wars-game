"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChefHat, Coins, HeartPulse } from "lucide-react";
import { useGame } from "@/features/game/gameContext";

type FeastOffer = {
  id: "broth" | "platter";
  name: string;
  cost: number;
  conditionGain: number;
  note: string;
};

const feastOffers: FeastOffer[] = [
  {
    id: "broth",
    name: "Smuggler Broth",
    cost: 15,
    conditionGain: 8,
    note: "Fast recovery for field crews.",
  },
  {
    id: "platter",
    name: "Glutton Plate",
    cost: 30,
    conditionGain: 18,
    note: "Heavier meal with stronger rebound.",
  },
];

export default function FeastHallPage() {
  const { state, dispatch } = useGame();
  const [notice, setNotice] = useState<string>("Pick an order to restore condition.");

  const credits = state.player.resources.credits;
  const condition = state.player.condition;

  const canRecover = useMemo(() => condition < 100, [condition]);

  function buyOffer(offer: FeastOffer) {
    if (credits < offer.cost) {
      setNotice(`Not enough credits for ${offer.name}.`);
      return;
    }

    if (!canRecover) {
      setNotice("Condition is already full.");
      return;
    }

    dispatch({ type: "SPEND_RESOURCE", payload: { key: "credits", amount: offer.cost } });
    dispatch({ type: "ADJUST_CONDITION", payload: offer.conditionGain });
    setNotice(`${offer.name} served: +${offer.conditionGain} condition.`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(130,70,0,0.22),rgba(5,8,18,1)_60%)] px-6 py-8 text-white md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-amber-300/75">
              Black Market / Gluttony Lane
            </div>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.04em]">
              Feast Hall
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Load-bearing Book 1 slice: spend credits for direct condition
              recovery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bazaar/black-market"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/40 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Black Market
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          {feastOffers.map((offer) => {
            const disabled = credits < offer.cost || !canRecover;

            return (
              <button
                key={offer.id}
                type="button"
                onClick={() => buyOffer(offer)}
                disabled={disabled}
                className="rounded-2xl border border-amber-300/20 bg-amber-500/5 p-5 text-left transition hover:border-amber-300/40 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.08em]">
                      {offer.name}
                    </h2>
                    <p className="mt-2 text-sm text-white/70">{offer.note}</p>
                  </div>

                  <ChefHat className="h-5 w-5 text-amber-300" />
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-white/75">
                  <span className="inline-flex items-center gap-1">
                    <Coins className="h-4 w-4 text-amber-300" /> {offer.cost}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HeartPulse className="h-4 w-4 text-emerald-300" /> +
                    {offer.conditionGain}
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              Credits: <span className="font-semibold text-amber-200">{credits}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              Condition: <span className="font-semibold text-emerald-200">{condition}</span>/100
            </div>
          </div>

          <p className="mt-3 text-white/70">{notice}</p>
        </section>
      </div>
    </main>
  );
}
