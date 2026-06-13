import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import {
  CircleAlert,
  Clock,
  Play,
  Heart,
  MoreHorizontal,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMusic } from "@/features/music/lib/useMusic";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { useLikeRelease } from "@/features/likes/lib/useLikeRelease";
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
  const { playAlbum } = usePlayerPlayback();

  const { fetchRelease, isReleaseLoading, releaseError } = useMusic();
  const { isReleaseLiked, toggleLikeRelease } = useLikeRelease();

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
              onClick={() => playAlbum(release.tracks, 0)}
              className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
            >
              <Play className="size-6 fill-current" />
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
            width: "auto",
            align: "right",
            render: (track) => (
              <Typography variant="subtitle" size="sm">
                {formatDuration(track.durationSeconds)}
              </Typography>
            ),
          },
        ]}
      />
    </div>
  );
}

export default AlbumDetailsPage;
