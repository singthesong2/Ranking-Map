"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import MapSection from "@/components/MapSection";
import RankingList from "@/components/RankingList";
import useCurrentlocation from "@/hooks/useCurrentlocation";
import useRestaurants from "@/hooks/useRestaurants";
import useDebounce from "@/hooks/useDebounce";
import type { RestaurantCategory, RestaurantSort } from "@/types/restaurant";
import { calculateDistance } from "@/utils/calculateDistance";

function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<RestaurantCategory>("all");
  const [radius, setRadius] = useState(1000);
  const [sortOption, setSortOption] = useState<RestaurantSort>("recommended");
  const [visibleCount, setVisibleCount] = useState(10);
  const debouncedRadius = useDebounce(radius, 1000);
  const { latitude, longitude } = useCurrentlocation();
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();

  useEffect(() => {
    if (latitude === null || longitude === null) return;

    fetchRestaurants(latitude, longitude, debouncedRadius, selectedCategory);
  }, [
    latitude,
    longitude,
    debouncedRadius,
    selectedCategory,
    fetchRestaurants,
  ]);

  const sortedRestaurants = useMemo(() => {
    if (latitude === null || longitude === null) return [];

    const radiusRestaurants = restaurants.filter((restaurant) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        restaurant.location.latitude,
        restaurant.location.longitude,
      );

      return distance <= radius;
    });

    const sorted = [...radiusRestaurants];

    if (sortOption === "rating")
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    if (sortOption === "reviews")
      sorted.sort(
        (a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0),
      );

    if (sortOption === "distance") {
      sorted.sort((a, b) => {
        const distanceA = calculateDistance(
          latitude,
          longitude,
          a.location.latitude,
          a.location.longitude,
        );

        const distanceB = calculateDistance(
          latitude,
          longitude,
          b.location.latitude,
          b.location.longitude,
        );

        return distanceA - distanceB;
      });
    }
    return sorted;
  }, [restaurants, radius, sortOption, latitude, longitude]);

  const displayRestaurants = sortedRestaurants.slice(0, visibleCount);

  const hasMore = visibleCount < sortedRestaurants.length;

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, sortOption, radius]);

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <SearchBox />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
      />
      <MapSection
        latitude={latitude}
        longitude={longitude}
        radius={radius}
        onRadiusChange={setRadius}
        sortOption={sortOption}
        onSortChange={setSortOption}
        restaurants={displayRestaurants}
        loading={loading}
        error={error}
      />
      <RankingList
        restaurants={displayRestaurants}
        hasMore={hasMore}
        onLoadMore={() => {
          setVisibleCount((prev) => prev + 10);
        }}
      />
    </main>
  );
}

export default Home;
