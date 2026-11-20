"use client";

import { useEffect, type RefObject } from "react";

interface UseCurrentLocationMarkerProps {
  mapReady: boolean;
  mapRef: RefObject<kakao.maps.Map | null>;
  latitude: number | null;
  longitude: number | null;
}

export function useCurrentLocationMarker({
  mapReady,
  mapRef,
  latitude,
  longitude,
}: UseCurrentLocationMarkerProps) {
  useEffect(() => {
    const map = mapRef.current;

    if (!mapReady || !map) return;
    if (latitude === null || longitude === null) return;

    const position = new window.kakao.maps.LatLng(latitude, longitude);

    const marker = document.createElement("div");
    marker.className = "current-location-marker";
    marker.setAttribute("aria-hidden", "true");
    const pulse = document.createElement("span");
    pulse.className = "current-location-marker__pulse";
    const halo = document.createElement("span");
    halo.className = "current-location-marker__halo";
    const dot = document.createElement("span");
    dot.className = "current-location-marker__dot";

    marker.append(pulse, halo, dot);

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content: marker,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 15,
    });

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [mapReady, mapRef, latitude, longitude]);
}
