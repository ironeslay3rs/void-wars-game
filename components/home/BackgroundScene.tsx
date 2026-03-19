import { assets } from "@/lib/assets";

export default function BackgroundScene() {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.home.background})` }}
    />
  );
}