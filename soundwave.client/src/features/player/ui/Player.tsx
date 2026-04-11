import { useRef, useState, useEffect } from "react";

import { usePlayerPlayback } from "../lib/usePlayerPlayback";
import PlaybackControls from "./PlaybackControls";

function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const {
    currentTrack: track,
    isPlaying,
    currentTimeSeconds,
    setCurrentTime,
  } = usePlayerPlayback();

  useEffect(() => {
    if (!track) return;

    if (isPlaying) {
      audioRef.current?.play();
      return;
    }

    audioRef.current?.pause();
  }, [isPlaying, track]);

  const handleLoadedMeta = () => {
    setDurationSeconds(audioRef.current?.duration ?? 0);
  };

  const handleTimeUpdate = (
    e: React.SyntheticEvent<HTMLAudioElement, Event>,
  ) => {
    const target = e.target as HTMLAudioElement;
    setCurrentTime(target.currentTime);
  };

  return (
    <>
      <PlaybackControls
        isPlaying={isPlaying}
        currentTime={currentTimeSeconds ?? 0}
        duration={durationSeconds}
        track={track}
      />

      <audio
        ref={audioRef}
        src={track?.file}
        onLoadedMetadata={handleLoadedMeta}
        onTimeUpdate={handleTimeUpdate}
      >
        <track kind="captions" />
      </audio>
    </>
  );
}

export default Player;
