"use client";

import Link from "next/link";
import {
  Briefcase,
  BrainCircuit,
  FolderKanban,
  Play,
  Settings,
  Store,
  Trophy,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  mainMenuItems,
  type MainMenuIconKey,
  type MainMenuItem,
} from "@/features/home/mainMenuData";

const iconMap: Record<MainMenuIconKey, LucideIcon> = {
  play: Play,
  folder: FolderKanban,
  briefcase: Briefcase,
  brain: BrainCircuit,
  wrench: Wrench,
  store: Store,
  trophy: Trophy,
  users: Users,
  settings: Settings,
};

export default function MainMenuLeftRail() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/45 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="mb-3 rounded-[22px] border border-red-500/30 bg-[linear-gradient(135deg,rgba(130,18,18,0.88),rgba(45,8,8,0.92))] px-4 py-4 shadow-[0_0_30px_rgba(255,50,50,0.12)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/80">
          Primary Access
        </div>

        <div className="mt-2 text-[34px] font-black uppercase leading-[0.92] text-white">
          Enter
          <br />
          The Void
        </div>
      </div>

      <nav className="space-y-2">
        {mainMenuItems.map((item: MainMenuItem) => {
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "group flex min-h-[56px] items-center gap-3 rounded-[18px] border px-4 transition duration-200",
                item.isPrimary
                  ? "border-red-500/35 bg-[linear-gradient(135deg,rgba(80,12,12,0.88),rgba(22,10,10,0.94))] text-white shadow-[0_0_24px_rgba(255,60,60,0.10)]"
                  : "border-white/10 bg-[linear-gradient(135deg,rgba(18,20,30,0.86),rgba(8,10,18,0.94))] text-white/88 hover:border-white/20 hover:bg-[linear-gradient(135deg,rgba(24,27,40,0.92),rgba(10,12,20,0.96))]",
              ].join(" ")}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-white/5">
                <Icon className="h-[18px] w-[18px]" />
              </div>

              <div className="flex-1">
                <div className="text-[22px] font-black uppercase leading-none tracking-[0.04em]">
                  {item.label}
                </div>
              </div>

              <div className="text-[10px] uppercase tracking-[0.24em] text-white/35 transition group-hover:text-white/55">
                Open
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}