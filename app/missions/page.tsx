"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";

export default function MissionsPage() {
  const { state, startMission, completeMission } = useGame();

  const activeCount = state.missions.filter((mission) => mission.status === "active").length;
  const availableCount = state.missions.filter(
    (mission) => mission.status === "available"
  ).length;
  const completedCount = state.missions.filter(
    (mission) => mission.status === "completed"
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(80,50,120,0.25),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Operations"
          title="Missions"
          subtitle="Primary contract flow, story progression, and district unlocks."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <PlaceholderPanel
            label="Active Contract"
            value={state.activeMissionId ? "1" : "0"}
            hint={state.activeMissionId ?? "No active mission"}
          />
          <PlaceholderPanel
            label="Available Missions"
            value={String(availableCount)}
            hint={`${completedCount} completed`}
          />
          <PlaceholderPanel
            label="Live Status"
            value={activeCount > 0 ? "In Progress" : "Idle"}
            hint={
              state.path
                ? `Path: ${state.path}`
                : "Choose a path to unlock Prologue Entry"
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Mission Chain"
            description="Complete missions to earn resources, rank XP, increase mastery, and unlock new districts."
          >
            <div className="space-y-4">
              {state.missions.map((mission, index) => (
                <div
                  key={mission.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">
                        0{index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {mission.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/65">
                        {mission.description}
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border px-3 py-2 text-xs uppercase tracking-[0.18em] ${
                        mission.status === "completed"
                          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                          : mission.status === "active"
                          ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                          : mission.status === "available"
                          ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
                          : "border-white/10 bg-white/5 text-white/45"
                      }`}
                    >
                      {mission.status}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
                    {mission.rewards.credits ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        +{mission.rewards.credits} Credits
                      </span>
                    ) : null}

                    {mission.rewards.voidCrystals ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        +{mission.rewards.voidCrystals} Void Crystals
                      </span>
                    ) : null}

                    {mission.rewards.bioEssence ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        +{mission.rewards.bioEssence} Bio Essence
                      </span>
                    ) : null}

                    {mission.rewards.masteryProgress ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        +{mission.rewards.masteryProgress}% Mastery
                      </span>
                    ) : null}

                    {mission.rewards.rankXp ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        +{mission.rewards.rankXp} Rank XP
                      </span>
                    ) : null}

                    {mission.rewards.unlockDistricts?.length ? (
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1">
                        Unlocks {mission.rewards.unlockDistricts.join(", ")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {mission.status === "available" && (
                      <button
                        onClick={() => startMission(mission.id)}
                        className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/20"
                      >
                        Start Mission
                      </button>
                    )}

                    {mission.status === "active" && (
                      <button
                        onClick={() => completeMission(mission.id)}
                        className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20"
                      >
                        Complete Mission
                      </button>
                    )}

                    {mission.status === "locked" && (
                      <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40">
                        Locked
                      </span>
                    )}

                    {mission.status === "completed" && (
                      <span className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Objective Console"
            description="Live state preview for the first playable loop."
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <p>
                  <span className="text-white">Current Path:</span>{" "}
                  {state.path ?? "Unassigned"}
                </p>
                <p className="mt-2">
                  <span className="text-white">Rank:</span> {state.rank} Lv.{state.rankLevel}
                </p>
                <p className="mt-2">
                  <span className="text-white">Rank XP:</span> {state.rankXp} /{" "}
                  {state.rankXpToNext}
                </p>
                <p className="mt-2">
                  <span className="text-white">Active Mission:</span>{" "}
                  {state.activeMissionId ?? "None"}
                </p>
                <p className="mt-2">
                  <span className="text-white">Credits:</span>{" "}
                  {state.credits.toLocaleString()}
                </p>
                <p className="mt-2">
                  <span className="text-white">Void Crystals:</span>{" "}
                  {state.voidCrystals.toLocaleString()}
                </p>
                <p className="mt-2">
                  <span className="text-white">Bio Essence:</span>{" "}
                  {state.bioEssence.toLocaleString()}
                </p>
                <p className="mt-2">
                  <span className="text-white">Mastery Progress:</span>{" "}
                  {state.masteryProgress}%
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/50">
                Choose a path on the home screen to unlock Prologue Entry, then
                complete it to access First Assignment.
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}