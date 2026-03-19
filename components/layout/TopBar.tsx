import { Bell, Power, Users, UserCircle2 } from "lucide-react";
import IconBadge from "@/components/shared/IconBadge";
import { homeSceneData } from "@/features/home/homeSceneData";

export default function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-6 pt-3">
      <div className="relative mx-auto flex h-24 max-w-[1700px] items-start justify-between">
        <div className="flex items-center gap-3 pt-1">
          <IconBadge>
            <Bell className="h-4 w-4" />
          </IconBadge>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="relative min-w-[560px] px-16 pt-1 text-center">
            <div className="absolute left-0 right-0 top-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="absolute left-0 top-5 h-px w-36 bg-gradient-to-r from-transparent to-white/20" />
            <div className="absolute right-0 top-5 h-px w-36 bg-gradient-to-l from-transparent to-white/20" />

            <div className="absolute left-8 top-2 h-8 w-8 border-l border-t border-white/15" />
            <div className="absolute right-8 top-2 h-8 w-8 border-r border-t border-white/15" />

            <div className="absolute left-14 top-10 h-px w-20 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="absolute right-14 top-10 h-px w-20 bg-gradient-to-l from-white/10 to-transparent" />

            <h1 className="text-[54px] font-black uppercase leading-none tracking-[0.12em] text-slate-100 drop-shadow-[0_8px_22px_rgba(0,0,0,0.4)]">
              {homeSceneData.title}
            </h1>

            <p className="mt-1 text-[11px] font-black uppercase tracking-[0.7em] text-slate-300">
              {homeSceneData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <IconBadge>
            <UserCircle2 className="h-4 w-4" />
          </IconBadge>
          <IconBadge>
            <Users className="h-4 w-4" />
          </IconBadge>
          <IconBadge>
            <Power className="h-4 w-4 text-red-400" />
          </IconBadge>
        </div>
      </div>
    </header>
  );
}