"use client";

import { useState, useCallback, useRef } from "react";
import type { RestaurantCategory, Restaurant } from "@/types/restaurant";

interface RestaurantsResponse {
  places?: Restaurant[];
}

function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCategoryRef = useRef<RestaurantCategory | null>(null);

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
        const newRestaurants = data.places ?? [];

        if (lastCategoryRef.current !== category) {
          setRestaurants(newRestaurants);
          lastCategoryRef.current = category;
          return;
        }

        setRestaurants((prevRestaurants) => {
          const restaurantMap = new Map<string, Restaurant>();
          newRestaurants.forEach((restaurant) => {
            restaurantMap.set(restaurant.id, restaurant);
          });
          prevRestaurants.forEach((restaurant) => {
            if (!restaurantMap.has(restaurant.id)) {
              restaurantMap.set(restaurant.id, restaurant);
            }
          });

          return Array.from(restaurantMap.values());
        });
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
