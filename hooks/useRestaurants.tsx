"use client";

import { useState, useCallback } from "react";
import type { RestaurantCategory } from "@/types/restaurant";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantsResponse {
  places?: Restaurant[];
}

function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(
    async (
      latitude: number,
      longitude: number,
      radius: number,
      category: RestaurantCategory,
    ) => {
      try {
        setLoading(true);
        setError(null);

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
        });

        if (!response.ok) throw new Error();

        const data: RestaurantsResponse = await response.json();

        setRestaurants(data.places ?? []);
      } catch {
        setError("맛집 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    restaurants,
    loading,
    error,
    fetchRestaurants,
  };
}

export default useRestaurants;
