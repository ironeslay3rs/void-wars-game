"use client";

import type { AuthSession, AuthUser } from "@/features/auth/authTypes";

const AUTH_STORAGE_KEY = "void-wars-oblivion-auth-session";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[authClient] Supabase env check", {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
  });

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

function mapAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;

  if (typeof raw.id !== "string") {
    return null;
  }

  return {
    id: raw.id,
    email: typeof raw.email === "string" ? raw.email : null,
  };
}

function mapAuthSession(value: unknown): AuthSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const user = mapAuthUser(raw.user);

  if (
    typeof raw.access_token !== "string" ||
    typeof raw.refresh_token !== "string" ||
    !user
  ) {
    return null;
  }

  const expiresAt =
    typeof raw.expires_at === "number"
      ? raw.expires_at * 1000
      : Date.now() + (typeof raw.expires_in === "number" ? raw.expires_in : 0) * 1000;

  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt,
    user,
  };
}

async function supabaseRequest(
  path: string,
  init: RequestInit,
  accessToken?: string,
) {
  const { url, anonKey } = getSupabaseConfig();

  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  return response;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const message =
      typeof payload.msg === "string"
        ? payload.msg
        : typeof payload.error_description === "string"
          ? payload.error_description
          : typeof payload.message === "string"
            ? payload.message
            : null;

    return message ?? "Authentication request failed.";
  } catch {
    return "Authentication request failed.";
  }
}

export function loadStoredAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return mapAuthSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function storeAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function refreshAuthSession(refreshToken: string) {
  const response = await supabaseRequest(
    "/auth/v1/token?grant_type=refresh_token",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const session = mapAuthSession(payload);

  if (!session) {
    throw new Error("Supabase returned an invalid refreshed session.");
  }

  return session;
}

export async function signInWithPassword(email: string, password: string) {
  const response = await supabaseRequest(
    "/auth/v1/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  const session = mapAuthSession(payload);

  if (!session) {
    throw new Error("Supabase returned an invalid sign-in session.");
  }

  return session;
}

export async function signUpWithPassword(email: string, password: string) {
  const response = await supabaseRequest(
    "/auth/v1/signup",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await response.json();
  return mapAuthSession(payload);
}

export async function signOutRemote(accessToken: string) {
  const response = await supabaseRequest(
    "/auth/v1/logout",
    {
      method: "POST",
    },
    accessToken,
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}
