"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { getTeleportGateScreenData } from "@/features/teleport-gate/teleportGateScreenData";

const routeOptions = [
  "City Routes",
  "Danger Zones",
  "Expedition Paths",
];

export default function TeleportGatePage() {
  const { state, dispatch } = useGame();
  const screenData = getTeleportGateScreenData(state);

  const gateStatus = state.player.districtState.gateStatus;
  const unlockedRoutes = state.player.unlockedRoutes;

  function setGateStatus(status: "standby" | "charging" | "open") {
    dispatch({ type: "SET_GATE_STATUS", payload: status });
  }

  function unlockRoute(route: string) {
    dispatch({ type: "UNLOCK_ROUTE", payload: route });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,90,150,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={screenData.eyebrow}
          title={screenData.title}
          subtitle={screenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {screenData.cards.map((card) => (
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
            title="Travel Channels"
            description="Unlock routes and prepare the gate for future travel systems."
          >
            <div className="space-y-3">
              {routeOptions.map((route) => (
                <button
                  key={route}
                  type="button"
                  onClick={() => unlockRoute(route)}
                  className="block w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm text-white/70 transition hover:bg-white/10"
                >
                  {route}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Gate Console"
            description="Live gate controls for shared travel state."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                Current gate status: {gateStatus}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                Unlocked routes:{" "}
                {unlockedRoutes.length > 0 ? unlockedRoutes.join(", ") : "None"}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setGateStatus("charging")}
                  className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
                >
                  Charge Gate
                </button>

                <button
                  type="button"
                  onClick={() => setGateStatus("open")}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  Open Gate
                </button>

                <button
                  type="button"
                  onClick={() => setGateStatus("standby")}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Return to Standby
                </button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}