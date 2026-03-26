"use client";

import { useRouter } from "next/navigation";
import MenuButton from "@/components/shared/MenuButton";
import { homeMenuData } from "@/features/navigation/homeMenuData";
import { getNavigationItemsByPlacement } from "@/features/navigation/navigationItems";
import { useGame } from "@/features/game/gameContext";
import {
  getContinueRoute,
  hasMeaningfulProgress,
} from "@/features/game/gameProgress";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";

export default function LeftCommandMenu() {
  const router = useRouter();
  const { state, resetGame } = useGame();

  const continueRoute = getContinueRoute(state.player);
  const canContinue = hasMeaningfulProgress(state.player);
  const sideNavItems = getNavigationItemsByPlacement("side");

  return (
    <aside className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-6 top-20 z-30 w-[290px] overflow-y-auto overscroll-contain pr-1 pb-6 xl:w-[320px]">
      <div className="relative rounded-[22px] border border-white/8 bg-black/24 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-[3px]">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-6 left-0 w-px bg-gradient-to-b from-transparent via-red-500/20 to-transparent" />

        <div className="space-y-2.5">
          <MenuButton
            label="Into the Void"
            isPrimary
            href={VOID_EXPEDITION_PATH}
          />

          {homeMenuData.map((item) => {
            if (item.label === "Continue") {
              return (
                <MenuButton
                  key={item.id}
                  label={canContinue ? item.label : `${item.label} / No Save`}
                  onClick={() => router.push(continueRoute)}
                />
              );
            }

            if (item.label === "New Game") {
              return (
                <MenuButton
                  key={item.id}
                  label={item.label}
                  onClick={() => {
                    resetGame();
                    router.push("/new-game");
                  }}
                />
              );
            }

            return (
              <MenuButton
                key={item.id}
                label={item.label}
                href={item.href}
              />
            );
          })}

          <div className="px-2 pt-3">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="px-3 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
              Command Network
            </div>
          </div>

          {sideNavItems.map((item) => (
            <MenuButton
              key={item.id}
              label={item.label}
              href={item.href}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}