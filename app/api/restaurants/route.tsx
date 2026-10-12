export async function POST(request: Request) {
  const { latitude, longitude } = await request.json();

  if (latitude == null || longitude == null) {
    return Response.json(
      { message: "위치 정보가 필요합니다." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return new Response(null, {
      status: 500,
    });
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount",
      },

      body: JSON.stringify({
        includedTypes: ["restaurant"],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius: 3000,
          },
        },
        rankPreference: "POPULARITY",
      }),
    },
  );

  if (!response.ok) {
    return new Response(null, {
      status: 500,
    });
  }
  const data = await response.json();

  return Response.json(data);
}
