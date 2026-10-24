import { NextResponse } from "next/server";
import { normalize } from "@/utils/regionSearch";

export async function POST(request: Request) {
  try {
    const { keyword, latitude, longitude, radius, pageToken } =
      await request.json();

    if (
      typeof keyword !== "string" ||
      !keyword.trim() ||
      keyword.length > 100 ||
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180 ||
      typeof radius !== "number" ||
      !Number.isFinite(radius) ||
      radius < 100 ||
      radius > 5000 ||
      (pageToken !== undefined &&
        (typeof pageToken !== "string" || !pageToken.trim()))
    ) {
      return NextResponse.json(
        { error: "검색 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google API 키가 없습니다." },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.formattedAddress",
            "places.location",
            "places.types",
            "places.primaryType",
            "places.googleMapsUri",
            "nextPageToken",
          ].join(","),
        },
        body: JSON.stringify({
          textQuery: keyword.trim(),
          languageCode: "ko",
          pageSize: 10,
          ...(pageToken ? { pageToken } : {}),
          locationBias: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius,
            },
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "가게 검색에 실패했습니다." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const normalizedKeyword = normalize(keyword.trim());
    const filteredRestaurants = (data.places ?? []).filter(
      (restaurant: { displayName?: { text?: string } }) =>
        normalize(restaurant.displayName?.text ?? "").includes(
          normalizedKeyword,
        ),
    );

    return NextResponse.json({
      restaurants: filteredRestaurants,
      nextPageToken: data.nextPageToken ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "검색 요청을 처리하지 못했습니다." },
      { status: 500 },
    );
  }
}
