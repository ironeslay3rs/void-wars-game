import SceneBackdrop from "@/components/scene/SceneBackdrop";

// Keep the city/home scene distinct from the main background scene even if the art direction overlaps for now.

export default function CityHomeScene() {
  return (
    <SceneBackdrop
      sceneId="city-home-scene"
      imageClassName="scale-[1.02]"
      layers={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,132,72,0.20),rgba(35,24,18,0.18)_24%,rgba(8,10,18,0.62)_58%,rgba(0,0,0,0.88)_100%)]" />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.32),rgba(0,0,0,0.76))]" />

          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,214,170,0.10),rgba(0,0,0,0))]" />

          <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.78))]" />

          <div className="absolute left-[18%] top-[18%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(255,120,72,0.18),rgba(0,0,0,0))] blur-3xl" />

          <div className="absolute right-[16%] top-[16%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(80,200,255,0.10),rgba(0,0,0,0))] blur-3xl" />

          <div className="absolute inset-x-[14%] bottom-[18%] h-32 bg-[radial-gradient(circle_at_center,rgba(255,180,110,0.10),rgba(0,0,0,0))] blur-3xl" />
        </>
      }
    />
  );
}
