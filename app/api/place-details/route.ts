import { NextResponse, type NextRequest } from "next/server";

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
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,googleMapsUri,location",
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

    if (
      typeof place?.id !== "string" ||
      !place.id.trim() ||
      typeof place?.displayName?.text !== "string" ||
      !place.displayName.text.trim() ||
      typeof place?.location?.latitude !== "number" ||
      typeof place?.location?.longitude !== "number" ||
      !Number.isFinite(place.location.latitude) ||
      !Number.isFinite(place.location.longitude) ||
      Math.abs(place.location.latitude) > 90 ||
      Math.abs(place.location.longitude) > 180
    ) {
      return NextResponse.json(
        { error: "음식점 정보 또는 위치 정보가 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        id: place.id,
        displayName: {
          text: place.displayName.text,
        },
        formattedAddress:
          typeof place.formattedAddress === "string"
            ? place.formattedAddress
            : "",

        location: {
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        },
        googleMapsUri:
          typeof place.googleMapsUri === "string"
            ? place.googleMapsUri
            : `https://www.google.com/maps/search/?api=1&query=restaurant&query_place_id=${encodeURIComponent(place.id)}`,
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
