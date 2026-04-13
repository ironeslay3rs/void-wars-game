"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { GameProvider } from "@/features/game/gameContext";
import AnomalyToast from "@/components/shared/AnomalyToast";
import RankUpBanner from "@/components/shared/RankUpBanner";
import ToastHost from "@/components/shared/ToastHost";
import GameEventToaster from "@/components/shared/GameEventToaster";
import {
  clearStoredAuthSession,
  loadStoredAuthSession,
  refreshAuthSession,
  signInWithPassword,
  signOutRemote,
  signUpWithPassword,
  storeAuthSession,
} from "@/features/auth/authClient";
import type { AuthContextValue, AuthSession, AuthStatus } from "@/features/auth/authTypes";

const PUBLIC_AUTH_ROUTES = new Set(["/login", "/register", "/recover"]);

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const beforeLogoutHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const isPublicAuthRoute = pathname ? PUBLIC_AUTH_ROUTES.has(pathname) : false;

  useEffect(() => {
    let isCancelled = false;

    async function resolveSession() {
      const storedSession = loadStoredAuthSession();

      if (!storedSession) {
        if (!isCancelled) {
          setSession(null);
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const shouldRefresh = storedSession.expiresAt <= Date.now() + 60_000;
        const nextSession = shouldRefresh
          ? await refreshAuthSession(storedSession.refreshToken)
          : storedSession;

        if (isCancelled) {
          return;
        }

        storeAuthSession(nextSession);
        setSession(nextSession);
        setStatus("authenticated");
      } catch {
        clearStoredAuthSession();

        if (!isCancelled) {
          setSession(null);
          setStatus("unauthenticated");
        }
      }
    }

    void resolveSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" && !isPublicAuthRoute) {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && isPublicAuthRoute) {
      router.replace("/home");
    }
  }, [isPublicAuthRoute, router, status]);

  const signIn = useCallback(async (email: string, password: string) => {
    const nextSession = await signInWithPassword(email, password);
    // Clear stale unsuffixed state key from older builds to prevent collisions.
    try {
      window.localStorage.removeItem("void-wars-oblivion-game-state");
    } catch {
      // best-effort only
    }
    storeAuthSession(nextSession);
    setSession(nextSession);
    setStatus("authenticated");
    router.replace("/home");
  }, [router]);

  const signUp = useCallback(async (email: string, password: string) => {
    const nextSession = await signUpWithPassword(email, password);

    if (!nextSession) {
      return false;
    }

    // Clear stale unsuffixed state key from older builds to prevent collisions.
    try {
      window.localStorage.removeItem("void-wars-oblivion-game-state");
    } catch {
      // best-effort only
    }
    storeAuthSession(nextSession);
    setSession(nextSession);
    setStatus("authenticated");
    router.replace("/home");
    return true;
  }, [router]);

  const signOut = useCallback(async () => {
    try {
      await beforeLogoutHandlerRef.current?.();
    } catch {
      // best-effort flush only
    }

    const activeSession = session;

    clearStoredAuthSession();
    setSession(null);
    setStatus("unauthenticated");

    if (activeSession) {
      try {
        await signOutRemote(activeSession.accessToken);
      } catch {
        // best-effort sign out only
      }
    }

    router.replace("/login");
  }, [router, session]);

  const setBeforeLogoutHandler = useCallback(
    (handler: (() => Promise<void>) | null) => {
      beforeLogoutHandlerRef.current = handler;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      session,
      signIn,
      signUp,
      signOut,
      setBeforeLogoutHandler,
    }),
    [session, setBeforeLogoutHandler, signIn, signOut, signUp, status],
  );

  let content: ReactNode = (
    <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/70">
      Establishing uplink...
    </div>
  );

  if (status !== "loading") {
    if (status === "unauthenticated") {
      content = isPublicAuthRoute ? children : content;
    } else if (isPublicAuthRoute) {
      content = content;
    } else {
      content = (
        <>
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="fixed right-6 top-6 z-[100] rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-sm transition hover:border-white/30 hover:bg-black/70"
          >
            Logout
          </button>
          <GameProvider>
            {children}
            <AnomalyToast />
            <RankUpBanner />
            <ToastHost />
            <GameEventToaster />
          </GameProvider>
        </>
      );
    }
  }

  return <AuthContext.Provider value={value}>{content}</AuthContext.Provider>;
}
