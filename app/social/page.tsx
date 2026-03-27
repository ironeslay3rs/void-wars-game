"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  addFriend,
  appendStoredMessage,
  loadFriendBindings,
  loadFriends,
  loadMessages,
  removeFriend,
  saveFriendBindings,
  type FriendContact,
  type SocialChatMessage,
} from "@/features/social/socialChatStore";
import { MessageCircle, Shield, Users2, Globe2, UserRound } from "lucide-react";
import type {
  ChatBroadcastMessage,
  ClientToServerMessage,
  RegisterSocialMessage,
  SendChatMessage,
  ServerToClientMessage,
  SocialRosterMessage,
  VoidRealtimeClientId,
} from "@/features/void-maps/realtime/voidRealtimeProtocol";
import ScreenHeader from "@/components/shared/ScreenHeader";
import { useGame } from "@/features/game/gameContext";
import { getVoidRealtimeWebSocketUrl } from "@/lib/voidRealtimeWsUrl";

type SocialTab = "friends" | "global" | "guild" | "dm";

function SocialSection({
  icon: Icon,
  title,
  children,
  badge,
}: {
  icon: typeof Users2;
  title: string;
  children: ReactNode;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <div className="text-sm font-bold uppercase tracking-[0.12em] text-white/85">
            {title}
          </div>
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

function ChatPane({
  messages,
  emptyText,
}: {
  messages: Array<{ id: string; senderName: string; text: string; ts: number }>;
  emptyText: string;
}) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/30">
        <MessageCircle className="mx-auto mb-2 h-8 w-8 opacity-30" />
        <div className="text-xs uppercase tracking-[0.18em]">{emptyText}</div>
      </div>
    );
  }
  return (
    <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-3">
      {messages.map((m) => (
        <div key={m.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2">
          <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em]">
            <span className="font-bold text-white/75">{m.senderName}</span>
            <span className="text-white/35">{new Date(m.ts).toLocaleTimeString()}</span>
          </div>
          <div className="mt-1 text-sm text-white/85">{m.text}</div>
        </div>
      ))}
    </div>
  );
}

function getOrCreateSocialClientId() {
  if (typeof window === "undefined") return "social-client";
  const k = "vw-social-client-id";
  const existing = window.localStorage.getItem(k);
  if (existing) return existing;
  const next = `social-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  window.localStorage.setItem(k, next);
  return next;
}

function normalizeFriendKey(callsign: string) {
  return callsign.toLowerCase().replace(/\s+/g, "-");
}

function loadDmThread(playerStoreId: string, friend: FriendContact | null) {
  if (!friend) return [] as SocialChatMessage[];
  const byStableId = loadMessages({
    channel: "dm",
    playerId: playerStoreId,
    friendId: friend.id,
  });
  if (byStableId.length > 0) return byStableId;
  return loadMessages({
    channel: "dm",
    playerId: playerStoreId,
    friendId: normalizeFriendKey(friend.callsign),
  });
}

export default function SocialPage() {
  const { state } = useGame();
  const { player } = state;
  const playerStoreId = player.playerName.toLowerCase().replace(/\s+/g, "-") || "operative";
  const [socialClientId] = useState<VoidRealtimeClientId>(() => getOrCreateSocialClientId());
  const guildId = player.guild.kind === "inGuild" ? player.guild.guildId : null;
  const hasGuild = guildId !== null;
  const wsRef = useRef<WebSocket | null>(null);
  const selectedFriendKeyRef = useRef<string | null>(null);

  const [tab, setTab] = useState<SocialTab>("friends");
  const [friends, setFriends] = useState<FriendContact[]>(() => loadFriends(playerStoreId));
  const [friendBindings, setFriendBindings] = useState<Record<string, string>>(() =>
    loadFriendBindings(playerStoreId),
  );
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
    () => loadFriends(playerStoreId)[0]?.id ?? null,
  );
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendNote, setNewFriendNote] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatNotice, setChatNotice] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socialRoster, setSocialRoster] = useState<
    Array<{ clientId: string; playerName: string; guildId: string | null }>
  >([]);
  const [globalMessages, setGlobalMessages] = useState(() =>
    loadMessages({ channel: "global", playerId: playerStoreId }),
  );
  const [guildMessages, setGuildMessages] = useState(() =>
    loadMessages({ channel: "guild", playerId: playerStoreId, guildId }),
  );
  const [dmMessages, setDmMessages] = useState(() => {
    const seedFriend = loadFriends(playerStoreId)[0];
    return loadDmThread(playerStoreId, seedFriend ?? null);
  });

  const selectedFriend = useMemo(
    () => friends.find((f) => f.id === selectedFriendId) ?? null,
    [friends, selectedFriendId],
  );
  const selectedFriendKey = selectedFriend
    ? normalizeFriendKey(selectedFriend.callsign)
    : null;
  const selectedFriendBindingClientId = selectedFriend
    ? friendBindings[selectedFriend.id] ?? null
    : null;
  const selectedFriendOnlineCandidates = useMemo(() => {
    if (!selectedFriend) return [] as Array<{ clientId: string; playerName: string }>;
    return socialRoster.filter(
      (p) =>
        p.playerName.toLowerCase() === selectedFriend.callsign.toLowerCase() &&
        p.clientId !== socialClientId,
    );
  }, [selectedFriend, socialClientId, socialRoster]);

  const onlineClientIds = useMemo(() => {
    return new Set(socialRoster.map((p) => p.clientId));
  }, [socialRoster]);

  useEffect(() => {
    selectedFriendKeyRef.current = selectedFriendKey;
  }, [selectedFriendKey]);

  useEffect(() => {
    function onStorage(ev: StorageEvent) {
      if (!ev.key || !ev.key.startsWith("vw-social:")) return;
      setGlobalMessages(loadMessages({ channel: "global", playerId: playerStoreId }));
      setGuildMessages(
        loadMessages({ channel: "guild", playerId: playerStoreId, guildId }),
      );
      if (selectedFriend) {
        setDmMessages(
          loadDmThread(playerStoreId, selectedFriend),
        );
      }
      setFriends(loadFriends(playerStoreId));
      setFriendBindings(loadFriendBindings(playerStoreId));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [playerStoreId, guildId, selectedFriend]);

  useEffect(() => {
    const wsUrl = getVoidRealtimeWebSocketUrl();
    if (!wsUrl) {
      const t = window.setTimeout(() => {
        setSocketConnected(false);
        setChatNotice(
          "HTTPS: set NEXT_PUBLIC_VOID_WS_URL to your hosted websocket (wss://…).",
        );
      }, 0);
      return () => window.clearTimeout(t);
    }
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSocketConnected(true);
      const register: RegisterSocialMessage = {
        type: "register_social",
        clientId: socialClientId,
        playerName: player.playerName,
        guildId,
      };
      ws.send(JSON.stringify(register));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerToClientMessage;
      if (msg.type === "social_roster") {
        const roster = (msg as SocialRosterMessage).players;
        setSocialRoster(roster);
        return;
      }
      if (msg.type !== "chat_broadcast") return;
      const chat = msg as ChatBroadcastMessage;

      if (chat.channel === "global") {
        const stored = appendStoredMessage({
          channel: "global",
          playerId: playerStoreId,
          message: {
            id: `${chat.ts}-${chat.fromClientId}`,
            channel: "global",
            senderId: chat.fromClientId,
            senderName: chat.senderName,
            text: chat.text,
            ts: chat.ts,
          },
        });
        setGlobalMessages(stored);
        return;
      }

      if (chat.channel === "guild" && guildId && chat.guildId === guildId) {
        const stored = appendStoredMessage({
          channel: "guild",
          playerId: playerStoreId,
          guildId,
          message: {
            id: `${chat.ts}-${chat.fromClientId}`,
            channel: "guild",
            senderId: chat.fromClientId,
            senderName: chat.senderName,
            text: chat.text,
            ts: chat.ts,
            guildId: chat.guildId,
          },
        });
        setGuildMessages(stored);
        return;
      }

      if (chat.channel === "dm") {
        if (
          chat.fromClientId !== socialClientId &&
          chat.toClientId !== socialClientId
        ) {
          return;
        }
        if (chat.fromClientId === socialClientId) {
          return;
        }
        let resolvedFriend = friends.find(
          (f) => friendBindings[f.id] === chat.fromClientId,
        );
        if (!resolvedFriend) {
          const matchesByName = friends.filter(
            (f) => f.callsign.toLowerCase() === chat.senderName.toLowerCase(),
          );
          if (matchesByName.length === 1) {
            resolvedFriend = matchesByName[0];
            const nextBindings = {
              ...friendBindings,
              [resolvedFriend.id]: chat.fromClientId,
            };
            saveFriendBindings(playerStoreId, nextBindings);
            setFriendBindings(nextBindings);
          }
        }
        if (!resolvedFriend) {
          setChatNotice("Incoming DM from unlinked contact. Add/link that friend first.");
          return;
        }
        const stored = appendStoredMessage({
          channel: "dm",
          playerId: playerStoreId,
          friendId: resolvedFriend.id,
          message: {
            id: `${chat.ts}-${chat.fromClientId}`,
            channel: "dm",
            senderId: chat.fromClientId,
            senderName: chat.senderName,
            text: chat.text,
            ts: chat.ts,
            toFriendId: chat.toClientId,
          },
        });
        if (selectedFriendKeyRef.current === normalizeFriendKey(resolvedFriend.callsign)) {
          setDmMessages(stored);
        }
      }
    };

    ws.onclose = () => setSocketConnected(false);
    ws.onerror = () => setSocketConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [friendBindings, friends, guildId, player.playerName, playerStoreId, socialClientId]);

  function handleAddFriend() {
    const next = addFriend(playerStoreId, newFriendName, newFriendNote);
    setFriends(next);
    setNewFriendName("");
    setNewFriendNote("");
    if (next.length > 0 && !selectedFriendId) {
      setSelectedFriendId(next[0].id);
    }
  }

  function handleRemoveFriend(friendId: string) {
    const next = removeFriend(playerStoreId, friendId);
    setFriends(next);
    if (friendBindings[friendId]) {
      const nextBindings = { ...friendBindings };
      delete nextBindings[friendId];
      saveFriendBindings(playerStoreId, nextBindings);
      setFriendBindings(nextBindings);
    }
    if (selectedFriendId === friendId) {
      const nextSelected = next[0] ?? null;
      setSelectedFriendId(nextSelected?.id ?? null);
      setDmMessages(loadDmThread(playerStoreId, nextSelected));
    }
  }

  function sendOverSocket(msg: ClientToServerMessage) {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setChatNotice("Chat socket offline. Check websocket server.");
      return false;
    }
    ws.send(JSON.stringify(msg));
    return true;
  }

  function handleSendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatNotice(null);
    if (tab === "global") {
      const msg: SendChatMessage = {
        type: "send_chat",
        clientId: socialClientId,
        channel: "global",
        text,
        senderName: player.playerName,
      };
      if (sendOverSocket(msg)) setChatInput("");
      return;
    }
    if (tab === "guild") {
      if (!guildId) return;
      const msg: SendChatMessage = {
        type: "send_chat",
        clientId: socialClientId,
        channel: "guild",
        text,
        senderName: player.playerName,
        guildId,
      };
      if (sendOverSocket(msg)) setChatInput("");
      return;
    }
    if (tab === "dm") {
      if (!selectedFriend) return;
      const target = selectedFriendBindingClientId
        ? socialRoster.find((p) => p.clientId === selectedFriendBindingClientId)
        : null;
      if (!target) {
        setChatNotice(
          "Friend is not linked to an active chat session. Use 'Link Online' first.",
        );
        return;
      }
      const optimistic: SocialChatMessage = {
        id: `self-${Date.now()}`,
        channel: "dm",
        senderId: socialClientId,
        senderName: player.playerName,
        text,
        ts: Date.now(),
        toFriendId: target.clientId,
      };
      const next = appendStoredMessage({
        channel: "dm",
        playerId: playerStoreId,
        friendId: selectedFriend.id,
        message: optimistic,
      });
      setDmMessages(next);

      const msg: SendChatMessage = {
        type: "send_chat",
        clientId: socialClientId,
        channel: "dm",
        text,
        senderName: player.playerName,
        toClientId: target.clientId,
      };
      if (sendOverSocket(msg)) setChatInput("");
      return;
    }
  }

  function handleUnlinkFriend(friendId: string) {
    if (!friendBindings[friendId]) return;
    const nextBindings = { ...friendBindings };
    delete nextBindings[friendId];
    saveFriendBindings(playerStoreId, nextBindings);
    setFriendBindings(nextBindings);
    setChatNotice("Session link cleared. Re-link when your friend reconnects.");
  }

  function handleAutoLinkBestMatches() {
    const nextBindings = { ...friendBindings };
    let linkedCount = 0;
    for (const friend of friends) {
      if (nextBindings[friend.id]) continue;
      const candidates = socialRoster.filter(
        (p) =>
          p.playerName.toLowerCase() === friend.callsign.toLowerCase() &&
          p.clientId !== socialClientId,
      );
      if (candidates.length === 1) {
        nextBindings[friend.id] = candidates[0].clientId;
        linkedCount += 1;
      }
    }
    saveFriendBindings(playerStoreId, nextBindings);
    setFriendBindings(nextBindings);
    setChatNotice(
      linkedCount > 0
        ? `Auto-linked ${linkedCount} friend${linkedCount > 1 ? "s" : ""}.`
        : "No unambiguous online matches found to auto-link.",
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(40,60,110,0.22),rgba(5,8,20,1)_55%)] px-4 py-8 text-white sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <ScreenHeader
          backHref="/home"
          backLabel="Home"
          eyebrow="Void Wars: Oblivion"
          title="Social"
          subtitle="Websocket-backed chat: global, guild, and friend direct messages."
        />

        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">
          Socket:{" "}
          <span className={socketConnected ? "text-emerald-300" : "text-red-300"}>
            {socketConnected ? "Connected" : "Disconnected"}
          </span>{" "}
          · Online: {socialRoster.length}
          {chatNotice ? <span className="ml-2 text-amber-200">· {chatNotice}</span> : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <SocialSection icon={Users2} title="Friends" badge={`${friends.length} linked`}>
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoLinkBestMatches}
                  className="rounded-lg border border-cyan-300/30 bg-cyan-500/12 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-100"
                >
                  Auto Link Best Match
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  placeholder="Friend callsign"
                  className="rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35"
                />
                <input
                  value={newFriendNote}
                  onChange={(e) => setNewFriendNote(e.target.value)}
                  placeholder="Note (optional)"
                  className="rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={handleAddFriend}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100"
                >
                  Add
                </button>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {friends.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/35">
                    <UserRound className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    No friends added yet.
                  </div>
                ) : (
                  friends.map((f) => (
                    <div
                      key={f.id}
                      className={[
                        "rounded-xl border px-3 py-2",
                        selectedFriendId === f.id
                          ? "border-cyan-400/35 bg-cyan-500/10"
                          : "border-white/10 bg-white/[0.03]",
                      ].join(" ")}
                    >
                      {(() => {
                        const boundClientId = friendBindings[f.id] ?? null;
                        const exactOnline = boundClientId
                          ? onlineClientIds.has(boundClientId)
                          : false;
                        const hasNameCandidate = socialRoster.some(
                          (p) =>
                            p.playerName.toLowerCase() === f.callsign.toLowerCase() &&
                            p.clientId !== socialClientId,
                        );
                        const status = exactOnline
                          ? "linked-online"
                          : boundClientId
                            ? "linked-offline"
                            : hasNameCandidate
                              ? "unlinked-online"
                              : "unlinked-offline";
                        return (
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span
                              className={[
                                "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
                                status === "linked-online"
                                  ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                                  : status === "linked-offline"
                                    ? "border-amber-300/35 bg-amber-500/12 text-amber-100"
                                    : status === "unlinked-online"
                                      ? "border-cyan-300/35 bg-cyan-500/12 text-cyan-100"
                                      : "border-white/15 bg-white/[0.04] text-white/60",
                              ].join(" ")}
                            >
                              {status === "linked-online"
                                ? "Linked · Online"
                                : status === "linked-offline"
                                  ? "Linked · Offline"
                                  : status === "unlinked-online"
                                    ? "Online · Not Linked"
                                    : "Offline"}
                            </span>
                            {hasNameCandidate && !boundClientId ? (
                              <span className="text-[10px] text-cyan-200/85">
                                ready to link
                              </span>
                            ) : null}
                          </div>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFriendId(f.id);
                          setDmMessages(loadDmThread(playerStoreId, f));
                          setTab("dm");
                        }}
                        className="text-left"
                      >
                        <div className="text-sm font-semibold text-white">{f.callsign}</div>
                        <div className="text-[11px] text-white/45">{f.note ?? "No note"}</div>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {friendBindings[f.id] ? (
                          <button
                            type="button"
                            onClick={() => handleUnlinkFriend(f.id)}
                            className="rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 transition hover:border-white/25 hover:bg-white/[0.09]"
                          >
                            Unlink
                          </button>
                        ) : (
                          <span className="min-w-0 flex-1" aria-hidden />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(f.id)}
                          className="rounded-lg border border-red-400/20 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </SocialSection>

          <SocialSection icon={MessageCircle} title="Chat Channels" badge="Live WS">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ["friends", "Friends"],
                    ["global", "Global"],
                    ["guild", "Guild"],
                    ["dm", "DM"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={[
                      "rounded-xl border px-2 py-2 text-[11px] font-bold uppercase tracking-[0.12em]",
                      tab === id
                        ? "border-cyan-300/40 bg-cyan-500/12 text-cyan-100"
                        : "border-white/10 bg-white/[0.03] text-white/60",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "friends" ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/70">
                  Pick a friend to open direct chat.
                </div>
              ) : null}
              {tab === "global" ? (
                <ChatPane messages={globalMessages} emptyText="Global channel is quiet" />
              ) : null}
              {tab === "guild" ? (
                hasGuild ? (
                  <ChatPane messages={guildMessages} emptyText="Guild channel is quiet" />
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/30">
                    <Shield className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Join a guild to access guild chat.
                  </div>
                )
              ) : null}
              {tab === "dm" ? (
                selectedFriend ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/65">
                      <div>
                        Link status:{" "}
                        {selectedFriendBindingClientId ? (
                          <span className="text-emerald-300">Linked</span>
                        ) : (
                          <span className="text-amber-300">Not linked</span>
                        )}
                        {selectedFriendBindingClientId ? (
                          onlineClientIds.has(selectedFriendBindingClientId) ? (
                            <span className="text-emerald-300"> · online</span>
                          ) : (
                            <span className="text-amber-300"> · offline</span>
                          )
                        ) : null}
                        {selectedFriendOnlineCandidates.length > 0
                          ? ` · ${selectedFriendOnlineCandidates.length} online candidate(s)`
                          : " · no online candidates"}
                      </div>
                      {selectedFriendBindingClientId ? (
                        <button
                          type="button"
                          onClick={() => handleUnlinkFriend(selectedFriend.id)}
                          className="shrink-0 rounded-lg border border-white/15 bg-white/[0.06] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/80 hover:border-white/25 hover:bg-white/[0.09]"
                        >
                          Unlink
                        </button>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFriendOnlineCandidates.length > 0 ? (
                        selectedFriendOnlineCandidates.map((candidate) => (
                          <button
                            key={candidate.clientId}
                            type="button"
                            onClick={() => {
                              const nextBindings = {
                                ...friendBindings,
                                [selectedFriend.id]: candidate.clientId,
                              };
                              saveFriendBindings(playerStoreId, nextBindings);
                              setFriendBindings(nextBindings);
                              setChatNotice(`Linked ${selectedFriend.callsign} to live session.`);
                            }}
                            className={[
                              "rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
                              selectedFriendBindingClientId === candidate.clientId
                                ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100"
                                : "border-white/15 bg-white/[0.04] text-white/75",
                            ].join(" ")}
                          >
                            Link Online
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-white/45">
                          No matching online session for this friend.
                        </span>
                      )}
                    </div>
                    <ChatPane
                      messages={dmMessages}
                      emptyText={`No DM history with ${selectedFriend.callsign}`}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-white/30">
                    <UserRound className="mx-auto mb-2 h-8 w-8 opacity-30" />
                    Select a friend to start direct chat.
                  </div>
                )
              ) : null}

              {tab !== "friends" ? (
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      tab === "global"
                        ? "Send to global channel"
                        : tab === "guild"
                          ? "Send to guild channel"
                          : selectedFriend
                            ? `Message ${selectedFriend.callsign}`
                            : "Select a friend first"
                    }
                    disabled={(tab === "guild" && !hasGuild) || !socketConnected}
                    className="flex-1 rounded-xl border border-white/12 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={(tab === "guild" && !hasGuild) || !socketConnected}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              ) : null}
            </div>
          </SocialSection>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/guild"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75 hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-white/65" />
              Open Guild Dashboard
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setTab("global")}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-white/75 hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-white/65" />
              Open Global Channel
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTab("guild")}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-white/75 hover:bg-white/[0.08]"
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-white/65" />
              Open Guild Channel
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
