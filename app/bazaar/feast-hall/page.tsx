"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import {
  canAffordFeastOffer,
  feastHallOffers,
  feastHallScreenData,
  formatFeastCost,
} from "@/features/black-market/feastHallData";
import { useGame } from "@/features/game/gameContext";

function getSummaryTone(condition: number, hasActiveProvision: boolean) {
  if (hasActiveProvision) return "ready" as const;
  if (condition <= 35) return "critical" as const;
  if (condition <= 60) return "warning" as const;
  return "neutral" as const;
}

export default function FeastHallPage() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const hasActiveProvision = player.activeProvision !== null;

  const summaryTitle = hasActiveProvision
    ? `${player.activeProvision?.title} is packed for the next expedition.`
    : player.condition <= 60
      ? "Condition is slipping. The hall can convert resources into immediate readiness."
      : "The hall is quiet, but one sanctioned indulgence can still harden the next run.";

  const summaryConsequence = hasActiveProvision
    ? `Your next expedition will absorb ${player.activeProvision?.conditionMitigation ?? 0} condition loss before the contract burns out.`
    : "Feast Hall contracts restore condition now and reduce pressure on the next expedition. Only one contract can be carried at a time.";

  function handlePurchase(offerId: (typeof feastHallOffers)[number]["id"]) {
    dispatch({
      type: "PURCHASE_FEAST_OFFER",
      payload: { offerId },
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(140,90,24,0.24),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={feastHallScreenData.eyebrow}
          title={feastHallScreenData.title}
          subtitle={feastHallScreenData.subtitle}
        />

        <ScreenStateSummary
          eyebrow="Gluttony Lane Status"
          title={summaryTitle}
          consequence={summaryConsequence}
          nextStep={hasActiveProvision ? "Launch an expedition to cash in the meal contract." : "Choose one contract that matches your current credits and sample pressure."}
          tone={getSummaryTone(player.condition, hasActiveProvision)}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-amber-300/15 bg-amber-500/10 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-amber-100/60">Condition</div>
            <div className="mt-3 text-3xl font-black text-white">{player.condition}%</div>
            <p className="mt-2 text-sm text-white/65">The Feast Hall exists to stabilize survivors before they test the wall again.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/45">Active Contract</div>
            <div className="mt-3 text-2xl font-black text-white">
              {player.activeProvision?.title ?? "None Packed"}
            </div>
            <p className="mt-2 text-sm text-white/65">
              {player.activeProvision
                ? `Next expedition mitigation: ${player.activeProvision.conditionMitigation}`
                : "The next meal contract you buy will stay live until one expedition reward consumes it."}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/10 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-100/60">Spend Pressure</div>
            <div className="mt-3 text-2xl font-black text-white">
              {player.resources.credits} Credits / {player.resources.bioSamples} Bio Samples
            </div>
            <p className="mt-2 text-sm text-white/65">Credits buy routine meals. Bio samples unlock the lane&apos;s gluttonous compact.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard
            title="Feast Contracts"
            description="Small, load-bearing prep services for Book 1. Each contract restores condition now and cushions exactly one upcoming expedition."
          >
            <div className="grid gap-4">
              {feastHallOffers.map((offer) => {
                const canAfford = canAffordFeastOffer(offer.cost, player.resources);
                const disabled = hasActiveProvision || !canAfford;
                const buttonLabel = hasActiveProvision
                  ? "Contract Already Packed"
                  : canAfford
                    ? `Buy ${offer.title}`
                    : "Insufficient Stock";

                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-amber-200/70">
                            {offer.tagline}
                          </div>
                          <h2 className="mt-2 text-xl font-semibold text-white">{offer.title}</h2>
                        </div>

                        <p className="max-w-2xl text-sm leading-6 text-white/65">{offer.description}</p>

                        <div className="grid gap-2 text-sm text-white/75 md:grid-cols-3">
                          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            Cost: {formatFeastCost(offer.cost)}
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            Immediate Recovery: +{offer.conditionRecovery} condition
                          </div>
                          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            Next Expedition Shield: {offer.nextExpeditionMitigation}
                          </div>
                        </div>

                        <p className="text-sm leading-6 text-amber-100/70">{offer.appetiteNote}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePurchase(offer.id)}
                        disabled={disabled}
                        className={[
                          "rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition lg:min-w-[210px]",
                          disabled
                            ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35"
                            : "border-amber-300/30 bg-amber-500/15 text-amber-50 hover:border-amber-200/55 hover:bg-amber-500/20",
                        ].join(" ")}
                      >
                        {buttonLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Hall Law"
              description="Black Market rules framed as player-facing survival fiction, not a new economy layer."
            >
              <div className="space-y-4 text-sm leading-6 text-white/70">
                <p>{feastHallScreenData.law}</p>
                <p>{feastHallScreenData.doctrine}</p>
              </div>
            </SectionCard>

            <SectionCard
              title="Why this lane matters"
              description="The first Black Market slice should immediately improve the core loop: prepare, endure, extract, and return."
            >
              <div className="space-y-3 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Converts existing resources into condition and expedition readiness.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Uses one persistent prep slot instead of a shop framework or a new currency.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Establishes a template that future sin lanes can copy: one place, one pressure, one meaningful service.
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}
