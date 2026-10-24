"use client";

import { useEffect, type RefObject } from "react";
import type { Restaurant } from "@/types/restaurant";
import {
  calculateDistance,
  calculateWalkingMinutes,
} from "@/utils/calculateDistance";

interface UseSelectedRestaurantMarkerProps {
  mapReady: boolean;
  mapRef: RefObject<kakao.maps.Map | null>;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  selectedRestaurant: Restaurant | null;
  searchLatitude: number | null;
  searchLongitude: number | null;
}

export function useSelectedRestaurantMarker({
  mapReady,
  mapRef,
  mapContainerRef,
  selectedRestaurant,
  searchLatitude,
  searchLongitude,
}: UseSelectedRestaurantMarkerProps) {
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedRestaurant) return;

    const map = mapRef.current;

    const position = new window.kakao.maps.LatLng(
      selectedRestaurant.location.latitude,
      selectedRestaurant.location.longitude,
    );

    const markerImage = new window.kakao.maps.MarkerImage(
      "/restaurant-pin.svg",
      new window.kakao.maps.Size(40, 52),
      {
        offset: new window.kakao.maps.Point(20, 52),
      },
    );

    const marker = new window.kakao.maps.Marker({
      position,
      image: markerImage,
      zIndex: 100,
    });

    marker.setMap(map);

    let hoverOverlay: kakao.maps.CustomOverlay | null = null;

    const handleMouseOver = () => {
      if (hoverOverlay) hoverOverlay.setMap(null);

      const infoBox = document.createElement("div");
      infoBox.style.pointerEvents = "none";
      infoBox.style.backgroundColor = "white";
      infoBox.style.border = "1px solid #e5e7eb";
      infoBox.style.borderRadius = "8px";
      infoBox.style.padding = "8px 12px";
      infoBox.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
      infoBox.style.whiteSpace = "nowrap";
      const name = document.createElement("div");
      name.textContent = selectedRestaurant.displayName.text;
      name.style.fontSize = "14px";
      name.style.fontWeight = "700";
      name.style.color = "#111827";

      const distance =
        searchLatitude !== null && searchLongitude !== null
          ? calculateDistance(
              searchLatitude,
              searchLongitude,
              selectedRestaurant.location.latitude,
              selectedRestaurant.location.longitude,
            )
          : null;

      const info = document.createElement("div");
      const reviewCount =
        selectedRestaurant.userRatingCount != null
          ? `${selectedRestaurant.userRatingCount}개`
          : "정보 없음";
      const walkingTime =
        distance !== null
          ? `약 ${calculateWalkingMinutes(distance)}분`
          : "정보 없음";
      info.textContent =
        `⭐ ${selectedRestaurant.rating ?? "정보 없음"}` +
        ` / 리뷰 : ${reviewCount}` +
        ` / 도보 : ${walkingTime}`;

      info.style.marginTop = "4px";
      info.style.fontSize = "12px";
      info.style.color = "#6b7280";

      infoBox.appendChild(name);
      infoBox.appendChild(info);

      hoverOverlay = new window.kakao.maps.CustomOverlay({
        position,
        content: infoBox,
        xAnchor: 0.5,
        yAnchor: 1.9,
        zIndex: 210,
      });

      hoverOverlay.setMap(map);
    };

    const handleMouseOut = () => {
      if (hoverOverlay) {
        hoverOverlay.setMap(null);
        hoverOverlay = null;
      }
    };

    const handleClick = () => {
      if (!selectedRestaurant.googleMapsUri) return;

      window.open(
        selectedRestaurant.googleMapsUri,
        "_blank",
        "noopener,noreferrer",
      );
    };
    window.kakao.maps.event.addListener(marker, "mouseover", handleMouseOver);
    window.kakao.maps.event.addListener(marker, "mouseout", handleMouseOut);
    window.kakao.maps.event.addListener(marker, "click", handleClick);

    map.panTo(position);

    mapContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    return () => {
      window.kakao.maps.event.removeListener(
        marker,
        "mouseover",
        handleMouseOver,
      );
      window.kakao.maps.event.removeListener(
        marker,
        "mouseout",
        handleMouseOut,
      );
      window.kakao.maps.event.removeListener(marker, "click", handleClick);

      handleMouseOut();
      marker.setMap(null);
    };
  }, [
    selectedRestaurant,
    mapReady,
    mapRef,
    mapContainerRef,
    searchLatitude,
    searchLongitude,
  ]);
}
