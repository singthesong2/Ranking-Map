import type { Restaurant } from "@/types/restaurant";
import {
  calculateDistance,
  calculateWalkingMinutes,
} from "@/utils/calculateDistance";
import RankingListSkeleton from "@/components/RankingListSkeleton";
import FavoriteButton from "@/components/FavoriteButton";

interface RankingListProps {
  restaurants: Restaurant[];
  latitude: number | null;
  longitude: number | null;
  hasMore: boolean;
  onLoadMore: () => void;
  loading: boolean;
  error: string | null;
}

interface RestaurantStatsProps {
  restaurant: Restaurant;
  walkingMinutes: number | null;
}

function RestaurantStats({ restaurant, walkingMinutes }: RestaurantStatsProps) {
  return (
    <>
      <span>⭐ {restaurant.rating ?? "정보 없음"}</span>
      <span>리뷰 {restaurant.userRatingCount ?? 0}개</span>
      {walkingMinutes !== null && <span>도보 약 {walkingMinutes}분</span>}
    </>
  );
}

function RankingList({
  restaurants,
  latitude,
  longitude,
  hasMore,
  onLoadMore,
  loading,
  error,
}: RankingListProps) {
  const showSkeleton = loading && restaurants.length === 0;

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
    <section className="p-4 lg:p-0" aria-busy={loading}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-[#2F292B] lg:text-[21px]">
          맛집 랭킹
        </h2>
        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-[#8E8084]">
          {showSkeleton ? "불러오는 중..." : `${restaurants.length}곳 표시`}
        </span>
      </div>
      {showSkeleton ? (
        <div role="status">
          <span className="sr-only">음식점 목록을 불러오고 있습니다.</span>
          <RankingListSkeleton />
        </div>
      ) : error && restaurants.length === 0 ? (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600"
        >
          {error}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">
            검색 조건에 맞는 음식점이 없습니다.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            검색 반경이나 카테고리를 변경해 보세요.
          </p>
        </div>
      ) : (
        <>
          {loading && (
            <div
              role="status"
              className="mb-3 flex items-center gap-2 text-xs text-[#8E8084]"
            >
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-[#EAD2D6] border-t-[#B5616E] motion-reduce:animate-none"
              />
              음식점 목록 업데이트 중...
            </div>
          )}
          {error && (
            <p role="alert" className="mb-3 text-sm text-red-600">
              목록을 업데이트하지 못했습니다. 기존 결과를 표시합니다.
            </p>
          )}
          <div className="space-y-3">
            {restaurants.map((restaurant, index) => {
              const walkingMinutes = getWalkingMinutes(restaurant);
              return (
                <article
                  key={restaurant.id}
                  className="rounded-2xl border border-[#EEE6E4] bg-white transition-all duration-200 hover:border-[#D9B1B6] hover:bg-[#FFFBFB] hover:shadow-[0_8px_24px_rgba(58,34,38,0.06)] active:border-[#D9B1B6] active:bg-[#FFFBFB]"
                >
                  <div className="flex items-center gap-3 p-4 max-[359px]:pb-2">
                    <a
                      href={restaurant.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${restaurant.displayName.text} 구글 지도에서 보기`}
                      className="group flex min-w-0 flex-1 items-start gap-3 focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8EFF0] text-base font-bold text-[#A05260]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-bold text-[#30292B] group-hover:text-[#9D5360] group-active:text-[#9D5360]">
                          {restaurant.displayName.text}
                        </h3>
                        {restaurant.formattedAddress && (
                          <p className="mt-1 truncate text-xs text-[#93878A]">
                            {restaurant.formattedAddress}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-[#776C6F] max-[359px]:hidden">
                          <RestaurantStats
                            restaurant={restaurant}
                            walkingMinutes={walkingMinutes}
                          />
                        </div>
                      </div>
                    </a>
                    <div className="shrink-0">
                      <FavoriteButton restaurant={restaurant} />
                    </div>
                  </div>
                  <div className="hidden items-center gap-x-2.5 whitespace-nowrap px-4 pb-4 text-xs text-[#776C6F] max-[359px]:flex">
                    <RestaurantStats
                      restaurant={restaurant}
                      walkingMinutes={walkingMinutes}
                    />
                  </div>
                </article>
              );
            })}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={onLoadMore}
              className="mt-6 w-full rounded-xl border border-[#E8DDE0] bg-white py-3 font-medium text-[#69575C] transition-colors hover:border-[#CFAAB1] hover:bg-[#FCF6F7] active:bg-[#FCF6F7]"
            >
              더보기
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default RankingList;
