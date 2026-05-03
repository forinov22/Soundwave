import type { Track } from "@/shared/types/Track";
import type { Release } from "@/shared/types/Release";

export type SearchFilterType =
  | "Все"
  | "Треки"
  | "Альбомы"
  | "Исполнители"
  | "Плейлисты";

// Маппинг фильтра UI → параметр API
export const FILTER_TO_API: Record<SearchFilterType, string | undefined> = {
  Все: undefined,
  Треки: "Tracks",
  Альбомы: "Releases",
  Исполнители: "Artists",
  Плейлисты: "Playlists",
};

export interface SearchTopResult {
  id: number;
  title: string;
  imageUrl: string | null;
  artistName: string;
  type: string; // "Track" | "Release" | "Artist" | "Playlist"
}

export interface SearchArtist {
  id: number;
  name: string;
  avatarUrl: string | null;
}

export interface SearchPlaylist {
  id: number;
  title: string;
  imageUrl: string | null;
  ownerName: string;
}

export interface SearchResult {
  topResult: SearchTopResult | null;
  tracks: Track[];
  releases: Release[];
  artists: SearchArtist[];
  playlists: SearchPlaylist[];
}
