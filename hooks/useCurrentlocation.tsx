import { useEffect, useState } from "react";

type LocationErrorType =
  | "permission_denied"
  | "position_unavailable"
  | "timeout"
  | "unsupported"
  | "unknown";

interface Location {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  errorType: LocationErrorType | null;
  loading: boolean;
}

function useCurrentlocation() {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
    error: null,
    errorType: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        error: "현재 브라우저에서는 위치 정보를 지원하지 않습니다.",
        errorType: "unsupported",
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
          errorType: null,
          loading: false,
        });
      },
      (error) => {
        let errorType: LocationErrorType = "unknown";
        let errorMessage = "현재 위치 정보를 가져올 수 없습니다.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorType = "permission_denied";
            errorMessage = "위치 정보 접근 권한이 허용되지 않았습니다.";
            break;

          case error.POSITION_UNAVAILABLE:
            errorType = "position_unavailable";
            errorMessage = "현재 위치를 확인할 수 없습니다.";
            break;

          case error.TIMEOUT:
            errorType = "timeout";
            errorMessage = "위치 확인 시간이 초과되었습니다.";
            break;
        }

        setLocation({
          latitude: null,
          longitude: null,
          error: errorMessage,
          errorType,
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
