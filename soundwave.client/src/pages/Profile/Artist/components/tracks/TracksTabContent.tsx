import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

import { useArtist } from "@/features/artist/lib/useArtist";
import { useDeleteTrackWithConfirm } from "@/features/artist/lib/useDeleteTrackWithConfirm";
import { Typography } from "@/shared/ui/Typography";

import AddTrackDialog from "./AddTrackDialog";
import TracksTable from "./TracksTable";
import DeleteTrackConfirmDialog from "./DeleteTrackConfirmDialog";

const TracksTabContent = () => {
  const { tracks, fetchTracks, isTracksLoading } = useArtist();

  const dt = useDeleteTrackWithConfirm();

  useEffect(() => {
    if (tracks.length === 0) {
      fetchTracks();
    }
  }, [tracks.length, fetchTracks]);

  return (
    <div className="rounded-2xl border border-hairline bg-graphite-panel p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography
            as="h3"
            variant="title"
            size="lg"
            className="font-semibold"
          >
            Треки
          </Typography>
          <Typography variant="subtitle" size="sm" className="mt-1">
            {isTracksLoading
              ? "Загрузка..."
              : `${tracks.length} ${pluralizeTracks(tracks.length)}`}
          </Typography>
        </div>
        <AddTrackDialog />
      </div>

      {dt.blockedMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <div className="flex-1">
            <Typography
              variant="title"
              size="sm"
              className="font-semibold text-red-300/90"
            >
              Удаление невозможно
            </Typography>
            <Typography variant="subtitle" size="sm" className="mt-0.5">
              {dt.blockedMessage}
            </Typography>
          </div>
          <button
            onClick={dt.dismissBlocked}
            className="text-xs text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            Закрыть
          </button>
        </div>
      )}

      <TracksTable
        tracks={tracks}
        isLoading={isTracksLoading}
        onDelete={dt.deleteTrack}
      />

      <DeleteTrackConfirmDialog
        open={dt.confirmState !== null}
        trackTitle={dt.confirmState?.trackTitle ?? ""}
        draftReleases={dt.confirmState?.draftReleases ?? []}
        onConfirm={dt.confirmForceDelete}
        onCancel={dt.cancelConfirm}
        isLoading={dt.isDeleting}
      />
    </div>
  );
};

const pluralizeTracks = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "трек";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "трека";
  return "треков";
};

export default TracksTabContent;
