import { useRef, useState, useEffect } from "react";

import { usePlayerPlayback } from "../lib/usePlayerPlayback";
import { usePlayerTime } from "../lib/usePlayerTime";
import PlaybackControls from "./PlaybackControls";

function Player() {
  const {
    currentTrack: track,
    isPlaying,
    playNext,
  } = usePlayerPlayback();

  const {
    currentTimeSeconds,
    lastSeekTime, // Достаем сигнал перемотки
    setCurrentTime,
  } = usePlayerTime();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [volume, setVolume] = useState(70);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (!track) return;

    if (isPlaying) {
      audioRef.current?.play();
      return;
    }

    audioRef.current?.pause();
  }, [isPlaying, track]);

  useEffect(() => {
    if (lastSeekTime !== null && audioRef.current) {
      audioRef.current.currentTime = lastSeekTime;
      // Важно: после выполнения перемотки, сигнал можно не обнулять, 
      // так как useEffect сработает только при изменении значения
    }
  }, [lastSeekTime]);

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
        volume={volume}
        onVolumeChange={setVolume}
      />

      <audio
        ref={audioRef}
        src={track?.audioUrl}
        onLoadedMetadata={handleLoadedMeta}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      >
        <track kind="captions" />
      </audio>
    </>
  );
}

export default Player;
