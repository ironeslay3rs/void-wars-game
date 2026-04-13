"use client";

/**
 * GuildRosterPanel — member list + contribution leaderboard.
 *
 * Caller passes a pre-sorted `LeaderboardRow[]` (descending contribution,
 * ties by seniority) plus the raw member list so role chips can render.
 * Presentational: no dispatch.
 *
 * Canon copy: Pure never "Spirit". Role labels stay crew-scale.
 */

import type { LeaderboardRow } from "@/features/guild/contributionLedger";
import type { GuildMember, GuildMemberRole } from "@/features/guild/guildTypes";

const ROLE_LABEL: Record<GuildMemberRole, string> = {
  founder: "Founder",
  officer: "Officer",
  member: "Member",
  initiate: "Initiate",
};

const ROLE_CHIP: Record<GuildMemberRole, string> = {
  founder: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  officer: "border-cyan-400/35 bg-cyan-500/12 text-cyan-100",
  member: "border-white/20 bg-white/5 text-white/80",
  initiate: "border-white/15 bg-black/25 text-white/55",
};

export type GuildRosterPanelProps = {
  members: GuildMember[];
  leaderboard: LeaderboardRow[];
  /** Optional: highlight this member (the viewer). */
  selfMemberId?: string;
  className?: string;
};

export default function GuildRosterPanel({
  members,
  leaderboard,
  selfMemberId,
  className,
}: GuildRosterPanelProps) {
  const byId = new Map(members.map((m) => [m.id, m] as const));
  const total = leaderboard.reduce((a, r) => a + r.contribution, 0);

  return (
    <section
      aria-label="Guild roster"
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white ${className ?? ""}`}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Roster · {leaderboard.length}
        </div>
        <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
          Leaderboard
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-[11px] leading-relaxed text-white/50">
          No members on the wall yet.
        </p>
      ) : (
        <ol className="space-y-1.5" role="list">
          {leaderboard.map((row, idx) => {
            const member = byId.get(row.memberId);
            const role: GuildMemberRole = member?.role ?? "member";
            const share = total > 0 ? Math.round((row.contribution / total) * 100) : 0;
            const isSelf = selfMemberId === row.memberId;
            return (
              <li
                key={row.memberId}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${
                  isSelf
                    ? "border-cyan-400/35 bg-cyan-500/8"
                    : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-[11px] font-black tabular-nums text-white/55">
                    {idx + 1}
                  </span>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] ${ROLE_CHIP[role]}`}
                  >
                    {ROLE_LABEL[role]}
                  </span>
                  <span className="truncate text-[12px] font-bold tracking-[0.04em] text-white/90">
                    {row.displayName}
                    {isSelf ? (
                      <span className="ml-1 text-[10px] font-semibold tracking-[0.1em] text-cyan-200/80">
                        · you
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[11px] font-black tabular-nums text-white/90">
                    {row.contribution.toLocaleString()}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.14em] text-white/40">
                    {share}% share
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
