"use client";

import { useRouter } from "next/navigation";
import BiotechLabsStateSummary from "@/components/biotech-labs/BiotechLabsStateSummary";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { getActiveBiotechSpecimen } from "@/features/biotech-labs/specimenData";
import { biotechLabsScreenData } from "@/features/biotech-labs/biotechLabsScreenData";
import { useGame } from "@/features/game/gameContext";
import {
  formatFieldRationCost,
  getFieldRationCost,
  hasEnoughFieldRations,
} from "@/features/game/rationRules";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";

export default function BiotechLabsPage() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const hasBiotechSpecimenLead = state.player.hasBiotechSpecimenLead;
  const guidance = getFirstSessionGuidance(state);
  const huntRationCost = getFieldRationCost("hunt");
  const canAffordHunt = hasEnoughFieldRations(
    state.player.resources.fieldRations,
    "hunt",
  );
  const shouldHighlightHuntAction =
    hasBiotechSpecimenLead && canAffordHunt && guidance.nextAction === "hunt";
  const activeSpecimen = getActiveBiotechSpecimen(hasBiotechSpecimenLead);
  const huntActionMessage = hasBiotechSpecimenLead
    ? guidance.nextAction === "hunt"
      ? canAffordHunt
        ? "Ready. A viable specimen lead is active and the hunt will spend 1 Field Ration."
        : "Blocked. The lead is ready, but you need 1 Field Ration before deploying."
      : canAffordHunt
        ? "Ready, but not recommended. Recovery is the safer next step before pushing deeper into the wastes."
        : "Blocked. Recovery can wait, but you still need 1 Field Ration before deploying."
    : "Blocked. No biotech lead is active. Return home, finish exploration, and claim the result first.";

  function handleResolveFirstHunt() {
    if (!hasBiotechSpecimenLead) {
      return;
    }

    dispatch({
      type: "RESOLVE_HUNT",
      payload: { missionId: "bio-hunt-specimen" },
    });
    router.push("/bazaar/biotech-labs/result");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={biotechLabsScreenData.eyebrow}
          title={biotechLabsScreenData.title}
          subtitle={biotechLabsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {biotechLabsScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <BiotechLabsStateSummary />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Mutation Bays"
            description="Current biotech hunt surface: confirm the active specimen lead, then resolve the hunt from here."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {hasBiotechSpecimenLead
                  ? "A fresh specimen trace was recovered from the wastes. Biotech labs can deploy a tracking team now."
                  : "No viable specimen trace is on record. Sweep the wastes through exploration to recover and claim a fresh lead."}
              </div>

              {activeSpecimen ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">
                        Active Specimen
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {activeSpecimen.name}
                      </div>
                    </div>

                    <div className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100">
                      {activeSpecimen.threatLabel}
                    </div>
                  </div>

                  <div className="mt-3 text-sm font-medium uppercase tracking-[0.08em] text-white/70">
                    {activeSpecimen.category}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {activeSpecimen.description}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleResolveFirstHunt}
                disabled={!hasBiotechSpecimenLead || !canAffordHunt}
                className={[
                  "w-full rounded-xl p-4 text-left text-sm font-semibold transition",
                  hasBiotechSpecimenLead && canAffordHunt
                    ? shouldHighlightHuntAction
                      ? "border border-emerald-300/60 bg-emerald-500/14 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.2),0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-200/80 hover:bg-emerald-500/18"
                      : "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/40 hover:bg-emerald-500/15"
                    : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>
                    {hasBiotechSpecimenLead && canAffordHunt
                      ? `Run Specimen Hunt · ${formatFieldRationCost(huntRationCost)}`
                      : hasBiotechSpecimenLead
                        ? `Need ${formatFieldRationCost(huntRationCost)}`
                        : "No Active Specimen Lead"}
                  </span>
                  {shouldHighlightHuntAction ? (
                    <span className="rounded-full border border-emerald-300/40 bg-emerald-300/14 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-50">
                      Recommended
                    </span>
                  ) : null}
                </div>
              </button>

              <div
                className={[
                  "rounded-xl px-3 py-3 text-sm",
                  hasBiotechSpecimenLead
                    ? "border border-emerald-500/20 bg-emerald-500/8 text-emerald-50/85"
                    : "border border-white/10 bg-white/[0.03] text-white/60",
                ].join(" ")}
              >
                {huntActionMessage} Stock on hand: {state.player.resources.fieldRations}{" "}
                Field Rations.
              </div>

              {["Gene Extraction", "Mutation Trials", "Tissue Refinement"].map(
                (entry) => (
                  <div
                    key={entry}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                  >
                    {entry}
                  </div>
                )
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Bio Console"
            description="Current specimen-readout surface for the active biotech lead."
          >
            {activeSpecimen ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                  Tracking Profile
                </div>
                <div className="mt-3 text-base font-semibold text-white">
                  {activeSpecimen.name}
                </div>
                <div className="mt-2 text-sm text-white/65">
                  {activeSpecimen.category} / {activeSpecimen.threatLabel}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Genetic trace is stable enough for deployment. Run the hunt while the current biotech signal remains viable.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                No active specimen profile is available yet. Recover and claim a fresh exploration lead to populate the tracking console.
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
