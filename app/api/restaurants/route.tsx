import type { Restaurant, RestaurantCategory } from "@/types/restaurant";
import {
  classifyRestaurant,
  isExcludedRestaurant,
} from "@/utils/restaurantClassifier";
import { calculateDistance } from "@/utils/calculateDistance";

export async function POST(request: Request) {
  const {
    latitude,
    longitude,
    radius,
    category,
  }: {
    latitude: number;
    longitude: number;
    radius: number;
    category: RestaurantCategory;
  } = await request.json();

  if (latitude == null || longitude == null || radius == null) {
    return Response.json(
      { message: "위치 정보가 필요합니다." },
      { status: 400 },
    );
  }

  const safeRadius = Math.min(5000, Math.max(100, Number(radius)));

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return new Response(null, {
      status: 500,
    });
  }

  const CATEGORY_TYPES: Partial<Record<RestaurantCategory, string[]>> = {
    all: ["restaurant"],
    korean: ["korean_restaurant"],
    chinese: ["chinese_restaurant"],
    japanese: ["japanese_restaurant"],
    western: [
      "western_restaurant",
      "italian_restaurant",
      "french_restaurant",
      "american_restaurant",
      "european_restaurant",
    ],
    burger: ["hamburger_restaurant", "fast_food_restaurant"],
    southeastAsian: [
      "thai_restaurant",
      "vietnamese_restaurant",
      "indonesian_restaurant",
      "malaysian_restaurant",
      "filipino_restaurant",
      "cambodian_restaurant",
      "burmese_restaurant",
    ],
    cafe: ["cafe", "coffee_shop"],
    bar: ["bar", "pub", "cocktail_bar", "wine_bar", "sports_bar"],
  };

  const TEXT_SEARCH_QUERIES: Partial<Record<RestaurantCategory, string>> = {
    shabu: "샤브샤브",
    mala: "마라탕",
    meat: "고기집",
    chicken: "치킨",
    curry: "카레 커리",
  };

  const textQuery = TEXT_SEARCH_QUERIES[category];

  if (textQuery) {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.primaryType,places.googleMapsUri",
        },

        body: JSON.stringify({
          textQuery,
          pageSize: 20,
          rankPreference: "RELEVANCE",
          locationBias: {
            circle: {
              center: {
                latitude,
                longitude,
              },
              radius: safeRadius,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      console.error("Google Text Search Error:", error);

      return new Response(null, {
        status: 500,
      });
    }

    const data: {
      places?: Restaurant[];
    } = await response.json();

    const places = data.places ?? [];

    const filteredPlaces = places
      .filter((restaurant) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.location.latitude,
          restaurant.location.longitude,
        );

        return distance <= safeRadius;
      })
      .filter((restaurant) => classifyRestaurant(restaurant) === category)
      .sort((a, b) => {
        const reviewDifference =
          (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);

        if (reviewDifference !== 0) {
          return reviewDifference;
        }

        return (b.rating ?? 0) - (a.rating ?? 0);
      })
      .slice(0, 10);

    return Response.json({
      places: filteredPlaces,
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
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.primaryType,places.googleMapsUri",
      },

      body: JSON.stringify({
        includedTypes: CATEGORY_TYPES[category] ??
          CATEGORY_TYPES.all ?? ["restaurant"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },
            radius: safeRadius,
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

  const data: {
    places?: Restaurant[];
  } = await response.json();
  const places = data.places ?? [];
  const deletePlaces = places.filter(
    (restaurant) => !isExcludedRestaurant(restaurant),
  );
  const filteredPlaces =
    category === "all"
      ? deletePlaces
      : deletePlaces.filter(
          (restaurant) => classifyRestaurant(restaurant) === category,
        );

  return Response.json({
    places: filteredPlaces,
  });
}
