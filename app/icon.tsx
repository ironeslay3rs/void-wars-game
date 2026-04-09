import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 48, height: 48 };

export const contentType = "image/png";

/** Browser tab / favicon — matches PWA tile styling. */
export default function Icon() {
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
          borderRadius: 10,
          color: "#c9a227",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        VW
      </div>
    ),
    { ...size },
  );
}
