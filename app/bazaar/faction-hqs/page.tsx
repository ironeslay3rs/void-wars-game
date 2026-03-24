"use client";

import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { useGame } from "@/features/game/gameContext";
import { getFactionHqsScreenData } from "@/features/faction-hqs/factionHqsScreenData";

export default function FactionHqsPage() {
  const { state, dispatch } = useGame();
  const screenData = getFactionHqsScreenData(state);

  const currentAlignment = state.player.factionAlignment;
  const influence = state.player.influence;

  function joinFaction(faction: "bio" | "mecha" | "spirit") {
    dispatch({ type: "SET_FACTION_ALIGNMENT", payload: faction });
  }

  function gainInfluence(amount: number) {
    dispatch({ type: "ADD_INFLUENCE", payload: amount });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,40,120,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
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
            title="School Wings"
            description="Choose a school alignment and begin building influence inside the Bazaar."
          >
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => joinFaction("bio")}
                className="block w-full rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-left text-sm text-white transition hover:bg-emerald-500/20"
              >
                Verdant Coil Wing
              </button>

              <button
                type="button"
                onClick={() => joinFaction("mecha")}
                className="block w-full rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-left text-sm text-white transition hover:bg-cyan-500/20"
              >
                Chrome Synod Wing
              </button>

              <button
                type="button"
                onClick={() => joinFaction("spirit")}
                className="block w-full rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-left text-sm text-white transition hover:bg-violet-500/20"
              >
                Ember Vault Wing
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="Faction Console"
            description="Live alignment and influence controls for the shared game state."
          >
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                Current faction: {currentAlignment}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                Current influence: {influence}
              </div>

              <button
                type="button"
                onClick={() => gainInfluence(10)}
                className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
              >
                Gain 10 Influence
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}