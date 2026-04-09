"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SchoolSelector from "@/components/onboarding/SchoolSelector";
import SchoolAffinityPicker from "@/components/onboarding/SchoolAffinityPicker";
import { useGame } from "@/features/game/gameContext";
import type { CareerFocus, PathType } from "@/features/game/gameTypes";
import { initialGameState } from "@/features/game/initialGameState";
import {
  createNewPlayer,
  SCHOOL_STARTER_PACK_SUMMARY,
} from "@/features/player/playerFactory";
import {
  onboardingNarrativeBeats,
  consequenceBeats,
} from "@/features/lore/puppyOnboardingData";
import { getSchoolById } from "@/features/schools/schoolSelectors";
import type { SchoolId } from "@/features/schools/schoolTypes";

type Step = 1 | 2 | 3 | 4;

function normalizeCallsign(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 18);
}

export default function NewGamePage() {
  const router = useRouter();
  const { state, dispatch } = useGame();

  const [callsign, setCallsign] = useState(() => state.player.playerName);
  const normalizedCallsign = useMemo(() => normalizeCallsign(callsign), [callsign]);
  const [step, setStep] = useState<Step>(1);
  const [selectedSchool, setSelectedSchool] = useState<PathType | null>(null);
  const [selectedAffinitySchool, setSelectedAffinitySchool] =
    useState<SchoolId | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<CareerFocus | null>(null);

  const canNextFrom1 = normalizedCallsign.length >= 2;
  // Step 2 now requires both an empire AND a child school affinity.
  const canNextFrom2 = selectedSchool !== null && selectedAffinitySchool !== null;
  const canNextFrom3 = selectedCareer !== null;
  const canStart = canNextFrom1 && canNextFrom2 && canNextFrom3;

  // Narrative beats
  const step1Beat = onboardingNarrativeBeats[1];
  const step4Beat = onboardingNarrativeBeats[4];
  const step3Beat = selectedSchool ? consequenceBeats[selectedSchool] : null;

  function handleBegin() {
    if (
      !canStart ||
      selectedSchool === null ||
      selectedCareer === null ||
      selectedAffinitySchool === null
    )
      return;

    const player = createNewPlayer({
      name: normalizedCallsign,
      school: selectedSchool,
      career: selectedCareer,
      affinitySchoolId: selectedAffinitySchool,
    });
    dispatch({
      type: "HYDRATE_STATE",
      payload: {
        ...initialGameState,
        player,
      },
    });
    router.push("/home");
  }

  return (
    <main className="safe-min-h-screen safe-page-padding bg-[radial-gradient(circle_at_top,_rgba(80,110,160,0.22),_rgba(5,8,18,1)_58%)] py-10 text-white">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-3xl border border-white/10 bg-black/35 p-7 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">
              Void Wars: Oblivion
            </p>
            <h1 className="text-3xl font-black uppercase tracking-[0.08em] text-white">
              {step === 1
                ? step1Beat.title
                : step === 2
                  ? "The Deal"
                  : step === 3
                    ? step3Beat?.title ?? "The Consequence"
                    : step4Beat.title}
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              {step === 1
                ? step1Beat.eyebrow
                : step === 2
                  ? "Black Market · Lower Ring"
                  : step === 3
                    ? step3Beat?.eyebrow ?? "Something Changed"
                    : step4Beat.eyebrow}
            </p>
          </div>

          {/* Narrative flavor */}
          <div className="mt-6 rounded-2xl border border-white/8 bg-black/25 px-5 py-4">
            <p className="text-sm leading-relaxed text-white/65">
              {step === 1
                ? step1Beat.flavor
                : step === 2
                  ? "Three brokers. Three stalls. Each one has something that shouldn't be for sale. You didn't come here to browse. You came because something in this market is calling to you — and you're too hungry to walk away."
                  : step === 3
                    ? step3Beat?.flavor
                    : step4Beat.flavor}
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
              {step === 1
                ? step1Beat.guidance
                : step === 2
                  ? "Choose the broker. This sets your path."
                  : step === 3
                    ? step3Beat?.guidance
                    : step4Beat.guidance}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Step {step} / 4
                </div>
                <div className="text-xs text-white/55">
                  {selectedSchool ? (
                    <>
                      Starter pack ({selectedSchool}):{" "}
                      {SCHOOL_STARTER_PACK_SUMMARY[selectedSchool]}
                    </>
                  ) : (
                    <>
                      Every path starts with <span className="text-white/75">500 credits</span>{" "}
                      plus school-weighted salvage. Pick a broker in step 2 for exact tallies.
                    </>
                  )}
                </div>
              </div>
            </div>

            {step === 1 ? (
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Step 1 — Enter operative name
                </span>
                <input
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                  placeholder="What does the market call you?"
                  autoComplete="nickname"
                />
                <div className="text-[11px] text-white/45">
                  Shown on HUD and contracts. The broker needs a name before the deal.
                </div>
              </label>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <SchoolSelector
                  value={selectedSchool}
                  onChange={(next) => {
                    setSelectedSchool(next);
                    // Switching empire invalidates the prior school affinity.
                    setSelectedAffinitySchool(null);
                  }}
                />
                {selectedSchool ? (
                  <SchoolAffinityPicker
                    empire={selectedSchool}
                    value={selectedAffinitySchool}
                    onChange={(next) => setSelectedAffinitySchool(next)}
                  />
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Step 3 — Choose career focus
                </div>
                <p className="text-xs text-white/50">
                  The deal changed you. Now choose how you survive — with firepower, salvage instinct, or workshop discipline.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  {(["combat", "gathering", "crafting"] as CareerFocus[]).map((focus) => {
                    const active = selectedCareer === focus;
                    return (
                      <button
                        key={focus}
                        type="button"
                        onClick={() => setSelectedCareer(focus)}
                        className={[
                          "rounded-2xl border bg-black/30 p-5 text-left transition",
                          active
                            ? "border-cyan-400/40 bg-cyan-500/10"
                            : "border-white/12 hover:border-white/25",
                        ].join(" ")}
                      >
                        <div className="text-lg font-black uppercase tracking-[0.06em] text-white">
                          {focus}
                        </div>
                        <div className="mt-2 text-xs leading-relaxed text-white/70">
                          {focus === "combat"
                            ? "The thing inside you wants to fight. Void-field damage and posture — for operatives who solve problems with firepower."
                            : focus === "gathering"
                              ? "Your instincts say hoard. Better salvage and pickup returns when the lane turns rough."
                              : "Your hands know things your mind doesn't yet. Crafting costs bend in your favor — sustain the long war."}
                        </div>
                        {active ? (
                          <div className="mt-4 inline-flex rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                            Selected
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-5 py-5 text-sm text-amber-50/90">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100/70">
                  Step 4 — Confirmation
                </div>
                <div className="mt-2 text-white/85">
                  You are <span className="font-black">{normalizedCallsign || "—"}</span>.
                  The <span className="font-black uppercase">{selectedSchool ?? "—"}</span> deal
                  is inside you now. Career focus:{" "}
                  <span className="font-black uppercase">{selectedCareer ?? "—"}</span>.
                </div>
                {selectedAffinitySchool ? (
                  <div className="mt-2 text-white/75">
                    You stand with the{" "}
                    <span className="font-black">
                      {getSchoolById(selectedAffinitySchool).name}
                    </span>{" "}
                    in {getSchoolById(selectedAffinitySchool).nation}. The
                    {" "}
                    <span className="font-semibold">
                      {getSchoolById(selectedAffinitySchool).laneDisplay}
                    </span>{" "}
                    is your shadow walk in Blackcity.
                  </div>
                ) : null}
                <div className="mt-2 text-white/75">
                  You start as <span className="font-semibold">Puppy</span> with 100% condition.
                  The Black Market records your first oath.
                </div>
                <div className="mt-3 border-l-2 border-amber-200/35 pl-3 text-xs italic leading-relaxed text-amber-100/85">
                  &ldquo;No one in the Black Market stays alive for free.&rdquo;
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))}
                  className="rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white/80 hover:border-white/25 hover:bg-white/10"
                >
                  Back
                </button>
              ) : null}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !canNextFrom1) return;
                    if (step === 2 && !canNextFrom2) return;
                    if (step === 3 && !canNextFrom3) return;
                    setStep((prev) => ((prev + 1) as Step));
                  }}
                  disabled={
                    (step === 1 && !canNextFrom1) ||
                    (step === 2 && !canNextFrom2) ||
                    (step === 3 && !canNextFrom3)
                  }
                  className={[
                    "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                    (step === 1 && canNextFrom1) ||
                    (step === 2 && canNextFrom2) ||
                    (step === 3 && canNextFrom3)
                      ? "border-cyan-400/35 bg-cyan-500/12 text-cyan-50 hover:border-cyan-300/50 hover:bg-cyan-500/18"
                      : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                  ].join(" ")}
                >
                  {step === 1 ? "Enter the Market" : step === 2 ? "Take the Deal" : "Accept"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBegin}
                  disabled={!canStart}
                  className={[
                    "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition",
                    canStart
                      ? "border-amber-300/35 bg-amber-500/12 text-amber-50 hover:border-amber-200/50 hover:bg-amber-500/18"
                      : "cursor-not-allowed border-white/10 bg-white/[0.03] text-white/30",
                  ].join(" ")}
                >
                  Begin
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
