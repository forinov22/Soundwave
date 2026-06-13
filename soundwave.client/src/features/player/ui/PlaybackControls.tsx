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

import type { Track } from "@/shared/types/Track";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackRow } from "@/shared/ui/TrackRow";
import { formatDuration } from "@/shared/lib/formatDuration";
import { Slider } from "@/components/ui/slider";
import { useRightSidebar } from "@/features/sidebar/lib/useRightSidebar";

import { usePlayerPlayback } from "../lib/usePlayerPlayback";

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
  const { trackList, togglePlay, seek, playNext, playPrevious } =
    usePlayerPlayback();
  const { toggle } = useRightSidebar();

  return (
    <footer className="sticky bottom-0 z-50 h-24 border-t border-white/5 bg-zinc-950/90 px-4 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-450 items-center justify-between">
        {/* Информация о треке */}
        <div className="flex w-[30%] min-w-45 items-center gap-4">
          {track ? (
            <>
              <TrackRow
                image={track.imageUrl}
                title={track.title}
                subtitle={track.artistName}
                size="md"
                titleOnClick={() => {}}
                subtitleOnClick={() => {}}
                className="overflow-hidden"
              />
              <ActionIcon
                icon={<Heart className="size-4" />}
                variant="primary"
                label="В избранное"
              />
            </>
          ) : (
            <div className="flex items-center gap-4 opacity-20">
              <div className="size-14 rounded-lg bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-2 w-16 rounded bg-zinc-800" />
              </div>
            </div>
          )}
        </div>

        {/* Управление воспроизведением */}
        <div className="flex max-w-[40%] flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-4 md:gap-6">
            <ActionIcon
              icon={<Shuffle className="size-4" />}
              label="Перемешать"
            />
            <ActionIcon
              icon={<SkipBack className="size-5 fill-current" />}
              onClick={playPrevious}
              disabled={trackList.length <= 1}
              label="Предыдущий"
            />
            {isPlaying ? (
              <ActionIcon
                variant="primary"
                icon={<Pause className="size-5 fill-current" />}
                onClick={togglePlay}
                disabled={!track}
              />
            ) : (
              <ActionIcon
                variant="primary"
                icon={<Play className="size-5 fill-current" />}
                onClick={togglePlay}
                disabled={!track}
              />
            )}
            <ActionIcon
              icon={<SkipForward className="size-5 fill-current" />}
              onClick={playNext}
              disabled={trackList.length <= 1}
              label="Следующий"
            />
            <ActionIcon icon={<Repeat className="size-4" />} label="Повтор" />
          </div>

          {/* Слайдер прогресса */}
          <div className="flex w-full items-center gap-3">
            <span className="min-w-8.75 text-right text-[10px] font-medium text-zinc-500">
              {formatDuration(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={(val) => seek(val[0])} // Теперь это реально передвинет ползунок в audio
              className="w-full"
            />
            <span className="min-w-8.75 text-[10px] font-medium text-zinc-500">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Доп. контролы (громкость и очередь) */}
        <div className="hidden w-[30%] items-center justify-end gap-3 md:flex">
          {/* <Button
            size="icon"
            variant="ghost"
            onClick={() => toggle("queue")} // Теперь открывает очередь
            className="text-zinc-300 transition-all hover:bg-white/5 hover:text-white active:scale-90"
          >
            <ListMusic className="size-4" />
          </Button> */}
          <ActionIcon
            icon={<ListMusic className="size-4" />}
            onClick={() => toggle("queue")}
            label="Очередь"
          />
          <div className="group flex items-center gap-2">
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
