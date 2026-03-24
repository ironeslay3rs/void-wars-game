"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, UserPlus, Users, Wifi, WifiOff } from "lucide-react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  friendChatShellMessages,
  friendShellEntries,
  type FriendPresence,
  type FriendShellEntry,
} from "@/features/social/socialShellData";
import { assets } from "@/lib/assets";

function getPresenceStyle(presence: FriendPresence) {
  switch (presence) {
    case "online":
      return {
        chip: "border-emerald-400/30 bg-emerald-500/12 text-emerald-100",
        dot: "bg-emerald-400",
        label: "Online",
      };
    case "busy":
      return {
        chip: "border-amber-400/30 bg-amber-500/12 text-amber-100",
        dot: "bg-amber-400",
        label: "Busy",
      };
    default:
      return {
        chip: "border-white/10 bg-white/[0.05] text-white/60",
        dot: "bg-white/35",
        label: "Offline",
      };
  }
}

function getFactionStyle(faction: FriendShellEntry["faction"]) {
  switch (faction) {
    case "Bio":
      return "border-emerald-400/25 bg-emerald-500/10 text-emerald-100";
    case "Mecha":
      return "border-cyan-400/25 bg-cyan-500/10 text-cyan-100";
    default:
      return "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-100";
  }
}

function getPortraitForFaction(faction: FriendShellEntry["faction"]) {
  switch (faction) {
    case "Bio":
      return assets.factions.bio;
    case "Mecha":
      return assets.factions.mecha;
    default:
      return assets.factions.pure;
  }
}

type FriendsScreenProps = {
  embedded?: boolean;
};

export default function FriendsScreen({
  embedded = false,
}: FriendsScreenProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
    friendShellEntries[0]?.id ?? null,
  );

  const selectedFriend = useMemo(
    () =>
      friendShellEntries.find((friend) => friend.id === selectedFriendId) ??
      null,
    [selectedFriendId],
  );
  const selectedConversation = selectedFriend
    ? friendChatShellMessages[selectedFriend.id] ?? []
    : [];

  const content = (
    <>
      {!embedded ? (
        <ScreenHeader
          eyebrow="Operative Network"
          title="Friends"
          subtitle="Track trusted contacts, check signal state, and keep a clean roster without building the full social stack yet."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
            <SectionCard
              title="Roster"
              description="Pinned contacts only. Presence is shell state for now, but the hierarchy and review flow are production-safe."
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/58 sm:min-w-[280px]">
                    <Search className="h-4 w-4 text-white/38" />
                    <span>Search callsign or add a new contact tag</span>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-red-50 transition hover:border-red-300/40 hover:bg-red-500/14"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Friend
                  </button>
                </div>

                <div className="space-y-3">
                  {friendShellEntries.map((friend) => {
                    const presenceStyle = getPresenceStyle(friend.presence);
                    const isSelected = selectedFriendId === friend.id;

                    return (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => setSelectedFriendId(friend.id)}
                        className={[
                          "w-full rounded-2xl border px-4 py-4 text-left transition",
                          isSelected
                            ? "border-red-400/35 bg-red-500/10 shadow-[0_0_28px_rgba(220,38,38,0.14)]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                            <Image
                              src={getPortraitForFaction(friend.faction)}
                              alt={friend.faction}
                              fill
                              className="object-contain p-2"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-base font-black uppercase tracking-[0.06em] text-white">
                                {friend.callsign}
                              </span>
                              <span
                                className={[
                                  "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                                  getFactionStyle(friend.faction),
                                ].join(" ")}
                              >
                                {friend.faction}
                              </span>
                              <span
                                className={[
                                  "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                                  presenceStyle.chip,
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "h-2 w-2 rounded-full",
                                    presenceStyle.dot,
                                  ].join(" ")}
                                />
                                {presenceStyle.label}
                              </span>
                            </div>

                            <div className="mt-2 text-sm uppercase tracking-[0.14em] text-white/45">
                              {friend.title}
                            </div>

                            <p className="mt-2 text-sm leading-6 text-white/62">
                              {friend.note}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Add-Friend Shell"
              description="Input-only shell for the future invite flow. No backend or persistent social logic is attached in this slice."
            >
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/55">
                  Enter callsign, citadel tag, or recovered network trace.
                </div>
                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white/45"
                >
                  Queue Invite
                </button>
              </div>
            </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard
            title="Selected Contact"
            description="Focused contact state only. This is where chat or direct actions can layer in later without changing the shell."
          >
            {selectedFriend ? (
              <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,24,36,0.86),rgba(8,10,16,0.96))] p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <Image
                            src={getPortraitForFaction(selectedFriend.faction)}
                            alt={selectedFriend.faction}
                            fill
                            className="object-contain p-2"
                          />
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                            Contact Focus
                          </div>
                          <div className="mt-2 text-2xl font-black uppercase tracking-[0.06em] text-white">
                            {selectedFriend.callsign}
                          </div>
                          <div className="mt-2 text-sm uppercase tracking-[0.14em] text-white/50">
                            {selectedFriend.title}
                          </div>
                        </div>
                      </div>

                      <span
                        className={[
                          "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          getPresenceStyle(selectedFriend.presence).chip,
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-2 w-2 rounded-full",
                            getPresenceStyle(selectedFriend.presence).dot,
                          ].join(" ")}
                        />
                        {getPresenceStyle(selectedFriend.presence).label}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Alignment
                        </div>
                        <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                          {selectedFriend.faction}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Signal State
                        </div>
                        <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                          {selectedFriend.statusLine}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/64">
                      {selectedFriend.note}
                    </p>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
                          Contact Log
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                          Local Shell
                        </div>
                      </div>

                      <div className="mt-4 max-h-[240px] space-y-3 overflow-y-auto pr-1">
                        {selectedConversation.map((message) => (
                          <div
                            key={message.id}
                            className={[
                              "max-w-[88%] rounded-2xl border px-4 py-3 text-sm leading-6",
                              message.sender === "self"
                                ? "ml-auto border-red-400/20 bg-red-500/10 text-white/80"
                                : "border-white/10 bg-white/[0.04] text-white/72",
                            ].join(" ")}
                          >
                            <div>{message.text}</div>
                            <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
                              {message.sender === "self"
                                ? "You"
                                : selectedFriend.callsign}{" "}
                              / {message.timestamp}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
                          Send a field note to {selectedFriend.callsign}...
                        </div>
                        <button
                          type="button"
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/45"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-red-50 transition hover:border-red-300/40 hover:bg-red-500/14"
                    >
                      Open Contact Shell
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFriendId(null)}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white/68 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      Clear Selection
                    </button>
                  </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Users className="h-6 w-6 text-white/35" />
                </div>
                <div className="mt-4 text-lg font-semibold text-white">
                  No contact selected
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Pick a friend from the roster to inspect signal state and
                  prepare this shell for later direct-contact features.
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Presence States"
            description="Visual shell states only. These are static stand-ins for future live presence logic."
          >
            <div className="grid gap-3">
              {[
                {
                  label: "Online",
                  detail: "Contact is currently reachable from the citadel network.",
                  tone: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
                  icon: <Wifi className="h-4 w-4" />,
                },
                {
                  label: "Busy",
                  detail: "Contact is active elsewhere and should read as occupied.",
                  tone: "border-amber-400/25 bg-amber-500/10 text-amber-100",
                  icon: <Wifi className="h-4 w-4" />,
                },
                {
                  label: "Offline",
                  detail: "No current signal. The shell keeps the contact visible anyway.",
                  tone: "border-white/10 bg-white/[0.03] text-white/68",
                  icon: <WifiOff className="h-4 w-4" />,
                },
              ].map((entry) => (
                <div
                  key={entry.label}
                  className={[
                    "flex items-start gap-3 rounded-xl border px-4 py-3",
                    entry.tone,
                  ].join(" ")}
                >
                  <div className="mt-0.5">{entry.icon}</div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.08em]">
                      {entry.label}
                    </div>
                    <div className="mt-1 text-sm leading-6 opacity-80">
                      {entry.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,22,22,0.24),_rgba(5,8,18,1)_60%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">{content}</div>
    </main>
  );
}
