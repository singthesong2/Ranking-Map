import { useEffect, useState } from "react";

interface Location {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

function useCurrentlocation() {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: "현재 브라우저에서는 위치 정보를 지원하지 않습니다.",
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      () => {
        setLocation({
          latitude: null,
          longitude: null,
          error: "현재 위치 정보를 가져올 수 없습니다.",
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }, []);

  return location;
}

export default useCurrentlocation;
