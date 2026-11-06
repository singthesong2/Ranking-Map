import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Restaurant } from "@/types/restaurant";

interface FavoritesStore {
  favoriteIds: string[];
  restaurantDetails: Record<string, Restaurant>;
  toggleFavorite: (restaurant: Restaurant) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  rememberRestaurant: (restaurant: Restaurant) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      favoriteIds: [],
      restaurantDetails: {},

      toggleFavorite: (restaurant) =>
        set((state) => {
          const id = restaurant.id;
          const isFavorite = state.favoriteIds.includes(id);

          if (isFavorite) {
            const nextDetails = { ...state.restaurantDetails };
            delete nextDetails[id];

            return {
              favoriteIds: state.favoriteIds.filter(
                (favoriteId) => favoriteId !== id,
              ),
              restaurantDetails: nextDetails,
            };
          }

          return {
            favoriteIds: [...state.favoriteIds, id],
            restaurantDetails: {
              ...state.restaurantDetails,
              [id]: restaurant,
            },
          };
        }),

      removeFavorite: (id) =>
        set((state) => {
          const nextDetails = { ...state.restaurantDetails };
          delete nextDetails[id];

          return {
            favoriteIds: state.favoriteIds.filter(
              (favoriteId) => favoriteId !== id,
            ),
            restaurantDetails: nextDetails,
          };
        }),

      clearFavorites: () =>
        set({
          favoriteIds: [],
          restaurantDetails: {},
        }),

      rememberRestaurant: (restaurant) =>
        set((state) => {
          if (!state.favoriteIds.includes(restaurant.id)) return state;

          if (state.restaurantDetails[restaurant.id] === restaurant)
            return state;

          return {
            restaurantDetails: {
              ...state.restaurantDetails,
              [restaurant.id]: restaurant,
            },
          };
        }),
    }),
    {
      name: "restaurant-favorites",
      partialize: (state) => ({
        favoriteIds: state.favoriteIds,
      }),
      skipHydration: true,
    },
  ),
);
