import { create } from "zustand";

import type { Track } from "@/shared/types/Track";
import type { Release } from "@/shared/types/Release";

interface MusicState {
  trendingTracks: Track[];
  popularReleases: Release[];
  setTrendingTracks: (tracks: Track[]) => void;
  setPopularReleases: (releases: Release[]) => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  trendingTracks: [],
  popularReleases: [],
  setTrendingTracks: (trendingTracks) => set({ trendingTracks }),
  setPopularReleases: (popularReleases) => set({ popularReleases }),
}));
