import { useEffect } from "react";
import { Music } from "lucide-react";

import { useArtist } from "@/features/artist/lib/useArtist";
import { Typography } from "@/shared/ui/Typography";

import AddTrackDialog from "./AddTrackDialog";
import TracksTable from "./TracksTable";

const TracksTabContent = () => {
  const { tracks, fetchMyTracks, isTracksLoading, deleteTrack } = useArtist();

  useEffect(() => {
    // Загружаем только если стор пуст — избегаем лишних запросов
    // при переключении табов
    if (tracks.length === 0) {
      fetchMyTracks();
    }
  }, [tracks.length, fetchMyTracks]);

  return (
    <div className="rounded-2xl border border-white/5 bg-[oklch(0.22_0_0)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="size-5 text-primary" />
          <div>
            <Typography as="h3" variant="title" size="md" className="font-bold">
              Библиотека треков
            </Typography>
            <Typography variant="subtitle" size="sm" className="mt-0.5">
              {isTracksLoading ? "Загрузка..." : `${tracks.length} треков`}
            </Typography>
          </div>
        </div>
        {/* onCreated больше не нужен — createTrack сам пишет в стор */}
        <AddTrackDialog />
      </div>

      <TracksTable
        tracks={tracks}
        isLoading={isTracksLoading}
        onDelete={deleteTrack}
      />
    </div>
  );
};

export default TracksTabContent;
