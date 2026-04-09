"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export function GameOnboardingRouteGuard({
  children,
  characterCreated,
}: {
  children: ReactNode;
  characterCreated: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (characterCreated) return;
    if (pathname?.startsWith("/new-game")) return;
    router.replace("/new-game");
  }, [characterCreated, pathname, router]);

  return children;
}
