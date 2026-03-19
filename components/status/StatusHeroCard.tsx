"use client";

import { useGame } from "@/features/game/gameContext";

function formatFactionLabel(faction: string) {
  if (faction === "unbound") return "Unbound";
  if (faction === "bio") return "Bio";
  if (faction === "mecha") return "Mecha";
  if (faction === "spirit") return "Spirit";
  return faction;
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

export default function StatusHeroCard() {
  const { state } = useGame();
  const { player } = state;

  const rankProgress = getProgressPercent(
    player.rankXp,
    player.rankXpToNext,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* LEFT PANEL */}
      <div className="rounded-[24px] border border-white/10 p-5">
        <div className="text-xs text-white/50 uppercase">
          {formatFactionLabel(player.factionAlignment)}
        </div>

        <div className="mt-4 text-2xl font-black">
          {player.playerName}
        </div>

        <div className="text-sm text-white/60">
          {player.rank}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-white/40">Level</div>
            <div className="text-xl font-bold">
              {player.rankLevel}
            </div>
          </div>

          <div>
            <div className="text-xs text-white/40">Influence</div>
            <div className="text-xl font-bold">
              {player.influence}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="grid gap-4">
        {/* XP */}
        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>XP</span>
            <span>
              {player.rankXp}/{player.rankXpToNext}
            </span>
          </div>

          <div className="mt-2 h-2 bg-white/10 rounded">
            <div
              className="h-full bg-white"
              style={{ width: `${rankProgress}%` }}
            />
          </div>
        </div>

        {/* CONDITION */}
        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>Condition</span>
            <span>{player.condition}%</span>
          </div>

          <div className="mt-2 h-2 bg-white/10 rounded">
            <div
              className="h-full bg-red-400"
              style={{ width: `${player.condition}%` }}
            />
          </div>

          <div className="text-xs text-white/60 mt-2">
            {getConditionLabel(player.condition)}
          </div>
        </div>

        {/* MASTERY */}
        <div className="rounded-xl border border-white/10 p-4">
          <div className="flex justify-between text-sm">
            <span>Mastery</span>
            <span>{player.masteryProgress}%</span>
          </div>

          <div className="mt-2 h-2 bg-white/10 rounded">
            <div
              className="h-full bg-purple-400"
              style={{ width: `${player.masteryProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}