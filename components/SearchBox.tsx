"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import useDebounce from "@/hooks/useDebounce";
import { normalize, removeRegionSuffix } from "@/utils/regionSearch";
import type { Restaurant } from "@/types/restaurant";
import { calculateDistance } from "@/utils/calculateDistance";
import { calculateWalkingMinutes } from "@/utils/calculateDistance";
import useRestaurantSearch from "@/hooks/useRestaurantSearch";
import useClickOutside from "@/hooks/useClickOutside";
import { useMapStore } from "@/stores/useMapStore";
import { useToastStore } from "@/stores/useToastStore";
import { useSearchHistoryStore } from "@/stores/useSearchHistoryStore";
import type { SearchHistoryItem } from "@/schemas/searchHistorySchema";
import FavoriteButton from "@/components/FavoriteButton";
import SearchHistoryList from "@/components/SearchHistoryList";
import ConfirmModal from "@/components/ConfirmModal";

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
  const [showHistory, setShowHistory] = useState(false);
  const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
  const requestIdRef = useRef(0);
  const submittedKeywordRef = useRef("");
  const historyAreaRef = useRef<HTMLDivElement>(null);

  const radius = useMapStore((state) => state.radius);
  const restaurantResultsOpen = useMapStore(
    (state) => state.restaurantResultsOpen,
  );
  const setRestaurantResultsOpen = useMapStore(
    (state) => state.setRestaurantResultsOpen,
  );
  const setRadius = useMapStore((state) => state.setRadius);
  const addHistory = useSearchHistoryStore((state) => state.addHistory);
  const clearHistoryByMode = useSearchHistoryStore(
    (state) => state.clearHistoryByMode,
  );
  const showToast = useToastStore((state) => state.showToast);

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
  const handleFocusSearch = () => {
    setShowHistory(true);
  };
  const setSearchCenter = useMapStore((state) => state.setSearchCenter);
  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setShowHistory(false);
    }
  };
  const handleRequestClearHistory = () => {
    setShowHistory(false);
    setDeleteHistoryModalOpen(true);
  };
  const handleCancelClearHistory = () => {
    setDeleteHistoryModalOpen(false);
  };
  const handleConfirmClearHistory = () => {
    clearHistoryByMode(searchMode);
    setDeleteHistoryModalOpen(false);
    showToast(
      `${searchMode === "region" ? "지역" : "음식점"} 검색 기록을 모두 삭제했어요.`,
      "success",
    );
  };

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
    setShowHistory(false);
    onRestaurantMapSelect(null);
  };

  const handleKeywordChange = (value: string) => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setKeyword(value);
    setShowHistory(value.trim() === "");
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
    setShowHistory(false);
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
    setShowHistory(false);
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
    setShowHistory(false);
    setSearchCenter({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setRestaurantResultsOpen(true);

    addHistory({
      kind: "region",
      label: region.name,
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleSelectHistory = (item: SearchHistoryItem) => {
    if (item.kind === "region") {
      handleSelectRegion({
        id: item.id,
        name: item.label,
        address: item.label,
        latitude: item.latitude,
        longitude: item.longitude,
      });

      return;
    }

    requestIdRef.current++;
    submittedKeywordRef.current = "";
    setSearchMode("restaurant");
    setKeyword(item.label);
    setPreviewKeyword("");
    setRegionResults([]);
    setResultsQuery("");
    setSearching(false);
    setSearchError("");
    setShowHistory(false);
    setSearchCenter({
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setRadius(item.radius);
    setManualRestaurantKeyword(item.label);
    setRestaurantResultsOpen(true);
    onRestaurantMapSelect(null);

    addHistory({
      kind: "restaurant",
      label: item.label,
      latitude: item.latitude,
      longitude: item.longitude,
      radius: item.radius,
    });
  };

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
  }, []);

  useClickOutside(historyAreaRef, handleCloseHistory, showHistory);

  const handleSearch = async () => {
    const query = keyword.trim();

    if (!query) return;

    if (searchMode === "restaurant") {
      if (latitude === null || longitude === null) {
        setSearchError("검색 위치를 확인할 수 없습니다.");
        return;
      }
      setSearchError("");
      setShowHistory(false);
      setManualRestaurantKeyword(query);
      onRestaurantMapSelect(null);
      addHistory({
        kind: "restaurant",
        label: query,
        latitude,
        longitude,
        radius,
      });
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

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowHistory(false);
    void handleSearch();
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

  useEffect(() => {
    void useSearchHistoryStore.persist.rehydrate();
  }, []);

  return (
    <>
      <section className="m-4 rounded-2xl border border-gray-200 p-4">
        <h2 className="mb-5 text-xl font-semibold">맛집 검색</h2>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleModeChange("region")}
            aria-pressed={searchMode === "region"}
            className={`rounded-full px-4 py-2 lg:rounded-xl lg:py-2.5 lg:text-sm lg:transition-colors ${
              searchMode === "region"
                ? "bg-[#B5616E] font-semibold text-white hover:bg-[#9D5360]"
                : "bg-[#F4F1F1] text-[#8B8082] hover:bg-[#F8EFF0]"
            }`}
          >
            지역 검색
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("restaurant")}
            aria-pressed={searchMode === "restaurant"}
            className={`rounded-full px-4 py-2 lg:rounded-xl lg:py-2.5 lg:text-sm lg:transition-colors ${
              searchMode === "restaurant"
                ? "bg-[#B5616E] font-semibold text-white hover:bg-[#9D5360]"
                : "bg-[#F4F1F1] text-[#8B8082] hover:bg-[#F8EFF0]"
            }`}
          >
            음식점 검색
          </button>
        </div>

        <div ref={historyAreaRef} className="relative">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="search"
              value={keyword}
              onFocus={handleFocusSearch}
              onClick={handleFocusSearch}
              onKeyDown={handleSearchKeyDown}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder={
                searchMode === "region"
                  ? "예: 강남역, 홍대입구, 신림동"
                  : "예: 맥도날드, 강강술래, 프랭크버거"
              }
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-5 py-3 outline-none focus:border-blue-500 lg:h-12 lg:rounded-2xl lg:border-[#E7DEDD] lg:bg-[#FCFAF9] lg:px-4 lg:text-sm lg:text-[#302B2D] lg:placeholder:text-[#9F9495] lg:focus:border-[#B5616E] lg:focus:ring-4 lg:focus:ring-[#B5616E]/10"
            />
            <button
              type="submit"
              disabled={!keyword.trim()}
              className="rounded-full bg-[#B5616E] px-5 py-3 text-white hover:bg-[#9D5360] disabled:opacity-50 lg:rounded-2xl lg:px-5 lg:text-sm lg:font-semibold"
            >
              검색
            </button>
          </form>
          {showHistory && (
            <div className="absolute top-full right-0 left-0 z-30">
              <SearchHistoryList
                mode={searchMode}
                onSelect={handleSelectHistory}
                onRequestClearAll={handleRequestClearHistory}
              />
            </div>
          )}
        </div>
        {currentKeyword !== "" && (
          <div className="mt-3 flex min-h-[40px] flex-wrap items-center justify-between gap-2">
            {resultKeyword !== "" && resultKeyword === currentKeyword && (
              <h3 className="font-semibold lg:text-sm lg:font-semibold lg:text-[#3A3032]">
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
                    className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 lg:rounded-xl lg:border-[#EAE0DF] lg:text-xs"
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
                className="h-10 rounded-lg border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50 lg:rounded-xl lg:text-xs"
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
              <div className="mt-3 space-y-1 rounded-xl border border-gray-200 p-2 lg:rounded-2xl lg:border-[#EDE4E3] lg:bg-white lg:shadow-sm">
                {regionResults.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => handleSelectRegion(region)}
                    className="w-full rounded-lg px-3 py-3 text-left hover:bg-gray-100 lg:rounded-xl lg:hover:bg-[#FBF0F1]"
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
                      <h4 className="font-semibold lg:text-sm lg:font-semibold lg:text-[#3A3032]">
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
                          className="overflow-hidden rounded-lg border border-gray-200 lg:rounded-2xl lg:border-[#EEE6E4] lg:bg-white lg:shadow-[0_4px_16px_rgba(70,40,40,0.04)]"
                        >
                          <div className="flex items-center gap-3 transition-colors hover:bg-[#FFFBFB] focus-within:bg-[#FFFBFB]">
                            <a
                              href={restaurant.googleMapsUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-w-0 flex-1 p-3 transition-colors hover:bg-gray-50"
                            >
                              <p className="font-semibold lg:text-sm lg:font-semibold lg:text-[#3A3032]">
                                {restaurant.displayName.text}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {restaurant.formattedAddress}
                              </p>
                              <p className="mt-1 text-sm text-[#B5616E]">
                                거리: {Math.round(distance)}m
                              </p>
                              <p className="mt-1 text-sm text-[#B5616E]">
                                도보 약 {calculateWalkingMinutes(distance)}분
                              </p>
                            </a>
                            <div className="shrink-0 pr-3 lg:pr-4">
                              <FavoriteButton restaurant={restaurant} />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRestaurantMapSelect(restaurant)}
                            className="w-full border-t border-[#F0E8E6] px-3 py-2 text-sm font-medium text-[#B5616E] transition-colors hover:bg-[#F8EFF0] hover:text-[#9D5360] focus-visible:outline-2 focus-visible:outline-[#B5616E] lg:py-2.5 lg:text-xs"
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
                          {outsideRestaurants.map(
                            ({ restaurant, distance }) => (
                              <div
                                key={restaurant.id}
                                className="overflow-hidden rounded-lg border border-gray-200 lg:rounded-2xl lg:border-[#EEE6E4] lg:bg-white lg:shadow-[0_4px_16px_rgba(70,40,40,0.04)]"
                              >
                                <div className="flex items-center gap-3 transition-colors hover:bg-[#FFFBFB] focus-within:bg-[#FFFBFB]">
                                  <a
                                    href={restaurant.googleMapsUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="min-w-0 flex-1 p-3 lg:p-4"
                                  >
                                    <p className="font-semibold lg:text-sm lg:font-semibold lg:text-[#3A3032]">
                                      {restaurant.displayName.text}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {restaurant.formattedAddress}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                      거리: {(distance / 1000).toFixed(1)}km
                                    </p>
                                  </a>
                                  <div className="shrink-0 pr-3 lg:pr-4">
                                    <FavoriteButton restaurant={restaurant} />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onRestaurantMapSelect(restaurant)
                                  }
                                  className="w-full border-t border-[#F0E8E6] px-3 py-2 text-sm font-medium text-[#B5616E] transition-colors hover:bg-[#F8EFF0] hover:text-[#9D5360] focus-visible:outline-2 focus-visible:outline-[#B5616E] lg:py-2.5 lg:text-xs"
                                >
                                  지도에서 보기
                                </button>
                              </div>
                            ),
                          )}
                        </>
                      )}
                    </>
                  )}
                  {hasNextPage && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore || isFetching}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 lg:rounded-xl lg:border-[#E9DEDD] lg:text-[#9E5260] lg:hover:bg-[#FFF7F8]"
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
      <ConfirmModal
        isOpen={deleteHistoryModalOpen}
        title={`${searchMode === "region" ? "지역" : "음식점"} 검색 기록을 모두 삭제할까요?`}
        description={`저장된 ${searchMode === "region" ? "지역" : "음식점"} 검색 기록만 삭제됩니다.`}
        confirmText="전체 삭제"
        onCancel={handleCancelClearHistory}
        onConfirm={handleConfirmClearHistory}
      />
    </>
  );
}

export default SearchBox;
