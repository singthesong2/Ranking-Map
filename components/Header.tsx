"use client";

import { useEffect, useState } from "react";
import { IconHeart } from "@tabler/icons-react";
import FavoritesPanel from "@/components/FavoritesPanel";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

function Header() {
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  useEffect(() => {
    void useFavoritesStore.persist.rehydrate();
  }, []);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">맛집 랭킹</h1>
        <button
          type="button"
          onClick={() => setFavoritesOpen(true)}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 hover:bg-gray-50"
          aria-label={`찜 목록 열기, ${favoriteCount}개`}
        >
          <IconHeart size={22} />
          <span className="hidden sm:inline">찜 목록</span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
            {favoriteCount}
          </span>
        </button>
      </header>
      <FavoritesPanel
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />
    </>
  );
}

export default Header;
