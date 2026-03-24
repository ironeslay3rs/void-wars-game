import { Bell, Power, Users, UserCircle2 } from "lucide-react";
import IconBadge from "@/components/shared/IconBadge";
import { homeSceneData } from "@/features/home/homeSceneData";

export default function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 px-4 pt-safe-top sm:px-6">
      <div className="relative mx-auto flex h-24 max-w-[1700px] items-start justify-between pt-3">
        <div className="flex items-center gap-2 pt-1 sm:gap-3">
          <IconBadge>
            <Bell className="h-[18px] w-[18px] md:h-4 md:w-4" />
          </IconBadge>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="relative min-w-[320px] px-6 pt-1 text-center sm:min-w-[420px] sm:px-10 lg:min-w-[560px] lg:px-16">
            <div className="absolute left-0 right-0 top-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="absolute left-0 top-5 hidden h-px w-20 bg-gradient-to-r from-transparent to-white/20 sm:block lg:w-36" />
            <div className="absolute right-0 top-5 hidden h-px w-20 bg-gradient-to-l from-transparent to-white/20 sm:block lg:w-36" />

            <div className="absolute left-4 top-2 h-7 w-7 border-l border-t border-white/15 sm:left-6 sm:h-8 sm:w-8 lg:left-8" />
            <div className="absolute right-4 top-2 h-7 w-7 border-r border-t border-white/15 sm:right-6 sm:h-8 sm:w-8 lg:right-8" />

            <div className="absolute left-10 top-10 hidden h-px w-12 bg-gradient-to-r from-white/10 to-transparent sm:block lg:left-14 lg:w-20" />
            <div className="absolute right-10 top-10 hidden h-px w-12 bg-gradient-to-l from-white/10 to-transparent sm:block lg:right-14 lg:w-20" />

            <h1 className="text-[32px] font-black uppercase leading-none tracking-[0.12em] text-slate-100 drop-shadow-[0_8px_22px_rgba(0,0,0,0.4)] sm:text-[40px] lg:text-[54px]">
              {homeSceneData.title}
            </h1>

            <p className="mt-1 text-[12px] font-black uppercase tracking-[0.42em] text-slate-300 sm:text-[11px] sm:tracking-[0.55em] lg:tracking-[0.7em]">
              {homeSceneData.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:gap-3">
          <IconBadge>
            <UserCircle2 className="h-[18px] w-[18px] md:h-4 md:w-4" />
          </IconBadge>
          <IconBadge>
            <Users className="h-[18px] w-[18px] md:h-4 md:w-4" />
          </IconBadge>
          <IconBadge>
            <Power className="h-[18px] w-[18px] text-red-400 md:h-4 md:w-4" />
          </IconBadge>
        </div>
      </div>
    </header>
  );
}
