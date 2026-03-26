"use client";

import BazaarSubpageNav from "@/components/bazaar/BazaarSubpageNav";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { ZoneDoctrinePressurePanel } from "@/components/factions/ZoneDoctrinePressurePanel";
import {
  canonFactionOrder,
  getFactionLabel,
  getFactionWingLabel,
} from "@/features/canonRegistry";
import { useGame } from "@/features/game/gameContext";
import { getFactionHqsScreenData } from "@/features/faction-hqs/factionHqsScreenData";
import {
  FACTION_HQ_STIPEND_COOLDOWN_MS,
  computeFactionHqStipend,
} from "@/features/factions/factionWorldLogic";

export default function FactionHqsPage() {
  const { state, dispatch } = useGame();
  const screenData = getFactionHqsScreenData(state);

  const currentAlignment = state.player.factionAlignment;
  const lastClaim = state.player.lastFactionHqStipendAt ?? 0;
  const nextClaimAt = lastClaim + FACTION_HQ_STIPEND_COOLDOWN_MS;
  /* Stipend countdown — intentional wall clock read for UX. */
  // eslint-disable-next-line react-hooks/purity -- live cooldown display
  const now = Date.now();
  const canClaim =
    currentAlignment !== "unbound" && now >= nextClaimAt;
  const stipendPreview = computeFactionHqStipend(state.player);

  function joinFaction(faction: (typeof canonFactionOrder)[number]) {
    dispatch({ type: "SET_FACTION_ALIGNMENT", payload: faction });
  }

  function claimStipend() {
    dispatch({ type: "CLAIM_FACTION_HQ_STIPEND" });
  }

  const cooldownRemainingMin =
    nextClaimAt > now
      ? Math.ceil((nextClaimAt - now) / 60000)
      : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,40,120,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <BazaarSubpageNav
          accentClassName="hover:border-fuchsia-300/40"
          backHref="/factions"
          backLabel="Back to Factions"
        />

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

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title="Doctrine Wings"
            description="Pick a path. HQs only pay stipends to aligned operatives."
          >
            <div className="space-y-6">
              <div className="space-y-3">
                {canonFactionOrder.map((faction) => {
                  const accentClass =
                    faction === "bio"
                      ? "border-emerald-400/20 bg-emerald-500/10 hover:bg-emerald-500/20"
                      : faction === "mecha"
                        ? "border-cyan-400/20 bg-cyan-500/10 hover:bg-cyan-500/20"
                        : "border-violet-400/20 bg-violet-500/10 hover:bg-violet-500/20";

                  return (
                    <button
                      key={faction}
                      type="button"
                      onClick={() => joinFaction(faction)}
                      className={`block w-full rounded-xl border p-4 text-left text-sm text-white transition ${accentClass}`}
                    >
                      {getFactionWingLabel(faction)}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                  HQ stipend (4h lockout)
                </p>
                <p className="mt-2 text-white/80">
                  Next payout (aligned): {stipendPreview.credits} credits, +
                  {stipendPreview.influence} influence. Territory bonus applies
                  when your doctrine leads void regions.
                </p>
                {currentAlignment === "unbound" ? (
                  <p className="mt-2 text-amber-200/80">
                    Align with a wing to claim wages.
                  </p>
                ) : canClaim ? (
                  <button
                    type="button"
                    onClick={claimStipend}
                    className="mt-3 w-full rounded-xl border border-fuchsia-400/35 bg-fuchsia-500/15 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/25"
                  >
                    Claim stipend
                  </button>
                ) : (
                  <p className="mt-3 text-xs text-white/50">
                    Next claim in ~{cooldownRemainingMin} min.
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Theatre stakes"
            description="Where your contracts and field raids shift doctrine pressure."
          >
            <ZoneDoctrinePressurePanel
              zoneDoctrinePressure={state.player.zoneDoctrinePressure}
              factionAlignment={state.player.factionAlignment}
            />
          </SectionCard>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-center text-sm text-white/55">
          Current affiliation:{" "}
          <span className="text-white/85">{getFactionLabel(currentAlignment)}</span>
          {" · "}
          Mercenary ledger:{" "}
          <span className="text-white/85">{state.player.guildContributionTotal}</span>
          {" · "}
          Guild:{" "}
          <span className="text-white/85">
            {state.player.guild.kind === "inGuild"
              ? `${state.player.guild.guildName} (${getFactionLabel(state.player.guild.pledge)})`
              : "None"}
          </span>
        </div>
      </div>
    </main>
  );
}
