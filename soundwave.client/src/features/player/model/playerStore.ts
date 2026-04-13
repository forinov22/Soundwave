import { create } from "zustand";

import type { Track } from "@/features/music/types";

interface PlayerState {
  trackList: Track[];
  isPlaying: boolean;
  currentTrackIndex: number | null;
  currentTimeSeconds: number;
  lastSeekTime: number | null;

  setTrack: (track: Track, play?: boolean) => void;
  setTrackList: (tracks: Track[], index?: number) => void;
  
  setCurrentTrackIndex: (index: number) => void;
  addTrack: (track: Track) => void;

  togglePlay: () => void;

  setCurrentTime: (seconds: number | null) => void;
  seek: (time: number) => void;

  reorderTrackList: (startIndex: number, endIndex: number) => void;
  removeTrack: (index: number) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  trackList: [],
  isPlaying: false,
  currentTrackIndex: null,
  currentTimeSeconds: 0,
  lastSeekTime: null,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setCurrentTrackIndex: (index) => {
    const { trackList } = get();
    if (index >= 0 && index < trackList.length) {
      set({
        currentTrackIndex: index,
        isPlaying: true,
        currentTimeSeconds: 0, // Сбрасываем время при смене трека
      });
    }
  },

  setTrack: (track, play) => {
    set({
      trackList: [track],
      currentTrackIndex: 0,
      currentTimeSeconds: 0,
      isPlaying: play ?? get().isPlaying,
    });
  },

  setTrackList: (tracks, index = 0) => {
    set({
      trackList: tracks,
      currentTrackIndex: index,
      currentTimeSeconds: 0,
      isPlaying: true,
    });
  },

  addTrack: (track) => {
    const { trackList, currentTrackIndex } = get();
    set({
      trackList: [...trackList, track],
      currentTrackIndex: currentTrackIndex ?? 0,
    });
  },

  seek: (time) => set({ lastSeekTime: time, currentTimeSeconds: time }),
  setCurrentTime: (seconds) => set({ currentTimeSeconds: seconds ?? 0 }),

  reorderTrackList: (startIndex: number, endIndex: number) => {
    const { trackList, currentTrackIndex } = get();
    const newTrackList = [...trackList];
    const [movedTrack] = newTrackList.splice(startIndex, 1);
    newTrackList.splice(endIndex, 0, movedTrack);

    let newIndex = currentTrackIndex;
    if (currentTrackIndex !== null) {
      newIndex = newIndex as number;
      if (startIndex === currentTrackIndex) newIndex = endIndex;
      else if (startIndex < currentTrackIndex && endIndex >= currentTrackIndex)
        newIndex--;
      else if (startIndex > currentTrackIndex && endIndex <= currentTrackIndex)
        newIndex++;
    }
    set({ trackList: newTrackList, currentTrackIndex: newIndex });
  },
  removeTrack: (index: number) => {
    const { trackList, currentTrackIndex } = get();
    const newTrackList = trackList.filter((_, i) => i !== index);
    let newIndex = currentTrackIndex;
    if (currentTrackIndex !== null) {
      newIndex = newIndex as number;
      if (index === currentTrackIndex) {
        newIndex =
          index < newTrackList.length
            ? index
            : newTrackList.length > 0
              ? 0
              : null;
      } else if (index < currentTrackIndex) {
        newIndex--;
      }
    }
    set({ trackList: newTrackList, currentTrackIndex: newIndex });
  },
}));
