"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import useCurrentlocation from "@/hooks/useCurrentlocation";
import useRestaurants from "@/hooks/useRestaurants";

function MapSection() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
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

    restaurantMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    const markers = restaurants.map((restaurant) => {
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
  }, [restaurants, mapReady]);

  return (
    <section>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <div ref={mapContainerRef} className="h-96 w-full" />
      <button
        onClick={() => {
          if (latitude === null || longitude === null) return;

          fetchRestaurants(latitude, longitude);
        }}
        disabled={loading}
      >
        {loading ? "불러오는 중..." : "주변 맛집 불러오기"}
      </button>

      {error && <p>{error}</p>}
      <ul>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            {restaurant.displayName.text}
            {" / "}⭐ {restaurant.rating ?? "정보 없음"}
            {" / "}
            리뷰 {restaurant.userRatingCount ?? 0}개
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MapSection;
