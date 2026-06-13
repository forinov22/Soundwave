import { useShallow } from "zustand/react/shallow";

import type { Track } from "@/features/music/types";

import { usePlayer } from "../model/playerStore";

export function usePlayerPlayback() {
  const {
    trackList,
    currentTrackIndex,
    isPlaying,
    togglePlay,
    setTrack,
    setTrackList,
    setCurrentTrackIndex,
    seek,
    reorderTrackList,
    removeTrack,
    shuffleMode,
    repeatMode,
    shuffledIndices,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer(
    useShallow((state) => ({
      trackList: state.trackList,
      currentTrackIndex: state.currentTrackIndex,
      isPlaying: state.isPlaying,
      togglePlay: state.togglePlay,
      setTrack: state.setTrack,
      setTrackList: state.setTrackList,
      setCurrentTrackIndex: state.setCurrentTrackIndex,
      seek: state.seek,
      reorderTrackList: state.reorderTrackList,
      removeTrack: state.removeTrack,
      shuffleMode: state.shuffleMode,
      repeatMode: state.repeatMode,
      shuffledIndices: state.shuffledIndices,
      toggleShuffle: state.toggleShuffle,
      cycleRepeat: state.cycleRepeat,
    })),
  );

  const currentTrack =
    currentTrackIndex === null ? null : trackList[currentTrackIndex];

  const playTrack = (track: Track) => setTrack(track, true);

  const playAlbum = (tracks: Track[], startIndex: number = 0) => {
    setTrackList(tracks, startIndex);
  };

  const playShuffle = (tracks: Track[]) => {
    const randomStart = Math.floor(Math.random() * tracks.length);
    setTrackList(tracks, randomStart);
    if (!shuffleMode) toggleShuffle();
  };

  const playNext = () => {
    if (trackList.length === 0 || currentTrackIndex === null) return;

    if (shuffleMode && shuffledIndices.length > 0) {
      const pos = shuffledIndices.indexOf(currentTrackIndex);
      const nextPos = pos + 1;
      if (nextPos >= shuffledIndices.length) {
        if (repeatMode === "none") return;
        setCurrentTrackIndex(shuffledIndices[0]);
      } else {
        setCurrentTrackIndex(shuffledIndices[nextPos]);
      }
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    if (nextIndex >= trackList.length) {
      if (repeatMode === "none") return;
      setCurrentTrackIndex(0);
    } else {
      setCurrentTrackIndex(nextIndex);
    }
  };

  const playPrevious = () => {
    if (trackList.length === 0 || currentTrackIndex === null) return;

    if (shuffleMode && shuffledIndices.length > 0) {
      const pos = shuffledIndices.indexOf(currentTrackIndex);
      const prevPos = pos - 1;
      if (prevPos < 0) {
        setCurrentTrackIndex(
          shuffledIndices[shuffledIndices.length - 1],
        );
      } else {
        setCurrentTrackIndex(shuffledIndices[prevPos]);
      }
      return;
    }

    const prevIndex =
      (currentTrackIndex - 1 + trackList.length) % trackList.length;
    setCurrentTrackIndex(prevIndex);
  };

  const moveTrack = (startIndex: number, endIndex: number) => {
    reorderTrackList(startIndex, endIndex);
  };

  const removeFromQueue = (index: number) => {
    removeTrack(index);
  };

  const playFromQueue = (index: number) => {
    setCurrentTrackIndex(index);
  };

  return {
    trackList,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    togglePlay,
    seek,
    playTrack,
    playAlbum,
    playNext,
    playPrevious,
    moveTrack,
    removeFromQueue,
    playFromQueue,
    hasTracks: trackList.length > 0,
    shuffleMode,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    playShuffle,
  };
}
