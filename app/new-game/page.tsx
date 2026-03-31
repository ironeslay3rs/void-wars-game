"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolSelector from "@/components/onboarding/SchoolSelector";
import { useGame } from "@/features/game/gameContext";
import type { CareerFocus, PathType } from "@/features/game/gameTypes";
import { initialGameState } from "@/features/game/initialGameState";
import {
  createNewPlayer,
  SCHOOL_STARTER_PACK_SUMMARY,
} from "@/features/player/playerFactory";

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
  const [selectedCareer, setSelectedCareer] = useState<CareerFocus | null>(null);

  const canNextFrom1 = normalizedCallsign.length >= 2;
  const canNextFrom2 = selectedSchool !== null;
  const canNextFrom3 = selectedCareer !== null;
  const canStart = canNextFrom1 && canNextFrom2 && canNextFrom3;

  function handleBegin() {
    if (!canStart || selectedSchool === null || selectedCareer === null) return;

    const player = createNewPlayer({
      name: normalizedCallsign,
      school: selectedSchool,
      career: selectedCareer,
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
              New Game
            </h1>
            <p className="text-sm text-white/60">
              Step into the Hour 0–3 loop. Your first start is fragile on purpose.
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
                      plus school-weighted salvage (ores, alloy, samples, rune dust, moss
                      rations; Pure adds ember cores). Pick a school in step 2 for exact
                      tallies.
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
                  placeholder="Enter callsign"
                  autoComplete="nickname"
                />
                <div className="text-[11px] text-white/45">
                  Shown on HUD and contracts. Keep it short.
                </div>
              </label>
            ) : null}

            {step === 2 ? (
              <SchoolSelector
                value={selectedSchool}
                onChange={(next) => setSelectedSchool(next)}
              />
            ) : null}

            {step === 3 ? (
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                  Step 3 — Choose career focus
                </div>
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
                            ? "Shell drill damage bias. Prep for posture/expose identity."
                            : focus === "gathering"
                              ? "Field pickup efficiency. Better salvage returns under pressure."
                              : "District cost reduction and profession tier value."}
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
                  You are about to enter as <span className="font-black">{normalizedCallsign || "—"}</span>,
                  leaning <span className="font-black uppercase">{selectedSchool ?? "—"}</span>,
                  focus <span className="font-black uppercase">{selectedCareer ?? "—"}</span>.
                </div>
                <div className="mt-2 text-white/75">
                  You start as <span className="font-semibold">Puppy</span> with 100% condition.
                </div>
                <div className="mt-3 border-l-2 border-amber-200/35 pl-3 text-xs leading-relaxed text-amber-100/85">
                  The gate opens on your signal. The Black Market records your first oath, then sends you to the hub.
                </div>
              </div>
            ) : null}

            <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">
                First action
              </div>
              <p className="mt-2 text-sm text-white/70">
                After you begin, open <span className="font-semibold text-white">Exploration</span>{" "}
                on Home to find a biotech signal and trigger your first hunt.
              </p>
            </div>

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
                  Next
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
                  Confirm & Begin
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-white/55">
              <Link className="hover:text-white" href="/character">
                Character screen →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

