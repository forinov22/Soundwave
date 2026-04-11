import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Track } from "@/shared/types/track";
import {
  Laptop2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
} from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track: Track | null;
}

const formatDuration = (secs: number | null) => {
  if (!secs) return "0:00";

  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

function PlaybackControls({
  isPlaying,
  currentTime,
  duration,
  track,
}: Readonly<PlaybackControlsProps>) {
  return (
    <footer className="h-[10%] px-4 bg-zinc-900 border-t border-zinc-800">
      <div className="h-full max-w-450 mx-auto flex items-center justify-between ">
        {/* current playing track */}
        <div className="min-w-45 w-[30%] hidden sm:flex items-center gap-4">
          {track && (
            <>
              <img
                src={track.image}
                alt={track.name}
                className="w-14 h-14 object-cover rounded-md"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate hover:underline cursor-pointer">
                  {track.name}
                </div>
                <div className="text-sm text-zinc-400 truncate hover:underline cursor-pointer">
                  Doja Cat
                </div>
              </div>
            </>
          )}
        </div>

        {/* player controls */}
        <div className="flex-1 max-w-full sm:max-w-[45%] flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="hidden sm:inline-flex text-zinc-400 hover:text-white"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              size={"icon"}
              variant={"ghost"}
              disabled={!track}
              className="text-zinc-400 hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size={"icon"}
              variant={"ghost"}
              className="h-8 w-8 bg-white hover:bg-white/80 text-black rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            <Button
              size={"icon"}
              variant={"ghost"}
              disabled={!track}
              className="text-zinc-400 hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              size={"icon"}
              variant={"ghost"}
              disabled={!track}
              className="hidden sm:inline-flex text-zinc-400 hover:text-white"
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-full hidden sm:flex items-center gap-2">
            <div className="text-xs text-zinc-400">
              {formatDuration(currentTime)}
            </div>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="w-full hover:cursor-grab active:cursor-grabbing"
              onValueChange={() => {}}
            />
            <div className="text-xs text-zinc-400">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        {/* volume controls */}
        <div className="min-w-45 w-[30%] hidden sm:flex items-center justify-end gap-1">
          <Button
            size={"icon"}
            variant={"ghost"}
            className="text-zinc-400 hover:text-white"
          >
            <Laptop2 className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size={"icon"}
              variant={"ghost"}
              className="text-zinc-400 hover:text-white"
            >
              <Volume1 className="h-4 w-4" />
            </Button>

            <Slider
              value={[50]}
              max={100}
              step={1}
              className="w-24 hover:cursor-grab active:cursor-grabbing"
              onValueChange={() => {}}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PlaybackControls;
