"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

type MapLoadStatus = "loading" | "ready" | "error";

const MAP_LOAD_TIMEOUT = 15000;

const DEFAULT_MAP_CENTER = {
  latitude: 37.5665,
  longitude: 126.978,
};

export function useKakaoMapLoader(
  mapContainerRef: RefObject<HTMLDivElement | null>,
  initialLatitude: number | null,
  initialLongitude: number | null,
) {
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const [status, setStatus] = useState<MapLoadStatus>(
    process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ? "loading" : "error",
  );

  const [sdkReady, setSdkReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const container = mapContainerRef.current;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!container || !apiKey || mapRef.current) return;

    let cancelled = false;
    let finished = false;
    let script: HTMLScriptElement | null = null;

    const handleFailure = () => {
      if (cancelled || finished) return;
      finished = true;
      setStatus("error");
    };

    const timeoutId = window.setTimeout(handleFailure, MAP_LOAD_TIMEOUT);

    const handleSdkLoaded = () => {
      if (cancelled || finished) return;

      try {
        if (!window.kakao?.maps?.load) {
          handleFailure();
          return;
        }

        window.kakao.maps.load(() => {
          if (cancelled || finished) return;
          if (!window.kakao?.maps?.Map || !window.kakao?.maps?.LatLng) {
            handleFailure();
            return;
          }
          finished = true;
          window.clearTimeout(timeoutId);
          setSdkReady(true);
        });
      } catch {
        handleFailure();
      }
    };

    if (window.kakao?.maps?.Map && window.kakao?.maps?.LatLng) {
      handleSdkLoaded();
    } else {
      const sdkScript = document.createElement("script");
      sdkScript.src =
        `https://dapi.kakao.com/v2/maps/sdk.js` +
        `?appkey=${encodeURIComponent(apiKey)}` +
        `&autoload=false&libraries=services` +
        `&retry=${retryCount}`;
      sdkScript.async = true;
      sdkScript.setAttribute("fetchpriority", "high");
      sdkScript.onload = handleSdkLoaded;
      sdkScript.onerror = handleFailure;
      document.head.appendChild(sdkScript);
      script = sdkScript;
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);

      if (script) {
        script.onload = null;
        script.onerror = null;
        script.remove();
      }
    };
  }, [mapContainerRef, retryCount]);

  useEffect(() => {
    const container = mapContainerRef.current;

    if (!sdkReady || !container || mapRef.current) return;

    const hasInitialPosition =
      initialLatitude !== null && initialLongitude !== null;
    const latitude = hasInitialPosition
      ? initialLatitude
      : DEFAULT_MAP_CENTER.latitude;
    const longitude = hasInitialPosition
      ? initialLongitude
      : DEFAULT_MAP_CENTER.longitude;

    try {
      const center = new window.kakao.maps.LatLng(latitude, longitude);
      mapRef.current = new window.kakao.maps.Map(container, {
        center,
        level: 3,
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [
    sdkReady,
    mapContainerRef,
    initialLatitude,
    initialLongitude,
    retryCount,
  ]);

  const retry = () => {
    if (status !== "error") return;
    setStatus("loading");
    setRetryCount((prev) => prev + 1);
  };

  return {
    mapRef,
    mapReady: status === "ready",
    status,
    retry,
  };
}
