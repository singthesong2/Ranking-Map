import type { Restaurant } from "@/types/restaurant";
import {
  calculateDistance,
  calculateWalkingMinutes,
} from "@/utils/calculateDistance";

interface RankingListProps {
  restaurants: Restaurant[];
  latitude: number | null;
  longitude: number | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

function RankingList({
  restaurants,
  latitude,
  longitude,
  hasMore,
  onLoadMore,
}: RankingListProps) {
  const getWalkingMinutes = (restaurant: Restaurant) =>
    latitude !== null && longitude !== null
      ? calculateWalkingMinutes(
          calculateDistance(
            latitude,
            longitude,
            restaurant.location.latitude,
            restaurant.location.longitude,
          ),
        )
      : null;
  return (
    <section className="p-4">
      <h2 className="mb-4 text-xl font-bold">맛집 랭킹</h2>
      <div className="space-y-4">
        {restaurants.map((restaurant, index) => (
          <a
            key={restaurant.id}
            href={restaurant.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
          >
            <div className="flex gap-4">
              <span className="text-xl font-bold">{index + 1}</span>
              <div>
                <h3 className="font-bold">{restaurant.displayName.text}</h3>
                <div className="mt-1 flex gap-3 text-sm">
                  <span>⭐ {restaurant.rating ?? "정보 없음"}</span>
                  <span>리뷰 {restaurant.userRatingCount ?? 0}개</span>
                  {getWalkingMinutes(restaurant) !== null && (
                    <span>도보 약 {getWalkingMinutes(restaurant)}분</span>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="mt-6 w-full rounded-lg border border-gray-300 py-3 font-medium hover:bg-gray-50"
        >
          더보기
        </button>
      )}
    </section>
  );
}

export default RankingList;
