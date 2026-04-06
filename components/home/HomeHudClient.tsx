"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { useGame } from "@/features/game/gameContext";
import type { FactionAlignment, GameState } from "@/features/game/gameTypes";
import ConditionWidget from "@/components/home/ConditionWidget";
import HomeResourceStrip from "@/components/home/HomeResourceStrip";
import { getFirstSessionGuidance } from "@/features/guidance/firstSessionGuidance";
import { getProgressionMeaning } from "@/features/game/gameSelectors";
import {
  HOME_BOTTOM_NAV_BOTTOM,
  HOME_MOBILE_PANEL_BOTTOM_CLEARANCE,
  HOME_MOBILE_SCROLL_TOP,
  HOME_RESOURCE_STRIP_BOTTOM,
} from "@/config/layout";

type PathSelection = Exclude<FactionAlignment, "unbound">;

function getSelectedPath(alignment: FactionAlignment): PathSelection | null {
  return alignment === "unbound" ? null : alignment;
}

function needsCriticalRecovery(player: GameState["player"]) {
  return player.condition < 40 || player.hunger < 40;
}

type PrimaryAction = {
  phase: "prep" | "deploy" | "return" | "recover";
  headline: string;
  detail: string;
  hint: string;
  label: string;
  href: string;
  tone: "danger" | "ready";
};

function getPrimaryAction(state: GameState): PrimaryAction {
  const { player } = state;
  const hasActiveDeploy =
    player.voidRealtimeBinding !== null || player.activeProcess !== null;
  const queueIsEmpty = (player.missionQueue?.length ?? 0) === 0;

  if (hasActiveDeploy) {
    return {
      phase: "deploy",
      headline: "Continue Deployment",
      detail:
        player.voidRealtimeBinding !== null
          ? "The field is already open. Finish the hunt now, then return with the haul before you think about another lane."
          : "An active contract is already moving. Let it resolve, close the return, and only then choose the next push.",
      hint: "Now: finish the run. Next: return, settle, then recover or prep again.",
      label: "Continue Deployment",
      href: player.voidRealtimeBinding !== null ? "/void-field" : "/missions",
      tone: "ready",
    };
  }

  if (needsCriticalRecovery(player)) {
    return {
      phase: "recover",
      headline: "Stabilize in Black Market",
      detail:
        "Your body is slipping. Recover posture and supplies before you prep another contract or step back into the Void.",
      hint: "Now: recover. Next: prep the next run once the pressure drops.",
      label: "Stabilize in Black Market",
      href: "/bazaar/black-market",
      tone: "danger",
    };
  }

  if (queueIsEmpty) {
    return {
      phase: "prep",
      headline: "Prep the Next Contract",
      detail:
        "No contract chain is holding. Open Missions, choose the next job, and set the next deployment in motion.",
      hint: "Now: prep in Missions. Next: deploy as soon as the contract is set.",
      label: "Prep in Missions",
      href: "/missions",
      tone: "ready",
    };
  }

  return {
    phase: "deploy",
    headline: "Enter the Void",
    detail:
      "The contract chain is already primed and your vitals are holding. Stop lingering in the hub and press the field now.",
    hint: "Now: deploy. Next: return with the haul, then recover and repeat.",
    label: "Enter the Void",
    href: "/deploy-into-void",
    tone: "ready",
  };
}

function PrimaryActionCard({ action }: { action: PrimaryAction }) {
  const isDanger = action.tone === "danger";

  return (
    <section
      className={[
        "rounded-[26px] border p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-md sm:p-6",
        isDanger
          ? "border-amber-300/35 bg-[linear-gradient(165deg,rgba(72,34,10,0.92),rgba(16,10,8,0.98))]"
          : "border-cyan-300/25 bg-[linear-gradient(165deg,rgba(20,28,42,0.94),rgba(8,10,16,0.98))]",
      ].join(" ")}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
        {action.phase} phase
      </div>
      <h1 className="mt-2 text-2xl font-black uppercase tracking-[0.06em] text-white sm:text-3xl">
        {action.headline}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/74 sm:text-[15px]">
        {action.detail}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/48">
        {action.hint}
      </p>
      <Link
        href={action.href}
        className={[
          "mt-5 flex min-h-[56px] w-full items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-black uppercase tracking-[0.14em] transition touch-manipulation",
          isDanger
            ? "border-amber-200/35 bg-amber-500/16 text-amber-50 hover:border-amber-100/55 hover:bg-amber-500/24"
            : "border-cyan-200/25 bg-cyan-500/12 text-cyan-50 hover:border-cyan-100/45 hover:bg-cyan-500/20",
        ].join(" ")}
      >
        {action.label}
      </Link>
    </section>
  );
}

export default function HomeHudClient() {
  const { state, dispatch } = useGame();
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname ?? "";
    if (pathname !== "/home") return;
    if (!prev || prev === "/home") return;
    if (state.player.runInstability > 0) {
      dispatch({ type: "RESET_RUN_INSTABILITY" });
    }
  }, [pathname, state.player.runInstability, dispatch]);

  const selectedPath = getSelectedPath(state.player.factionAlignment);
  const guidance = getFirstSessionGuidance(state);
  const progressionMeaning = getProgressionMeaning(state);
  const primaryAction = getPrimaryAction(state);

  return (
    <>
      <section
        className="fixed inset-x-0 z-30 overflow-y-auto overscroll-y-contain px-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))]"
        style={{
          top: `max(${HOME_MOBILE_SCROLL_TOP}, env(safe-area-inset-top, 0px))`,
          bottom: `calc(${HOME_MOBILE_PANEL_BOTTOM_CLEARANCE} + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pb-8 pt-1 sm:gap-7 sm:pb-10">
          <PrimaryActionCard action={primaryAction} />
          <ConditionWidget
            path={selectedPath}
            rank={state.player.rank}
            rankLevel={state.player.rankLevel}
            rankXp={state.player.rankXp}
            rankXpToNext={state.player.rankXpToNext}
            condition={state.player.condition}
            hunger={state.player.hunger}
            masteryProgress={state.player.masteryProgress}
            loopStateLabel={guidance.stateLabel}
            nextStepLabel={guidance.nextStepLabel}
            progressionMeaning={progressionMeaning}
          />
          <p className="px-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42 sm:text-[12px]">
            Act now or lose ground.
          </p>
        </div>
      </section>

      <section
        className="pointer-events-none fixed inset-x-0 z-30 px-3 pr-[max(0.75rem,env(safe-area-inset-right,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] sm:px-6"
        style={{ bottom: HOME_RESOURCE_STRIP_BOTTOM }}
      >
        <div className="pointer-events-auto mx-auto w-full min-w-0 max-w-4xl">
          <HomeResourceStrip />
        </div>
      </section>

      <section
        className="absolute inset-x-3 z-30 pr-[max(0.25rem,env(safe-area-inset-right,0px))] pl-[max(0.25rem,env(safe-area-inset-left,0px))] xl:inset-x-7"
        style={{ bottom: HOME_BOTTOM_NAV_BOTTOM }}
      >
        <BottomNav />
      </section>
    </>
  );
}
