"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RestaurantCategory, Restaurant } from "@/types/restaurant";

interface RestaurantsResponse {
  places?: Restaurant[];
}

interface UseRestaurantsParams {
  latitude: number | null;
  longitude: number | null;
  radius: number;
  category: RestaurantCategory;
}

function useRestaurants({
  latitude,
  longitude,
  radius,
  category,
}: UseRestaurantsParams) {
  const queryClient = useQueryClient();
  const latKey = latitude?.toFixed(5) ?? null;
  const lngKey = longitude?.toFixed(5) ?? null;

  const {
    data,
    isFetching,
    error: queryError,
  } = useQuery<Restaurant[]>({
    queryKey: ["restaurants", category, latKey, lngKey, radius],

    queryFn: async ({ signal }) => {
      if (latitude === null || longitude === null) {
        throw new Error("검색 위치가 없습니다.");
      }

      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude,
          longitude,
          radius,
          category,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error("맛집 정보 요청 실패");
      }

      const result: RestaurantsResponse = await response.json();
      return result.places ?? [];
    },

    enabled: latitude !== null && longitude !== null,
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const restaurants = useMemo(() => {
    if (latKey === null || lngKey === null) {
      return [];
    }
    const restaurantMap = new Map<string, Restaurant>();
    data?.forEach((restaurant) => {
      restaurantMap.set(restaurant.id, restaurant);
    });
    const cachedResults = queryClient.getQueriesData<Restaurant[]>({
      queryKey: ["restaurants", category, latKey, lngKey],
    });
    cachedResults.forEach(([, cachedRestaurants]) => {
      cachedRestaurants?.forEach((restaurant) => {
        if (!restaurantMap.has(restaurant.id)) {
          restaurantMap.set(restaurant.id, restaurant);
        }
      });
    });

    return Array.from(restaurantMap.values());
  }, [data, queryClient, category, latKey, lngKey, radius]);

  return {
    restaurants,
    loading: isFetching,
    error: queryError ? "맛집 정보를 불러오지 못했습니다." : null,
  };
}

export default useRestaurants;
