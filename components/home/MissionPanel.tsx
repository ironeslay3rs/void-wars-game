"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "spirit") return "Pure";
  return faction;
}

function formatStatusLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Optimal";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getProgressPercent(current: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (current / max) * 100));
}

function getFactionAccent(faction: string) {
  if (faction === "bio") {
    return {
      ring: "border-emerald-500/35",
      glow: "shadow-[0_0_40px_rgba(16,185,129,0.18)]",
      text: "text-emerald-200",
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      bar: "from-emerald-400 to-emerald-700",
    };
  }

  if (faction === "mecha") {
    return {
      ring: "border-cyan-500/35",
      glow: "shadow-[0_0_40px_rgba(34,211,238,0.18)]",
      text: "text-cyan-200",
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      bar: "from-cyan-300 to-cyan-700",
    };
  }

  if (faction === "spirit") {
    return {
      ring: "border-violet-500/35",
      glow: "shadow-[0_0_40px_rgba(168,85,247,0.18)]",
      text: "text-violet-200",
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      bar: "from-violet-300 to-violet-700",
    };
  }

  return {
    ring: "border-white/15",
    glow: "shadow-[0_0_30px_rgba(255,255,255,0.06)]",
    text: "text-white/90",
    chip: "border-white/15 bg-white/5 text-white/90",
    bar: "from-white/80 to-white/30",
  };
}

export default function StatusPage() {
  const { state } = useGame();
  const { player } = state;

  const factionAccent = getFactionAccent(player.factionAlignment);
  const rankProgress = getProgressPercent(player.rankXp, player.rankXpToNext);

  const resources = [
    { label: "Credits", value: player.resources.credits },
    { label: "Iron Ore", value: player.resources.ironOre },
    { label: "Scrap Alloy", value: player.resources.scrapAlloy },
    { label: "Rune Dust", value: player.resources.runeDust },
    { label: "Ember Core", value: player.resources.emberCore },
    { label: "Bio Samples", value: player.resources.bioSamples },
  ];

  const systemStates = [
    { label: "Forge", value: formatStatusLabel(player.districtState.forgeStatus) },
    { label: "Arena", value: formatStatusLabel(player.districtState.arenaStatus) },
    { label: "Mecha Core", value: formatStatusLabel(player.districtState.mechaStatus) },
    { label: "Mutation", value: formatStatusLabel(player.districtState.mutationState) },
    { label: "Attunement", value: formatStatusLabel(player.districtState.attunementState) },
    { label: "Gate", value: formatStatusLabel(player.districtState.gateStatus) },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(90,20,20,0.22),_rgba(5,8,20,1)_58%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Operative Status"
          title="Player Status"
          subtitle="Identity, progression, live system condition, and current operational profile."
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Operative Profile"
            description="Primary identity panel for doctrine alignment, rank status, and mission readiness."
          >
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <div
                className={[
                  "relative overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(32,10,10,0.92),rgba(8,8,16,0.96))] p-5",
                  factionAccent.ring,
                  factionAccent.glow,
                ].join(" ")}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                      Active Vessel
                    </span>
                    <span
                      className={[
                        "rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                        factionAccent.chip,
                      ].join(" ")}
                    >
                      {formatFactionLabel(player.factionAlignment)}
                    </span>
                  </div>

                  <div className="flex aspect-[3/4] items-center justify-center rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),rgba(0,0,0,0.32)_58%,rgba(0,0,0,0.78)_100%)]">
                    <div className="text-center">
                      <div className="text-[11px] uppercase tracking-[0.3em] text-white/35">
                        Portrait Chamber
                      </div>
                      <div className="mt-3 text-lg font-black uppercase tracking-[0.08em] text-white/90">
                        {player.playerName}
                      </div>
                      <div className={["mt-2 text-sm font-semibold", factionAccent.text].join(" ")}>
                        {player.rank}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                        Rank Level
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {player.rankLevel}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                        Influence
                      </div>
                      <div className="mt-2 text-2xl font-black text-white">
                        {player.influence}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Rank Progress
                      </div>
                      <div className="mt-2 text-xl font-black uppercase tracking-[0.04em] text-white">
                        {player.rank}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                        XP
                      </div>
                      <div className="mt-2 text-sm font-bold text-white/85">
                        {player.rankXp} / {player.rankXpToNext}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    <div
                      className={[
                        "h-full rounded-full bg-gradient-to-r",
                        factionAccent.bar,
                      ].join(" ")}
                      style={{ width: `${rankProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Condition
                      </span>
                      <span className="text-sm font-bold text-white/85">
                        {player.condition}%
                      </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-amber-300"
                        style={{ width: `${player.condition}%` }}
                      />
                    </div>

                    <div className="mt-3 text-sm text-white/65">
                      Status:{" "}
                      <span className="font-semibold text-white/90">
                        {getConditionLabel(player.condition)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                        Mastery
                      </span>
                      <span className="text-sm font-bold text-white/85">
                        {player.masteryProgress}%
                      </span>
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
                        style={{ width: `${player.masteryProgress}%` }}
                      />
                    </div>

                    <div className="mt-3 text-sm text-white/65">
                      Doctrine integration and combat identity refinement.
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,18,26,0.92),rgba(8,10,16,0.96))] p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                      Operations Snapshot
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Live Feed
                    </div>
                  </div>

                  <div className="mt-3 text-lg font-black uppercase tracking-[0.04em] text-white">
                    Awaiting mission board sync
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                        Active Route
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        Pending navigation sync
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                        Mission Feed
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        Waiting for mission layer handoff
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Resource Ledger"
              description="Current holdings available for crafting, upgrades, and market operations."
            >
              <div className="grid gap-3">
                {resources.map((resource) => (
                  <div
                    key={resource.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] px-4 py-3"
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.06em] text-white/75">
                      {resource.label}
                    </span>
                    <span className="text-lg font-black text-white">
                      {resource.value}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="System States"
              description="District-linked operational systems and current readiness."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {systemStates.map((system) => (
                  <div
                    key={system.label}
                    className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(22,18,26,0.84),rgba(10,10,16,0.9))] p-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                      {system.label}
                    </div>
                    <div className="mt-2 text-base font-black uppercase tracking-[0.04em] text-white">
                      {system.value}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Loadout Snapshot"
              description="Reserved for equipment slots, rune set, and profession-linked bonuses."
            >
              <div className="grid gap-3">
                {[
                  "Weapon Slot",
                  "Armor Slot",
                  "Core Slot",
                  "Rune Set",
                  "Profession Bind",
                ].map((entry) => (
                  <div
                    key={entry}
                    className="flex items-center justify-between rounded-2xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="text-sm uppercase tracking-[0.08em] text-white/60">
                      {entry}
                    </span>
                    <span className="text-sm font-semibold text-white/35">
                      Empty
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}