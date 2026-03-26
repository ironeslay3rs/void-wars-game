import { redirect } from "next/navigation";

export default async function VoidMapLegacyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const spIn = await searchParams;
  const q = new URLSearchParams();

  const zone = typeof spIn.zone === "string" ? spIn.zone : null;
  const bucket = typeof spIn.bucket === "string" ? spIn.bucket : null;
  const intro = typeof spIn.deployIntro === "string" ? spIn.deployIntro : null;

  if (zone) q.set("zone", zone);
  if (bucket) q.set("bucket", bucket);
  if (intro) q.set("deployIntro", intro);

  const suffix = q.size > 0 ? `?${q.toString()}` : "";
  redirect(`/deploy-into-void/field${suffix}`);
}
