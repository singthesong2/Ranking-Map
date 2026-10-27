"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantSearchResponse {
  restaurants: Restaurant[];
  nextPageToken: string | null;
}

interface UseRestaurantSearchParams {
  keyword: string;
  latitude: number | null;
  longitude: number | null;
  radius: number;
  enabled: boolean;
}

function useRestaurantSearch({
  keyword,
  latitude,
  longitude,
  radius,
  enabled,
}: UseRestaurantSearchParams) {
  const query = useInfiniteQuery({
    queryKey: ["restaurant-search", keyword, latitude, longitude, radius],

    initialPageParam: null as string | null,

    queryFn: async ({
      pageParam,
      signal,
    }): Promise<RestaurantSearchResponse> => {
      if (latitude === null || longitude === null)
        throw new Error("검색 위치가 없습니다.");

      const response = await fetch("/api/restaurant-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword,
          latitude,
          longitude,
          radius,
          ...(pageParam ? { pageToken: pageParam } : {}),
        }),
        signal,
      });

      if (!response.ok) throw new Error("음식점 검색에 실패했습니다.");
      return (await response.json()) as RestaurantSearchResponse;
    },

    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,

    enabled:
      enabled &&
      keyword.trim() !== "" &&
      latitude !== null &&
      longitude !== null,

    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const restaurants = useMemo(() => {
    const restaurantMap = new Map<string, Restaurant>();

    query.data?.pages.forEach((page) => {
      page.restaurants.forEach((restaurant) => {
        if (!restaurantMap.has(restaurant.id)) {
          restaurantMap.set(restaurant.id, restaurant);
        }
      });
    });

    return Array.from(restaurantMap.values());
  }, [query.data]);

  return {
    ...query,
    restaurants,
  };
}

export default useRestaurantSearch;
