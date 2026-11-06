"use client";

import { useEffect, useState } from "react";
import {
  IconX,
  IconTrash,
  IconExternalLink,
  IconHeartFilled,
} from "@tabler/icons-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useQueries } from "@tanstack/react-query";
import type { Restaurant } from "@/types/restaurant";
import ConfirmModal from "@/components/ConfirmModal";
import { useToastStore } from "@/stores/useToastStore";

type FavoritePlaceDetails = Pick<
  Restaurant,
  "id" | "displayName" | "formattedAddress" | "googleMapsUri"
>;

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritesPanel({
  isOpen,
  onClose,
}: FavoritesPanelProps) {
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const restaurantDetails = useFavoritesStore(
    (state) => state.restaurantDetails,
  );

  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const detailQueries = useQueries({
    queries: favoriteIds.map((id) => ({
      queryKey: ["favorite-place-details", id],

      queryFn: async ({ signal }): Promise<FavoritePlaceDetails> => {
        const response = await fetch(
          `/api/place-details?id=${encodeURIComponent(id)}`,
          { signal },
        );

        if (!response.ok) throw new Error("음식점 정보 조회 실패");

        return response.json();
      },

      enabled: isOpen && !restaurantDetails[id],
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,

      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  const showToast = useToastStore((state) => state.showToast);
  const handleConfirmClear = () => {
    clearFavorites();
    setIsDeleteModalOpen(false);
    showToast("찜 목록을 모두 삭제했어요.", "success");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (isDeleteModalOpen) setIsDeleteModalOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isDeleteModalOpen, onClose]);

  if (!isOpen) return null;

  const handleRemoveFavorite = (id: string, restaurantName?: string) => {
    removeFavorite(id);
    showToast(
      restaurantName
        ? `${restaurantName} 찜을 해제했어요.`
        : "찜을 해제했어요.",
      "success",
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="찜 목록 닫기"
        className="fixed inset-0 z-40 bg-black/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="찜한 맛집 목록"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-xl font-bold">찜한 맛집</h2>
            <p className="mt-1 text-sm text-gray-500">
              총 {favoriteIds.length}개
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <IconX size={24} />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {favoriteIds.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
              <IconHeartFilled size={40} />
              <p>아직 찜한 맛집이 없습니다.</p>
              <p className="text-sm">마음에 드는 음식점의 하트를 눌러보세요.</p>
            </div>
          ) : (
            favoriteIds.map((id, index) => {
              const detailsQuery = detailQueries[index];
              const restaurant = restaurantDetails[id] ?? detailsQuery.data;
              const googleMapsUrl =
                restaurant?.googleMapsUri ||
                `https://www.google.com/maps/search/?api=1&query=restaurant&query_place_id=${encodeURIComponent(id)}`;

              return (
                <div key={id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {restaurant
                          ? restaurant.displayName.text
                          : detailsQuery.isPending
                            ? "음식점 정보 불러오는 중..."
                            : "음식점 정보 확인 불가"}
                      </h3>
                      {restaurant ? (
                        <p className="mt-1 text-sm text-gray-500">
                          {restaurant.formattedAddress}
                        </p>
                      ) : detailsQuery.isError ? (
                        <div className="mt-2">
                          <p className="text-sm text-red-500">
                            음식점 정보를 불러오지 못했습니다.
                          </p>
                          <button
                            type="button"
                            onClick={() => void detailsQuery.refetch()}
                            className="mt-2 text-sm text-blue-600 hover:underline"
                          >
                            다시 시도
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">
                          음식점 정보를 불러오는 중입니다.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFavorite(id, restaurant?.displayName.text)
                      }
                      aria-label="찜 해제"
                      className="rounded-full p-2 text-red-500 hover:bg-red-50"
                    >
                      <IconHeartFilled size={22} />
                    </button>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Google 지도에서 보기
                    <IconExternalLink size={16} />
                  </a>
                </div>
              );
            })
          )}
        </div>
        {favoriteIds.length > 0 && (
          <div className="border-t border-gray-200 p-5">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-red-600 hover:bg-red-50"
            >
              <IconTrash size={18} />
              전체 삭제
            </button>
          </div>
        )}
      </aside>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="찜 목록을 모두 삭제할까요?"
        description={`저장한 맛집 ${favoriteIds.length}개가 삭제됩니다.\n삭제한 찜 목록은 복구할 수 없습니다.`}
        confirmText="전체 삭제"
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmClear}
      />
    </>
  );
}
