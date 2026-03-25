"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Flame,
  Soup,
  TriangleAlert,
  UtensilsCrossed,
} from "lucide-react";
import SectionCard from "@/components/shared/SectionCard";
import { feastHallOffers } from "@/features/black-market/feastHallData";
import { useGame } from "@/features/game/gameContext";
import type { FeastHallOfferId, ResourceKey } from "@/features/game/gameTypes";
import { useRecoveryCooldown } from "@/features/status/useRecoveryCooldown";

function formatResourceLabel(resource: ResourceKey) {
  if (resource === "bioSamples") {
    return "Bio Samples";
  }

  return resource.charAt(0).toUpperCase() + resource.slice(1);
}

function formatCost(cost: Partial<Record<ResourceKey, number>>) {
  const costEntries = Object.entries(cost).filter(
    (entry): entry is [ResourceKey, number] => typeof entry[1] === "number",
  );

  return costEntries
    .map(([resource, amount]) => `${amount} ${formatResourceLabel(resource)}`)
    .join(" - ");
}

function getConditionTone(condition: number) {
  if (condition < 40) return "critical";
  if (condition < 60) return "strained";
  if (condition < 85) return "stable";
  return "primed";
}

function getConditionMessage(condition: number) {
  if (condition < 40) {
    return "Critical. The next expedition push should begin with recovery, not bravado.";
  }

  if (condition < 60) {
    return "Strained. The Feast Hall is the fastest way to stop the loop from collapsing.";
  }

  if (condition < 85) {
    return "Stable. Recovery is optional, but a stronger plate can still harden the next sortie.";
  }

  return "Primed. Save your salvage unless you want a deliberate Gluttony spike before a run.";
}

function formatHungerEffect(hungerDelta: number) {
  if (hungerDelta === 0) {
    return "No hunger change";
  }

  return hungerDelta > 0 ? `+${hungerDelta} hunger` : `${hungerDelta} hunger`;
}

type FeastHallScreenProps = {
  embedded?: boolean;
};

export default function FeastHallScreen({
  embedded = false,
}: FeastHallScreenProps) {
  const { state, dispatch } = useGame();
  const { player } = state;
  const [serviceFeedback, setServiceFeedback] = useState<string | null>(null);
  const { isRecoveryOnCooldown, recoveryCooldownRemainingSeconds } =
    useRecoveryCooldown(player.conditionRecoveryAvailableAt);
  const conditionTone = getConditionTone(player.condition);

  function canAffordOffer(cost: Partial<Record<ResourceKey, number>>) {
    const costEntries = Object.entries(cost).filter(
      (entry): entry is [ResourceKey, number] => typeof entry[1] === "number",
    );

    return costEntries.every(
      ([resource, amount]) => player.resources[resource] >= amount,
    );
  }

  function handleUseOffer(offerId: FeastHallOfferId) {
    const offer = feastHallOffers.find((entry) => entry.id === offerId);

    if (!offer) {
      setServiceFeedback("Service not recognized. The kitchen rejects the order.");
      return;
    }

    if (player.condition >= 100) {
      setServiceFeedback(
        "Condition already full. Keep your salvage for the next extraction cycle.",
      );
      return;
    }

    if (isRecoveryOnCooldown) {
      setServiceFeedback(
        `Kitchen still cooling down. Next service opens in ${recoveryCooldownRemainingSeconds}s.`,
      );
      return;
    }

    if (!canAffordOffer(offer.cost)) {
      setServiceFeedback(
        `Insufficient payment for ${offer.title}. Secure more credits or salvage first.`,
      );
      return;
    }

    dispatch({ type: "USE_FEAST_HALL_OFFER", payload: { offerId } });
    setServiceFeedback(
      `${offer.title} served: +${offer.conditionGain} condition, ${formatHungerEffect(offer.hungerDelta)}, and a ${Math.ceil(offer.cooldownMs / 1000)}s lockout.`,
    );
  }

  const content = (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Gluttony / Feast Hall"
          description="Book 1's first live Black Market lane: a recovery house where hunger, condition, and salvage are all part of the same decision."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-amber-100/75">
                Neutral Law
              </div>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Deals are sacred in the Black Market. The Feast Hall honors
                that law with fixed terms, clean payment, and no haggling after
                the first bite.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                Peru / Pure
              </div>
              <p className="mt-2 text-sm leading-6 text-white/72">
                The lane draws from the Mouth of Inti and Pure ritual excess,
                but sells survival first: eat now, endure longer, pay in
                credits or salvage.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                Loop Fit
              </div>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Eat in the citadel, steady the body, then return to the front.
                Recovery here is strong, but every plate still burns hunger and
                keeps survival pressure alive.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Operative Readiness"
          description="Live readout from existing condition, hunger, cooldown, and resource state."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Condition
              </div>
              <div className="mt-2 text-3xl font-black uppercase">
                {player.condition}%
              </div>
              <div className="mt-2 text-sm text-white/65">
                {getConditionMessage(player.condition)}
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className={[
                    "h-full rounded-full transition-all",
                    conditionTone === "critical"
                      ? "bg-red-400"
                      : conditionTone === "strained"
                        ? "bg-amber-300"
                        : conditionTone === "stable"
                          ? "bg-emerald-300"
                          : "bg-cyan-300",
                  ].join(" ")}
                  style={{ width: `${player.condition}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                Hall Access
              </div>
              <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                <UtensilsCrossed className="h-5 w-5 text-amber-300" />
                {isRecoveryOnCooldown ? "Kitchen cooling down" : "Kitchen ready"}
              </div>
              <div className="mt-2 text-sm text-white/65">
                {isRecoveryOnCooldown
                  ? `Next contract can begin in ${recoveryCooldownRemainingSeconds}s.`
                  : "No recovery lockout is active. Feast Hall plates restore condition, but richer contracts burn more hunger and make the next decision sharper."}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Credits
                  </div>
                  <div className="mt-1 font-semibold text-white">
                    {player.resources.credits}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Bio Samples
                  </div>
                  <div className="mt-1 font-semibold text-white">
                    {player.resources.bioSamples}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                    Hunger
                  </div>
                  <div className="mt-1 font-semibold text-white">
                    {player.hunger}%
                  </div>
                </div>
              </div>
              {serviceFeedback ? (
                <div className="mt-4 rounded-xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/90">
                  {serviceFeedback}
                </div>
              ) : null}
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {feastHallOffers.map((offer) => {
          const affordable = canAffordOffer(offer.cost);
          const disabled =
            isRecoveryOnCooldown || !affordable || player.condition >= 100;
          const isRecommended =
            !isRecoveryOnCooldown &&
            player.condition < 60 &&
            ((offer.id === "sample-stew" &&
              player.resources.credits < 10 &&
              player.resources.bioSamples >= 4) ||
              (offer.id === "scavenger-broth" &&
                player.resources.credits >= 10) ||
              (offer.id === "mouth-of-inti" &&
                player.condition < 35 &&
                affordable));

          return (
            <SectionCard
              key={offer.id}
              title={offer.title}
              description={offer.description}
            >
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
                    <div>
                      <div className="font-semibold text-white">Cost</div>
                      <div className="mt-1 text-white/65">
                        {formatCost(offer.cost)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <Flame className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <div>
                      <div className="font-semibold text-white">Effect</div>
                      <div className="mt-1 text-white/65">
                        Restore {offer.conditionGain} condition,{" "}
                        {formatHungerEffect(offer.hungerDelta)}, and set a{" "}
                        {Math.ceil(offer.cooldownMs / 1000)}s hall cooldown.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 text-amber-200" />
                    <div>
                      <div className="font-semibold text-white">Tradeoff</div>
                      <div className="mt-1 text-white/65">
                        {offer.riskNote}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-white/58">
                  {offer.useCase}
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
                  {player.condition >= 100
                    ? "Condition already full"
                    : isRecoveryOnCooldown
                      ? `Kitchen locked for ${recoveryCooldownRemainingSeconds}s`
                      : affordable
                        ? `Take ${offer.title}`
                        : "Insufficient payment"}
                </button>
              </div>
            </SectionCard>
          );
        })}
      </section>
    </>
  );

  if (embedded) {
    return content;
  }

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
