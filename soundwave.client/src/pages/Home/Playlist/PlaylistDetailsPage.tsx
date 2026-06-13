import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Play,
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
            <Button
              size="icon"
              className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
              disabled={details.tracks.length === 0}
            >
              <Play className="size-6 fill-current" />
            </Button>

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
                label={isPlaylistSaved(details.id) ? "Убрать из медиатеки" : "Сохранить в медиатеку"}
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

      {details.tracks.length > 0 ? (
        <TrackTable
          data={details.tracks}
          getKey={(t) => t.id}
          onRowClick={() => {}}
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
            onAdd={(track) => addTrack(track.id)}
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
