import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Void Wars: Oblivion — survival RPG";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(145deg, #0a0a0a 0%, #121218 45%, #1a1510 100%)",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#0a0a0a",
              border: "2px solid rgba(201, 162, 39, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c9a227",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            VW
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2 }}>
              Void Wars: Oblivion
            </div>
            <div style={{ fontSize: 28, color: "rgba(245,245,245,0.75)" }}>
              Black Market hub · Void hunts · Extraction
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "rgba(245,245,245,0.55)",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          Survival-first RPG — deploy, hunt, recover. Play in the browser or install as an app.
        </div>
      </div>
    ),
    { ...size },
  );
}
