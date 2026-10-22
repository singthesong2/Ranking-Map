"use client";

import { useEffect, useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";

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
  onRegionSelect: (latitude: number, longitude: number) => void;
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

function SearchBox({ onRegionSelect }: SearchBoxProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("region");
  const [keyword, setKeyword] = useState("");
  const [previewKeyword, setPreviewKeyword] = useState("");
  const [regionResults, setRegionResults] = useState<RegionResult[]>([]);
  const [resultsQuery, setResultsQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const debouncedKeyword = useDebounce(keyword, 700);

  const requestIdRef = useRef(0);
  const submittedKeywordRef = useRef("");

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
  };

  const handleKeywordChange = (value: string) => {
    requestIdRef.current++;
    submittedKeywordRef.current = "";

    setKeyword(value);
    setRegionResults([]);
    setResultsQuery("");
    setSearchError("");
    setSearching(false);
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

        if (results.length === 0) {
          setSearchError("검색 결과가 없습니다.");
        }
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;

        setSearchError("지역 검색에 실패했습니다.");
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setSearching(false);
        }
      });

    return () => {
      if (requestIdRef.current === requestId) {
        requestIdRef.current++;
      }
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

    onRegionSelect(region.latitude, region.longitude);
  };

  const handleSearch = async () => {
    const query = keyword.trim();

    if (!query) return;

    if (searchMode === "restaurant") {
      setPreviewKeyword(query);
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

      const normalize = (value: string) =>
        value.replace(/\s/g, "").toLowerCase();

      const removeRegionSuffix = (value: string) =>
        normalize(value).replace(/(특별자치시|특별시|광역시|시|군|면|동)$/, "");
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

      {searchMode === "region" && (
        <>
          {searching && (
            <p className="mt-3 text-sm text-gray-500">검색 중...</p>
          )}
          {searchError && (
            <p className="mt-3 text-sm text-red-500">{searchError}</p>
          )}
          {resultsQuery === keyword.trim() && regionResults.length > 0 && (
            <div className="mt-3 space-y-1 rounded-xl border border-gray-200 p-2">
              {regionResults.map((region) => (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region)}
                  className="w-full rounded-lg px-3 py-3 text-left hover:bg-gray-100"
                >
                  <p className="text-sm font-medium">📍 {region.name}</p>

                  {region.address !== region.name && (
                    <p className="ml-6 mt-1 text-xs text-gray-500">
                      {region.address}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {previewKeyword && (
        <div className="mt-6">
          <h3 className="font-semibold">
            {searchMode === "region" ? "📍" : "🔎"} {previewKeyword}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchMode === "region"
              ? "선택한 지역을 기준으로 맛집을 검색합니다."
              : "가게 검색 결과 연결은 다음 단계에서 구현합니다."}
          </p>
        </div>
      )}
    </section>
  );
}

export default SearchBox;
