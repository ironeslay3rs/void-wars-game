"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArenaConsoleCard from "@/components/arena/ArenaConsoleCard";
import ArenaModesCard from "@/components/arena/ArenaModesCard";
import ArenaRewardsCard from "@/components/arena/ArenaRewardsCard";
import ArenaRulesCard from "@/components/arena/ArenaRulesCard";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { arenaScreenData } from "@/features/arena/arenaScreenData";
import { useGame } from "@/features/game/gameContext";

type ArenaMode = {
  title: string;
  subtitle: string;
  body: string;
};

type QueueState = "idle" | "searching" | "matched";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Verdant Coil";
  if (faction === "mecha") return "Chrome Synod";
  if (faction === "spirit") return "Ember Vault";
  return faction;
}

function getConditionLabel(condition: number) {
  if (condition >= 85) return "Combat Ready";
  if (condition >= 65) return "Stable";
  if (condition >= 40) return "Strained";
  return "Critical";
}

function getArenaEligibility(condition: number) {
  if (condition >= 40) return "Eligible";
  return "Restricted";
}

function getFactionAccent(faction: string) {
  if (faction === "bio") {
    return {
      ring: "border-emerald-500/30",
      glow: "shadow-[0_0_35px_rgba(16,185,129,0.16)]",
      chip: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
      bar: "from-emerald-400 to-emerald-700",
    };
  }

  if (faction === "mecha") {
    return {
      ring: "border-cyan-500/30",
      glow: "shadow-[0_0_35px_rgba(34,211,238,0.16)]",
      chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-100",
      bar: "from-cyan-300 to-cyan-700",
    };
  }

  if (faction === "spirit") {
    return {
      ring: "border-violet-500/30",
      glow: "shadow-[0_0_35px_rgba(168,85,247,0.16)]",
      chip: "border-violet-500/30 bg-violet-500/10 text-violet-100",
      bar: "from-violet-300 to-violet-700",
    };
  }

  return {
    ring: "border-white/15",
    glow: "shadow-[0_0_28px_rgba(255,255,255,0.05)]",
    chip: "border-white/15 bg-white/5 text-white/90",
    bar: "from-white/80 to-white/30",
  };
}

const battleModes: ArenaMode[] = [
  {
    title: "Ranked",
    subtitle: "Primary ladder combat",
    body: "High-risk competitive queue with rank pressure, rewards, and faction visibility.",
  },
  {
    title: "Practice",
    subtitle: "Low-pressure sparring",
    body: "Controlled matches for learning builds, pacing, and weapon rhythm without ladder pressure.",
  },
  {
    title: "Tournament",
    subtitle: "Scheduled event combat",
    body: "Bracket-based combat reserved for seasonal events, prestige rewards, and public standings.",
  },
];

export default function ArenaPage() {
  const router = useRouter();
  const { state } = useGame();
  const { player } = state;

  const [selectedMode, setSelectedMode] = useState<ArenaMode>(battleModes[0]);
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const matchmakingTimerRef = useRef<number | null>(null);

  const factionAccent = getFactionAccent(player.factionAlignment);
  const conditionLabel = getConditionLabel(player.condition);
  const arenaEligibility = getArenaEligibility(player.condition);

  const liveCards = [
    {
      label: "Faction Alignment",
      value: formatFactionLabel(player.factionAlignment),
      hint: "Arena modifiers can later react to your active path.",
    },
    {
      label: "Condition",
      value: `${player.condition}%`,
      hint: `${conditionLabel} — live shared player state.`,
    },
    {
      label: "Arena Access",
      value: arenaEligibility,
      hint: "Eligibility is based on current combat condition.",
    },
  ];

  const rules = [
    "Condition below 40% restricts ranked participation.",
    "Arena tuning will later apply PvP-specific combat modifiers.",
    "Faction flavor remains visible, but combat balance overrides raw path advantage.",
    "Ranked rewards will scale with performance tier, not only participation.",
  ];

  const rewards = [
    { label: "Credits", value: "Base payout" },
    { label: "Influence", value: "Arena reputation" },
    { label: "Rank Progress", value: "Season ladder" },
    { label: "Prestige Items", value: "Future unlocks" },
  ];

  useEffect(() => {
    return () => {
      if (matchmakingTimerRef.current !== null) {
        window.clearTimeout(matchmakingTimerRef.current);
      }
    };
  }, []);

  function handleSelectMode(mode: ArenaMode) {
    if (matchmakingTimerRef.current !== null) {
      window.clearTimeout(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    setSelectedMode(mode);
    setQueueState("idle");
  }

  function handleQueue() {
    if (arenaEligibility !== "Eligible") return;

    if (matchmakingTimerRef.current !== null) {
      window.clearTimeout(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    setQueueState("searching");

    matchmakingTimerRef.current = window.setTimeout(() => {
      setQueueState("matched");
      matchmakingTimerRef.current = null;
    }, 2000);
  }

  function handleCancelQueue() {
    if (matchmakingTimerRef.current !== null) {
      window.clearTimeout(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    setQueueState("idle");
  }

  function handleEnterMatch() {
    if (matchmakingTimerRef.current !== null) {
      window.clearTimeout(matchmakingTimerRef.current);
      matchmakingTimerRef.current = null;
    }

    setQueueState("idle");
    router.push("/arena/match");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(110,50,70,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={arenaScreenData.eyebrow}
          title={arenaScreenData.title}
          subtitle={arenaScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {liveCards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Battle Modes"
            description="Core combat lanes for ranked pressure, controlled practice, and seasonal competitive events."
          >
            <ArenaModesCard
              battleModes={battleModes}
              chipClassName={factionAccent.chip}
              panelClassName={`${factionAccent.ring} ${factionAccent.glow}`}
              selectedModeTitle={selectedMode.title}
              onSelectMode={handleSelectMode}
            />
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Match Console"
              description="Live readiness, queue state, and match-entry checkpoint."
            >
              <ArenaConsoleCard
                arenaEligibility={arenaEligibility}
                condition={player.condition}
                barClassName={factionAccent.bar}
                selectedMode={selectedMode}
                queueState={queueState}
                onQueue={handleQueue}
                onCancelQueue={handleCancelQueue}
                onEnterMatch={handleEnterMatch}
              />
            </SectionCard>

            <SectionCard
              title="Combat Ruleset"
              description="Arena-specific tuning that will later balance PvP separately from PvE."
            >
              <ArenaRulesCard rules={rules} />
            </SectionCard>

            <SectionCard
              title="Reward Track"
              description="Planned reward categories for ranked, event, and progression-linked arena combat."
            >
              <ArenaRewardsCard rewards={rewards} />
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  );
}