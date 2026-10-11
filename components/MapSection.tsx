"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import useCurrentlocation from "@/hooks/useCurrentlocation";

function MapSection() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const { latitude, longitude } = useCurrentlocation();
  const markerRef = useRef<kakao.maps.Marker | null>(null);

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

    markerRef.current = new window.kakao.maps.Marker({
      position: currentPosition,
    });

    markerRef.current.setMap(mapRef.current);
  }, [latitude, longitude, mapReady]);

  return (
    <section>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <div ref={mapContainerRef} className="h-96 w-full" />
    </section>
  );
}

export default MapSection;
