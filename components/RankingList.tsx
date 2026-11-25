import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
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
  onRetry: () => void;
  retrying: boolean;
}

interface RestaurantStatsProps {
  restaurant: Restaurant;
  walkingMinutes: number | null;
}

interface RestaurantApiErrorProps {
  hasPreviousResults: boolean;
  onRetry: () => void;
  retrying: boolean;
}

function RestaurantStats({ restaurant, walkingMinutes }: RestaurantStatsProps) {
  return (
    <>
      <span>
        <span className="text-[#D49A38]" aria-hidden="true">
          ★
        </span>{" "}
        {restaurant.rating ?? "정보 없음"}
      </span>
      <span>리뷰 {restaurant.userRatingCount ?? 0}개</span>
      {walkingMinutes !== null && <span>도보 약 {walkingMinutes}분</span>}
    </>
  );
}

function RestaurantApiError({
  hasPreviousResults,
  onRetry,
  retrying,
}: RestaurantApiErrorProps) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-[#EAD2D6] bg-[#FFF9FA] ${
        hasPreviousResults ? "mb-3 p-4" : "p-6"
      }`}
    >
      <div
        className={`flex gap-3 ${
          hasPreviousResults
            ? "items-start"
            : "flex-col items-center text-center"
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8EFF0]">
          <IconAlertCircle
            size={24}
            stroke={1.8}
            className="text-[#B5616E]"
            aria-hidden="true"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#783E50]">
            {hasPreviousResults
              ? "맛집 목록을 업데이트하지 못했어요"
              : "맛집 정보를 불러오지 못했어요"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#776C6F]">
            {hasPreviousResults
              ? "이전에 불러온 검색 결과를 표시하고 있어요."
              : "인터넷 연결이나 서버 상태를 확인한 뒤 다시 시도해 주세요."}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#B5616E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9D5360] active:bg-[#874650] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E] ${
          hasPreviousResults ? "w-full sm:w-auto" : "w-full"
        }`}
      >
        <IconRefresh
          size={17}
          aria-hidden="true"
          className={retrying ? "animate-spin motion-reduce:animate-none" : ""}
        />
        {retrying ? "다시 불러오는 중..." : "다시 시도"}
      </button>
    </div>
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
  onRetry,
  retrying,
}: RankingListProps) {
  const hasSearchPosition = latitude !== null && longitude !== null;
  const showSkeleton = loading && !error && restaurants.length === 0;

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
          {!hasSearchPosition
            ? "검색 위치 미선택"
            : error && restaurants.length === 0
              ? "불러오기 실패"
              : showSkeleton
                ? "불러오는 중..."
                : `${restaurants.length}곳 표시`}
        </span>
      </div>
      {!hasSearchPosition ? (
        <div className="rounded-2xl border border-[#EEE6E4] bg-white p-8 text-center">
          <p className="text-sm font-medium text-[#685D60]">
            아직 검색할 위치가 선택되지 않았어요.
          </p>
          <p className="mt-2 text-xs text-[#93878A]">
            지역 검색이나 지도에서 검색 위치를 지정해 주세요.
          </p>
        </div>
      ) : showSkeleton ? (
        <div role="status">
          <span className="sr-only">음식점 목록을 불러오고 있습니다.</span>
          <RankingListSkeleton />
        </div>
      ) : error && restaurants.length === 0 ? (
        <RestaurantApiError
          hasPreviousResults={false}
          onRetry={onRetry}
          retrying={retrying}
        />
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
          {loading && !error && (
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
            <RestaurantApiError
              hasPreviousResults
              onRetry={onRetry}
              retrying={retrying}
            />
          )}
          <div className="space-y-3">
            {restaurants.map((restaurant, index) => {
              const walkingMinutes = getWalkingMinutes(restaurant);

              return (
                <article
                  key={restaurant.id}
                  className="relative rounded-2xl border border-[#EEE6E4] bg-white transition-all duration-200 hover:border-[#D9B1B6] hover:bg-[#FFFBFB] hover:shadow-[0_8px_24px_rgba(58,34,38,0.06)] active:border-[#D9B1B6] active:bg-[#FFFBFB]"
                >
                  <div className="flex items-center gap-3 p-4 max-[359px]:pb-2 max-[359px]:pr-16">
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
                    <div className="shrink-0 max-[359px]:absolute max-[359px]:right-4 max-[359px]:top-1/2 max-[359px]:-translate-y-1/2">
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
