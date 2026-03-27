"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  BrainCircuit,
  FolderKanban,
  Power,
  Settings,
  Store,
  Trophy,
  Users,
  Wrench,
  Play,
  type LucideIcon,
} from "lucide-react";
import {
  mainMenuItems,
  type MainMenuIconKey,
  type MainMenuItem,
} from "@/features/home/mainMenuData";
import { VOID_EXPEDITION_PATH } from "@/features/void-maps/voidRoutes";
import { useAuth } from "@/features/auth/useAuth";

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
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const isFieldActive = pathname === "/home";

  function handleStartVoidHunt() {
    router.push(VOID_EXPEDITION_PATH);
  }

  return (
    <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] border border-white/10 bg-black/45 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
      {/* Deploy + Logout merged into one red card */}
      <div className="group relative mb-3">
        <button
          type="button"
          onClick={handleStartVoidHunt}
          className={[
            "block w-full rounded-[22px] border px-4 py-4 text-left shadow-[0_0_30px_rgba(255,50,50,0.12)] transition",
            "border-red-500/30 bg-[linear-gradient(135deg,rgba(130,18,18,0.88),rgba(45,8,8,0.92))] hover:border-red-400/45 hover:brightness-110",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-red-200/80">
              Deployment
            </div>
            <div
              className={[
                "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                isFieldActive
                  ? "border-cyan-300/40 bg-cyan-300/14 text-cyan-50"
                  : "border-white/10 bg-black/20 text-white/55",
              ].join(" ")}
            >
              {isFieldActive ? "Field Active" : "Ready"}
            </div>
          </div>

          <div className="mt-2 text-[34px] font-black uppercase leading-[0.92] text-white">
            Enter
            <br />
            The Void
          </div>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
            Deploy now
          </p>
        </button>

        {/* Logout — fused into bottom-right corner of the Deploy card */}
        <button
          type="button"
          onClick={() => void signOut()}
          aria-label="Sign out"
          title="Sign out"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/40 transition hover:border-red-400/40 hover:bg-red-900/40 hover:text-red-300 active:scale-90"
        >
          <Power className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="space-y-1.5">
        {mainMenuItems.map((item: MainMenuItem) => {
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "group flex min-h-[52px] items-center gap-3 rounded-[18px] border px-4 transition duration-200",
                item.isPrimary
                  ? "border-red-500/35 bg-[linear-gradient(135deg,rgba(80,12,12,0.88),rgba(22,10,10,0.94))] text-white shadow-[0_0_24px_rgba(255,60,60,0.10)]"
                  : "border-white/10 bg-[linear-gradient(135deg,rgba(18,20,30,0.86),rgba(8,10,18,0.94))] text-white/88 hover:border-white/20 hover:bg-[linear-gradient(135deg,rgba(24,27,40,0.92),rgba(10,12,20,0.96))]",
              ].join(" ")}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-white/5">
                <Icon className="h-[17px] w-[17px]" />
              </div>

              <div className="flex-1">
                <div className="text-[20px] font-black uppercase leading-none tracking-[0.04em]">
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
