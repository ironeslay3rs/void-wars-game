"use client";

import type { PlayerPresence } from "@/features/void-maps/realtime/voidRealtimeProtocol";
import VoidFieldPlayer from "@/components/void-field/VoidFieldPlayer";

export default function VoidFieldPlayers({
  players,
  selfClientId,
}: {
  players: PlayerPresence[];
  selfClientId: string;
}) {
  return (
    <>
      {players
        .filter((p) => p.clientId !== selfClientId)
        .map((p) => (
          <VoidFieldPlayer
            key={p.clientId}
            xNorm={p.x / 100}
            yNorm={p.y / 100}
            label={p.playerName.slice(0, 4)}
            isSelf={false}
            factionAlignment={p.factionAlignment}
            showLabel
          />
        ))}
    </>
  );
}
