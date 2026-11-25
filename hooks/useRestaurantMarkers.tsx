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
  onMarkerSelect: (restaurant: Restaurant) => void;
}

export function useRestaurantMarkers({
  mapReady,
  mapRef,
  restaurants,
  searchLatitude,
  searchLongitude,
  onMarkerSelect,
}: UseRestaurantMarkersProps) {
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    const mouseHoverQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

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
        clickable: true,
      });

      marker.setMap(map);

      const handleMouseOver = () => {
        if (!mouseHoverQuery.matches) return;
        clearHover();
        const infoBox = document.createElement("div");
        infoBox.className =
          "pointer-events-none whitespace-nowrap rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.15)]";
        const name = document.createElement("div");
        name.textContent = restaurant.displayName.text;
        name.className = "text-sm font-bold text-[#111827]";

        const distance =
          searchLatitude !== null && searchLongitude !== null
            ? calculateDistance(
                searchLatitude,
                searchLongitude,
                restaurant.location.latitude,
                restaurant.location.longitude,
              )
            : null;

        const walkingMinutes =
          distance !== null ? calculateWalkingMinutes(distance) : null;
        const info = document.createElement("div");
        info.className = "mt-1 text-xs text-[#6b7280]";
        const star = document.createElement("span");
        star.textContent = "★";
        star.className = "text-[#D49A38]";
        star.setAttribute("aria-hidden", "true");
        const details = document.createElement("span");
        details.textContent = ` ${restaurant.rating ?? "정보 없음"} / 리뷰 : ${restaurant.userRatingCount ?? 0}개${
          walkingMinutes !== null ? ` / 도보 : 약 ${walkingMinutes}분` : ""
        }`;
        info.append(star, details);
        infoBox.append(name, info);

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
        clearHover();
        if (!mouseHoverQuery.matches) {
          onMarkerSelect(restaurant);
          return;
        }
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
  }, [
    restaurants,
    mapReady,
    searchLatitude,
    searchLongitude,
    mapRef,
    onMarkerSelect,
  ]);
}
