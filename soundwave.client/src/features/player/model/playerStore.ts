import { create } from 'zustand';

import type { Track } from '@/shared/types/track';

interface PlyaerState {
    trackList: Track[];
    isPlaying: boolean;
    currentTrackIndex: number | null;
    currentTimeSeconds: number | null;
    setTrack: (track: Track, play?: boolean) => void;
    addTrack: (track: Track) => void;
    togglePlay: () => void;
    setCurrentTime: (mills: number | null) => void; 
};

export const usePlayer = create<PlyaerState>((set, get) => ({
    trackList: [],
    isPlaying: false,
    currentTrackIndex: null,
    currentTimeSeconds: null,
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setTrack: (track, play) => {
        const state = {
            trackList: [track],
            currentTrackIndex: 0,
            isPlaying: get().isPlaying,
        };

        if (play !== undefined) {
            state.isPlaying = play;
        };
        
        set(state);
    },
    addTrack: (track) => {
        const { currentTrackIndex } = get();

        const state = {
            trackList: [...get().trackList, track],
            currentTrackIndex,
        };

        if (currentTrackIndex == null) {
            state.currentTrackIndex = 0;
        }

        set(state);
    },
    setCurrentTime: (seconds) => set(() => ({ currentTimeSeconds: seconds })),
}));
