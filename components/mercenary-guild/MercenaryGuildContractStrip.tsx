"use client";

import Link from "next/link";
import SectionCard from "@/components/shared/SectionCard";
import { useGame } from "@/features/game/gameContext";
import {
  GUILD_CONTRACT_TEMPLATES,
  getContractProgressPct,
} from "@/features/social/guildLiveLogic";
import { enforceCapacity } from "@/features/resources/inventoryLogic";

export default function MercenaryGuildContractStrip() {
  const { state, dispatch } = useGame();
  const guild = state.player.guild;
  const contracts = state.player.guildContracts ?? [];
  const activeContract = contracts.find((c) => c.status !== "claimed") ?? null;
  const activePct = activeContract
    ? getContractProgressPct(state.player, activeContract)
    : 0;

  return (
    <SectionCard
      title="Guild Contracts"
      description="Post a shared contract here; hunting-ground runs in the contract zone pay into the guild ledger until the contract clears."
    >
      {guild.kind !== "inGuild" ? (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/55">
          <p>
            Guild contracts require a guild. Found or join one from the
            collective board.
          </p>
          <Link
            href="/guild"
            className="mt-3 inline-flex rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-500/16"
          >
            Open guild screen
          </Link>
        </div>
      ) : activeContract ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
            Active · {activeContract.zoneId}
          </p>
          <p className="mt-1 text-base font-black text-white/90">
            {activeContract.title}
          </p>
          <p className="mt-2 text-sm text-white/70">
            {activeContract.description}
          </p>
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-cyan-400/70"
                style={{ width: `${activePct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/55">
              Progress: {activePct}% · needs +
              {activeContract.targetContributionDelta} contribution since
              posting
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              enforceCapacity(state.player.resources, activeContract.reward);
              dispatch({
                type: "GUILD_CLAIM_CONTRACT",
                payload: { contractId: activeContract.id },
              });
            }}
            disabled={activePct < 100}
            className="mt-4 w-full rounded-xl border border-amber-400/25 bg-amber-500/12 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-amber-100 transition enabled:hover:bg-amber-500/18 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Claim payout
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {GUILD_CONTRACT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                dispatch({
                  type: "GUILD_POST_CONTRACT",
                  payload: { templateId: t.id },
                })
              }
              className="block w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                {t.zoneId}
              </p>
              <p className="mt-1 text-base font-black text-white/90">
                {t.title}
              </p>
              <p className="mt-2 text-sm text-white/70">{t.description}</p>
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
