import { create } from "zustand";

import type { ArtistDetails } from "@/features/music/types";

import type { SidebarView } from "../types";

interface SidebarState {
  view: SidebarView;
  artistDetails: ArtistDetails | null;

  artistCache: Map<string, ArtistDetails>;

  setView: (view: SidebarView) => void;
  setArtistDetails: (details: ArtistDetails | null) => void;
  addToCache: (details: ArtistDetails) => void;
}

const MAX_CACHE_SIZE = 20;

export const useSidebarStore = create<SidebarState>((set, get) => ({
  view: null,
  artistDetails: null,
  artistCache: new Map(),

  setView: (view) => set({ view }),

  setArtistDetails: (details) => set({ artistDetails: details }),

  addToCache: (details) => {
    const cache = new Map(get().artistCache);

    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) cache.delete(firstKey);
    }

    cache.set(String(details.id), details);
    set({ artistCache: cache });
  },
}));
