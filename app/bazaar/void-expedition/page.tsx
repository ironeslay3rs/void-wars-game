import { Suspense } from "react";
import VoidExpeditionScreen from "@/components/void-maps/VoidExpeditionScreen";

export default function VoidExpeditionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/60">
          Loading expedition…
        </div>
      }
    >
      <VoidExpeditionScreen />
    </Suspense>
  );
}
