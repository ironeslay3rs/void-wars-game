/**
 * Canonical site origin for metadata (Open Graph, manifest id, absolute URLs).
 * Prefer NEXT_PUBLIC_SITE_URL in production; Vercel sets VERCEL_URL during build/deploy.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}
