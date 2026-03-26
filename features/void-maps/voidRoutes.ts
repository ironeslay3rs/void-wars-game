/** Canonical client routes for the two-layer Void flow (expedition → field). */
export const VOID_EXPEDITION_PATH = "/deploy-into-void";
export const VOID_FIELD_PATH = "/deploy-into-void/field";
export const TP_FIELD_PATH = "/tp-field";

export function voidFieldSearch(params: {
  zoneId: string;
  sessionBucketId: number;
  deployIntro?: boolean;
}) {
  const q = new URLSearchParams({
    zone: params.zoneId,
    bucket: String(params.sessionBucketId),
  });
  if (params.deployIntro) q.set("deployIntro", "1");
  return `${VOID_FIELD_PATH}?${q.toString()}`;
}
