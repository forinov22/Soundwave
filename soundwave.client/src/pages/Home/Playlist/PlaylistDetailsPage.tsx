import { useState } from "react";
import { useParams } from "react-router";
import {
  Play,
  MoreHorizontal,
  Clock,
  Lock,
  Globe,
  Trash2,
  Pencil,
  // Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { songsData, albumsData } from "@/assets/assets";
import { formatDuration } from "@/shared/lib/formatDuration";
import { EntityHeader } from "@/shared/ui/EntityHeader";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";

import { EditPlaylistModal } from "./EditPlaylistModal";
import { TrackSearchInput } from "./TrackSearchInput";

// import type { LayoutOutletContext } from "../MainLayout";

// ─── Типы ──────────────────────────────────────────────────────────────────

interface PlaylistTrack {
  id: number;
  name: string;
  image: string;
  duration: string;
  albumName: string;
  artistName: string;
}

interface PlaylistState {
  name: string;
  description: string;
  image: string | null;
  isPublic: boolean;
  tracks: PlaylistTrack[];
}

// ─── Хардкод начального состояния ──────────────────────────────────────────

const INITIAL_TRACKS: PlaylistTrack[] = songsData.slice(0, 3).map((s) => ({
  id: s.id,
  name: s.name,
  image: s.image,
  duration: s.duration,
  albumName: albumsData[s.id % albumsData.length]?.name ?? "Неизвестно",
  artistName: "Various Artists",
}));

const PLACEHOLDER_IMAGE = songsData[0].image;

// ─── Страница ──────────────────────────────────────────────────────────────

function PlaylistDetailsPage() {
  // const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();
  const { id } = useParams();

  const [playlist, setPlaylist] = useState<PlaylistState>({
    name: `Мой плейлист ${id ?? ""}`,
    description: "",
    image: null,
    isPublic: false,
    tracks: INITIAL_TRACKS,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);

  // Текущий пользователь всегда владелец (хардкод)
  const isOwner = true;

  const addedTrackIds = playlist.tracks.map((t) => t.id);

  const handleAddTrack = (track: {
    id: number;
    name: string;
    image: string;
    duration: string;
    albumName?: string;
  }) => {
    setPlaylist((prev) => ({
      ...prev,
      tracks: [
        ...prev.tracks,
        {
          id: track.id,
          name: track.name,
          image: track.image,
          duration: track.duration,
          albumName: track.albumName ?? "",
          artistName: "Various Artists",
        },
      ],
    }));
  };

  const handleRemoveTrack = (trackId: number) => {
    setPlaylist((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));
  };

  const handleSaveEdit = (data: {
    name: string;
    description: string;
    image: string | null;
  }) => {
    setPlaylist((prev) => ({ ...prev, ...data }));
  };

  const handleTogglePublic = () => {
    setPlaylist((prev) => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const totalDuration = playlist.tracks.reduce((acc, t) => {
    const [m, s] = t.duration.split(":").map(Number);
    return acc + (m * 60 + (s || 0));
  }, 0);

  return (
    <div className="relative pb-20">
      {/* Хедер */}
      <EntityHeader
        image={playlist.image ?? PLACEHOLDER_IMAGE}
        type="Плейлист"
        title={playlist.name}
        meta={[
          playlist.description || null,
          `${playlist.tracks.length} треков`,
          totalDuration > 0 ? formatDuration(totalDuration) : null,
          playlist.isPublic ? "Открытый" : "Закрытый",
        ]}
        preset="album"
        actions={
          <>
            <Button
              size="icon"
              className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
              disabled={playlist.tracks.length === 0}
            >
              <Play className="size-6 fill-current" />
            </Button>

            {/* Три точки с dropdown */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <ActionIcon
                      icon={<MoreHorizontal className="size-6" />}
                      size="lg"
                      label="Действия с плейлистом"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 border-white/10 bg-zinc-900 text-text-primary"
                >
                  <DropdownMenuItem
                    onClick={() => setIsEditOpen(true)}
                    className="cursor-pointer gap-2 hover:bg-white/5 focus:bg-white/5"
                  >
                    <Pencil className="size-4 text-text-secondary" />
                    Изменить сведения
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleTogglePublic}
                    className="cursor-pointer gap-2 hover:bg-white/5 focus:bg-white/5"
                  >
                    {playlist.isPublic ? (
                      <>
                        <Lock className="size-4 text-text-secondary" />
                        Сделать закрытым
                      </>
                    ) : (
                      <>
                        <Globe className="size-4 text-text-secondary" />
                        Сделать открытым
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem className="cursor-pointer gap-2 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400">
                    <Trash2 className="size-4" />
                    Удалить плейлист
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        }
        className="mb-8"
      />

      {/* Таблица треков */}
      {playlist.tracks.length > 0 ? (
        <TrackTable
          data={playlist.tracks}
          getKey={(t) => t.id}
          onRowClick={() => {}}
          columns={[
            {
              key: "track",
              header: "Название",
              width: "4fr",
              render: (track) => (
                <TrackRow
                  image={track.image}
                  title={track.name}
                  subtitle={track.artistName}
                  size="sm"
                />
              ),
            },
            {
              key: "album",
              header: "Альбом",
              width: "3fr",
              hideOnMobile: true,
              render: (track) => (
                <Typography variant="subtitle" size="sm" truncate>
                  {track.albumName}
                </Typography>
              ),
            },
            {
              key: "duration",
              header: <Clock className="size-4" />,
              width: "auto",
              align: "right",
              render: (track) => (
                <div className="flex items-center gap-2">
                  <Typography
                    variant="subtitle"
                    size="sm"
                    className="w-10 text-right font-mono"
                  >
                    {track.duration}
                  </Typography>
                  {/* Удалить трек — только для владельца */}
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track.id);
                      }}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        "text-icon opacity-0 transition-all group-hover:opacity-100",
                        "hover:bg-red-500/10 hover:text-red-400 active:scale-90",
                      )}
                      aria-label="Удалить трек"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      ) : (
        /* Пустое состояние */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Typography variant="title" size="lg" className="mb-2">
            Плейлист пуст
          </Typography>
          <Typography variant="subtitle" size="sm" className="mb-6 max-w-xs">
            Найдите треки ниже и добавьте их в плейлист
          </Typography>
        </div>
      )}

      {/* Поиск треков — только для владельца */}
      {isOwner && (
        <div className="mt-10">
          <Typography
            as="h2"
            variant="title"
            size="lg"
            className="mb-4 text-xl font-bold"
          >
            Найти и добавить треки
          </Typography>
          <TrackSearchInput
            addedTrackIds={addedTrackIds}
            onAdd={handleAddTrack}
            className="max-w-lg"
          />
        </div>
      )}

      {/* Модалка редактирования */}
      <EditPlaylistModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialName={playlist.name}
        initialDescription={playlist.description}
        initialImage={playlist.image ?? undefined}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

export default PlaylistDetailsPage;
