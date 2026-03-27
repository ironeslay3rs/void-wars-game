/**
 * Client-only WebSocket URL for void realtime (field sessions + social chat).
 *
 * Production (Vercel): set `NEXT_PUBLIC_VOID_WS_URL` to a dedicated WSS endpoint
 * (your hosted `wsServer` — Fly, Railway, VPS, etc.). The app cannot open a WS
 * server on the same Vercel deployment.
 */

function formatWithPort(proto: "ws:" | "wss:", host: string, port: string) {
  if (proto === "wss:" && port === "443") {
    return `${proto}//${host}`;
  }
  if (proto === "ws:" && port === "80") {
    return `${proto}//${host}`;
  }
  return `${proto}//${host}:${port}`;
}

export function getVoidRealtimeWebSocketUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const explicit = process.env.NEXT_PUBLIC_VOID_WS_URL?.trim();
  if (explicit) {
    return explicit;
  }

  // HTTPS (e.g. Vercel preview/production): never guess host:port — there is no WS listener on the page origin.
  if (window.location.protocol === "https:") {
    return "";
  }

  const host =
    process.env.NEXT_PUBLIC_VOID_WS_HOST?.trim() ||
    window.location.hostname;

  const port = (process.env.NEXT_PUBLIC_VOID_WS_PORT ?? "3002").trim();

  return formatWithPort("ws:", host, port);
}
