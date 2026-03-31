import { NextResponse } from "next/server";

export async function GET() {
  const wsConfigured = Boolean(
    process.env.NEXT_PUBLIC_VOID_WS_URL?.trim(),
  );
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  const redisConfigured = Boolean(process.env.REDIS_URL);
  const postgresConfigured = Boolean(process.env.DATABASE_URL);

  return NextResponse.json(
    {
      status: "ok",
      service: "void-wars-web",
      timestamp: new Date().toISOString(),
      checks: {
        supabaseConfigured,
        wsConfigured,
        redisConfigured,
        postgresConfigured,
      },
    },
    { status: 200 },
  );
}
