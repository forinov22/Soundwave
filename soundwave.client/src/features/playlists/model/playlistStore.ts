import { create } from "zustand";

import type { PlaylistDetails, PlaylistSummary } from "../types";

interface PlaylistState {
  // Список для сайдбара
  playlists: PlaylistSummary[];
  // Кеш открытых плейлистов id → details
  cache: Record<number, PlaylistDetails>;
  // id лайкнутых треков (быстрая проверка без запроса)
  likedTrackIds: Set<number>;

  setPlaylists: (p: PlaylistSummary[]) => void;
  addPlaylist: (p: PlaylistSummary) => void;
  removePlaylist: (id: number) => void;
  updateSummary: (p: PlaylistSummary) => void;

  setPlaylistDetails: (p: PlaylistDetails) => void;
  updatePlaylistDetails: (p: PlaylistDetails) => void;

  setLikedTrackIds: (ids: number[]) => void;
  addLikedTrack: (id: number) => void;
  removeLikedTrack: (id: number) => void;
  isLiked: (id: number) => boolean;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  cache: {},
  likedTrackIds: new Set(),

  setPlaylists: (playlists) => set({ playlists }),

  addPlaylist: (p) =>
    set((s) => ({
      // Любимые треки — всегда первыми
      playlists: p.isLikedSongs ? [p, ...s.playlists] : [...s.playlists, p],
    })),

  removePlaylist: (id) =>
    set((s) => ({
      playlists: s.playlists.filter((p) => p.id !== id),
      cache: Object.fromEntries(
        Object.entries(s.cache).filter(([k]) => Number(k) !== id),
      ),
    })),

  updateSummary: (updated) =>
    set((s) => ({
      playlists: s.playlists.map((p) => (p.id === updated.id ? updated : p)),
    })),

  setPlaylistDetails: (p) => set((s) => ({ cache: { ...s.cache, [p.id]: p } })),

  updatePlaylistDetails: (p) =>
    set((s) => ({
      cache: { ...s.cache, [p.id]: p },
      // Синхронизируем summary в сайдбаре
      playlists: s.playlists.map((pl) =>
        pl.id === p.id
          ? {
              ...pl,
              title: p.title,
              imageUrl: p.imageUrl,
              trackCount: p.tracks.length,
              isPublic: p.isPublic,
            }
          : pl,
      ),
    })),

  setLikedTrackIds: (ids) => set({ likedTrackIds: new Set(ids) }),

  addLikedTrack: (id) =>
    set((s) => ({ likedTrackIds: new Set([...s.likedTrackIds, id]) })),

  removeLikedTrack: (id) =>
    set((s) => {
      const next = new Set(s.likedTrackIds);
      next.delete(id);
      return { likedTrackIds: next };
    }),

  isLiked: (id) => get().likedTrackIds.has(id),
}));
