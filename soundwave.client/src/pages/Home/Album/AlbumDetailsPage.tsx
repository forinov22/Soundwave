import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import {
  CircleAlert,
  Clock,
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMusic } from "@/features/music/lib/useMusic";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { useLikeRelease } from "@/features/likes/lib/useLikeRelease";
import { useLike } from "@/features/playlists/lib/useLike";
import { formatDuration } from "@/shared/lib/formatDuration";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { Typography } from "@/shared/ui/Typography";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { EntityHeader } from "@/shared/ui/EntityHeader";

import type { LayoutOutletContext } from "../MainLayout";
import type { ReleaseDetails } from "@/shared/types/Release";

function AlbumDetailsPage() {
  const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();
  const { id } = useParams();
  const { playAlbum, togglePlay, currentTrack, isPlaying } = usePlayerPlayback();

  const { fetchRelease, isReleaseLoading, releaseError } = useMusic();
  const { isReleaseLiked, toggleLikeRelease } = useLikeRelease();
  const { isLiked, toggleLike } = useLike();

  const [release, setRelease] = useState<ReleaseDetails | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      const data = await fetchRelease(Number(id));
      if (data) {
        setRelease(data);
        setGradientBgColor(data.bgColor || "#22c55e33");
      }
    };

    loadData();

    return () => {
      setGradientBgColor(); // Убираем цвет при размонтировании
    };
  }, [id, fetchRelease, setGradientBgColor]);

  // Обработка загрузки
  if (isReleaseLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Обработка ошибки
  if (releaseError || !release) {
    return (
      <div className="flex h-[70vh] animate-in flex-col items-center justify-center gap-4 text-zinc-500 duration-300 fade-in zoom-in">
        <CircleAlert className="size-16 stroke-1 text-red-500/50" />
        <h2 className="text-2xl font-bold text-zinc-100">
          {releaseError ? "Ошибка при загрузке альбома" : "Альбом не найден"}
        </h2>
        <p className="max-w-xs text-center text-zinc-400">
          {releaseError ||
            "Похоже, этого альбома больше не существует или ссылка неверна."}
        </p>
        <Button
          variant="outline"
          className="mt-2 border-zinc-700 hover:bg-zinc-800"
          onClick={() => globalThis.location.reload()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  const isAlbumLoaded = release.tracks.some((t) => t.id === currentTrack?.id);
  const isAlbumPlaying = isAlbumLoaded && isPlaying;

  return (
    <div className="relative">
      {/* Header */}
      <EntityHeader
        image={release.imageUrl}
        type="Альбом"
        title={release.title}
        meta={["MusicApp", release.description, "2024"]}
        preset="album"
        actions={
          <>
            <Button
              size="icon"
              onClick={() => isAlbumLoaded ? togglePlay() : playAlbum(release.tracks, 0)}
              className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
            >
              {isAlbumPlaying ? (
                <Pause className="size-6 fill-current" />
              ) : (
                <Play className="size-6 fill-current" />
              )}
            </Button>
            <ActionIcon
              icon={
                <Heart
                  className={
                    release && isReleaseLiked(release.id)
                      ? "size-8 fill-emerald-500 text-emerald-500"
                      : "size-8"
                  }
                />
              }
              variant="primary"
              size="lg"
              label={release && isReleaseLiked(release.id) ? "Убрать из избранного" : "В избранное"}
              onClick={() => release && toggleLikeRelease(release.id)}
            />
            <ActionIcon
              icon={<MoreHorizontal className="size-8" />}
              size="lg"
              label="Ещё"
            />
          </>
        }
        className="mb-8"
      />

      {/* Tracks Table */}
      <TrackTable
        data={release.tracks}
        getKey={(t) => t.id}
        isActive={(t) => t.id === currentTrack?.id}
        onRowClick={(_, idx) => playAlbum(release.tracks, idx)}
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
            render: () => (
              <Typography variant="subtitle" size="sm">
                {release.title}
              </Typography>
            ),
          },
          {
            key: "duration",
            header: <Clock className="size-4" />,
            width: "130px",
            align: "right",
            render: (track) => (
              <div className="flex items-center justify-end gap-2">
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
                <Typography variant="subtitle" size="sm" className="w-10 text-right font-mono">
                  {formatDuration(track.durationSeconds)}
                </Typography>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default AlbumDetailsPage;
