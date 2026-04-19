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
import type { Album } from "@/features/music/types";
import { useMusic } from "@/features/music/lib/useMusic";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { formatDuration } from "@/shared/lib/formatDuration";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { Typography } from "@/shared/ui/Typography";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { EntityHeader } from "@/shared/ui/EntityHeader";

import type { LayoutOutletContext } from "../MainLayout";

function AlbumDetailsPage() {
  const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();
  const { id } = useParams();
  const { playAlbum } = usePlayerPlayback();

  const { fetchAlbum, isAlbumLoading, albumError } = useMusic();

  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      const data = await fetchAlbum(Number(id));
      if (data) {
        setAlbum(data);
        setGradientBgColor(data.bgColor || "#22c55e33");
      }
    };

    loadData();

    return () => {
      setGradientBgColor(); // Убираем цвет при размонтировании
    };
  }, [id, fetchAlbum, setGradientBgColor]);

  // Обработка загрузки
  if (isAlbumLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Обработка ошибки
  if (albumError || !album) {
    return (
      <div className="flex h-[70vh] animate-in flex-col items-center justify-center gap-4 text-zinc-500 duration-300 fade-in zoom-in">
        <CircleAlert className="size-16 stroke-1 text-red-500/50" />
        <h2 className="text-2xl font-bold text-zinc-100">
          {albumError ? "Ошибка при загрузке альбома" : "Альбом не найден"}
        </h2>
        <p className="max-w-xs text-center text-zinc-400">
          {albumError ||
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
        image={album.imageUrl}
        type="Альбом"
        title={album.title}
        meta={["MusicApp", album.description, "2024"]}
        preset="album"
        actions={
          <>
            <Button
              size="icon"
              onClick={() => playAlbum(album.tracks, 0)}
              className="size-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80"
            >
              <Play className="size-6 fill-current" />
            </Button>
            <ActionIcon
              icon={<Heart className="size-8" />}
              variant="primary"
              size="lg"
              label="В избранное"
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
        data={album.tracks}
        getKey={(t) => t.id}
        onRowClick={(_, idx) => playAlbum(album.tracks, idx)}
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
                {album.title}
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
