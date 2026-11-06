"use client";

import { useEffect, useState } from "react";
import { IconHeart, IconShare } from "@tabler/icons-react";
import FavoritesPanel from "@/components/FavoritesPanel";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface HeaderProps {
  onShareSearch: () => void;
}

function Header({ onShareSearch }: HeaderProps) {
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.length);

  useEffect(() => {
    void useFavoritesStore.persist.rehydrate();
  }, []);

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">맛집 랭킹</h1>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={onShareSearch}
            aria-label="지역 검색 공유"
            title="지역 검색 공유"
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition-colors hover:bg-gray-50"
          >
            <IconShare size={22} stroke={1.8} />
            <span className="hidden sm:inline">지역 검색 공유</span>
          </button>
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
        </div>
      </header>
      <FavoritesPanel
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
      />
    </>
  );
}

export default Header;
