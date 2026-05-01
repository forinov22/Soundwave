import { useState } from "react";
import { Music2, Pencil, Trash2 } from "lucide-react";

import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import type { ArtistAlbum } from "@/features/artist/types/ArtistAlbum";

import AlbumDialog from "./AlbumDialog";

interface AlbumCardProps {
  album: ArtistAlbum;
  onDelete: () => void;
}

const AlbumCard = ({ album, onDelete }: AlbumCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tracks = album.tracks;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[oklch(0.28_0_0)] transition-all duration-300 hover:bg-[oklch(0.31_0_0)]">
      {/* Верхняя часть — клик раскрывает треки */}
      <div
        className="flex cursor-pointer items-center gap-4 p-4"
        onClick={() => setIsExpanded((p) => !p)}
      >
        {/* Обложка */}
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg shadow-lg">
          {album.imageUrl ? (
            <img
              src={album.imageUrl}
              alt={album.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-white/5">
              <Music2 className="size-6 text-text-muted" />
            </div>
          )}
        </div>

        {/* Инфо */}
        <div className="min-w-0 flex-1">
          <Typography variant="title" size="sm" truncate className="font-bold">
            {album.name}
          </Typography>
          <Typography variant="subtitle" size="xs" className="mt-0.5">
            {album.releaseYear} · {album.tracks.length} треков
          </Typography>
        </div>

        {/* Кнопки — stopPropagation чтобы не раскрывать карточку */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <AlbumDialog album={album}>
            <div>
              <ActionIcon
                icon={<Pencil className="size-4" />}
                size="sm"
                label="Редактировать альбом"
              />
            </div>
          </AlbumDialog>
          <button
            onClick={onDelete}
            className="flex size-7 items-center justify-center rounded-full text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-90"
            aria-label="Удалить альбом"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Раскрывающаяся таблица треков */}
      {isExpanded && (
        <div className="border-t border-white/5 px-2 pb-2">
          <TrackTable
            data={tracks}
            getKey={(t) => t.id}
            onRowClick={() => {}}
            showHeader={false}
            columns={[
              {
                key: "track",
                width: "1fr",
                render: (track) => (
                  <TrackRow
                    image={"imageUrl" in track ? track.imageUrl : track.image}
                    title={"title" in track ? track.title : track.name}
                    subtitle={
                      "artistName" in track
                        ? track.artistName
                        : "Various Artists"
                    }
                    size="sm"
                  />
                ),
              },
              {
                key: "duration",
                width: "auto",
                align: "right",
                render: (track) => (
                  <Typography
                    variant="subtitle"
                    size="sm"
                    className="font-mono"
                  >
                    {"durationSeconds" in track
                      ? `${Math.floor(track.durationSeconds / 60)}:${String(track.durationSeconds % 60).padStart(2, "0")}`
                      : track.duration}
                  </Typography>
                ),
              },
              {
                key: "remove",
                header: "",
                width: "40px",
                render: () => (
                  <button
                    className="flex size-7 items-center justify-center rounded-full text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 active:scale-90"
                    aria-label="Убрать из альбома"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default AlbumCard;
