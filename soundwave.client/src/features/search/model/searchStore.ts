import { create } from "zustand";
import type { SearchResult, SearchFilterType } from "../types";

// Кеш: "query:filter" → результат
type CacheKey = string;
const cacheKey = (q: string, filter: SearchFilterType): CacheKey =>
  `${q.toLowerCase()}:${filter}`;

interface SearchState {
  cache: Record<CacheKey, SearchResult>;
  setResult: (
    q: string,
    filter: SearchFilterType,
    result: SearchResult,
  ) => void;
  getResult: (q: string, filter: SearchFilterType) => SearchResult | undefined;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  cache: {},

  setResult: (q, filter, result) =>
    set((s) => ({
      cache: { ...s.cache, [cacheKey(q, filter)]: result },
    })),

  getResult: (q, filter) => get().cache[cacheKey(q, filter)],
}));
