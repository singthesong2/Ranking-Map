"use client";

import type { RestaurantSort } from "@/types/restaurant";
import { useMapStore } from "@/stores/useMapStore";

interface MapControlsProps {
  sortOption: RestaurantSort;
  onSortChange: (sort: RestaurantSort) => void;
}

function MapControls({ sortOption, onSortChange }: MapControlsProps) {
  const radius = useMapStore((state) => state.radius);
  const setRadius = useMapStore((state) => state.setRadius);

  return (
    <section className="mx-4 mb-4 min-w-0 overflow-hidden rounded-2xl border border-gray-200 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-medium">검색 반경</span>
        <span className="font-bold">
          {radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSortChange("recommended")}
          className={
            sortOption === "recommended"
              ? "rounded-full bg-[#B5616E] px-4 py-2 text-white hover:bg-[#9D5360]"
              : "rounded-full bg-[#F8EFF0] px-4 py-2 text-[#685D60] hover:bg-[#F3E1E5]"
          }
        >
          추천순
        </button>
        <button
          type="button"
          onClick={() => onSortChange("rating")}
          className={
            sortOption === "rating"
              ? "rounded-full bg-[#B5616E] px-4 py-2 text-white hover:bg-[#9D5360]"
              : "rounded-full bg-[#F8EFF0] px-4 py-2 text-[#685D60] hover:bg-[#F3E1E5]"
          }
        >
          평점순
        </button>
        <button
          type="button"
          onClick={() => onSortChange("reviews")}
          className={
            sortOption === "reviews"
              ? "rounded-full bg-[#B5616E] px-4 py-2 text-white hover:bg-[#9D5360]"
              : "rounded-full bg-[#F8EFF0] px-4 py-2 text-[#685D60] hover:bg-[#F3E1E5]"
          }
        >
          리뷰 많은 순
        </button>
        <button
          type="button"
          onClick={() => onSortChange("distance")}
          className={
            sortOption === "distance"
              ? "rounded-full bg-[#B5616E] px-4 py-2 text-white hover:bg-[#9D5360]"
              : "rounded-full bg-[#F8EFF0] px-4 py-2 text-[#685D60] hover:bg-[#F3E1E5]"
          }
        >
          가까운 순
        </button>
      </div>
      <input
        type="range"
        min={100}
        max={5000}
        step={100}
        value={radius}
        onChange={(e) => {
          setRadius(Number(e.target.value));
        }}
        aria-label="검색 반경"
        className="mt-4 block box-border w-full min-w-0 max-w-full accent-[#B5616E]"
      />
      <div className="mt-3 grid w-full grid-cols-2 items-center text-sm text-gray-500">
        <span className="justify-self-start">100m</span>
        <span className="justify-self-end">5km</span>
      </div>
    </section>
  );
}

export default MapControls;
