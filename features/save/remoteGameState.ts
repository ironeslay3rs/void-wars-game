"use client";

import type { GameState } from "@/features/game/gameTypes";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

async function supabaseRestRequest(
  path: string,
  accessToken: string,
  init: RequestInit,
) {
  const { url, anonKey } = getSupabaseConfig();

  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers ?? {}),
    },
  });
}

export async function loadRemoteGameState(
  userId: string,
  accessToken: string,
): Promise<GameState | null> {
  const response = await supabaseRestRequest(
    `/rest/v1/game_saves?select=game_state&user_id=eq.${encodeURIComponent(userId)}`,
    accessToken,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load remote game state.");
  }

  const rows = (await response.json()) as Array<{ game_state?: GameState }>;
  return rows[0]?.game_state ?? null;
}

export async function saveRemoteGameState(params: {
  userId: string;
  accessToken: string;
  gameState: GameState;
}) {
  const { userId, accessToken, gameState } = params;

  const response = await supabaseRestRequest(
    "/rest/v1/game_saves?on_conflict=user_id",
    accessToken,
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          user_id: userId,
          game_state: gameState,
          updated_at: new Date().toISOString(),
        },
      ]),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to save remote game state.");
  }
}
