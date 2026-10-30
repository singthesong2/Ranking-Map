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
import { classifyRestaurant } from "@/utils/restaurantClassifier";
import { useMapStore } from "@/stores/useMapStore";
import { createShareUrl } from "@/utils/shareSearch";
import { readShareSearch } from "@/utils/shareSearch";
import { useToastStore } from "@/stores/useToastStore";

function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<RestaurantCategory>("all");
  const [sortOption, setSortOption] = useState<RestaurantSort>("recommended");
  const [visibleCount, setVisibleCount] = useState(10);
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);
  const setRestaurantResultsOpen = useMapStore(
    (state) => state.setRestaurantResultsOpen,
  );
  const debouncedRadius = useDebounce(radius, 1000);
  const { latitude, longitude } = useCurrentlocation();
  const searchCenter = useMapStore((state) => state.searchCenter);
  const setSearchCenter = useMapStore((state) => state.setSearchCenter);
  const setSelectedRestaurant = useMapStore(
    (state) => state.setSelectedRestaurant,
  );
  const centerLatitude = searchCenter?.latitude ?? latitude;
  const centerLongitude = searchCenter?.longitude ?? longitude;
  const { restaurants, loading, error } = useRestaurants({
    latitude: centerLatitude,
    longitude: centerLongitude,
    radius: debouncedRadius,
    category: selectedCategory,
  });

  const showToast = useToastStore((state) => state.showToast);

  const handleResetLocation = () => {
    setSearchCenter(null);
    setRestaurantResultsOpen(true);
    setVisibleCount(10);
  };

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

  const handleShareSearch = async () => {
    if (centerLatitude === null || centerLongitude === null) {
      showToast("검색 위치 정보를 가져오지 못했어요.", "error");
      return;
    }

    const shareUrl = createShareUrl({
      latitude: centerLatitude,
      longitude: centerLongitude,
      radius,
      category: selectedCategory,
      sort: sortOption,
    });

    try {
      if (navigator.share) {
        await navigator.share({
          title: "맛집 랭킹",
          text: "내가 검색한 맛집을 확인해 봐!",
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      showToast("검색 링크를 복사했어요.", "success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      showToast("링크 공유에 실패했어요.", "error");
    }
  };

  useEffect(() => {
    const shared = readShareSearch();

    if (!shared) return;

    setSearchCenter({
      latitude: shared.latitude,
      longitude: shared.longitude,
    });

    if (shared.radius !== undefined) setRadius(shared.radius);
    if (shared.category !== undefined) setSelectedCategory(shared.category);
    if (shared.sort !== undefined) setSortOption(shared.sort);
  }, [setSearchCenter, setRadius]);

  return (
    <main className="min-h-screen bg-white text-black">
      <Header onShareSearch={handleShareSearch} />
      <SearchBox
        latitude={centerLatitude}
        longitude={centerLongitude}
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
        onResetLocation={handleResetLocation}
        sortOption={sortOption}
        onSortChange={setSortOption}
        restaurants={displayRestaurants}
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
