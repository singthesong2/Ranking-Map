import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("id")?.trim();

  if (!placeId || placeId.length > 256) {
    return NextResponse.json(
      { error: "올바르지 않은 장소 ID입니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google API 키가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    const url =
      `https://places.googleapis.com/v1/places/` +
      encodeURIComponent(placeId) +
      "?languageCode=ko";

    const response = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,googleMapsUri",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "음식점 정보 조회에 실패했습니다." },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const place = await response.json();

    if (!place.id || !place.displayName?.text) {
      return NextResponse.json(
        { error: "음식점 정보가 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        id: place.id,
        displayName: place.displayName,
        formattedAddress: place.formattedAddress ?? "",
        googleMapsUri:
          place.googleMapsUri ??
          `https://www.google.com/maps/search/?api=1&query=restaurant&query_place_id=${encodeURIComponent(place.id)}`,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "서버 요청 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
