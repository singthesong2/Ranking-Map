import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  savedSearchHistorySchema,
  type NewSearchHistory,
  type SearchHistoryItem,
} from "@/schemas/searchHistorySchema";

const MAX_SEARCH_HISTORY = 20;

interface SearchHistoryStore {
  history: SearchHistoryItem[];
  addHistory: (entry: NewSearchHistory) => void;
  removeHistory: (id: string) => void;
  clearHistoryByMode: (mode: SearchHistoryItem["kind"]) => void;
  clearHistory: () => void;
}

function makeHistoryId(entry: NewSearchHistory): string {
  if (entry.kind === "region")
    return `region:${entry.latitude.toFixed(6)}:${entry.longitude.toFixed(6)}`;

  return `restaurant:${entry.label.trim().toLocaleLowerCase()}:${entry.latitude.toFixed(6)}:${entry.longitude.toFixed(6)}:${entry.radius}`;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistory: (entry) =>
        set((state) => {
          const label = entry.label.trim();

          if (!label) return state;

          const normalizedEntry = {
            ...entry,
            label,
          };
          const id = makeHistoryId(normalizedEntry);
          const item: SearchHistoryItem = {
            ...normalizedEntry,
            id,
            searchedAt: Date.now(),
          };

          return {
            history: [
              item,
              ...state.history.filter((saved) => saved.id !== id),
            ].slice(0, MAX_SEARCH_HISTORY),
          };
        }),
      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),
      clearHistoryByMode: (mode) =>
        set((state) => ({
          history: state.history.filter((item) => item.kind !== mode),
        })),
      clearHistory: () =>
        set({
          history: [],
        }),
    }),
    {
      name: "restaurant-search-history",
      partialize: (state) => ({
        history: state.history,
      }),
      skipHydration: true,
      merge: (persistedState, currentState) => {
        const parsed = savedSearchHistorySchema.safeParse(persistedState);
        return {
          ...currentState,
          history: parsed.success ? parsed.data.history : [],
        };
      },
    },
  ),
);
