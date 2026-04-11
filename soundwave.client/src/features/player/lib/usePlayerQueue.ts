import type { Track } from "@/shared/types/track";

import { usePlayer } from "../model/playerStore";

export function usePlayerQueue() {
  const { setTrack, addTrack, trackList, currentTrackIndex } = usePlayer();

  const playTrack = (track: Track) => {
    setTrack(track, true);
  };

  return {
    trackList,
    currentTrackIndex,
    setTrack,
    addTrack,
    playTrack,
  };
}
