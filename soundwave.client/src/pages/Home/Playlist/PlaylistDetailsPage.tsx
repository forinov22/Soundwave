import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Play,
  Pause,
  Shuffle,
  MoreHorizontal,
  Clock,
  Lock,
  Globe,
  Trash2,
  Pencil,
  Loader2,
  Heart,
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
import { formatDuration } from "@/shared/lib/formatDuration";
import { EntityHeader } from "@/shared/ui/EntityHeader";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { usePlaylistDetails } from "@/features/playlists/lib/usePlaylistDetails";
import { useLikePlaylist } from "@/features/likes/lib/useLikePlaylist";
import { useLike } from "@/features/playlists/lib/useLike";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";

import { EditPlaylistModal } from "./EditPlaylistModal";
import { TrackSearchInput } from "./TrackSearchInput";
import { useAuth } from "@/features/auth/lib/useAuth";

const LIKED_SONGS_IMAGE = (
  <div className="flex size-full items-center justify-center bg-linear-to-br from-indigo-700 to-emerald-400">
    <Heart className="size-16 fill-white text-white" />
  </div>
);

function PlaylistDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlistId = Number(id);

  const { user } = useAuth();
  const userId = user?.id;
  const { isPlaylistSaved, toggleSavePlaylist } = useLikePlaylist();

  const {
    details,
    isLoading,
    error,
    updatePlaylist,
    isUpdating,
    addTrack,
    isAddingTrack,
    removeTrack,
    deletePlaylist,
    togglePublic,
  } = usePlaylistDetails(playlistId);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const { isLiked, toggleLike } = useLike();
  const {
    playAlbum,
    playShuffle,
    togglePlay,
    currentTrack,
    isPlaying,
    shuffleMode,
  } = usePlayerPlayback();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Typography variant="title" size="lg">
          Плейлист не найден
        </Typography>
        <Typography variant="subtitle" size="sm">
          Возможно, он был удалён или недоступен
        </Typography>
      </div>
    );
  }

  const isOwner = details.ownerId === userId;

  const tracks = details.tracks;
  const isPlaylistLoaded = tracks.some((t) => t.id === currentTrack?.id);
  const isPlaylistPlaying = isPlaylistLoaded && isPlaying;
  const addedTrackIds = details.tracks.map((t) => t.id);

  const totalDuration = details.tracks.reduce(
    (acc, t) => acc + t.durationSeconds,
    0,
  );

  const handleSaveEdit = async (data: {
    name: string;
    description: string;
    image: string | null;
  }) => {
    await updatePlaylist({ title: data.name, description: data.description });
  };

  const handleDelete = async () => {
    await deletePlaylist();
    navigate(-1);
  };

  let image = details.imageUrl ?? (
    <div className="flex size-full items-center justify-center rounded bg-zinc-700">
      <span className="text-9xl text-zinc-400">♪</span>
    </div>
  );

  if (details.isLikedSongs) {
    image = LIKED_SONGS_IMAGE;
  }

  return (
    <div className="relative pb-20">
      <EntityHeader
        image={image}
        type={details.isLikedSongs ? "Любимые треки" : "Плейлист"}
        title={details.title}
        meta={[
          details.description || null,
          `${details.tracks.length} треков`,
          totalDuration > 0 ? formatDuration(totalDuration) : null,
          (!details.isLikedSongs && details.isPublic && "Открытый") || null,
          (!details.isLikedSongs && !details.isPublic && "Закрытый") || null,
        ]}
        preset="album"
        actions={
          <>
            {/* Play / Pause */}
            <div className="relative">
              {isPlaylistPlaying && (
                <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-20" />
              )}
              <button
                onClick={() => {
                  if (tracks.length === 0) return;
                  isPlaylistLoaded ? togglePlay() : playAlbum(tracks, 0);
                }}
                disabled={tracks.length === 0}
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-full shadow-lg",
                  "transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40",
                  "bg-emerald-500 text-black hover:bg-emerald-400",
                  isPlaylistPlaying ? "hover:scale-105" : "hover:scale-110",
                )}
              >
                {isPlaylistPlaying ? (
                  <Pause className="size-5 fill-current" />
                ) : (
                  <Play className="size-5 translate-x-px fill-current" />
                )}
              </button>
            </div>

            {/* Shuffle */}
            <button
              onClick={() => tracks.length > 0 && playShuffle(tracks)}
              disabled={tracks.length === 0}
              className={cn(
                "relative flex size-9 items-center justify-center rounded-full",
                "transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40",
                isPlaylistLoaded && shuffleMode
                  ? "text-emerald-500 hover:text-emerald-400"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              <Shuffle className="size-4" />
              {isPlaylistLoaded && shuffleMode && (
                <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-emerald-500" />
              )}
            </button>

            {!isOwner && !details.isLikedSongs && details.isPublic && (
              <ActionIcon
                icon={
                  <Heart
                    className={
                      isPlaylistSaved(details.id)
                        ? "size-8 fill-emerald-500 text-emerald-500"
                        : "size-8"
                    }
                  />
                }
                variant="primary"
                size="lg"
                label={
                  isPlaylistSaved(details.id)
                    ? "Убрать из медиатеки"
                    : "Сохранить в медиатеку"
                }
                onClick={() => toggleSavePlaylist(details.id)}
              />
            )}

            {isOwner && !details.isLikedSongs && (
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
                    onClick={togglePublic}
                    className="cursor-pointer gap-2 hover:bg-white/5 focus:bg-white/5"
                  >
                    {details.isPublic ? (
                      <>
                        <Lock className="size-4 text-text-secondary" /> Сделать
                        закрытым
                      </>
                    ) : (
                      <>
                        <Globe className="size-4 text-text-secondary" /> Сделать
                        открытым
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="cursor-pointer gap-2 text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400"
                  >
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

      {tracks.length > 0 ? (
        <TrackTable
          data={tracks}
          getKey={(t) => t.id}
          onRowClick={(_, idx) => playAlbum(tracks, idx)}
          columns={[
            {
              key: "track",
              header: "Название",
              width: "4fr",
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
              key: "album",
              header: "Альбом",
              width: "3fr",
              hideOnMobile: true,
              render: (track) => (
                <Typography variant="subtitle" size="sm" truncate>
                  {track.albumTitle ?? "—"}
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
                  <ActionIcon
                    icon={
                      <Heart
                        className={
                          isLiked(track.id)
                            ? "size-4 fill-emerald-500 text-emerald-500"
                            : "size-4"
                        }
                      />
                    }
                    size="sm"
                    label={isLiked(track.id) ? "Убрать из избранного" : "В избранное"}
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                  />
                  <Typography
                    variant="subtitle"
                    size="sm"
                    className="w-10 text-right font-mono"
                  >
                    {formatDuration(track.durationSeconds)}
                  </Typography>
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Typography variant="title" size="lg" className="mb-2">
            Плейлист пуст
          </Typography>
          <Typography variant="subtitle" size="sm" className="mb-6 max-w-xs">
            {details.isLikedSongs
              ? "Лайкайте треки — они появятся здесь"
              : "Найдите треки ниже и добавьте их в плейлист"}
          </Typography>
        </div>
      )}

      {isOwner && !details.isLikedSongs && (
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
            onAdd={(id) => addTrack(id)}
            isLoading={isAddingTrack}
            className="max-w-lg"
          />
        </div>
      )}

      {isEditOpen && (
        <EditPlaylistModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialName={details.title}
          initialDescription={details.description}
          initialImage={details.imageUrl ?? undefined}
          onSave={handleSaveEdit}
          isSaving={isUpdating}
        />
      )}
    </div>
  );
}

export default PlaylistDetailsPage;
