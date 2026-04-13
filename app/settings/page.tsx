"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import PlaceholderPanel from "@/components/shared/PlaceholderPanel";
import { settingsScreenData } from "@/features/settings/settingsScreenData";
import {
  getVolume,
  isMuted,
  playSound,
  setMuted,
  setVolume,
} from "@/features/audio/soundEngine";

export default function SettingsPage() {
  const [volume, setVolumeState] = useState(0.3);
  const [muted, setMutedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setVolumeState(getVolume());
    setMutedState(isMuted());
    setHydrated(true);
  }, []);

  function handleVolumeChange(next: number) {
    setVolumeState(next);
    setVolume(next);
  }

  function handleVolumeCommit(next: number) {
    setVolumeState(next);
    setVolume(next);
    if (!muted) playSound("ui-click");
  }

  function handleToggleMute() {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    if (!next) playSound("ui-click");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(80,80,100,0.2),_rgba(5,8,20,1)_55%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:border-white/30 hover:bg-white/10"
          >
            ← Home
          </Link>
        </div>

        <ScreenHeader
          eyebrow={settingsScreenData.eyebrow}
          title={settingsScreenData.title}
          subtitle={settingsScreenData.subtitle}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {settingsScreenData.cards.map((card) => (
            <PlaceholderPanel
              key={card.label}
              label={card.label}
              value={card.value}
              hint={card.hint}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Audio"
            description="Master volume drives every synth effect and the ambient zone drone. Preferences persist locally across sessions."
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                  <span>Master Volume</span>
                  <span className="tabular-nums text-white/85">
                    {hydrated ? `${Math.round(volume * 100)}%` : "—"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) =>
                    handleVolumeChange(parseFloat(e.target.value))
                  }
                  onMouseUp={(e) =>
                    handleVolumeCommit(
                      parseFloat((e.currentTarget as HTMLInputElement).value),
                    )
                  }
                  onTouchEnd={(e) =>
                    handleVolumeCommit(
                      parseFloat((e.currentTarget as HTMLInputElement).value),
                    )
                  }
                  disabled={muted}
                  className="mt-3 w-full accent-cyan-400 disabled:opacity-40"
                />
                <p className="mt-2 text-xs text-white/55">
                  Slide then release to preview with a UI click.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white/85">Mute all</p>
                  <p className="text-xs text-white/55">
                    Silences synth FX and ambient drone without losing your
                    volume setting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className={[
                    "rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition",
                    muted
                      ? "border-red-400/35 bg-red-500/14 text-red-100 hover:bg-red-500/20"
                      : "border-emerald-400/30 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18",
                  ].join(" ")}
                >
                  {muted ? "Muted" : "On"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => playSound("rank-up")}
                disabled={muted}
                className="w-full rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-cyan-100 transition enabled:hover:bg-cyan-500/18 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Test tone · rank-up cue
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="Account Systems"
            description="Session, profile, and connected services — tied to your auth provider in this web client."
          >
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm leading-relaxed text-white/55">
              Account identity flows through the same login you used to open
              the wasteland record. Deeper profile and linked-device controls
              ship when the account shell graduates past M1.
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
