import { Suspense } from "react";
import VoidExpeditionScreen from "@/components/void-maps/VoidExpeditionScreen";

export default function DeployIntoVoidPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/60">
          Loading deploy map...
        </div>
      }
    >
      <VoidExpeditionScreen />
    </Suspense>
  );
}
