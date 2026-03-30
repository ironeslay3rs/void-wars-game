"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import BiotechLabsStateSummary from "@/components/biotech-labs/BiotechLabsStateSummary";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { getActiveBiotechSpecimen } from "@/features/biotech-labs/specimenData";
import { biotechLabsScreenData } from "@/features/biotech-labs/biotechLabsScreenData";
import { useGame } from "@/features/game/gameContext";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { getActivityHungerCost } from "@/features/status/survival";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

export default function BiotechLabsPage() {
  const router = useRouter();
  const { state } = useGame();
  const hasBiotechSpecimenLead = state.player.hasBiotechSpecimenLead;
  const guidance = getFirstSessionGuidance(state);
  const shouldHighlightHuntAction =
    hasBiotechSpecimenLead && guidance.nextAction === "hunt";
  const huntHungerCost = getActivityHungerCost("hunt");
  const activeSpecimen = getActiveBiotechSpecimen(hasBiotechSpecimenLead);
  const activeSpecimenAsset = activeSpecimen?.creatureAsset ?? null;
  const huntActionMessage = hasBiotechSpecimenLead
    ? guidance.nextAction === "hunt"
      ? "Live trace confirmed. This is the moment to commit, take the field cost, and turn the lead into a payout."
      : "Live trace confirmed, but the body is not ready. Recovery is the safer call before commitment."
    : "No live trace on record. Return to the field surface, finish exploration, and claim a lead first.";

  function handleResolveFirstHunt() {
    if (!hasBiotechSpecimenLead) {
      return;
    }
    router.push(
      `/hunt?missionId=${encodeURIComponent(
        "bio-hunt-specimen",
      )}&zone=${encodeURIComponent("howling-scar")}&return=${encodeURIComponent(
        "/bazaar/biotech-labs/result",
      )}`,
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,120,80,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <BazaarSubpageNav accentClassName="hover:border-emerald-300/40" />

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

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
            Shared queue
          </span>
          <Link
            href={VOID_EXPEDITION_PATH}
            className="font-semibold text-cyan-200/95 underline decoration-cyan-400/35 underline-offset-2 hover:text-white"
          >
            Void Expedition
          </Link>
          <span className="text-white/35">·</span>
          <Link
            href="/bazaar/mercenary-guild"
            className="font-semibold text-amber-200/95 underline decoration-amber-400/35 underline-offset-2 hover:text-white"
          >
            Hunting Ground
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Mutation Bays"
            description="This is where a live specimen lead becomes a resolved hunt. Confirm the target, commit, then carry the result forward."
          >
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                    Lead Status
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {hasBiotechSpecimenLead ? "Lead Active" : "Lead Required"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                    Field Cost
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    -{huntHungerCost}% hunger on resolution
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                {hasBiotechSpecimenLead
                  ? "A live trace is pinned to the board. You can commit the hunt from here right now."
                  : "No viable trace is pinned. Sweep the wastes, then claim a fresh lead before coming back here."}
              </div>

              {activeSpecimen ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
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

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-red-300/20 bg-black/20 px-3 py-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-red-200/70">
                            Threat
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">
                            {activeSpecimen.threatLabel}
                          </div>
                        </div>

                        <div className="rounded-xl border border-amber-300/20 bg-black/20 px-3 py-3">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">
                            Hunger Burn
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">
                            -{huntHungerCost}% on resolution
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeSpecimenAsset ? (
                      <div className="mx-auto w-full max-w-[220px] shrink-0 overflow-hidden rounded-xl border border-emerald-400/20 bg-black/20 p-3">
                        <Image
                          src={activeSpecimenAsset}
                          alt={activeSpecimen.name}
                          width={220}
                          height={220}
                          className="h-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.45)]"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleResolveFirstHunt}
                disabled={!hasBiotechSpecimenLead}
                className={[
                  "w-full rounded-xl p-4 text-left text-sm font-semibold transition",
                  hasBiotechSpecimenLead
                    ? shouldHighlightHuntAction
                      ? "border border-emerald-300/60 bg-emerald-500/14 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.2),0_0_30px_rgba(16,185,129,0.2)] hover:border-emerald-200/80 hover:bg-emerald-500/18"
                      : "border border-emerald-500/25 bg-emerald-500/10 text-emerald-100 hover:border-emerald-400/40 hover:bg-emerald-500/15"
                    : "cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div>
                      {hasBiotechSpecimenLead
                        ? "Commit to Specimen Hunt"
                        : "No Active Specimen Lead"}
                    </div>
                    <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-white/60">
                      {hasBiotechSpecimenLead
                        ? `Threat ${activeSpecimen?.threatLabel ?? "confirmed"} / hunger burn on contact`
                        : "Secure a live trace before commitment"}
                    </div>
                  </div>
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
                {huntActionMessage}
              </div>

              <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-3 text-sm text-cyan-50/90">
                Next Step:{" "}
                {hasBiotechSpecimenLead
                  ? guidance.nextAction === "hunt"
                    ? "commit to the hunt, review the payout, then decide between Feast Hall recovery or the next run."
                    : "recover first, then return here and commit to the live lead."
                  : "return to the field surface, complete exploration, and claim a lead before coming back here."}
              </div>

              {["Gene Extraction", "Mutation Trials", "Tissue Refinement"].map(
                (entry) => (
                  <div
                    key={entry}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65"
                  >
                    {entry}
                  </div>
                ),
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Bio Console"
            description="Read the current target here before you commit to the hunt."
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
                  Genetic trace is stable enough for deployment. Run the hunt
                  while the signal is live, then review the aftermath before
                  beginning the next sweep.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                No active specimen profile is available yet. Finish exploration
                and claim a fresh lead to populate this console.
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
