"use client";

import type { GameState } from "@/features/game/gameTypes";

const GAME_SAVES_TABLE = "game_saves";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    anonKey,
  };
}

async function readSupabaseRestError(response: Response) {
  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const message =
      typeof payload.message === "string"
        ? payload.message
        : typeof payload.error === "string"
          ? payload.error
          : typeof payload.details === "string"
            ? payload.details
            : null;
    const hint =
      typeof payload.hint === "string" ? payload.hint : null;

    if (message && hint) {
      return `${message} ${hint}`;
    }

    return message;
  } catch {
    return null;
  }
}

async function createRemoteGameStateError(
  operation: "load" | "save",
  response: Response,
) {
  const suffix =
    operation === "load"
      ? "load remote game state"
      : "save remote game state";
  const details = await readSupabaseRestError(response);

  if (response.status === 404) {
    return new Error(
      `Supabase REST could not find public.${GAME_SAVES_TABLE}. Create the table and expose it to the API before attempting to ${suffix}.${details ? ` ${details}` : ""}`.trim(),
    );
  }

  return new Error(
    details
      ? `Failed to ${suffix}. ${details}`
      : `Failed to ${suffix}.`,
  );
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
    `/rest/v1/${GAME_SAVES_TABLE}?select=game_state&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    accessToken,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw await createRemoteGameStateError("load", response);
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

  try {
    const response = await supabaseRestRequest(
      `/rest/v1/${GAME_SAVES_TABLE}?on_conflict=user_id`,
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
      console.error(await createRemoteGameStateError("save", response));
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to save remote game state.", error);
    return false;
  }
}
