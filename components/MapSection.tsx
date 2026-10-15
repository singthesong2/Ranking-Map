"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useMemo } from "react";
import useCurrentlocation from "@/hooks/useCurrentlocation";
import useRestaurants from "@/hooks/useRestaurants";
import useDebounce from "@/hooks/useDebounce";
import type { RestaurantCategory, RestaurantSort } from "@/types/restaurant";
import { calculateDistance } from "@/utils/calculateDistance";

interface MapSectionProps {
  selectedCategory: RestaurantCategory;
}

function MapSection({ selectedCategory }: MapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [radius, setRadius] = useState(1000);
  const [sortOption, setSortOption] = useState<RestaurantSort>("recommended");
  const radiusCircleRef = useRef<kakao.maps.Circle | null>(null);
  const debouncedRadius = useDebounce(radius, 1000);
  const { latitude, longitude } = useCurrentlocation();
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const markerRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const restaurantMarkersRef = useRef<kakao.maps.Marker[]>([]);

  const createCurrentLocationMarker = () => {
    const marker = document.createElement("div");
    marker.className =
      "w-5 h-5 rounded-full bg-blue-600 border-4 border-white box-border";

    return marker;
  };

  const handleLoad = () => {
    if (!mapContainerRef.current) return;

    window.kakao.maps.load(() => {
      const center = new window.kakao.maps.LatLng(37.5665, 126.978);
      const options = {
        center,
        level: 3,
      };
      mapRef.current = new window.kakao.maps.Map(
        mapContainerRef.current!,
        options,
      );
      setMapReady(true);
    });
  };

  const displayRestaurants = useMemo(() => {
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

    const sortedRestaurants = [...radiusRestaurants];

    if (sortOption === "rating")
      sortedRestaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    if (sortOption === "reviews")
      sortedRestaurants.sort(
        (a, b) => (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0),
      );

    if (sortOption === "distance") {
      sortedRestaurants.sort((a, b) => {
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
    return sortedRestaurants.slice(0, 10);
  }, [restaurants, sortOption, latitude, longitude, radius]);

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;
    if (latitude === null || longitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);

    mapRef.current.setCenter(currentPosition);

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = createCurrentLocationMarker();

    markerRef.current = new window.kakao.maps.CustomOverlay({
      position: currentPosition,
      content: marker,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 10,
    });

    markerRef.current.setMap(mapRef.current);
  }, [latitude, longitude, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;
    if (latitude === null || longitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);

    if (radiusCircleRef.current) radiusCircleRef.current.setMap(null);

    radiusCircleRef.current = new window.kakao.maps.Circle({
      center: currentPosition,
      radius,
      strokeWeight: 2,
      strokeColor: "#3B82F6",
      strokeOpacity: 0.8,
      fillOpacity: 0,
    });

    radiusCircleRef.current.setMap(mapRef.current);
  }, [latitude, longitude, radius, mapReady]);

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

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;

    restaurantMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    const markers = displayRestaurants.map((restaurant) => {
      const position = new window.kakao.maps.LatLng(
        restaurant.location.latitude,
        restaurant.location.longitude,
      );

      const marker = new window.kakao.maps.Marker({
        position,
      });
      marker.setMap(mapRef.current);
      return marker;
    });

    restaurantMarkersRef.current = markers;
  }, [displayRestaurants, mapReady]);

  return (
    <section>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <div ref={mapContainerRef} className="h-96 w-full" />

      <div className="p-4">
        <div className="mb-2 flex justify-between">
          <span className="font-medium">검색 반경</span>

          <span className="font-bold">
            {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
          </span>
        </div>
        <button
          onClick={() => setSortOption("recommended")}
          className={
            sortOption === "recommended"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          추천순
        </button>
        <button
          onClick={() => setSortOption("rating")}
          className={
            sortOption === "rating"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          평점순
        </button>
        <button
          onClick={() => setSortOption("reviews")}
          className={
            sortOption === "reviews"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          리뷰 많은 순
        </button>
        <button
          onClick={() => setSortOption("distance")}
          className={
            sortOption === "distance"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          가까운 순
        </button>

        <input
          type="range"
          min={100}
          max={5000}
          step={100}
          value={radius}
          onChange={(e) => {
            setRadius(Number(e.target.value));
          }}
          className="w-full accent-blue-600"
        />

        <div className="mt-1 flex justify-between text-sm text-gray-500">
          <span>100m</span>
          <span>5km</span>
        </div>
      </div>

      {loading && <p>맛집을 불러오는 중...</p>}

      {error && <p>{error}</p>}
      <ul>
        {displayRestaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.displayName.text}
            {" / "}⭐ {restaurant.rating ?? "정보 없음"}
            {" / "}
            리뷰 {restaurant.userRatingCount ?? 0}개
            <p>primaryType: {restaurant.primaryType ?? "값 없음"}</p>
            <p>types: {restaurant.types?.join(", ") ?? "값 없음"}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MapSection;
