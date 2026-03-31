import type { ArenaMatchModeId } from "@/features/arena/arenaMatchModes";

export type ArenaMode = {
  id: ArenaMatchModeId;
  title: string;
  subtitle: string;
  body: string;
};

export type { ArenaMatchModeId } from "@/features/arena/arenaMatchModes";

export type QueueState = "idle" | "searching" | "matched";

export type ArenaAccent = {
  ring: string;
  glow: string;
  chip: string;
  bar: string;
};
