import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };

export const contentType = "image/png";

/** iOS “Add to Home Screen” / PWA tile (PNG for broad compatibility). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: 40,
          color: "#c9a227",
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -2,
        }}
      >
        VW
      </div>
    ),
    { ...size },
  );
}
