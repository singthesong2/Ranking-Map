"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

type MapLoadStatus = "loading" | "ready" | "error";

const MAP_LOAD_TIMEOUT = 15000;

export function useKakaoMapLoader(
  mapContainerRef: RefObject<HTMLDivElement | null>,
) {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [status, setStatus] = useState<MapLoadStatus>(
    process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ? "loading" : "error",
  );

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const container = mapContainerRef.current;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!container || !apiKey) return;

    let cancelled = false;
    let finished = false;
    let script: HTMLScriptElement | null = null;

    const handleFailure = () => {
      if (cancelled || finished) return;

      finished = true;
      setStatus("error");
    };
    const timeoutId = window.setTimeout(handleFailure, MAP_LOAD_TIMEOUT);
    const initializeMap = () => {
      if (cancelled || finished || mapRef.current) return;

      try {
        if (!window.kakao?.maps?.load) {
          handleFailure();
          return;
        }

        window.kakao.maps.load(() => {
          if (cancelled || finished || mapRef.current) return;

          try {
            const center = new window.kakao.maps.LatLng(37.5665, 126.978);
            const map = new window.kakao.maps.Map(container, {
              center,
              level: 3,
            });
            mapRef.current = map;
            finished = true;
            window.clearTimeout(timeoutId);
            setStatus("ready");
          } catch (error) {
            handleFailure();
          }
        });
      } catch (error) {
        handleFailure();
      }
    };

    if (window.kakao?.maps?.Map && window.kakao?.maps?.LatLng) initializeMap();
    else {
      const sdkScript = document.createElement("script");

      sdkScript.src =
        `https://dapi.kakao.com/v2/maps/sdk.js` +
        `?appkey=${encodeURIComponent(apiKey)}` +
        `&autoload=false&libraries=services` +
        `&retry=${retryCount}`;
      sdkScript.async = true;
      sdkScript.onload = initializeMap;
      sdkScript.onerror = () => {
        handleFailure();
      };
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
