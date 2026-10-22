"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { Restaurant, RestaurantSort } from "@/types/restaurant";

interface MapSectionProps {
  latitude: number | null;
  longitude: number | null;
  searchLatitude: number | null;
  searchLongitude: number | null;
  onResetLocation: () => void;
  onSearchCenterChange: (latitude: number, longitude: number) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  sortOption: RestaurantSort;
  onSortChange: (sort: RestaurantSort) => void;
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
}

function MapSection({
  latitude,
  longitude,
  searchLatitude,
  searchLongitude,
  onSearchCenterChange,
  onResetLocation,
  radius,
  onRadiusChange,
  sortOption,
  onSortChange,
  restaurants,
  loading,
  error,
}: MapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const radiusCircleRef = useRef<kakao.maps.Circle | null>(null);
  const markerRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const restaurantMarkersRef = useRef<kakao.maps.Marker[]>([]);
  const hoverMark = useRef<kakao.maps.CustomOverlay | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const searchPinRef = useRef<kakao.maps.Marker | null>(null);

  const isCustomSearch =
    latitude !== null &&
    longitude !== null &&
    searchLatitude !== null &&
    searchLongitude !== null &&
    (searchLatitude !== latitude || searchLongitude !== longitude);

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

  const handleStartSelecting = () => {
    if (!mapRef.current) return;

    setIsSelectingLocation(true);
  };

  const handleConfirmLocation = () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const latitude = center.getLat();
    const longitude = center.getLng();

    onSearchCenterChange(latitude, longitude);
    setIsSelectingLocation(false);
  };

  const handleCancelSelecting = () => {
    setIsSelectingLocation(false);
  };

  const handleReturnCurrentLocation = () => {
    if (!mapRef.current) return;
    if (latitude === null || longitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);

    mapRef.current.setCenter(currentPosition);
    setIsSelectingLocation(false);
    onResetLocation();
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
    if (searchLatitude === null || searchLongitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(
      searchLatitude,
      searchLongitude,
    );

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
  }, [searchLatitude, searchLongitude, radius, mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;

    const map = mapRef.current;

    restaurantMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });

    if (hoverMark.current) {
      hoverMark.current.setMap(null);
      hoverMark.current = null;
    }

    const markers = restaurants.map((restaurant) => {
      const position = new window.kakao.maps.LatLng(
        restaurant.location.latitude,
        restaurant.location.longitude,
      );

      const marker = new window.kakao.maps.Marker({
        position,
      });
      marker.setMap(mapRef.current);

      window.kakao.maps.event.addListener(marker, "mouseover", () => {
        if (hoverMark.current) hoverMark.current.setMap(null);

        const infoBox = document.createElement("div");

        infoBox.style.pointerEvents = "none";
        infoBox.style.backgroundColor = "white";
        infoBox.style.border = "1px solid #e5e7eb";
        infoBox.style.borderRadius = "8px";
        infoBox.style.padding = "8px 12px";
        infoBox.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
        infoBox.style.whiteSpace = "nowrap";

        const name = document.createElement("div");

        name.textContent = restaurant.displayName.text;
        name.style.fontSize = "14px";
        name.style.fontWeight = "700";
        name.style.color = "#111827";

        const info = document.createElement("div");

        info.textContent = `⭐ ${restaurant.rating ?? "정보 없음"} / 리뷰 ${restaurant.userRatingCount ?? 0}개`;
        info.style.marginTop = "4px";
        info.style.fontSize = "12px";
        info.style.color = "#6b7280";
        infoBox.appendChild(name);
        infoBox.appendChild(info);

        hoverMark.current = new window.kakao.maps.CustomOverlay({
          position,
          content: infoBox,
          xAnchor: 0.5,
          yAnchor: 1.7,
          zIndex: 100,
        });

        hoverMark.current.setMap(map);
      });

      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        if (hoverMark.current) {
          hoverMark.current.setMap(null);
          hoverMark.current = null;
        }
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        if (!restaurant.googleMapsUri) return;

        window.open(restaurant.googleMapsUri, "_blank", "noopener,noreferrer");
      });

      return marker;
    });

    restaurantMarkersRef.current = markers;
  }, [restaurants, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (isSelectingLocation) {
      searchPinRef.current?.setMap(null);
      return;
    }

    if (searchLatitude === null || searchLongitude === null) return;

    if (searchLatitude === latitude && searchLongitude === longitude) {
      searchPinRef.current?.setMap(null);
      return;
    }

    const position = new window.kakao.maps.LatLng(
      searchLatitude,
      searchLongitude,
    );

    if (!searchPinRef.current) {
      const markerImage = new window.kakao.maps.MarkerImage(
        "/search-pin.svg",
        new window.kakao.maps.Size(90, 78),
        {
          offset: new window.kakao.maps.Point(45, 78),
        },
      );

      searchPinRef.current = new window.kakao.maps.Marker({
        position,
        image: markerImage,
        zIndex: 30,
      });
    } else {
      searchPinRef.current.setPosition(position);
    }

    searchPinRef.current.setMap(mapRef.current);
  }, [
    latitude,
    longitude,
    searchLatitude,
    searchLongitude,
    isSelectingLocation,
    mapReady,
  ]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (searchLatitude === null || searchLongitude === null) return;
    if (isSelectingLocation) return;

    const searchPosition = new window.kakao.maps.LatLng(
      searchLatitude,
      searchLongitude,
    );

    mapRef.current.setCenter(searchPosition);
  }, [searchLatitude, searchLongitude, mapReady, isSelectingLocation]);

  return (
    <section>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <div className="relative">
        <div ref={mapContainerRef} className="h-96 w-full" />

        {isSelectingLocation && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-full">
            <svg width="36" height="48" viewBox="0 0 24 36" aria-hidden="true">
              <path
                d="M12 1C5.9 1 1 5.9 1 12c0 9 11 22 11 22s11-13 11-22C23 5.9 18.1 1 12 1Z"
                fill="#ef4444"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
          </div>
        )}

        {/* 지도 조작 버튼 */}
        {mapReady && (
          <div className="absolute bottom-4 left-1/2 z-30 flex max-w-[95%] -translate-x-1/2 flex-wrap justify-center gap-2">
            {!isSelectingLocation ? (
              <>
                <button
                  type="button"
                  onClick={handleStartSelecting}
                  className="whitespace-nowrap rounded-full bg-white px-5 py-3 font-semibold text-gray-800 shadow-lg hover:bg-gray-100"
                >
                  📍 검색 위치 지정
                </button>

                {isCustomSearch && (
                  <button
                    type="button"
                    onClick={handleReturnCurrentLocation}
                    disabled={latitude === null || longitude === null}
                    className="whitespace-nowrap rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    내 위치로
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="whitespace-nowrap rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
                >
                  이 위치에서 검색
                </button>

                <button
                  type="button"
                  onClick={handleCancelSelecting}
                  className="whitespace-nowrap rounded-full bg-white px-4 py-3 font-semibold text-gray-700 shadow-lg hover:bg-gray-100"
                >
                  취소
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex justify-between">
          <span className="font-medium">검색 반경</span>
          <span className="font-bold">
            {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
          </span>
        </div>
        <button
          onClick={() => onSortChange("recommended")}
          className={
            sortOption === "recommended"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          추천순
        </button>
        <button
          onClick={() => onSortChange("rating")}
          className={
            sortOption === "rating"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          평점순
        </button>
        <button
          onClick={() => onSortChange("reviews")}
          className={
            sortOption === "reviews"
              ? "rounded-full bg-blue-600 px-4 py-2 text-white"
              : "rounded-full bg-gray-100 px-4 py-2 text-gray-700"
          }
        >
          리뷰 많은 순
        </button>
        <button
          onClick={() => onSortChange("distance")}
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
            onRadiusChange(Number(e.target.value));
          }}
          className="w-full accent-blue-600"
        />
        <div className="mt-1 flex justify-between text-sm text-gray-500">
          <span>100m</span>
          <span>5km</span>
        </div>
      </div>
    </section>
  );
}

export default MapSection;
