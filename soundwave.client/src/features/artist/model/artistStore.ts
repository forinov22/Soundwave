import { create } from "zustand";

import type { Track } from "@/shared/types/Track";
import type { ArtistAlbum } from "../types/ArtistAlbum";

interface ArtistState {
  tracks: Track[];
  albums: ArtistAlbum[];

  setTracks: (tracks: Track[]) => void;
  setAlbums: (albums: ArtistAlbum[]) => void;

  // Оптимистичные обновления — добавляем сразу после успешного API-вызова
  addTrack: (track: Track) => void;
  addAlbum: (album: ArtistAlbum) => void;
  removeTrack: (trackId: number) => void;
  removeAlbum: (albumId: number) => void;
}

export const useArtistStore = create<ArtistState>((set) => ({
  tracks: [],
  albums: [],

  setTracks: (tracks) => set({ tracks }),
  setAlbums: (albums) => set({ albums }),

  addTrack: (track) => set((s) => ({ tracks: [track, ...s.tracks] })),
  addAlbum: (album) => set((s) => ({ albums: [album, ...s.albums] })),
  removeTrack: (id) =>
    set((s) => ({ tracks: s.tracks.filter((t) => t.id !== id) })),
  removeAlbum: (id) =>
    set((s) => ({ albums: s.albums.filter((a) => a.id !== id) })),
}));
