"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/features/game/gameContext";

export default function HomeOnboardingGuard() {
  const { state } = useGame();
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    const name = state.player.playerName?.trim() ?? "";
    const isUnbound = state.player.factionAlignment === "unbound";
    if ((!name || name === "Void Walker") && isUnbound) {
      checked.current = true;
      router.replace("/new-game");
    }
  }, [state.player.playerName, state.player.factionAlignment, router]);

  return null;
}
