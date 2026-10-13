"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SearchBox from "@/components/SearchBox";
import CategoryFilter from "@/components/CategoryFilter";
import MapSection from "@/components/MapSection";
import RankingList from "@/components/RankingList";
import type { RestaurantCategory } from "@/types/restaurant";

function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<RestaurantCategory>("all");

  return (
    <main className="min-h-screen bg-white text-black">
      <Header />
      <SearchBox />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
      />
      <MapSection selectedCategory={selectedCategory} />
      <RankingList />
    </main>
  );
}

export default Home;
