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
    })),
  );

  const currentTrack =
    currentTrackIndex === null ? null : trackList[currentTrackIndex];

  const playTrack = (track: Track) => setTrack(track, true);

  const playAlbum = (tracks: Track[], startIndex: number = 0) => {
    setTrackList(tracks, startIndex);
  };

  const playNext = () => {
    if (trackList.length === 0 || currentTrackIndex === null) return;
    const nextIndex = (currentTrackIndex + 1) % trackList.length;
    setCurrentTrackIndex(nextIndex);
  };

  const playPrevious = () => {
    if (trackList.length === 0 || currentTrackIndex === null) return;
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
  };
}
