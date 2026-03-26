import { redirect } from "next/navigation";

export default async function VoidExpeditionLegacyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const spIn = await searchParams;
  const q = new URLSearchParams();
  const zone = typeof spIn.zone === "string" ? spIn.zone : null;
  if (zone) q.set("zone", zone);

  const suffix = q.size > 0 ? `?${q.toString()}` : "";
  redirect(`/deploy-into-void${suffix}`);
}
