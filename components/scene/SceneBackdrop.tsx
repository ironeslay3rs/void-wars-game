import type { ReactNode } from "react";

import { assets } from "@/lib/assets";

type SceneBackdropProps = {
  sceneId: string;
  className?: string;
  imageClassName?: string;
  layers?: ReactNode;
};

export default function SceneBackdrop({
  sceneId,
  className = "",
  imageClassName = "",
  layers,
}: SceneBackdropProps) {
  return (
    <div
      className={["absolute inset-0 overflow-hidden", className].join(" ").trim()}
      data-scene-id={sceneId}
    >
      <div
        className={[
          "absolute inset-0 bg-cover bg-center",
          imageClassName,
        ].join(" ").trim()}
        style={{ backgroundImage: `url(${assets.home.background})` }}
      />

      {layers}
    </div>
  );
}
