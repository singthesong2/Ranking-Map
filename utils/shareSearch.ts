import { shareSearchSchema } from "@/schemas/shareSearchSchema";

interface ShareSearchOptions {
  latitude: number;
  longitude: number;
  radius: number;
  category: string;
  sort: string;
}

export function createShareUrl({
  latitude,
  longitude,
  radius,
  category,
  sort,
}: ShareSearchOptions) {
  const url = new URL(window.location.pathname, window.location.origin);

  url.searchParams.set("lat", latitude.toFixed(6));
  url.searchParams.set("lng", longitude.toFixed(6));
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("category", category);
  url.searchParams.set("sort", sort);

  return url.toString();
}

export function readShareSearch() {
  const params = new URLSearchParams(window.location.search);

  const lat = params.get("lat");
  const lng = params.get("lng");
  if (!lat?.trim() || !lng?.trim()) return null;

  const radius = params.get("radius");
  const result = shareSearchSchema.safeParse({
    latitude: Number(lat),
    longitude: Number(lng),
    radius: radius === null ? undefined : Number(radius),
    category: params.get("category") ?? undefined,
    sort: params.get("sort") ?? undefined,
  });

  if (!result.success) return null;

  return result.data;
}
