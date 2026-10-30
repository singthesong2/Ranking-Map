"use client";

import { useEffect } from "react";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Restaurant } from "@/types/restaurant";
import type { MouseEvent } from "react";
import { useToastStore } from "@/stores/useToastStore";

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
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (isFavorite) {
      rememberRestaurant(restaurant);
    }
  }, [isFavorite, restaurant, rememberRestaurant]);

  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(restaurant);
    showToast(
      isFavorite
        ? `${restaurant.displayName.text} 찜을 해제했어요.`
        : `${restaurant.displayName.text} 찜 목록에 추가했어요.`,
      isFavorite ? "success" : "favorite",
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      aria-label={
        isFavorite
          ? `${restaurant.displayName.text} 찜 해제`
          : `${restaurant.displayName.text} 찜 추가`
      }
      aria-pressed={isFavorite}
      className={`group flex h-10 w-10 items-center justify-center bg-transparent transition-transform hover:scale-110 focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${className}`}
    >
      {isFavorite ? (
        <IconHeartFilled
          size={22}
          className="text-red-500 transition-colors group-hover:text-red-300"
        />
      ) : (
        <IconHeart
          size={22}
          stroke={1.8}
          className="text-gray-400 transition-colors group-hover:text-red-300"
        />
      )}
    </button>
  );
}
