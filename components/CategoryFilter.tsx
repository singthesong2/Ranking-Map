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
    <section className="flex flex-nowrap gap-2 overflow-x-auto overscroll-x-contain p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:gap-2.5 lg:p-0">
      <h2 className="hidden w-full pb-1 text-sm font-semibold text-[#514649] lg:block">
        음식 종류
      </h2>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onChangeCategory(category.value)}
          className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B5616E] lg:border lg:px-3.5 lg:py-2 lg:text-sm lg:font-medium ${
            selectedCategory === category.value
              ? "bg-[#B5616E] text-white lg:border-[#B5616E]"
              : "bg-[#F8EFF0] text-[#685D60] hover:bg-[#F3E1E5] lg:border-[#EFE7E7] lg:hover:border-[#D7BABE]"
          }`}
        >
          {category.label}
        </button>
      ))}
    </section>
  );
}

export default CategoryFilter;
