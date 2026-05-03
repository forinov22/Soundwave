import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";

import { useAsync } from "@/shared/hooks/useAsync";
import { searchApi } from "../api/searchApi";
import { useSearchStore } from "../model/searchStore";
import {
  FILTER_TO_API,
  type SearchFilterType,
  type SearchResult,
} from "../types";

const DEBOUNCE_MS = 350;

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  filter: SearchFilterType;
  setFilter: (f: SearchFilterType) => void;
  result: SearchResult | null;
  isLoading: boolean;
  isEmpty: boolean; // true когда query пустой
}

export function useSearch(): UseSearchReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const store = useSearchStore();

  // query и filter берём из URL — источник истины
  const query = searchParams.get("q") ?? "";
  const filterParam = (searchParams.get("filter") as SearchFilterType) ?? "Все";
  const [filter, setFilterState] = useState<SearchFilterType>(filterParam);

  const { execute, isLoading } = useAsync(
    async (q: string, f: SearchFilterType) => {
      const apiType = FILTER_TO_API[f];
      const res = await searchApi.search(q, apiType);
      store.setResult(q, f, res.data);
      return res.data;
    },
  );

  // Debounce + кеш: если результат уже есть — не запрашиваем
  useEffect(() => {
    if (!query.trim()) return;

    const cached = store.getResult(query, filter);
    if (cached) return;

    const timer = setTimeout(() => {
      execute(query, filter);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, filter]);

  // При смене фильтра сразу ищем (без debounce)
  const setFilter = useCallback(
    (f: SearchFilterType) => {
      setFilterState(f);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("filter", f);
        return next;
      });

      if (query.trim()) {
        const cached = store.getResult(query, f);
        if (!cached) execute(query, f);
      }
    },
    [query, execute, store, setSearchParams],
  );

  const setQuery = useCallback(
    (q: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (q) next.set("q", q);
        else next.delete("q");
        return next;
      });
    },
    [setSearchParams],
  );

  const result = query.trim() ? (store.getResult(query, filter) ?? null) : null;

  return {
    query,
    setQuery,
    filter,
    setFilter,
    result,
    isLoading: isLoading && !result,
    isEmpty: !query.trim(),
  };
}
