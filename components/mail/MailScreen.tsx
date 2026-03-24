"use client";

import { useMemo, useState } from "react";
import { Archive, FileText, PackageOpen } from "lucide-react";
import ScreenHeader from "@/components/shared/ScreenHeader";
import SectionCard from "@/components/shared/SectionCard";
import {
  mailEntries,
  type MailAttachment,
} from "@/features/social/socialShellData";

function getMailStateTone(unread: boolean) {
  return unread
    ? "border-red-400/30 bg-red-500/10 text-red-50"
    : "border-white/10 bg-white/[0.03] text-white/60";
}

function getAttachmentTone(type: MailAttachment["type"]) {
  return type === "reward"
    ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
    : "border-cyan-400/20 bg-cyan-500/10 text-cyan-100";
}

type MailScreenProps = {
  embedded?: boolean;
};

export default function MailScreen({ embedded = false }: MailScreenProps) {
  const [selectedMailId, setSelectedMailId] = useState<string | null>(
    mailEntries[0]?.id ?? null,
  );

  const selectedMail = useMemo(
    () => mailEntries.find((entry) => entry.id === selectedMailId) ?? null,
    [selectedMailId],
  );

  const content = (
    <>
      {!embedded ? (
        <ScreenHeader
          eyebrow="Citadel Archive"
          title="Mail"
          subtitle="Delayed notices, field records, and placeholder rewards held apart from live contact traffic."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard
          title="Inbox"
          description="Archival traffic only. Mail is slower than chat and reads like a record, not a live exchange."
        >
          <div className="space-y-3">
            {mailEntries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedMailId(entry.id)}
                className={[
                  "w-full rounded-2xl border px-4 py-4 text-left transition",
                  selectedMailId === entry.id
                    ? "border-amber-400/30 bg-amber-500/10 shadow-[0_0_28px_rgba(245,158,11,0.12)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black uppercase tracking-[0.05em] text-white">
                        {entry.sender}
                      </span>
                      <span
                        className={[
                          "rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          getMailStateTone(entry.unread),
                        ].join(" ")}
                      >
                        {entry.unread ? "Unread" : "Read"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/74">
                      {entry.subject}
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.16em] text-white/38">
                      {entry.category} / {entry.receivedAt}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      {entry.preview}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-6">
          <SectionCard
            title="Selected Record"
            description="Focused message view with a document-first hierarchy and clearly non-functional attachments."
          >
            {selectedMail ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(26,22,18,0.9),rgba(10,10,12,0.96))] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/38">
                        Sender
                      </div>
                      <div className="mt-2 text-xl font-black uppercase tracking-[0.06em] text-white">
                        {selectedMail.sender}
                      </div>
                      <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/38">
                        Subject
                      </div>
                      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] text-white/78">
                        {selectedMail.subject}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Received
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white/72">
                        {selectedMail.receivedAt}
                      </div>
                      <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62">
                        {selectedMail.category}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/35">
                      <Archive className="h-4 w-4" />
                      Archived Message Body
                    </div>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-white/72">
                      {selectedMail.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/38">
                    <PackageOpen className="h-4 w-4" />
                    Attachments / Reward Placeholders
                  </div>
                  <div className="mt-4 grid gap-3">
                    {selectedMail.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={[
                          "rounded-xl border px-4 py-3",
                          getAttachmentTone(attachment.type),
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="mt-0.5 h-4 w-4" />
                          <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.08em]">
                              {attachment.label}
                            </div>
                            <div className="mt-1 text-sm leading-6 opacity-80">
                              {attachment.detail}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-white/52">
                    Presentational only. This area does not claim, send, grant,
                    or write anything into inventory or player state.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <Archive className="h-6 w-6 text-white/35" />
                </div>
                <div className="mt-4 text-lg font-semibold text-white">
                  No record selected
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Select a mail record from the inbox to review sender,
                  subject, archive text, and placeholder attachments.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,44,24,0.18),_rgba(5,8,18,1)_62%)] px-6 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">{content}</div>
    </main>
  );
}
