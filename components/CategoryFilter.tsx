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
  { label: "버거", value: "burger" },
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
    <section className="flex flex-wrap gap-2 p-4 lg:gap-2.5 lg:p-0">
      <h2 className="hidden w-full pb-1 text-sm font-semibold text-[#514649] lg:block">
        음식 종류
      </h2>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChangeCategory(category.value)}
          className={`rounded-full px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E] lg:border lg:px-3.5 lg:py-2 lg:text-sm lg:font-medium ${
            selectedCategory === category.value
              ? "bg-blue-600 text-white lg:border-[#B5616E] lg:bg-[#B5616E] lg:text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 lg:border-[#EFE7E7] lg:bg-[#F8F5F4] lg:text-[#685D60] lg:hover:border-[#D7BABE] lg:hover:bg-[#F5ECEE]"
          }`}
        >
          {category.label}
        </button>
      ))}
    </section>
  );
}

export default CategoryFilter;
