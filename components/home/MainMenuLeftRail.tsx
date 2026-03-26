"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Briefcase,
  BrainCircuit,
  FolderKanban,
  Play,
  Settings,
  Store,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useGame } from "@/features/game/gameContext";
import {
  mainMenuItems,
  type MainMenuIconKey,
  type MainMenuItem,
} from "@/features/home/mainMenuData";
import { useActiveProcessTimer } from "@/features/exploration/useActiveProcessTimer";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

const iconMap: Record<MainMenuIconKey, LucideIcon> = {
  play: Play,
  folder: FolderKanban,
  briefcase: Briefcase,
  brain: BrainCircuit,
  wrench: Wrench,
  store: Store,
  trophy: Trophy,
  users: Users,
  settings: Settings,
};

/** Default hunting-ground contract id — expedition deploy still queues this mission. */
const DEFAULT_DEPLOY_HG_MISSION_ID = "hg-rustfang-prowl";

export default function MainMenuLeftRail() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useGame();
  const isFieldActive = pathname === "/home";
  const missionQueue = Array.isArray(state.player.missionQueue)
    ? state.player.missionQueue
    : [];
  const isQueueFull =
    missionQueue.length >= state.player.maxMissionQueueSlots;
  const defaultDeployMission = state.missions.find(
    (m) => m.id === DEFAULT_DEPLOY_HG_MISSION_ID,
  );
  const activeHuntProcess =
    state.player.activeProcess?.kind === "hunt"
      ? state.player.activeProcess
      : null;
  /** Informational only: button is always clickable in alpha. */
  const huntBlocksDeploy =
    activeHuntProcess !== null && activeHuntProcess.status === "running";
  const { remainingSeconds, isRunning } =
    useActiveProcessTimer(activeHuntProcess);
  const pendingHomeResultNavRef = useRef(false);
  const lastHandledHuntResultAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pendingHomeResultNavRef.current) {
      return;
    }

    const result = state.player.lastHuntResult;
    if (!result) {
      return;
    }

    const mission = state.missions.find((m) => m.id === result.missionId);
    if (mission?.category !== "hunting-ground") {
      return;
    }

    if (lastHandledHuntResultAtRef.current === result.resolvedAt) {
      return;
    }

    lastHandledHuntResultAtRef.current = result.resolvedAt;
    pendingHomeResultNavRef.current = false;
    router.push("/bazaar/biotech-labs/result");
  }, [state.player.lastHuntResult, state.missions, router]);

  function handleStartVoidHunt() {
    pendingHomeResultNavRef.current = true;
    router.push(VOID_EXPEDITION_PATH);
  }

  const deployStatusLine = activeHuntProcess
    ? huntBlocksDeploy
      ? "Hunt active"
      : "Ready"
    : isQueueFull
      ? "Queue full"
      : "Ready";

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/45 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <button
        type="button"
        onClick={handleStartVoidHunt}
        disabled={false}
        className={[
          "group mb-3 block w-full rounded-[22px] border px-4 py-4 text-left shadow-[0_0_30px_rgba(255,50,50,0.12)] transition",
          "border-red-500/30 bg-[linear-gradient(135deg,rgba(130,18,18,0.88),rgba(45,8,8,0.92))] hover:border-red-400/45 hover:brightness-110",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/80">
            Deployment
          </div>
          <div
            className={[
              "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
              activeHuntProcess
                ? "border-amber-300/40 bg-amber-300/14 text-amber-50"
                : isFieldActive
                  ? "border-cyan-300/40 bg-cyan-300/14 text-cyan-50"
                  : "border-white/10 bg-black/20 text-white/55",
            ].join(" ")}
          >
            {activeHuntProcess
              ? isRunning
                ? `Hunt ${remainingSeconds}s`
                : "Resolving"
              : isQueueFull
                ? "Queue Full"
                : isFieldActive
                  ? "Field Active"
                  : "Ready"}
          </div>
        </div>

        <div className="mt-2 text-[34px] font-black uppercase leading-[0.92] text-white">
          Deploy
          <br />
          Into the Void
        </div>

        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
          {deployStatusLine}
        </p>

        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
          Void Expedition · realm path · shared mission queue
        </p>

        <p className="mt-3 max-w-[260px] text-sm leading-6 text-white/72">
          {activeHuntProcess && isRunning
            ? "AFK hunt is live on the mission timer. If you deployed from here, the Hunt Result screen opens when the contract resolves."
            : activeHuntProcess && !isRunning
              ? "Contract is finishing payout resolution."
              : isQueueFull
                ? "Mission queue is full. Clear or wait for a hunting contract slot before deploying again."
                : `Sends you to Void Expedition to choose realm and queue ${defaultDeployMission?.title ?? "the short hunting-ground sortie"}, then opens the live void field while the timer runs.`}
        </p>
      </button>

      <nav className="space-y-2">
        {mainMenuItems.map((item: MainMenuItem) => {
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "group flex min-h-[56px] items-center gap-3 rounded-[18px] border px-4 transition duration-200",
                item.isPrimary
                  ? "border-red-500/35 bg-[linear-gradient(135deg,rgba(80,12,12,0.88),rgba(22,10,10,0.94))] text-white shadow-[0_0_24px_rgba(255,60,60,0.10)]"
                  : "border-white/10 bg-[linear-gradient(135deg,rgba(18,20,30,0.86),rgba(8,10,18,0.94))] text-white/88 hover:border-white/20 hover:bg-[linear-gradient(135deg,rgba(24,27,40,0.92),rgba(10,12,20,0.96))]",
              ].join(" ")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5">
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="flex-1">
                <div className="text-[22px] font-black uppercase leading-none tracking-[0.04em]">
                  {item.label}
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35 transition group-hover:text-white/55">
                Open
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
