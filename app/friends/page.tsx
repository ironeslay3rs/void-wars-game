"use client";

import { useState } from "react";
import FriendsScreen from "@/components/friends/FriendsScreen";
import MailScreen from "@/components/mail/MailScreen";
import ScreenHeader from "@/components/shared/ScreenHeader";
import {
  friendChatShellMessages,
  friendShellEntries,
  mailEntries,
} from "@/features/social/socialShellData";

export default function FriendsPage() {
  const [activeView, setActiveView] = useState<"friends" | "mail">("friends");
  const unreadMailCount = mailEntries.filter((entry) => entry.unread).length;
  const activeContacts = friendShellEntries.filter(
    (entry) => entry.presence !== "offline",
  ).length;
  const conversationThreads = Object.keys(friendChatShellMessages).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(120,22,22,0.24),_rgba(5,8,18,1)_60%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <ScreenHeader
          eyebrow="Operative Network"
          title="Social"
          subtitle="One access point for live contacts and delayed records, without merging their internal shells."
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/38">
              Social Summary
            </span>
            <div className="mt-2 font-semibold text-white">
              {activeContacts} active contacts, {unreadMailCount} unread mail
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
            {conversationThreads} local contact logs available
          </div>
        </div>

        <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-black/25 p-1">
          {[
            { id: "friends", label: "Friends" },
            { id: "mail", label: "Mail" },
          ].map((view) => {
            const isActive = activeView === view.id;

            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id as "friends" | "mail")}
                className={[
                  "rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition",
                  isActive
                    ? "bg-red-500/14 text-red-50 shadow-[0_0_22px_rgba(220,38,38,0.12)]"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white",
                ].join(" ")}
              >
                <span>{view.label}</span>
                {view.id === "mail" && unreadMailCount > 0 ? (
                  <span className="ml-2 rounded-full border border-red-400/25 bg-red-500/12 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-red-50">
                    {unreadMailCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {activeView === "friends" ? (
          <FriendsScreen embedded />
        ) : (
          <MailScreen embedded />
        )}
      </div>
    </main>
  );
}
