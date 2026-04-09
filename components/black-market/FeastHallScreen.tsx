"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Flame, Soup, TriangleAlert } from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import OpenFaceLink from "@/components/schools/OpenFaceLink";
import FeastHallBrokers from "@/components/black-market/feast-hall/FeastHallBrokers";
import FeastHallLoreCards from "@/components/black-market/feast-hall/FeastHallLoreCards";
import OperativeReadiness from "@/components/black-market/feast-hall/OperativeReadiness";
import { feastHallOffers } from "@/features/black-market/feastHallData";
import { resourceCostShortfall } from "@/features/black-market/sinLaneDealHelpers";
import { useGame } from "@/features/game/gameContext";
import { formatResourceLabel } from "@/features/game/gameFeedback";
import type { FeastHallOfferId, ResourceKey } from "@/features/game/gameTypes";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";

function formatCost(cost: Partial<Record<ResourceKey, number>>) {
  return Object.entries(cost)
    .filter((e): e is [ResourceKey, number] => typeof e[1] === "number")
    .map(([r, a]) => `${a} ${formatResourceLabel(r)}`)
    .join(" · ");
}

function formatHungerEffect(d: number) {
  return d === 0 ? "No hunger change" : d > 0 ? `+${d} hunger` : `${d} hunger`;
}

type FeastHallScreenProps = { embedded?: boolean };

export default function FeastHallScreen({ embedded = false }: FeastHallScreenProps) {
  const { state, dispatch } = useGame();
  const { player } = state;
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);
  const { isRecoveryOnCooldown, recoveryCooldownRemainingSeconds } =
    useRecoveryCooldown(player.conditionRecoveryAvailableAt);

  function canAffordOffer(cost: Partial<Record<ResourceKey, number>>) {
    return Object.entries(cost)
      .filter((e): e is [ResourceKey, number] => typeof e[1] === "number")
      .every(([r, a]) => player.resources[r] >= a);
  }

  function handleUseOffer(offerId: FeastHallOfferId) {
    const offer = feastHallOffers.find((e) => e.id === offerId);
    if (!offer) { setServiceFeedback("Service not recognized."); return; }
    if (player.condition >= 100) { setServiceFeedback("Condition already full."); return; }
    if (isRecoveryOnCooldown) { setServiceFeedback(`Kitchen cooling down. ${recoveryCooldownRemainingSeconds}s.`); return; }
    if (!canAffordOffer(offer.cost)) { setServiceFeedback(`Insufficient payment for ${offer.title}.`); return; }
    dispatch({ type: "USE_FEAST_HALL_OFFER", payload: { offerId } });
    setServiceFeedback(
      `${offer.title} served: +${offer.conditionGain} condition, ${formatHungerEffect(offer.hungerDelta)}, ${Math.ceil(offer.cooldownMs / 1000)}s lockout.`,
    );
  }

  const content = (
    <div className="flex flex-col gap-8">
      <div>
        <OpenFaceLink laneId="feast-hall" />
      </div>

      {/* Brokers FIRST — Mama Sol + Lars visible immediately */}
      <FeastHallBrokers />

      {/* Two-column: Lore | Readiness */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FeastHallLoreCards />
        <OperativeReadiness serviceFeedback={serviceFeedback} />
      </div>

      {/* Meal cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {feastHallOffers.map((offer) => {
          const affordable = canAffordOffer(offer.cost);
          const disabled = isRecoveryOnCooldown || !affordable || player.condition >= 100;
          const isRecommended =
            !isRecoveryOnCooldown && player.condition < 60 &&
            ((offer.id === "sample-stew" && player.resources.credits < 10 && player.resources.bioSamples >= 4) ||
             (offer.id === "scavenger-broth" && player.resources.credits >= 10) ||
             (offer.id === "mouth-of-inti" && player.condition < 35 && affordable));

          return (
            <SectionCard key={offer.id} title={offer.title} description={offer.description}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100">
                    {offer.label}
                  </span>
                  {isRecommended ? (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/72">
                  {offer.lore}
                </div>

                <div className="grid gap-3 text-sm text-white/75">
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <Soup className="mt-0.5 h-4 w-4 text-amber-300" />
                    <div><div className="font-semibold text-white">Cost</div><div className="mt-1 text-white/65">{formatCost(offer.cost)}</div></div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <Flame className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div><div className="font-semibold text-white">Immediate</div><div className="mt-1 text-white/65">Restore {offer.conditionGain} condition, {formatHungerEffect(offer.hungerDelta)}, {Math.ceil(offer.cooldownMs / 1000)}s lockout.</div></div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-200" />
                    <div><div className="font-semibold text-white">Tradeoff</div><div className="mt-1 text-white/65">{offer.riskNote}</div></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleUseOffer(offer.id)}
                  disabled={disabled}
                  className={[
                    "w-full rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition",
                    disabled
                      ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30"
                      : "border-amber-300/35 bg-amber-300/12 text-amber-50 hover:border-amber-200/50 hover:bg-amber-300/18",
                  ].join(" ")}
                >
                  {player.condition >= 100 ? "Condition full"
                    : isRecoveryOnCooldown ? `Locked ${recoveryCooldownRemainingSeconds}s`
                    : affordable ? `Take ${offer.title}`
                    : "Insufficient payment"}
                </button>
                {!affordable && !isRecoveryOnCooldown && player.condition < 100 ? (
                  <p className="mt-2 text-[11px] leading-snug text-rose-200/80">
                    {resourceCostShortfall(offer.cost, player.resources)}
                  </p>
                ) : null}
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,110,30,0.24),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex justify-end">
          <Link
            href="/bazaar/black-market"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Black Market
          </Link>
        </div>
        {content}
      </div>
    </main>
  );
}
