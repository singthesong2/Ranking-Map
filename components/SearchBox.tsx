"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useDebounce from "@/hooks/useDebounce";
import { normalize, removeRegionSuffix } from "@/utils/regionSearch";
import type { Restaurant } from "@/types/restaurant";
import { calculateDistance } from "@/utils/calculateDistance";
import { calculateWalkingMinutes } from "@/utils/calculateDistance";
import useRestaurantSearch from "@/hooks/useRestaurantSearch";
import { useMapStore } from "@/stores/useMapStore";

type SearchMode = "region" | "restaurant";

interface RegionResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  categoryGroupCode?: string;
}

interface SearchBoxProps {
  latitude: number | null;
  longitude: number | null;
  onRestaurantMapSelect: (restaurant: Restaurant | null) => void;
}

function searchRegions(query: string): Promise<RegionResult[]> {
  return new Promise((resolve, reject) => {
    const services = window.kakao?.maps?.services;

    if (!services) {
      reject(new Error("카카오 지도 서비스가 준비되지 않았습니다."));
      return;
    }

    const geocoder = new services.Geocoder();

    geocoder.addressSearch(query, (addresses, status) => {
      if (status === services.Status.OK && addresses.length > 0) {
        resolve(
          addresses.slice(0, 5).map((address) => ({
            id: address.address_name,
            name: address.address_name,
            address: address.address_name,
            latitude: Number(address.y),
            longitude: Number(address.x),
          })),
        );
        return;
      }

      const places = new services.Places();

      places.keywordSearch(
        query,
        (results, placeStatus) => {
          if (placeStatus === services.Status.OK) {
            resolve(
              results.map((place) => ({
                id: place.id,
                name: place.place_name,
                address: place.road_address_name || place.address_name,
                latitude: Number(place.y),
                longitude: Number(place.x),
                categoryGroupCode: Array.isArray(place.category_group_code)
                  ? (place.category_group_code.find((code) => code === "SW8") ??
                    place.category_group_code[0])
                  : place.category_group_code,
              })),
            );
          } else if (placeStatus === services.Status.ZERO_RESULT) {
            resolve([]);
          } else {
            reject(new Error("지역 검색에 실패했습니다."));
          }
        },
        { size: 5 },
      );
    });
  });
}

function SearchBox({
  latitude,
  longitude,
  onRestaurantMapSelect,
}: SearchBoxProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("region");
  const [keyword, setKeyword] = useState("");
  const [previewKeyword, setPreviewKeyword] = useState("");
  const [regionResults, setRegionResults] = useState<RegionResult[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [manualRestaurantKeyword, setManualRestaurantKeyword] = useState("");
  const requestIdRef = useRef(0);
  const submittedKeywordRef = useRef("");

  const radius = useMapStore((state) => state.radius);
  const restaurantResultsOpen = useMapStore(
    (state) => state.restaurantResultsOpen,
  );
  const setRestaurantResultsOpen = useMapStore(
    (state) => state.setRestaurantResultsOpen,
  );

  const debouncedKeyword = useDebounce(keyword, 700);
  const debouncedRadius = useDebounce(radius, 1000);

  const currentKeyword = keyword.trim();
  const debouncedSearchKeyword = debouncedKeyword.trim();
  const autoRestaurantKeyword =
    currentKeyword.length >= 2 && currentKeyword === debouncedSearchKeyword
      ? currentKeyword
      : "";
  const restaurantSearchKeyword =
    searchMode !== "restaurant"
      ? ""
      : manualRestaurantKeyword !== "" &&
          manualRestaurantKeyword === currentKeyword
        ? manualRestaurantKeyword
        : autoRestaurantKeyword;
  const {
    restaurants: restaurantResults,
    isLoading: restaurantSearching,
    isError: restaurantIsError,
    isFetchNextPageError,
    isFetching,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = useRestaurantSearch({
    keyword: restaurantSearchKeyword,
    latitude,
    longitude,
    radius: debouncedRadius,
    enabled: searchMode === "restaurant",
  });
  const restaurantSearchError = restaurantIsError && !isFetchNextPageError;
  const loadMoreError = isFetchNextPageError ? "추가 검색에 실패했습니다." : "";
  const resultKeyword =
    searchMode === "region" ? previewKeyword : restaurantSearchKeyword;

  const setSearchCenter = useMapStore((state) => state.setSearchCenter);

  const handleModeChange = (mode: SearchMode) => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setSearchMode(mode);
    setKeyword("");
    setPreviewKeyword("");
    setRegionResults([]);
    setResultsQuery("");
    setSearchError("");
    setSearching(false);
    setManualRestaurantKeyword("");
    onRestaurantMapSelect(null);
  };

  const handleKeywordChange = (value: string) => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setKeyword(value);
    setRegionResults([]);
    setResultsQuery("");
    setSearchError("");
    setSearching(false);
    setManualRestaurantKeyword("");
    setPreviewKeyword("");
    if (searchMode === "restaurant") onRestaurantMapSelect(null);
    setPreviewKeyword("");
  };

  const handleClearRegionSearch = () => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setKeyword("");
    setPreviewKeyword("");
    setManualRestaurantKeyword("");
    onRestaurantMapSelect(null);
    setSearchError("");
  };

  const handleClearRestaurantSearch = () => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setKeyword("");
    setPreviewKeyword("");
    setSearching(false);
    setSearchError("");
    onRestaurantMapSelect(null);
    setRestaurantResultsOpen(true);
  };

  useEffect(() => {
    const query = debouncedKeyword.trim();

    if (searchMode !== "region") return;
    if (query.length < 2) return;
    if (query === submittedKeywordRef.current) return;

    const requestId = ++requestIdRef.current;

    setSearching(true);
    setSearchError("");

    searchRegions(query)
      .then((results) => {
        if (requestId !== requestIdRef.current) return;

        setRegionResults(results);
        setResultsQuery(query);

        if (results.length === 0) setSearchError("검색 결과가 없습니다.");
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;

        setSearchError("지역 검색에 실패했습니다.");
      })
      .finally(() => {
        if (requestId === requestIdRef.current) setSearching(false);
      });

    return () => {
      if (requestIdRef.current === requestId) requestIdRef.current++;
    };
  }, [debouncedKeyword, searchMode]);

  const handleSelectRegion = (region: RegionResult) => {
    requestIdRef.current++;
    submittedKeywordRef.current = region.name;

    setKeyword(region.name);
    setPreviewKeyword(region.name);
    setRegionResults([]);
    setResultsQuery("");
    setSearchError("");
    setSearching(false);
    setSearchCenter({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setRestaurantResultsOpen(true);
  };

  const handleSearch = async () => {
    const query = keyword.trim();

    if (!query) return;

    if (searchMode === "restaurant") {
      if (latitude === null || longitude === null) {
        setSearchError("검색 위치를 확인할 수 없습니다.");
        return;
      }
      setSearchError("");
      setManualRestaurantKeyword(query);
      onRestaurantMapSelect(null);
      return;
    }

    submittedKeywordRef.current = query;
    const requestId = ++requestIdRef.current;

    setSearching(true);
    setSearchError("");

    try {
      const results =
        resultsQuery === query ? regionResults : await searchRegions(query);

      if (requestId !== requestIdRef.current) return;

      const normalizedQuery = normalize(query);

      const matchedRegions = results.filter((region) => {
        const name = normalize(region.name);
        const address = normalize(region.address);
        const lastName = region.name.trim().split(/\s+/).at(-1) ?? "";
        const lastAddress = region.address.trim().split(/\s+/).at(-1) ?? "";

        return (
          name === normalizedQuery ||
          address === normalizedQuery ||
          normalize(lastName) === normalizedQuery ||
          normalize(lastAddress) === normalizedQuery ||
          removeRegionSuffix(lastName) === normalizedQuery ||
          removeRegionSuffix(lastAddress) === normalizedQuery
        );
      });

      if (matchedRegions.length === 1) {
        handleSelectRegion(matchedRegions[0]);
        return;
      }

      if (matchedRegions.length === 0 && query.endsWith("역")) {
        const stationMatches = results.filter((region) => {
          return (
            region.categoryGroupCode === "SW8" &&
            normalize(region.name).startsWith(normalize(query))
          );
        });

        if (stationMatches.length > 0) {
          handleSelectRegion(stationMatches[0]);
          return;
        }
      }

      setRegionResults(results);
      setResultsQuery(query);

      if (results.length === 0) setSearchError("검색 결과가 없습니다.");
    } catch {
      if (requestId === requestIdRef.current)
        setSearchError("지역 검색에 실패했습니다.");
    } finally {
      if (requestId === requestIdRef.current) setSearching(false);
    }
  };

  const restaurantsWithDistance = restaurantResults
    .map((restaurant) => ({
      restaurant,
      distance:
        latitude !== null && longitude !== null
          ? calculateDistance(
              latitude,
              longitude,
              restaurant.location.latitude,
              restaurant.location.longitude,
            )
          : Infinity,
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearbyRestaurants = restaurantsWithDistance.filter(
    (item) => item.distance <= radius,
  );

  const outsideRestaurants = restaurantsWithDistance.filter(
    (item) => item.distance > radius,
  );

  const handleLoadMore = () => {
    if (!hasNextPage || isFetching) return;
    void fetchNextPage();
  };

  return (
    <section className="m-4 rounded-2xl border border-gray-200 p-4">
      <h2 className="mb-5 text-xl font-semibold">맛집 검색</h2>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleModeChange("region")}
          aria-pressed={searchMode === "region"}
          className={`rounded-full px-4 py-2 ${
            searchMode === "region"
              ? "bg-gray-100 font-semibold text-gray-900"
              : "text-gray-400 hover:bg-gray-50"
          }`}
        >
          지역 검색
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("restaurant")}
          aria-pressed={searchMode === "restaurant"}
          className={`rounded-full px-4 py-2 ${
            searchMode === "restaurant"
              ? "bg-gray-100 font-semibold text-gray-900"
              : "text-gray-400 hover:bg-gray-50"
          }`}
        >
          음식점 검색
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSearch();
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          placeholder={
            searchMode === "region"
              ? "예: 강남역, 홍대입구, 신림동"
              : "예: 맥도날드, 강강술래, 프랭크버거"
          }
          className="min-w-0 flex-1 rounded-full border border-gray-300 px-5 py-3 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!keyword.trim()}
          className="rounded-full bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          검색
        </button>
      </form>
      {currentKeyword !== "" && (
        <div className="mt-3 flex min-h-[40px] flex-wrap items-center justify-between gap-2">
          {resultKeyword !== "" && resultKeyword === currentKeyword && (
            <h3 className="font-semibold">
              &quot;{resultKeyword}&quot; 검색 결과
            </h3>
          )}
          <div className="ml-auto flex items-center gap-2">
            {searchMode === "restaurant" &&
              restaurantSearchKeyword !== "" &&
              !restaurantSearching &&
              !restaurantSearchError && (
                <button
                  type="button"
                  onClick={() =>
                    setRestaurantResultsOpen(!restaurantResultsOpen)
                  }
                  className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {restaurantResultsOpen ? "접기" : "펼치기"}
                </button>
              )}

            <button
              type="button"
              onClick={
                searchMode === "region"
                  ? handleClearRegionSearch
                  : handleClearRestaurantSearch
              }
              className="h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50"
            >
              검색 초기화
            </button>
          </div>
        </div>
      )}
      {searchMode === "region" && (
        <div className="space-y-3">
          {searching && (
            <p className="mt-3 text-sm text-gray-500">검색 중...</p>
          )}

          {searchError && (
            <p className="mt-3 text-sm text-red-500">{searchError}</p>
          )}
          {previewKeyword !== "" && previewKeyword === currentKeyword && (
            <p className="mt-3 text-sm text-gray-500">
              선택한 지역을 기준으로 맛집을 검색합니다.
            </p>
          )}
          {resultsQuery === currentKeyword && regionResults.length > 0 && (
            <div className="mt-3 space-y-1 rounded-xl border border-gray-200 p-2">
              {regionResults.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region)}
                  className="w-full rounded-lg px-3 py-3 text-left hover:bg-gray-100"
                >
                  <p className="text-sm font-medium">{region.name}</p>
                  {region.address !== region.name && (
                    <p className="mt-1 text-xs text-gray-500">
                      {region.address}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {searchMode === "restaurant" && (
        <div className="space-y-3">
          {restaurantSearching && (
            <p className="mt-3 text-sm text-gray-500">음식점 검색 중...</p>
          )}
          {searchError && (
            <p className="mt-3 text-sm text-red-500">{searchError}</p>
          )}
          {restaurantSearchError && (
            <p className="mt-3 text-sm text-red-500">
              음식점 검색에 실패했습니다.
            </p>
          )}
          {!restaurantSearching &&
            !searchError &&
            !restaurantSearchError &&
            restaurantSearchKeyword !== "" &&
            restaurantResultsOpen && (
              <div className="mt-3 space-y-3">
                {restaurantResults.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {hasNextPage
                      ? "현재 검색 결과에 일치하는 음식점이 없습니다. 더보기를 눌러 확인해보세요."
                      : "검색 결과가 없습니다."}
                  </p>
                ) : (
                  <>
                    <h4 className="font-semibold">
                      주변 음식점 ({nearbyRestaurants.length})
                    </h4>

                    {nearbyRestaurants.length === 0 && (
                      <p className="text-sm text-gray-500">
                        검색 반경 안에 음식점이 없습니다.
                      </p>
                    )}
                    {nearbyRestaurants.map(({ restaurant, distance }) => (
                      <div
                        key={restaurant.id}
                        className="overflow-hidden rounded-lg border border-gray-200"
                      >
                        <a
                          href={restaurant.googleMapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 transition-colors hover:bg-gray-50"
                        >
                          <p className="font-semibold">
                            {restaurant.displayName.text}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {restaurant.formattedAddress}
                          </p>
                          <p className="mt-1 text-sm text-blue-600">
                            거리: {Math.round(distance)}m
                          </p>
                          <p className="mt-1 text-sm text-blue-600">
                            도보 약 {calculateWalkingMinutes(distance)}분
                          </p>
                        </a>
                        <button
                          type="button"
                          onClick={() => onRestaurantMapSelect(restaurant)}
                          className="w-full border-t border-gray-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          지도에서 보기
                        </button>
                      </div>
                    ))}
                    {outsideRestaurants.length > 0 && (
                      <>
                        <h4 className="pt-3 font-semibold">
                          검색 반경 밖 ({outsideRestaurants.length})
                        </h4>
                        {outsideRestaurants.map(({ restaurant, distance }) => (
                          <div
                            key={restaurant.id}
                            className="overflow-hidden rounded-lg border border-gray-200"
                          >
                            <a
                              href={restaurant.googleMapsUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3 transition-colors hover:bg-gray-50"
                            >
                              <p className="font-semibold">
                                {restaurant.displayName.text}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {restaurant.formattedAddress}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                거리: {(distance / 1000).toFixed(1)}km
                              </p>
                            </a>

                            <button
                              type="button"
                              onClick={() => onRestaurantMapSelect(restaurant)}
                              className="w-full border-t border-gray-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                              지도에서 보기
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore || isFetching}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loadingMore ? "추가 검색 중..." : "음식점 더보기"}
                  </button>
                )}
                {loadMoreError && (
                  <p className="text-sm text-red-500">{loadMoreError}</p>
                )}
              </div>
            )}
        </div>
      )}
    </section>
  );
}

export default SearchBox;
