import { redirect } from "next/navigation";

type MarketLegacyRouteProps = {
  params: { slug?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildQueryString(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => query.append(key, entry));
      return;
    }

    if (typeof value === "string") {
      query.append(key, value);
    }
  });

  const encoded = query.toString();
  return encoded ? `?${encoded}` : "";
}

export default function LegacyMarketRedirectPage({
  params,
  searchParams,
}: MarketLegacyRouteProps) {
  const { slug = [] } = params;
  const resolvedSearchParams = searchParams ?? {};

  const suffix =
    slug.length > 0
      ? `/${slug.map((segment) => encodeURIComponent(segment)).join("/")}`
      : "";
  const queryString = buildQueryString(resolvedSearchParams);

  redirect(`/bazaar${suffix}${queryString}`);
}
