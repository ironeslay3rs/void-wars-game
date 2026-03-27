"use client";

import Link from "next/link";
import { MessageCircle, Shield, Users2, Star, Clock } from "lucide-react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { useGame } from "@/features/game/gameContext";

function SocialSection({
  icon: Icon,
  title,
  children,
  badge,
}: {
  icon: typeof Users2;
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-white/85">{title}</div>
          {badge ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function SocialPage() {
  const { state } = useGame();
  const { player } = state;
  const hasGuild = player.guildContributionTotal > 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(40,60,110,0.22),_rgba(5,8,20,1)_55%)] px-4 py-8 text-white sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <ScreenHeader
          backHref="/home"
          backLabel="Home"
          eyebrow="Void Wars: Oblivion"
          title="Social"
          subtitle="Guild, allies, messages, and faction standing."
        />

        {/* Guild quick card */}
        <SocialSection icon={Shield} title="Guild" badge={hasGuild ? "Active" : "None"}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Contribution</div>
                <div className="mt-1 text-xl font-black text-white">{player.guildContributionTotal}</div>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 text-center">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Standing</div>
                <div className="mt-1 text-sm font-black text-white">
                  {player.guildContributionTotal >= 240
                    ? "Vanguard"
                    : player.guildContributionTotal >= 80
                      ? "Bonded"
                      : "Probationary"}
                </div>
              </div>
            </div>
            <Link
              href="/guild"
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.05] text-sm font-bold uppercase tracking-[0.14em] text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]"
            >
              Open Guild Dashboard →
            </Link>
          </div>
        </SocialSection>

        {/* Friends */}
        <SocialSection icon={Users2} title="Friends" badge="Soon">
          <div className="space-y-2 text-sm text-white/55">
            <p>Add allies by callsign. See their condition, rank, and active zone in real time.</p>
            <div className="mt-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/30">
              <Users2 className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <div className="text-xs uppercase tracking-[0.18em]">No allies yet</div>
            </div>
          </div>
        </SocialSection>

        {/* Direct messages */}
        <SocialSection icon={MessageCircle} title="Messages" badge="Soon">
          <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/30">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <div className="text-xs uppercase tracking-[0.18em]">No messages</div>
            <p className="mt-2 text-[11px] text-white/25">
              Direct messaging unlocks with guild membership.
            </p>
          </div>
        </SocialSection>

        {/* Recent activity */}
        <SocialSection icon={Clock} title="Recent Activity">
          {player.guildContributionLog.length === 0 ? (
            <p className="text-sm text-white/45">No recent contribution activity.</p>
          ) : (
            <div className="space-y-2">
              {player.guildContributionLog.slice(-5).reverse().map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-sm"
                >
                  <span className="text-white/65">{entry.reason}</span>
                  <span className="font-bold text-emerald-300">+{entry.amount}</span>
                </div>
              ))}
            </div>
          )}
        </SocialSection>

        {/* Faction standing */}
        <SocialSection icon={Star} title="Faction Standing">
          <div className="grid grid-cols-3 gap-3">
            {(["bio", "mecha", "pure"] as const).map((faction) => {
              const labels: Record<string, string> = { bio: "Verdant Coil", mecha: "Chrome Synod", pure: "Ember Vault" };
              const colors: Record<string, string> = { bio: "text-emerald-300", mecha: "text-cyan-300", pure: "text-fuchsia-300" };
              const borders: Record<string, string> = { bio: "border-emerald-500/20", mecha: "border-cyan-500/20", pure: "border-fuchsia-500/20" };
              const isActive = player.factionAlignment === faction;
              return (
                <div
                  key={faction}
                  className={["rounded-xl border px-3 py-3 text-center transition", borders[faction], isActive ? "bg-white/[0.07]" : "bg-white/[0.03]"].join(" ")}
                >
                  <div className={["text-[10px] font-black uppercase tracking-[0.12em]", colors[faction]].join(" ")}>
                    {faction}
                  </div>
                  <div className="mt-1 text-[10px] text-white/45">{labels[faction]}</div>
                  {isActive && (
                    <div className="mt-1.5 rounded-full border border-white/12 bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70">
                      Active
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SocialSection>
      </div>
    </main>
  );
}
