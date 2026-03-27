import { NextResponse } from "next/server";

export async function GET() {
  const wsConfigured = Boolean(process.env.NEXT_PUBLIC_VOID_WS_URL);
  const redisConfigured = Boolean(process.env.REDIS_URL);
  const postgresConfigured = Boolean(process.env.DATABASE_URL);

  return NextResponse.json(
    {
      status: "ok",
      service: "void-wars-web",
      timestamp: new Date().toISOString(),
      checks: {
        wsConfigured,
        redisConfigured,
        postgresConfigured,
      },
    },
    { status: 200 },
  );
}
