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
import type {
  RestaurantCategory,
  RestaurantSort,
  Restaurant,
} from "@/types/restaurant";
import { calculateDistance } from "@/utils/calculateDistance";
import { classifyRestaurant } from "@/utils/restaurantClassifier";

function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<RestaurantCategory>("all");
  const [radius, setRadius] = useState(1000);
  const [sortOption, setSortOption] = useState<RestaurantSort>("recommended");
  const [searchCenter, setSearchCenter] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const handleResetLocation = () => {
    setSearchCenter(null);
    setSelectedRestaurant(null);
    setVisibleCount(10);
  };
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [restaurantResultsOpen, setRestaurantResultsOpen] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const debouncedRadius = useDebounce(radius, 1000);
  const { latitude, longitude } = useCurrentlocation();
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const centerLatitude = searchCenter?.latitude ?? latitude;
  const centerLongitude = searchCenter?.longitude ?? longitude;

  useEffect(() => {
    if (centerLatitude === null || centerLongitude === null) return;

    fetchRestaurants(
      centerLatitude,
      centerLongitude,
      debouncedRadius,
      selectedCategory,
    );
  }, [
    centerLatitude,
    centerLongitude,
    debouncedRadius,
    selectedCategory,
    fetchRestaurants,
  ]);

  const sortedRestaurants = useMemo(() => {
    if (centerLatitude === null || centerLongitude === null) return [];

    const radiusRestaurants = restaurants.filter((restaurant) => {
      const distance = calculateDistance(
        centerLatitude,
        centerLongitude,
        restaurant.location.latitude,
        restaurant.location.longitude,
      );

      return (
        distance <= radius &&
        (selectedCategory === "all" ||
          classifyRestaurant(restaurant) === selectedCategory)
      );
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
          centerLatitude,
          centerLongitude,
          a.location.latitude,
          a.location.longitude,
        );

        const distanceB = calculateDistance(
          centerLatitude,
          centerLongitude,
          b.location.latitude,
          b.location.longitude,
        );

        return distanceA - distanceB;
      });
    }
    return sorted;
  }, [
    restaurants,
    radius,
    sortOption,
    centerLatitude,
    centerLongitude,
    selectedCategory,
  ]);

  const displayRestaurants = sortedRestaurants.slice(0, visibleCount);

  const hasMore = visibleCount < sortedRestaurants.length;

  useEffect(() => {
    setVisibleCount(10);
  }, [selectedCategory, sortOption, radius, centerLatitude, centerLongitude]);

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <SearchBox
        latitude={centerLatitude}
        longitude={centerLongitude}
        radius={radius}
        restaurantResultsOpen={restaurantResultsOpen}
        onRestaurantResultsOpenChange={setRestaurantResultsOpen}
        onRegionSelect={(latitude, longitude) => {
          setSearchCenter({ latitude, longitude });
          setVisibleCount(10);
        }}
        onRestaurantMapSelect={(restaurant) => {
          setSelectedRestaurant(restaurant ? { ...restaurant } : null);
          setRestaurantResultsOpen(restaurant === null);
        }}
      />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
      />
      <MapSection
        latitude={latitude}
        longitude={longitude}
        searchLatitude={centerLatitude}
        searchLongitude={centerLongitude}
        onSearchCenterChange={(latitude, longitude) => {
          setSearchCenter({ latitude, longitude });
        }}
        onResetLocation={handleResetLocation}
        radius={radius}
        onRadiusChange={setRadius}
        sortOption={sortOption}
        onSortChange={setSortOption}
        restaurants={displayRestaurants}
        selectedRestaurant={selectedRestaurant}
        onReturnToSearchLocation={() => {
          setSelectedRestaurant(null);
          setRestaurantResultsOpen(true);
        }}
        loading={loading}
        error={error}
      />
      <RankingList
        restaurants={displayRestaurants}
        latitude={centerLatitude}
        longitude={centerLongitude}
        hasMore={hasMore}
        onLoadMore={() => {
          setVisibleCount((prev) => prev + 10);
        }}
      />
    </main>
  );
}

export default Home;
