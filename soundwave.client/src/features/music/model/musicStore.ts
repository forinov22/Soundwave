import { create } from "zustand";

import type { Track } from "@/shared/types/Track";
import type { Release } from "@/shared/types/Release";
import type { ArtistPublicProfile } from "@/features/artist-public/types";
import type { PlaylistSummary } from "@/features/playlists/types";

interface MusicState {
  trendingTracks: Track[];
  popularReleases: Release[];
  popularArtists: ArtistPublicProfile[];
  popularPlaylists: PlaylistSummary[];
  setTrendingTracks: (tracks: Track[]) => void;
  setPopularReleases: (releases: Release[]) => void;
  setPopularArtists: (artists: ArtistPublicProfile[]) => void;
  setPopularPlaylists: (playlists: PlaylistSummary[]) => void;
}

export const useMusicStore = create<MusicState>((set) => ({
  trendingTracks: [],
  popularReleases: [],
  popularArtists: [],
  popularPlaylists: [],
  setTrendingTracks: (trendingTracks) => set({ trendingTracks }),
  setPopularReleases: (popularReleases) => set({ popularReleases }),
  setPopularArtists: (popularArtists) => set({ popularArtists }),
  setPopularPlaylists: (popularPlaylists) => set({ popularPlaylists }),
}));
