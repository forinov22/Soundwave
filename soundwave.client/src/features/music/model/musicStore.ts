import { create } from 'zustand';

import type { Track, Album } from '../types';

interface MusicState {
    trendingTracks: Track[];
    popularAlbums: Album[];
    setTrendingTracks: (tracks: Track[]) => void;
    setPopularAlbums: (albums: Album[]) => void;
}

export const useMusicStore = create<MusicState>((set) => ({
    trendingTracks: [],
    popularAlbums: [],
    setTrendingTracks: (trendingTracks) => set({ trendingTracks }),
    setPopularAlbums: (popularAlbums) => set({ popularAlbums }),
}));
