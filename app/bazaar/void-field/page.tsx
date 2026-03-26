import { Suspense } from "react";
import VoidFieldScreen from "@/components/void-field/VoidFieldScreen";

export default function VoidFieldPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/60">
          Loading void field…
        </div>
      }
    >
      <VoidFieldScreen />
    </Suspense>
  );
}
