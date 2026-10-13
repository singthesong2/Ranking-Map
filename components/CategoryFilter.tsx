"use client";

import type { RestaurantCategory } from "@/types/restaurant";

interface CategoryFilterProps {
  selectedCategory: RestaurantCategory;
  onChangeCategory: (category: RestaurantCategory) => void;
}

const categories: {
  label: string;
  value: RestaurantCategory;
}[] = [
  { label: "전체", value: "all" },
  { label: "한식", value: "korean" },
  { label: "중식", value: "chinese" },
  { label: "일식", value: "japanese" },
  { label: "양식", value: "western" },
  { label: "고기", value: "meat" },
  { label: "샤브샤브", value: "shabu" },
  { label: "마라탕", value: "mala" },
  { label: "치킨", value: "chicken" },
  { label: "커리", value: "curry" },
  { label: "동남아", value: "southeastAsian" },
  { label: "카페", value: "cafe" },
  { label: "술집", value: "bar" },
];

function CategoryFilter({
  selectedCategory,
  onChangeCategory,
}: CategoryFilterProps) {
  return (
    <section className="flex flex-wrap gap-2 p-4">
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChangeCategory(category.value)}
          className={`rounded-full px-4 py-2 ${
            selectedCategory === category.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {category.label}
        </button>
      ))}
    </section>
  );
}

export default CategoryFilter;
