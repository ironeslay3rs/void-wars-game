import { assets } from "@/lib/assets";

export default function BackgroundScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${assets.home.background})` }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(140,40,40,0.22),rgba(25,20,40,0.18)_28%,rgba(5,8,20,0.58)_58%,rgba(0,0,0,0.86)_100%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.38),rgba(0,0,0,0.72))]" />

      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0))]" />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.72))]" />

      <div className="absolute left-1/2 top-[12%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(105,80,255,0.18),rgba(90,30,180,0.08),rgba(0,0,0,0))] blur-3xl" />

      <div className="absolute left-[22%] top-[16%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(255,70,70,0.14),rgba(0,0,0,0))] blur-3xl" />

      <div className="absolute right-[18%] top-[20%] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(60,180,255,0.12),rgba(0,0,0,0))] blur-3xl" />
    </div>
  );
}