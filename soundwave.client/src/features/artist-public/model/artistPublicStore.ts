import { create } from "zustand";

import type { ReleaseDetails } from "@/shared/types/Release";
import type { Track } from "@/shared/types/Track";
import type { ArtistPublicProfile, DiscographyFilter } from "../types";

// Ключ кеша = "artistId:filter" (filter: null|Single|EP|Album)
type CacheKey = string;
const cacheKey = (artistId: number, filter: DiscographyFilter): CacheKey =>
  `${artistId}:${filter ?? "all"}`;

interface DiscographyCache {
  releases: ReleaseDetails[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface ArtistPublicState {
  // Профили артистов: artistId → profile
  profiles: Record<number, ArtistPublicProfile>;

  // Популярные треки: artistId → tracks
  popularTracks: Record<number, Track[]>;

  // Дискография: cacheKey → накопленные страницы
  discography: Record<CacheKey, DiscographyCache>;

  // ── Сеттеры ──────────────────────────────────────────────────────────────

  setProfile: (profile: ArtistPublicProfile) => void;
  setPopularTracks: (artistId: number, tracks: Track[]) => void;

  // Добавляет страницу в кеш (накапливает для infinite scroll)
  appendDiscographyPage: (
    artistId: number,
    filter: DiscographyFilter,
    releases: ReleaseDetails[],
    page: number,
    totalPages: number,
    totalCount: number,
  ) => void;

  // Сбрасывает кеш дискографии для конкретного ключа (при смене фильтра)
  resetDiscography: (artistId: number, filter: DiscographyFilter) => void;

  // ── Геттеры ───────────────────────────────────────────────────────────────

  getProfile: (artistId: number) => ArtistPublicProfile | undefined;
  getPopularTracks: (artistId: number) => Track[] | undefined;
  getDiscography: (
    artistId: number,
    filter: DiscographyFilter,
  ) => DiscographyCache | undefined;
}

export const useArtistPublicStore = create<ArtistPublicState>((set, get) => ({
  profiles: {},
  popularTracks: {},
  discography: {},

  setProfile: (profile) =>
    set((s) => ({
      profiles: { ...s.profiles, [profile.id]: profile },
    })),

  setPopularTracks: (artistId, tracks) =>
    set((s) => ({
      popularTracks: { ...s.popularTracks, [artistId]: tracks },
    })),

  appendDiscographyPage: (
    artistId,
    filter,
    releases,
    page,
    totalPages,
    totalCount,
  ) => {
    const key = cacheKey(artistId, filter);
    set((s) => {
      const existing = s.discography[key];
      return {
        discography: {
          ...s.discography,
          [key]: {
            // Если это первая страница — заменяем; иначе — добавляем
            releases:
              page === 1
                ? releases
                : [...(existing?.releases ?? []), ...releases],
            page,
            totalPages,
            totalCount,
          },
        },
      };
    });
  },

  resetDiscography: (artistId, filter) => {
    const key = cacheKey(artistId, filter);
    set((s) => {
      const next = { ...s.discography };
      delete next[key];
      return { discography: next };
    });
  },

  getProfile: (artistId) => get().profiles[artistId],
  getPopularTracks: (artistId) => get().popularTracks[artistId],
  getDiscography: (artistId, filter) =>
    get().discography[cacheKey(artistId, filter)],
}));
