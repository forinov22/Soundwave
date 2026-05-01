import { Calendar, Loader2, Trash2 } from "lucide-react";

import type { Track } from "@/shared/types/Track";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { formatDuration } from "@/shared/lib/formatDuration";

interface TracksTableProps {
  tracks: Track[];
  isLoading: boolean;
  onDelete?: (trackId: number) => void;
}

const TracksTable = ({ tracks, isLoading, onDelete }: TracksTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Typography variant="title" size="md" className="mb-1">
          Нет треков
        </Typography>
        <Typography variant="subtitle" size="sm">
          Добавьте первый трек с помощью кнопки выше
        </Typography>
      </div>
    );
  }

  return (
    <TrackTable
      data={tracks}
      getKey={(t) => t.id}
      onRowClick={() => {}}
      columns={[
        {
          key: "track",
          header: "Название",
          width: "1fr",
          render: (track) => (
            <TrackRow
              image={track.imageUrl}
              title={track.title}
              subtitle={track.artistName}
              size="sm"
            />
          ),
        },
        {
          key: "duration",
          header: "Длительность",
          width: "120px",
          hideOnMobile: true,
          render: (track) => (
            <span className="flex items-center gap-2">
              <Calendar className="size-3.5 text-text-muted" />
              <Typography variant="subtitle" size="sm">
                {formatDuration(track.durationSeconds)}
              </Typography>
            </span>
          ),
        },
        {
          key: "actions",
          header: "",
          width: "40px",
          align: "right",
          render: (track) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(track.id);
              }}
              className="flex size-8 items-center justify-center rounded-full text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 active:scale-90"
              aria-label="Удалить трек"
            >
              <Trash2 className="size-4" />
            </button>
          ),
        },
      ]}
    />
  );
};

export default TracksTable;
