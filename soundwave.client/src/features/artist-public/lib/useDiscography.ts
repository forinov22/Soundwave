import { useState, useEffect, useCallback } from "react";

import { useAsync } from "@/shared/hooks/useAsync";
import type { ReleaseDetails } from "@/shared/types/Release";

import { artistPublicApi } from "../api/artistPublicApi";
import type {
  DiscographyFilter,
  DiscographySortDir,
  DiscographySortField,
} from "../types";

const PAGE_SIZE = 10;

interface UseDiscographyReturn {
  releases: ReleaseDetails[];
  totalPages: number;
  totalCount: number;
  page: number;
  isLoading: boolean;
  error: string | null;

  filter: DiscographyFilter;
  setFilter: (f: DiscographyFilter) => void;

  sortField: DiscographySortField;
  setSortField: (f: DiscographySortField) => void;

  sortDir: DiscographySortDir;
  toggleSortDir: () => void;

  loadMore: () => void;
  hasMore: boolean;
}

// Загружает релизы артиста с пагинацией, фильтром и сортировкой.
// Сортировка по имени делается на клиенте — бэк сортирует только по дате.
// Это нормально: страниц обычно немного, и клиентская сортировка достаточна.
export function useDiscography(artistId: number): UseDiscographyReturn {
  const [releases, setReleases] = useState<ReleaseDetails[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<DiscographyFilter>(null);
  const [sortField, setSortField] = useState<DiscographySortField>("date");
  const [sortDir, setSortDir] = useState<DiscographySortDir>("desc");

  const { execute, isLoading, error } = useAsync(
    async (artistId: number, filter: DiscographyFilter, page: number) => {
      const res = await artistPublicApi.getReleases(artistId, {
        type: filter,
        page,
        pageSize: PAGE_SIZE,
      });
      return res.data;
    },
  );

  const load = useCallback(
    async (targetPage: number, reset: boolean) => {
      const data = await execute(artistId, filter, targetPage);
      if (!data) return;

      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
      setReleases((prev) => (reset ? data.items : [...prev, ...data.items]));
      setPage(targetPage);
    },
    [artistId, filter, execute],
  );

  // При смене артиста или фильтра — сброс и загрузка с первой страницы
  useEffect(() => {
    load(1, true);
  }, [artistId, filter, load]);

  const setFilterState = useCallback((f: DiscographyFilter) => {
    setFilter(f);
    setPage(1);
  }, []);

  const toggleSortDir = useCallback(() => {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      load(page + 1, false);
    }
  }, [page, totalPages, isLoading, load]);

  // Клиентская сортировка поверх загруженных данных
  const sorted = [...releases].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") {
      cmp = a.title.localeCompare(b.title, "ru");
    } else {
      const da = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const db = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      cmp = da - db;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  return {
    releases: sorted,
    totalPages,
    totalCount,
    page,
    isLoading,
    error,
    filter,
    setFilter: setFilterState,
    sortField,
    setSortField,
    sortDir,
    toggleSortDir,
    loadMore,
    hasMore: page < totalPages,
  };
}
