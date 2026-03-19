"use client";

import { useRouter } from "next/navigation";
import MenuButton from "@/components/shared/MenuButton";
import { homeMenuData } from "@/features/navigation/homeMenuData";
import { useGame } from "@/features/game/gameContext";
import {
  getContinueRoute,
  hasMeaningfulProgress,
} from "@/features/game/gameProgress";

export default function LeftCommandMenu() {
  const router = useRouter();
  const { state, resetGame } = useGame();

  const continueRoute = getContinueRoute(state);
  const canContinue = hasMeaningfulProgress(state);

  return (
    <aside className="absolute left-6 top-20 z-30 w-[290px] xl:w-[320px]">
      <div className="relative rounded-[22px] border border-white/6 bg-black/18 p-2 backdrop-blur-[2px]">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="space-y-2.5">
          <MenuButton label="Enter the Void" isPrimary href="/" />

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
                  onClick={resetGame}
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
        </div>
      </div>
    </aside>
  );
}