"use client";

import Link from "next/link";
import { ArrowLeft, Soup, Wallet, Activity, FlaskConical } from "lucide-react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import ScreenStateSummary from "@/components/shared/ScreenStateSummary";
import { useGame } from "@/features/game/gameContext";
import {
  blackMarketFeastHallData,
  FEAST_HALL_SERVICE_BIO_SAMPLE_COST,
  FEAST_HALL_SERVICE_CONDITION_GAIN,
  FEAST_HALL_SERVICE_CREDITS_COST,
} from "@/features/black-market/blackMarketFeastHallData";

function getFeastHallState(params: {
  condition: number;
  credits: number;
  bioSamples: number;
}) {
  const { condition, credits, bioSamples } = params;
  const missingCredits = Math.max(0, FEAST_HALL_SERVICE_CREDITS_COST - credits);
  const missingSamples = Math.max(0, FEAST_HALL_SERVICE_BIO_SAMPLE_COST - bioSamples);

  if (condition >= 100) {
    return {
      tone: "ready" as const,
      title: "Sated",
      consequence:
        "Your condition is already at maximum. The Feast Hall is open, but the next bowl would be wasteful instead of load-bearing.",
      nextStep:
        "Return to exploration, a hunt, or another Bazaar district until the front scars your readiness again.",
      canUseService: false,
      actionLabel: "Condition Full",
    };
  }

  if (missingCredits > 0 || missingSamples > 0) {
    const requirements = [
      missingCredits > 0 ? `${missingCredits} more credits` : null,
      missingSamples > 0 ? `${missingSamples} more bio samples` : null,
    ]
      .filter(Boolean)
      .join(" and ");

    return {
      tone: "warning" as const,
      title: "Provision Blocked",
      consequence:
        "The kitchen will serve you, but only if you can honor the table price with hard currency and viable flesh-stock.",
      nextStep: `Secure ${requirements}, then return to convert salvage into readiness.`,
      canUseService: false,
      actionLabel: "Need More Provisions",
    };
  }

  if (condition <= 45) {
    return {
      tone: "critical" as const,
      title: "Starved for the Front",
      consequence:
        "Condition is low enough that the Feast Hall is the safest Black Market spend available right now.",
      nextStep:
        "Take the bowl, recover immediately, and re-enter the expedition loop with a fuller readiness buffer.",
      canUseService: true,
      actionLabel: "Take Communion Bowl",
    };
  }

  return {
    tone: "ready" as const,
    title: "Service Available",
    consequence:
      "The Gluttony lane is live. You can spend existing resources here to top off readiness before pressing back into the Void.",
    nextStep:
      "Use the bowl now for safer preparation, or hold the spend until your next return from the front.",
    canUseService: true,
    actionLabel: "Take Communion Bowl",
  };
}

export default function BlackMarketPage() {
  const { state, dispatch } = useGame();
  const { condition, resources } = state.player;
  const projectedCondition = Math.min(
    100,
    condition + FEAST_HALL_SERVICE_CONDITION_GAIN,
  );
  const feastHallState = getFeastHallState({
    condition,
    credits: resources.credits,
    bioSamples: resources.bioSamples,
  });

  function handleDineAtFeastHall() {
    if (!feastHallState.canUseService) {
      return;
    }

    dispatch({ type: "DINE_AT_FEAST_HALL" });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.16),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <ScreenHeader
            eyebrow={blackMarketFeastHallData.eyebrow}
            title={blackMarketFeastHallData.title}
            subtitle={blackMarketFeastHallData.subtitle}
          />

          <Link
            href="/bazaar"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/40 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bazaar
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Current Condition",
              value: `${condition}%`,
              hint: "Existing shared readiness pressure the Feast Hall directly stabilizes.",
              icon: Activity,
            },
            {
              label: "Credits at Table",
              value: String(resources.credits),
              hint: `${FEAST_HALL_SERVICE_CREDITS_COST} credits are consumed per bowl.`,
              icon: Wallet,
            },
            {
              label: "Viable Samples",
              value: String(resources.bioSamples),
              hint: `${FEAST_HALL_SERVICE_BIO_SAMPLE_COST} bio samples are rendered into each service.`,
              icon: FlaskConical,
            },
            {
              label: "Projected After Feast",
              value: `${projectedCondition}%`,
              hint: blackMarketFeastHallData.effectLabel,
              icon: Soup,
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-white/10 bg-black/30 p-5 shadow-[0_0_30px_rgba(0,0,0,0.22)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
                      {card.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {card.value}
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-amber-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/60">{card.hint}</p>
              </div>
            );
          })}
        </div>

        <ScreenStateSummary
          eyebrow="Feast Hall Status"
          title={feastHallState.title}
          consequence={feastHallState.consequence}
          nextStep={feastHallState.nextStep}
          tone={feastHallState.tone}
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title={blackMarketFeastHallData.serviceName}
            description={blackMarketFeastHallData.serviceDescription}
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-400/20 bg-amber-500/8 p-4 text-sm leading-6 text-amber-50/85">
                Gluttony in the Black Market is not indulgence for its own sake. It is survival made ritual: extract matter from the war, surrender it to the kitchen, and buy enough strength to return to the front.
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  `${FEAST_HALL_SERVICE_CREDITS_COST} Credits`,
                  `${FEAST_HALL_SERVICE_BIO_SAMPLE_COST} Bio Samples`,
                  `+${FEAST_HALL_SERVICE_CONDITION_GAIN} Condition`,
                ].map((entry) => (
                  <div
                    key={entry}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/75"
                  >
                    {entry}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDineAtFeastHall}
                disabled={!feastHallState.canUseService}
                className={[
                  "w-full rounded-xl border p-4 text-left transition",
                  feastHallState.canUseService
                    ? "border-amber-300/40 bg-amber-500/12 text-amber-50 shadow-[0_0_0_1px_rgba(252,211,77,0.12),0_0_30px_rgba(245,158,11,0.16)] hover:border-amber-200/60 hover:bg-amber-500/16"
                    : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/35",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold uppercase tracking-[0.08em]">
                    {feastHallState.actionLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
                    Sacred Deal
                  </span>
                </div>

                <p
                  className={[
                    "mt-2 text-sm leading-6",
                    feastHallState.canUseService ? "text-amber-50/80" : "text-white/55",
                  ].join(" ")}
                >
                  Pay the table, consume the bowl, and convert salvage into immediate readiness without building a new economy layer.
                </p>
              </button>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/60">
                The service is atomic and persistence-safe: one action spends from the existing shared pool and restores the existing condition stat. No new currencies, professions, hazards, or shop scaffolding are introduced.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Black Market Law"
            description="Neutral ground between Bio, Mecha, and Pure. The lane is framed diegetically so the market feels like the world, not a menu."
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-red-200/70">
                  Canon Law
                </div>
                <p className="mt-2 text-sm leading-6 text-red-50/85">
                  {blackMarketFeastHallData.law}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/65">
                Feast Hall is the best first Black Market lane because it plugs straight into the current loop: prepare, endure the front, return, spend salvage on survival, and go back out.
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/65">
                The lane also gives bio samples a concrete outlet. Samples no longer exist only as abstract hunt rewards; they now become provisions that keep the expedition alive.
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/65">
                In Black Market terms, Gluttony is logistics of appetite under siege. You do not buy luxury here. You buy the right to survive another descent into the Void.
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
