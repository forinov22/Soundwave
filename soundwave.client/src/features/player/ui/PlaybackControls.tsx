import {
  // Laptop2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  ListMusic,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Track } from "@/features/music/types";
import { formatDuration } from "@/shared/lib/formatDuration";

import { usePlayerPlayback } from "../lib/usePlayerPlayback";
import { useRightSidebar } from "@/features/sidebar/lib/useRightSidebar";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track: Track | null;
  volume: number;
  onVolumeChange: (value: number) => void;
}

function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  track,
  volume,
  onVolumeChange,
}: Readonly<PlaybackControlsProps>) {
  const {
    trackList,
    togglePlay,
    seek,
    playNext,
    playPrevious,
  } = usePlayerPlayback();
  const { toggle } = useRightSidebar();

  return (
    <footer className="h-24 px-4 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 sticky bottom-0 z-50">
      <div className="h-full flex items-center justify-between max-w-450 mx-auto">
        {/* Информация о треке */}
        <div className="flex items-center gap-4 min-w-45 w-[30%]">
          {track ? (
            <>
              <div className="relative group">
                <img
                  src={track.imageUrl}
                  alt={track.title}
                  className="size-14 object-cover rounded-lg shadow-2xl border border-white/10"
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
                  {track.title}
                </span>
                <span className="text-xs text-zinc-400 truncate hover:text-zinc-200 cursor-pointer">
                  {track.artistName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
              >
                <Heart className="size-4" />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4 opacity-20">
              <div className="size-14 bg-zinc-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-2 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
          )}
        </div>

        {/* Управление воспроизведением */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%]">
          <div className="flex items-center gap-4 md:gap-6">
            <Button
              size="icon"
              variant="ghost"
              className="hidden md:flex text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
            >
              <Shuffle className="size-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={playPrevious}
              disabled={trackList.length <= 1}
              className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
            >
              <SkipBack className="size-5 fill-current" />
            </Button>

            <Button
              onClick={togglePlay}
              disabled={!track}
              className="size-10 rounded-full bg-white hover:bg-emerald-400 text-black transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={playNext}
              disabled={trackList.length <= 1}
              className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
            >
              <SkipForward className="size-5 fill-current" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="hidden md:flex text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
            >
              <Repeat className="size-4" />
            </Button>
          </div>

          {/* Слайдер прогресса */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-medium text-zinc-500 min-w-8.75 text-right">
              {formatDuration(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(val) => seek(val[0])} // Теперь это реально передвинет ползунок в audio
              className="w-full"
            />
            <span className="text-[10px] font-medium text-zinc-500 min-w-8.75">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Доп. контролы (громкость и очередь) */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[30%]">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => toggle("queue")} // Теперь открывает очередь
            className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <ListMusic className="size-4" />
          </Button>
          <div className="flex items-center gap-2 group">
            <Volume2 className="size-4 text-zinc-400 group-hover:text-emerald-500" />
            <Slider
              defaultValue={[volume]}
              max={100}
              step={1}
              onValueChange={(val) => onVolumeChange(val[0])}
              className="w-24 transition-all"
            />
          </div>
          {/* <Button
            size="icon"
            variant="ghost"
            className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
          >
            <Laptop2 className="size-4" />
          </Button> */}
        </div>
      </div>
    </footer>
  );
}

export default PlaybackControls;
