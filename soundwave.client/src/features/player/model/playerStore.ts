import { create } from "zustand";

import type { Track } from "@/features/music/types";

export type RepeatMode = "none" | "all" | "one";

function buildShuffled(length: number, currentIndex: number): number[] {
  const rest = Array.from({ length }, (_, i) => i).filter(
    (i) => i !== currentIndex,
  );
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [currentIndex, ...rest];
}

interface PlayerState {
  trackList: Track[];
  isPlaying: boolean;
  currentTrackIndex: number | null;
  currentTimeSeconds: number;
  lastSeekTime: number | null;

  shuffleMode: boolean;
  repeatMode: RepeatMode;
  shuffledIndices: number[];

  setTrack: (track: Track, play?: boolean) => void;
  setTrackList: (tracks: Track[], index?: number) => void;

  setCurrentTrackIndex: (index: number) => void;
  addTrack: (track: Track) => void;

  togglePlay: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

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

  shuffleMode: false,
  repeatMode: "none",
  shuffledIndices: [],

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleShuffle: () => {
    const { shuffleMode, trackList, currentTrackIndex } = get();
    if (!shuffleMode && trackList.length > 0 && currentTrackIndex !== null) {
      set({
        shuffleMode: true,
        shuffledIndices: buildShuffled(trackList.length, currentTrackIndex),
      });
    } else {
      set({ shuffleMode: false, shuffledIndices: [] });
    }
  },

  cycleRepeat: () => {
    const { repeatMode } = get();
    const next: RepeatMode =
      repeatMode === "none" ? "all" : repeatMode === "all" ? "one" : "none";
    set({ repeatMode: next });
  },

  setCurrentTrackIndex: (index) => {
    const { trackList } = get();
    if (index >= 0 && index < trackList.length) {
      set({
        currentTrackIndex: index,
        isPlaying: true,
        currentTimeSeconds: 0,
      });
    }
  },

  setTrack: (track, play) => {
    set({
      trackList: [track],
      currentTrackIndex: 0,
      currentTimeSeconds: 0,
      isPlaying: play ?? get().isPlaying,
      shuffledIndices: get().shuffleMode ? buildShuffled(1, 0) : [],
    });
  },

  setTrackList: (tracks, index = 0) => {
    const { shuffleMode } = get();
    set({
      trackList: tracks,
      currentTrackIndex: index,
      currentTimeSeconds: 0,
      isPlaying: true,
      shuffledIndices: shuffleMode ? buildShuffled(tracks.length, index) : [],
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
