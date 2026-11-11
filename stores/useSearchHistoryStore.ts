import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  savedSearchHistorySchema,
  type NewSearchHistory,
  type SearchHistoryItem,
} from "@/schemas/searchHistorySchema";

const MAX_SEARCH_HISTORY = 20;

type SearchKind = SearchHistoryItem["kind"];

interface SearchHistoryStore {
  history: SearchHistoryItem[];
  addHistory: (entry: NewSearchHistory) => void;
  removeHistory: (id: string) => void;
  clearHistoryByMode: (mode: SearchHistoryItem["kind"]) => void;
  clearHistory: () => void;
}

function makeHistoryId(entry: NewSearchHistory | SearchHistoryItem): string {
  if (entry.kind === "region")
    return `region:${entry.latitude.toFixed(6)}:${entry.longitude.toFixed(6)}`;

  return `restaurant:${entry.label.trim().toLocaleLowerCase()}`;
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
              ...state.history.filter((saved) => makeHistoryId(saved) !== id),
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

        if (!parsed.success) return { ...currentState, history: [] };

        const seen = new Set<string>();
        const history = parsed.data.history
          .map((item) => ({
            ...item,
            id: makeHistoryId(item),
          }))
          .filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });

        return {
          ...currentState,
          history,
        };
      },
    },
  ),
);
