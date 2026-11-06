"use client";

import {
  IconHistory,
  IconMapPin,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useNow, formatRelativeTime } from "@/hooks/useRelativeTime";
import { useSearchHistoryStore } from "@/stores/useSearchHistoryStore";
import type { SearchHistoryItem } from "@/schemas/searchHistorySchema";

type SearchMode = SearchHistoryItem["kind"];

interface SearchHistoryListProps {
  mode: SearchMode;
  onSelect: (item: SearchHistoryItem) => void;
  onRequestClearAll: () => void;
}

interface SearchHistoryRowProps {
  item: SearchHistoryItem;
  now: number;
  onSelect: (item: SearchHistoryItem) => void;
  onRemove: (id: string) => void;
}

function SearchHistoryRow({
  item,
  now,
  onSelect,
  onRemove,
}: SearchHistoryRowProps) {
  const handleSelect = () => {
    onSelect(item);
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  return (
    <li className="flex items-center gap-2 rounded-lg hover:bg-gray-50">
      <button
        type="button"
        onClick={handleSelect}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
        aria-label={`${item.label}, ${formatRelativeTime(item.searchedAt, now)} 검색 다시 하기`}
      >
        {item.kind === "region" ? (
          <IconMapPin size={19} className="shrink-0 text-gray-500" />
        ) : (
          <IconSearch size={19} className="shrink-0 text-gray-500" />
        )}

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
          {item.label}
        </span>

        <time
          dateTime={new Date(item.searchedAt).toISOString()}
          className="shrink-0 text-xs text-gray-500"
        >
          {formatRelativeTime(item.searchedAt, now)}
        </time>
      </button>

      <button
        type="button"
        onClick={handleRemove}
        aria-label={`${item.label} 검색 기록 삭제`}
        title="기록 삭제"
        className="mr-2 shrink-0 rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
      >
        <IconX size={16} />
      </button>
    </li>
  );
}

export default function SearchHistoryList({
  mode,
  onSelect,
  onRequestClearAll,
}: SearchHistoryListProps) {
  const history = useSearchHistoryStore((state) => state.history);
  const removeHistory = useSearchHistoryStore((state) => state.removeHistory);
  const now = useNow();
  const filteredHistory = history.filter((item) => item.kind === mode);

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          <IconHistory size={19} />

          <span>최근 {mode === "region" ? "지역" : "음식점"} 검색</span>
        </div>
        {filteredHistory.length > 0 && (
          <button
            type="button"
            onClick={onRequestClearAll}
            className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            title="지역·음식점 검색 기록 모두 삭제"
          >
            <IconTrash size={15} />
            전체 삭제
          </button>
        )}
      </div>
      {filteredHistory.length === 0 ? (
        <p className="px-3 py-4 text-sm text-gray-500">
          저장된 {mode === "region" ? "지역" : "음식점"} 검색 기록이 없어요.
        </p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {filteredHistory.map((item) => (
            <SearchHistoryRow
              key={item.id}
              item={item}
              now={now}
              onSelect={onSelect}
              onRemove={removeHistory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
