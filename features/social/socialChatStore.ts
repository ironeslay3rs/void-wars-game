export type SocialChatChannel = "global" | "guild" | "dm";

export type FriendContact = {
  id: string;
  callsign: string;
  note?: string;
  addedAt: number;
};

export type SocialChatMessage = {
  id: string;
  channel: SocialChatChannel;
  senderId: string;
  senderName: string;
  text: string;
  ts: number;
  toFriendId?: string;
  guildId?: string;
};

const STORAGE_PREFIX = "vw-social";
const MAX_MESSAGES_PER_CHANNEL = 250;
const MAX_FRIENDS = 64;

function keyFriends(playerId: string) {
  return `${STORAGE_PREFIX}:friends:${playerId}`;
}

function keyFriendBindings(playerId: string) {
  return `${STORAGE_PREFIX}:friend-bindings:${playerId}`;
}

function keyGlobal() {
  return `${STORAGE_PREFIX}:chat:global`;
}

function keyGuild(guildId: string) {
  return `${STORAGE_PREFIX}:chat:guild:${guildId}`;
}

function keyDm(playerId: string, friendId: string) {
  const pair = [playerId, friendId].sort().join(":");
  return `${STORAGE_PREFIX}:chat:dm:${pair}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getWindowStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function sanitizeText(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 400);
}

export function loadFriends(playerId: string): FriendContact[] {
  const storage = getWindowStorage();
  if (!storage) return [];
  const raw = safeParse<FriendContact[]>(storage.getItem(keyFriends(playerId)), []);
  return raw
    .filter((f) => typeof f.id === "string" && typeof f.callsign === "string")
    .slice(0, MAX_FRIENDS);
}

export function saveFriends(playerId: string, friends: FriendContact[]) {
  const storage = getWindowStorage();
  if (!storage) return;
  storage.setItem(keyFriends(playerId), JSON.stringify(friends.slice(0, MAX_FRIENDS)));
}

export function addFriend(playerId: string, callsign: string, note?: string) {
  const normalized = callsign.replace(/\s+/g, " ").trim().slice(0, 24);
  if (!normalized) return loadFriends(playerId);
  const list = loadFriends(playerId);
  if (list.some((f) => f.callsign.toLowerCase() === normalized.toLowerCase())) {
    return list;
  }
  const next: FriendContact[] = [
    ...list,
    {
      id: `friend-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
      callsign: normalized,
      note: note?.trim().slice(0, 60) || undefined,
      addedAt: Date.now(),
    },
  ];
  saveFriends(playerId, next);
  return next;
}

export function removeFriend(playerId: string, friendId: string) {
  const next = loadFriends(playerId).filter((f) => f.id !== friendId);
  saveFriends(playerId, next);
  return next;
}

export function loadFriendBindings(playerId: string): Record<string, string> {
  const storage = getWindowStorage();
  if (!storage) return {};
  const raw = safeParse<Record<string, string>>(
    storage.getItem(keyFriendBindings(playerId)),
    {},
  );
  const out: Record<string, string> = {};
  for (const [friendId, clientId] of Object.entries(raw)) {
    if (typeof friendId === "string" && typeof clientId === "string") {
      out[friendId] = clientId;
    }
  }
  return out;
}

export function saveFriendBindings(playerId: string, bindings: Record<string, string>) {
  const storage = getWindowStorage();
  if (!storage) return;
  storage.setItem(keyFriendBindings(playerId), JSON.stringify(bindings));
}

export function loadMessages(params: {
  channel: SocialChatChannel;
  playerId: string;
  guildId?: string | null;
  friendId?: string | null;
}) {
  const storage = getWindowStorage();
  if (!storage) return [] as SocialChatMessage[];
  const { channel, playerId, guildId, friendId } = params;
  let key = keyGlobal();
  if (channel === "guild" && guildId) key = keyGuild(guildId);
  if (channel === "dm" && friendId) key = keyDm(playerId, friendId);
  return safeParse<SocialChatMessage[]>(storage.getItem(key), []);
}

export function appendMessage(params: {
  channel: SocialChatChannel;
  playerId: string;
  playerName: string;
  text: string;
  guildId?: string | null;
  friendId?: string | null;
  friendName?: string | null;
}) {
  const storage = getWindowStorage();
  if (!storage) return [] as SocialChatMessage[];

  const normalizedText = sanitizeText(params.text);
  if (!normalizedText) {
    return loadMessages({
      channel: params.channel,
      playerId: params.playerId,
      guildId: params.guildId,
      friendId: params.friendId,
    });
  }

  const base: SocialChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 10_000)}`,
    channel: params.channel,
    senderId: params.playerId,
    senderName: params.playerName,
    text: normalizedText,
    ts: Date.now(),
    guildId: params.guildId ?? undefined,
    toFriendId: params.friendId ?? undefined,
  };

  let key = keyGlobal();
  if (params.channel === "guild" && params.guildId) key = keyGuild(params.guildId);
  if (params.channel === "dm" && params.friendId) key = keyDm(params.playerId, params.friendId);

  const existing = safeParse<SocialChatMessage[]>(storage.getItem(key), []);
  const next = [...existing, base].slice(-MAX_MESSAGES_PER_CHANNEL);
  storage.setItem(key, JSON.stringify(next));
  return next;
}

export function appendStoredMessage(params: {
  channel: SocialChatChannel;
  playerId: string;
  message: SocialChatMessage;
  guildId?: string | null;
  friendId?: string | null;
}) {
  const storage = getWindowStorage();
  if (!storage) return [] as SocialChatMessage[];
  let key = keyGlobal();
  if (params.channel === "guild" && params.guildId) key = keyGuild(params.guildId);
  if (params.channel === "dm" && params.friendId) key = keyDm(params.playerId, params.friendId);
  const existing = safeParse<SocialChatMessage[]>(storage.getItem(key), []);
  const next = [...existing, params.message].slice(-MAX_MESSAGES_PER_CHANNEL);
  storage.setItem(key, JSON.stringify(next));
  return next;
}

