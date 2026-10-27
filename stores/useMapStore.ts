import { create } from "zustand";
import type { Restaurant } from "@/types/restaurant";

interface SearchCenter {
  latitude: number;
  longitude: number;
}

interface MapStore {
  searchCenter: SearchCenter | null;
  selectedRestaurant: Restaurant | null;
  restaurantResultsOpen: boolean;
  radius: number;
  setSearchCenter: (center: SearchCenter | null) => void;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  setRestaurantResultsOpen: (open: boolean) => void;
  setRadius: (radius: number) => void;
}

export const useMapStore = create<MapStore>()((set) => ({
  searchCenter: null,
  selectedRestaurant: null,
  restaurantResultsOpen: true,
  radius: 1000,

  setSearchCenter: (center) =>
    set({
      searchCenter: center,
      selectedRestaurant: null,
    }),

  setSelectedRestaurant: (restaurant) =>
    set({
      selectedRestaurant: restaurant,
    }),

  setRestaurantResultsOpen: (open) =>
    set({
      restaurantResultsOpen: open,
    }),

  setRadius: (radius) =>
    set({
      radius,
    }),
}));
