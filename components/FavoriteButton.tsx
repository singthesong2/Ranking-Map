"use client";

import { useEffect } from "react";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Restaurant } from "@/types/restaurant";

interface FavoriteButtonProps {
  restaurant: Restaurant;
  className?: string;
}

export default function FavoriteButton({
  restaurant,
  className = "",
}: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) =>
    state.favoriteIds.includes(restaurant.id),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const rememberRestaurant = useFavoritesStore(
    (state) => state.rememberRestaurant,
  );

  useEffect(() => {
    if (isFavorite) {
      rememberRestaurant(restaurant);
    }
  }, [isFavorite, restaurant, rememberRestaurant]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(restaurant);
      }}
      aria-label={
        isFavorite
          ? `${restaurant.displayName.text} 찜 해제`
          : `${restaurant.displayName.text} 찜 추가`
      }
      aria-pressed={isFavorite}
      title={isFavorite ? "찜 해제" : "찜 추가"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-red-50 ${className}`}
    >
      {isFavorite ? (
        <IconHeartFilled size={22} className="text-red-500" />
      ) : (
        <IconHeart size={22} stroke={1.8} />
      )}
    </button>
  );
}
