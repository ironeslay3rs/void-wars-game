import { Suspense } from "react";
import VoidFieldScreen from "@/components/void-field/VoidFieldScreen";

export default function DeployVoidFieldPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/70">
          <div className="w-[min(720px,92vw)] rounded-xl border border-white/10 bg-black/55 p-6 text-center shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400/60" />
              <span className="font-semibold">Loading void field...</span>
            </div>
            <div className="mt-3 h-px bg-white/10" />
            <p className="mt-3 text-xs leading-relaxed text-white/45">
              Bootstrapping hunt state, initializing realtime session, and syncing
              your loadout.
            </p>
          </div>
        </div>
      }
    >
      <VoidFieldScreen />
    </Suspense>
  );
}
