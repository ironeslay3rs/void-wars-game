import BazaarNodesLayer from "@/components/bazaar/BazaarNodesLayer";

export default function BazaarMapCanvas() {
  return (
    <div className="relative mx-auto h-[78vh] max-w-[1550px] rounded-[28px] border border-white/8 bg-black/10 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-[1px]">
      <BazaarNodesLayer />

      <div className="pointer-events-none absolute left-1/2 top-[26%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/18 blur-[90px]" />
      <div className="pointer-events-none absolute left-1/2 top-[56%] h-[320px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-[120px]" />
    </div>
  );
}