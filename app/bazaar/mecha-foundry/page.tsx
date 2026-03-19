"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { getMechaFoundryScreenData } from "@/features/mecha-foundry/mechaFoundryScreenData";

export default function MechaFoundryPage() {
  const { state, dispatch } = useGame();
  const mechaFoundryScreenData = getMechaFoundryScreenData(state);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,90,130,0.24),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <ScreenHeader
          eyebrow={mechaFoundryScreenData.eyebrow}
          title={mechaFoundryScreenData.title}
          subtitle={mechaFoundryScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {mechaFoundryScreenData.cards.map((card) => (
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
            title="Upgrade Bays"
            description="Reserved for frame upgrades, weapon tuning, module installation, and precision enhancement systems."
          >
            <div className="space-y-3">
              {["Frame Calibration", "Weapon Mounting", "Module Socketing"].map(
                (entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => dispatch({ type: "SET_MECHA_STATUS", payload: "upgrading" })}
                    className="block w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left text-sm text-white/65 transition hover:bg-white/10"
                  >
                    {entry}
                  </button>
                )
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Systems Console"
            description="Future diagnostics, stat changes, and enhancement validation."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Current mecha status: {state.player.districtState.mechaStatus}
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: "SET_MECHA_STATUS", payload: "ready" })}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
              >
                Mark System Ready
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}