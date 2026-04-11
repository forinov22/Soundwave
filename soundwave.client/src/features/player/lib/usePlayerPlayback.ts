import { usePlayer } from "../model/playerStore";

export function usePlayerPlayback() {
  const {
    trackList,
    currentTrackIndex,
    isPlaying,
    currentTimeSeconds,
    togglePlay,
    setCurrentTime,
  } = usePlayer();

  const currentTrack =
    currentTrackIndex === null ? null : trackList[currentTrackIndex];

  return {
    currentTrack,
    isPlaying,
    currentTimeSeconds,
    togglePlay,
    setCurrentTime,
  };
}
