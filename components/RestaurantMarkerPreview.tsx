"use client";

import type { Restaurant } from "@/types/restaurant";
import {
  calculateDistance,
  calculateWalkingMinutes,
} from "@/utils/calculateDistance";

interface RestaurantMarkerPreviewProps {
  restaurant: Restaurant;
  searchLatitude: number | null;
  searchLongitude: number | null;
  onClose: () => void;
}

function RestaurantMarkerPreview({
  restaurant,
  searchLatitude,
  searchLongitude,
  onClose,
}: RestaurantMarkerPreviewProps) {
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

  return (
    <aside
      aria-label="선택한 음식점 정보"
      className="absolute inset-x-3 bottom-3 z-40 mx-auto max-w-lg rounded-2xl border border-[#EEE6E4] bg-white px-4 py-3 shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#30292B]">
            {restaurant.displayName.text}
          </h3>
          <p className="mt-1 text-xs text-[#8E8084] sm:text-sm">
            <span className="text-[#D49A38]" aria-hidden="true">
              ★
            </span>{" "}
            {restaurant.rating?.toFixed(1) ?? "정보 없음"}
            {" / "}리뷰 : {restaurant.userRatingCount ?? 0}개
            {walkingMinutes !== null && (
              <>
                {" / "}도보 : 약 {walkingMinutes}분
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="음식점 정보 닫기"
          className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center bg-transparent text-[#8E8084] transition-colors hover:text-[#30292B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E]"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      {restaurant.googleMapsUri && (
        <div className="mt-3 flex justify-end border-t border-[#EEE6E4] pt-2">
          <a
            href={restaurant.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#B5616E] hover:text-[#9D5360] sm:text-sm"
          >
            Google 지도에서 자세히 보기
            <svg
              aria-hidden="true"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 5h5v5M10 14l9-9" />
              <path d="M19 13v6H5V5h6" />
            </svg>
          </a>
        </div>
      )}
    </aside>
  );
}

export default RestaurantMarkerPreview;
