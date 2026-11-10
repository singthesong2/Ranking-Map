"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import { useRestaurantMarkers } from "@/hooks/useRestaurantMarkers";
import { useSelectedRestaurantMarker } from "@/hooks/useSelectedRestaurantMarker";
import { useMapStore } from "@/stores/useMapStore";

interface MapSectionProps {
  latitude: number | null;
  longitude: number | null;
  searchLatitude: number | null;
  searchLongitude: number | null;
  onResetLocation: () => void;
  restaurants: Restaurant[];
  onReturnToSearchLocation: () => void;
  loading: boolean;
  error: string | null;
}

function MapSection({
  latitude,
  longitude,
  searchLatitude,
  searchLongitude,
  onResetLocation,
  restaurants,
  onReturnToSearchLocation,
  loading,
  error,
}: MapSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const radiusCircleRef = useRef<kakao.maps.Circle | null>(null);
  const markerRef = useRef<kakao.maps.CustomOverlay | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const searchPinRef = useRef<kakao.maps.Marker | null>(null);

  const selectedRestaurant = useMapStore((state) => state.selectedRestaurant);
  const setSearchCenter = useMapStore((state) => state.setSearchCenter);

  useRestaurantMarkers({
    mapReady,
    mapRef,
    restaurants,
    searchLatitude,
    searchLongitude,
  });

  useSelectedRestaurantMarker({
    mapReady,
    mapRef,
    mapContainerRef,
    selectedRestaurant,
    searchLatitude,
    searchLongitude,
  });

  const radius = useMapStore((state) => state.radius);
  const createCurrentLocationMarker = () => {
    const marker = document.createElement("div");
    marker.className =
      "w-5 h-5 rounded-full bg-[#9D5360] border-4 border-white box-border";

    return marker;
  };

  const handleLoad = () => {
    if (!mapContainerRef.current || mapRef.current) return;

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

    setSearchCenter({ latitude, longitude });
    setIsSelectingLocation(false);
  };

  const handleCancelSelecting = () => {
    setIsSelectingLocation(false);
  };

  const handleReturnCurrentLocation = () => {
    if (!mapRef.current) return;
    if (latitude === null || longitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);
    mapRef.current.panTo(currentPosition);
    setIsSelectingLocation(false);
    onResetLocation();
  };

  const handleReturnToSearchLocation = () => {
    if (!mapRef.current) return;
    if (searchLatitude === null || searchLongitude === null) return;

    const position = new window.kakao.maps.LatLng(
      searchLatitude,
      searchLongitude,
    );
    mapRef.current.panTo(position);
    onReturnToSearchLocation();
  };

  useEffect(() => {
    if (!mapReady) return;
    if (!mapRef.current) return;
    if (latitude === null || longitude === null) return;

    const currentPosition = new window.kakao.maps.LatLng(latitude, longitude);

    if (markerRef.current) markerRef.current.setMap(null);

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
      strokeWeight: 3,
      strokeColor: "#B5616E",
      strokeOpacity: 1,
      fillOpacity: 0,
    });

    radiusCircleRef.current.setMap(mapRef.current);
  }, [searchLatitude, searchLongitude, radius, mapReady]);

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

    const searchPosition = new window.kakao.maps.LatLng(
      searchLatitude,
      searchLongitude,
    );

    mapRef.current.setCenter(searchPosition);
  }, [searchLatitude, searchLongitude, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || !mapRef.current) return;

    const map = mapRef.current;
    const observer = new ResizeObserver(() => {
      map.relayout();
    });

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [mapReady]);

  return (
    <section className="min-w-0 lg:h-full">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
        strategy="afterInteractive"
        onReady={handleLoad}
      />
      <div className="relative lg:h-full">
        <div
          ref={mapContainerRef}
          className="h-[48svh] min-h-[340px] w-full lg:h-full"
        />

        {isSelectingLocation && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 z-20 -translate-x-1/2 -translate-y-full">
            <img
              src="/select-location-pin.svg"
              width={40}
              height={51}
              alt=""
              aria-hidden="true"
            />
          </div>
        )}

        {mapReady && (
          <div className="absolute bottom-3 left-1/2 z-30 flex w-[calc(100%-24px)] -translate-x-1/2 flex-wrap justify-center gap-2 lg:bottom-4 lg:w-auto lg:max-w-[95%]">
            <button
              type="button"
              onClick={handleReturnCurrentLocation}
              disabled={latitude === null || longitude === null}
              className="whitespace-nowrap rounded-full bg-[#B5616E] px-3 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-[#9D5360] disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base"
            >
              내 위치로
            </button>
            {!isSelectingLocation ? (
              <>
                <button
                  type="button"
                  onClick={handleStartSelecting}
                  className="whitespace-nowrap rounded-full border border-[#D9B1B6] bg-white px-3 py-2.5 text-xs font-semibold text-[#9D5360] shadow-lg transition-colors hover:bg-[#F8EFF0] sm:px-5 sm:py-3 sm:text-base"
                >
                  검색 위치 지정
                </button>
                {selectedRestaurant && !isSelectingLocation && (
                  <button
                    type="button"
                    onClick={handleReturnToSearchLocation}
                    className="whitespace-nowrap rounded-full border border-[#E8D3D7] bg-[#F8EFF0] px-3 py-2.5 text-xs font-semibold text-[#783E50] shadow-lg transition-colors hover:bg-[#EEDDE0] sm:px-5 sm:py-3 sm:text-base"
                  >
                    검색 위치로 돌아가기
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  className="whitespace-nowrap rounded-full bg-[#B5616E] px-3 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-[#9D5360] sm:px-5 sm:py-3 sm:text-base"
                >
                  이 위치에서 검색
                </button>

                <button
                  type="button"
                  onClick={handleCancelSelecting}
                  className="whitespace-nowrap rounded-full border border-[#DDD5D5] bg-white px-3 py-2.5 text-xs font-semibold text-[#685D60] shadow-lg transition-colors hover:bg-[#F4F1F1] sm:px-5 sm:py-3 sm:text-base"
                >
                  취소
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default MapSection;
