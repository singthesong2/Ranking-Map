"use client";

import { useEffect, type RefObject } from "react";
import type { Restaurant } from "@/types/restaurant";
import {
  calculateDistance,
  calculateWalkingMinutes,
} from "@/utils/calculateDistance";

interface UseRestaurantMarkersProps {
  mapReady: boolean;
  mapRef: RefObject<kakao.maps.Map | null>;
  restaurants: Restaurant[];
  searchLatitude: number | null;
  searchLongitude: number | null;
}

export function useRestaurantMarkers({
  mapReady,
  mapRef,
  restaurants,
  searchLatitude,
  searchLongitude,
}: UseRestaurantMarkersProps) {
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    let hoverMark: kakao.maps.CustomOverlay | null = null;

    const clearHover = () => {
      if (hoverMark) {
        hoverMark.setMap(null);
        hoverMark = null;
      }
    };

    const markers = restaurants.map((restaurant) => {
      const position = new window.kakao.maps.LatLng(
        restaurant.location.latitude,
        restaurant.location.longitude,
      );

      const markerImage = new window.kakao.maps.MarkerImage(
        "/restaurant-pin-blue.svg",
        new window.kakao.maps.Size(40, 52),
        {
          offset: new window.kakao.maps.Point(20, 52),
        },
      );

      const marker = new window.kakao.maps.Marker({
        position,
        image: markerImage,
      });

      marker.setMap(map);

      const handleMouseOver = () => {
        clearHover();

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

        const distance =
          searchLatitude !== null && searchLongitude !== null
            ? calculateDistance(
                searchLatitude,
                searchLongitude,
                restaurant.location.latitude,
                restaurant.location.longitude,
              )
            : null;

        info.textContent = `⭐ ${restaurant.rating ?? "정보 없음"} / 리뷰 : ${restaurant.userRatingCount ?? 0}개 / 도보 : ${
          distance !== null
            ? `약 ${calculateWalkingMinutes(distance)}분`
            : "정보 없음"
        }`;

        info.style.marginTop = "4px";
        info.style.fontSize = "12px";
        info.style.color = "#6b7280";
        infoBox.appendChild(name);
        infoBox.appendChild(info);

        hoverMark = new window.kakao.maps.CustomOverlay({
          position,
          content: infoBox,
          xAnchor: 0.5,
          yAnchor: 1.9,
          zIndex: 200,
        });

        hoverMark.setMap(map);
      };

      const handleMouseOut = () => {
        clearHover();
      };

      const handleClick = () => {
        if (!restaurant.googleMapsUri) return;

        window.open(restaurant.googleMapsUri, "_blank", "noopener,noreferrer");
      };
      window.kakao.maps.event.addListener(marker, "mouseover", handleMouseOver);
      window.kakao.maps.event.addListener(marker, "mouseout", handleMouseOut);
      window.kakao.maps.event.addListener(marker, "click", handleClick);

      return {
        marker,
        handleMouseOver,
        handleMouseOut,
        handleClick,
      };
    });

    return () => {
      clearHover();

      markers.forEach(
        ({ marker, handleMouseOver, handleMouseOut, handleClick }) => {
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
          marker.setMap(null);
        },
      );
    };
  }, [restaurants, mapReady, searchLatitude, searchLongitude, mapRef]);
}
