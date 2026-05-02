import { Clock, Loader2, Trash2 } from "lucide-react";

import {
  isPublishedTrack,
  type ArtistTrack,
} from "@/features/artist/types/ArtistTrack";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { formatDuration } from "@/shared/lib/formatDuration";

import TrackStatusBadge from "./TrackStatusBadge";

interface TracksTableProps {
  tracks: ArtistTrack[];
  isLoading: boolean;
  onDelete: (trackId: number, trackTitle: string) => void;
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
          Загрузите первый трек с помощью кнопки выше
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
          width: "1.5fr",
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
          key: "status",
          header: "Статус",
          // Без width: 1fr оставит элементу гибкость и позволит truncate работать.
          width: "1fr",
          hideOnMobile: true,
          render: (track) => <TrackStatusBadge track={track} />,
        },
        {
          key: "duration",
          header: "Длительность",
          width: "120px",
          hideOnMobile: true,
          render: (track) => (
            <span className="flex items-center gap-2">
              <Clock className="size-3.5 text-text-muted" />
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
          render: (track) => {
            // Опубликованные треки нельзя удалить — кнопка задизейблена.
            // Бэк всё равно отдаст 409, но лучше не давать пытаться.
            const isPublished = isPublishedTrack(track);
            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPublished) return;
                  onDelete(track.id, track.title);
                }}
                disabled={isPublished}
                className="flex size-8 items-center justify-center rounded-full text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                aria-label={
                  isPublished
                    ? "Опубликованный трек нельзя удалить"
                    : "Удалить трек"
                }
                title={
                  isPublished ? "Трек опубликован — нельзя удалить" : undefined
                }
              >
                <Trash2 className="size-4" />
              </button>
            );
          },
        },
      ]}
    />
  );
};

export default TracksTable;
