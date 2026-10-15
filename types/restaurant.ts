export type RestaurantCategory =
  | "all"
  | "korean"
  | "chinese"
  | "japanese"
  | "western"
  | "meat"
  | "shabu"
  | "mala"
  | "chicken"
  | "curry"
  | "southeastAsian"
  | "cafe"
  | "bar";

export interface Restaurant {
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  primaryType?: string;
  googleMapsUri?: string;
}

export type RestaurantSort = "recommended" | "rating" | "reviews" | "distance";
