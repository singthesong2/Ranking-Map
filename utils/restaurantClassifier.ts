import type { Restaurant, RestaurantCategory } from "@/types/restaurant";

export function classifyRestaurant(restaurant: Restaurant): RestaurantCategory {
  const name = restaurant.displayName.text.toLowerCase();

  if (
    name.includes("샤브") ||
    name.includes("전골") ||
    name.includes("shabu")
  ) {
    return "shabu";
  }

  if (name.includes("마라탕") || name.includes("훠궈")) {
    return "mala";
  }

  if (
    name.includes("치킨") ||
    name.includes("통닭") ||
    name.includes("닭강정")
  ) {
    return "chicken";
  }

  if (
    name.includes("카레") ||
    name.includes("커리") ||
    name.includes("curry")
  ) {
    return "curry";
  }

  if (
    name.includes("삼겹") ||
    name.includes("갈비") ||
    name.includes("족발") ||
    name.includes("보쌈") ||
    name.includes("닭갈비") ||
    name.includes("고기") ||
    name.includes("한우") ||
    name.includes("소고기") ||
    name.includes("돼지고기") ||
    name.includes("곱창") ||
    name.includes("막창") ||
    name.includes("대창")
  ) {
    return "meat";
  }

  switch (restaurant.primaryType) {
    case "korean_restaurant":
      return "korean";

    case "chinese_restaurant":
      return "chinese";

    case "japanese_restaurant":
      return "japanese";

    case "cafe":
    case "coffee_shop":
      return "cafe";

    case "bar":
    case "pub":
    case "cocktail_bar":
    case "wine_bar":
      return "bar";

    default:
      return "all";
  }
}
