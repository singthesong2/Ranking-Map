import type { Restaurant, RestaurantCategory } from "@/types/restaurant";

export function isExcludedRestaurant(restaurant: Restaurant) {
  const name = restaurant.displayName.text.toLowerCase();

  return (
    name.includes("스터디카페") ||
    name.includes("스터디 카페") ||
    name.includes("study cafe") ||
    name.includes("study café") ||
    name.includes("독서실")
  );
}

export function classifyRestaurant(restaurant: Restaurant): RestaurantCategory {
  const name = restaurant.displayName.text.toLowerCase();

  if (
    name.includes("샤브") ||
    name.includes("전골") ||
    name.includes("shabu")
  ) {
    return "shabu";
  }

  if (
    name.includes("마라탕") ||
    name.includes("마라샹궈") ||
    name.includes("훠궈") ||
    name.includes("mara") ||
    name.includes("malatang")
  ) {
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

  if (
    name.includes("포차") ||
    name.includes("포장마차") ||
    name.includes("호프") ||
    name.includes("이자카야")
  ) {
    return "bar";
  }

  switch (restaurant.primaryType) {
    case "korean_restaurant":
      return "korean";

    case "chinese_restaurant":
      return "chinese";

    case "japanese_restaurant":
      return "japanese";

    case "western_restaurant":
    case "european_restaurant":
    case "italian_restaurant":
    case "french_restaurant":
    case "american_restaurant":
      return "western";

    case "thai_restaurant":
    case "vietnamese_restaurant":
    case "indonesian_restaurant":
    case "malaysian_restaurant":
    case "filipino_restaurant":
    case "cambodian_restaurant":
    case "burmese_restaurant":
      return "southeastAsian";

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
