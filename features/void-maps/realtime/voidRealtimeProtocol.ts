import type { FactionAlignment, ResourcesState } from "@/features/game/gameTypes";
import type { VoidZoneId } from "@/features/void-maps/zoneData";

export type VoidRealtimeClientId = string;

export type PlayerPresence = {
  clientId: VoidRealtimeClientId;
  playerName: string;
  factionAlignment: FactionAlignment;
  x: number; // percent [0..100]
  y: number; // percent [0..100]
  lastMoveAt: number;
  rankLevel: number;
  condition: number;
  zoneMasteryForZone: number;
};

export type MobEntity = {
  mobEntityId: string;
  zoneId: VoidZoneId;
  waveIndex: number;
  mobId: string;
  mobLabel: string;
  packSize: number;
  spawnedAt: number;

  hp: number;
  maxHp: number;

  x: number; // percent [0..100]
  y: number; // percent [0..100]
};

/* =========================
 Client messages
========================= */
export type JoinSessionMessage = {
  type: "join_session";
  zoneId: VoidZoneId;
  sessionBucketId: number; // coarse realtime shard bucket
  clientId: VoidRealtimeClientId;
  playerName: string;
  factionAlignment: FactionAlignment;
  rankLevel: number;
  condition: number;
  zoneMasteryForZone: number;
};

export type MoveInputMessage = {
  type: "move_input";
  clientId: VoidRealtimeClientId;
  seq: number;
  ts: number;
  x: number; // percent [0..100]
  y: number; // percent [0..100]
};

export type AttackMobMessage = {
  type: "attack_mob";
  clientId: VoidRealtimeClientId;
  seq: number;
  ts: number;
  mobEntityId: string;
};

export type ClientToServerMessage =
  | JoinSessionMessage
  | MoveInputMessage
  | AttackMobMessage
  | HuntStatusMessage;

/* =========================
 Server messages
========================= */
export type SessionStateMessage = {
  type: "session_state";
  zoneId: VoidZoneId;
  sessionBucketId: number;
  sessionStartedAt: number;
  players: PlayerPresence[];
  mobs: MobEntity[];
};

export type PlayersUpdatedMessage = {
  type: "players_updated";
  players: PlayerPresence[];
};

export type MobSpawnedMessage = {
  type: "mob_spawned";
  mob: MobEntity;
};

export type MobHpUpdatedMessage = {
  type: "mob_hp_updated";
  mobEntityId: string;
  hp: number;
  maxHp: number;
};

export type CombatEventMessage = {
  type: "combat_event";
  mobEntityId: string;
  attackerClientId: VoidRealtimeClientId;
  damage: number;
  isCrit: boolean;
  ts: number;
};

export type MobDefeatedMessage = {
  type: "mob_defeated";
  mobEntityId: string;
  ts: number;
};

export type HuntStatus = "running" | "complete" | "paused";

export type HuntStatusMessage = {
  type: "hunt_status";
  clientId: VoidRealtimeClientId;
  status: HuntStatus;
  huntEndsAt: number | null;
  ts: number;
};

export type HuntContributionPerPlayer = {
  clientId: VoidRealtimeClientId;
  totalDamage: number;
  totalHits: number;
  mobsContributedTo: number;
  mobsKilled: number;
  bonusMultiplier: number;
  bossDefeated: boolean;
  bossDropResourcesBase: Partial<ResourcesState>;
};

export type HuntContributionResultMessage = {
  type: "hunt_contribution_result";
  zoneId: VoidZoneId;
  sessionBucketId: number;
  resolvedAt: number | null;
  perPlayer: HuntContributionPerPlayer[];
  ts: number;
};

export type ServerToClientMessage =
  | SessionStateMessage
  | PlayersUpdatedMessage
  | MobSpawnedMessage
  | MobHpUpdatedMessage
  | CombatEventMessage
  | MobDefeatedMessage
  | HuntContributionResultMessage;

// (ClientToServerMessage declared above)

