"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { guildScreenData } from "@/features/guild/guildScreenData";
import { useGame } from "@/features/game/gameContext";
import { getFactionLabel } from "@/features/canonRegistry";
import {
  buildLocalRivalTable,
  GUILD_CONTRACT_TEMPLATES,
  getContractProgressPct,
} from "@/features/social/guildLiveLogic";

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function GuildPage() {
  const { state, dispatch } = useGame();
  const total = state.player.guildContributionTotal ?? 0;
  const log = state.player.guildContributionLog ?? [];
  const standing =
    total >= 240 ? "Vanguard broker" : total >= 80 ? "Bonded contractor" : "Probationary";
  const guild = state.player.guild;
  const contracts = state.player.guildContracts ?? [];
  const activeContract = contracts.find((c) => c.status !== "claimed") ?? null;
  const activePct = activeContract ? getContractProgressPct(state.player, activeContract) : 0;

  const [newGuildName, setNewGuildName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [newMember, setNewMember] = useState("");

  const rivals = useMemo(() => buildLocalRivalTable(state.player), [state.player]);
  const contractChoices = useMemo(() => GUILD_CONTRACT_TEMPLATES, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(60,90,90,0.22),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow={guildScreenData.eyebrow}
          title={guildScreenData.title}
          subtitle={guildScreenData.subtitle}
        />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/factions"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-white/10"
          >
            Regional stakes
          </Link>
          <Link
            href="/market/faction-hqs"
            className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:bg-fuchsia-500/15"
          >
            Faction HQs
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PlaceholderPanel
            label="Mercenary standing"
            value={standing}
            hint="Rises as you bank guild contribution from hunts and realtime void work."
          />
          <PlaceholderPanel
            label="Contribution points"
            value={String(total)}
            hint="Serverless ledger — single-player sim of the Black Market guild pool."
          />
          <PlaceholderPanel
            label="Doctrine context"
            value={getFactionLabel(state.player.factionAlignment)}
            hint="Contribution still accrues unbound; stipends and pressure bonuses want alignment."
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Contribution log"
            description="Latest mercenary strikes registered with the guild."
          >
            {log.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                Close a hunting contract or finish realtime field work to generate
                entries.
              </div>
            ) : (
              <ul className="space-y-2">
                {log.map((entry, i) => (
                  <li
                    key={`${entry.at}-${i}`}
                    className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="text-white/85">{entry.reason}</p>
                      <p className="text-xs text-white/45">{formatTime(entry.at)}</p>
                    </div>
                    <span className="shrink-0 tabular-nums text-cyan-200/90">
                      +{entry.amount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Guild roster"
            description="Guilds are now live in your save. This is a local-first social layer (no invites/presence yet)."
          >
            {guild.kind === "none" ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    Found a guild
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={newGuildName}
                      onChange={(e) => setNewGuildName(e.target.value)}
                      placeholder="Guild name"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus-visible:border-cyan-300/35 focus-visible:ring-2 focus-visible:ring-cyan-400/25"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "GUILD_CREATE", payload: { guildName: newGuildName } })
                      }
                      className="rounded-xl border border-cyan-400/25 bg-cyan-500/12 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-cyan-100 transition hover:bg-cyan-500/18"
                    >
                      Found
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    Join by code
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="6-digit guild code"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus-visible:border-fuchsia-300/35 focus-visible:ring-2 focus-visible:ring-fuchsia-400/25"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({ type: "GUILD_JOIN", payload: { guildCode: joinCode } })
                      }
                      className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/12 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-fuchsia-100 transition hover:bg-fuchsia-500/18"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                        Guild
                      </p>
                      <p className="mt-1 text-lg font-black text-white/90">{guild.guildName}</p>
                      <p className="mt-1 text-xs text-white/55">
                        Code: <span className="font-semibold text-white/75">{guild.guildCode}</span>
                        {" · "}Pledge:{" "}
                        <span className="font-semibold text-white/75">{getFactionLabel(guild.pledge)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "GUILD_LEAVE" })}
                      className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-red-50 transition hover:bg-red-500/16"
                    >
                      Leave
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    Faction pledge
                  </p>
                  <p className="mt-2 text-xs text-white/55">
                    Pledge affects how your guild reads in faction HQs and war pressure copy. Multiplayer authority comes later.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {(["bio", "mecha", "pure"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => dispatch({ type: "GUILD_SET_PLEDGE", payload: { pledge: p } })}
                        className={[
                          "rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
                          guild.pledge === p
                            ? "border-emerald-400/35 bg-emerald-500/12 text-emerald-50"
                            : "border-white/10 bg-black/25 text-white/65 hover:bg-white/[0.06]",
                        ].join(" ")}
                      >
                        {getFactionLabel(p)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                    Add member (local)
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      placeholder="Callsigned operative"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus-visible:border-emerald-300/35 focus-visible:ring-2 focus-visible:ring-emerald-400/25"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({ type: "GUILD_ADD_MEMBER", payload: { callsign: newMember } });
                        setNewMember("");
                      }}
                      className="rounded-xl border border-emerald-400/25 bg-emerald-500/12 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-emerald-100 transition hover:bg-emerald-500/18"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {guild.members.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-white/85">{m.callsign}</p>
                          <p className="text-xs text-white/45">{m.role}</p>
                        </div>
                        {m.role === "Founder" ? (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                            Anchor
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({ type: "GUILD_REMOVE_MEMBER", payload: { memberId: m.id } })
                            }
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 transition hover:bg-white/[0.08]"
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Shared contracts"
            description="Post one contract. Progress is driven by your guild contribution ledger."
          >
            {guild.kind !== "inGuild" ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/50">
                Found or join a guild to post shared contracts.
              </div>
            ) : activeContract ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Active
                </p>
                <p className="mt-1 text-base font-black text-white/90">{activeContract.title}</p>
                <p className="mt-2 text-sm text-white/70">{activeContract.description}</p>
                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-cyan-400/70" style={{ width: `${activePct}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/55">
                    Progress: {activePct}% · needs +{activeContract.targetContributionDelta} contribution since posting
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "GUILD_CLAIM_CONTRACT", payload: { contractId: activeContract.id } })
                  }
                  disabled={activePct < 100}
                  className="mt-4 w-full rounded-xl border border-amber-400/25 bg-amber-500/12 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-amber-100 transition enabled:hover:bg-amber-500/18 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Claim payout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {contractChoices.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => dispatch({ type: "GUILD_POST_CONTRACT", payload: { templateId: t.id } })}
                    className="block w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:bg-white/[0.07]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      {t.zoneId}
                    </p>
                    <p className="mt-1 text-base font-black text-white/90">{t.title}</p>
                    <p className="mt-2 text-sm text-white/70">{t.description}</p>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Guild standings (local)"
            description="Local leaderboard shell until server authority is scheduled."
          >
            <ul className="space-y-2">
              {rivals.map((g, idx) => (
                <li
                  key={g.guildId}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                >
                  <span className="text-white/55 tabular-nums">#{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-white/85">{g.guildName}</p>
                    <p className="text-xs text-white/45">Pledge: {getFactionLabel(g.pledge)}</p>
                  </div>
                  <span className="shrink-0 tabular-nums text-cyan-200/90">{g.contribution}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
