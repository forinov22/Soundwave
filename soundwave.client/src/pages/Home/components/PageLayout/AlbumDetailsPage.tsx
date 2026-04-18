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
import { formatDuration } from "@/shared/lib/formatDuration";
import { ActionIcon } from "@/shared/ui/ActionIcon";

import type { LayoutOutletContext } from "../../MainLayout";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";

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
      <div className="flex flex-col items-center gap-6 pt-6 md:flex-row md:items-end md:gap-8">
        <img
          src={album.imageUrl}
          alt={album.title}
          className="w-52 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:w-64"
        />
        <div className="flex flex-col text-center md:text-left">
          <span className="text-xs font-bold tracking-widest text-emerald-500 uppercase">
            Альбом
          </span>
          <h1 className="mt-2 mb-4 text-4xl font-black text-white md:text-7xl">
            {album.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-300 md:justify-start">
            <span className="text-white">MusicApp</span>
            <span className="text-zinc-500">•</span>
            <span>{album.description}</span>
            <span className="text-zinc-500">•</span>
            <span>2024</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 mb-8 flex items-center gap-6">
        <Button
          size="icon"
          onClick={() => playAlbum(album.tracks, 0)}
          className="size-14 rounded-full bg-emerald-500 text-black shadow-lg hover:bg-emerald-400"
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
      </div>

      {/* Tracks Table */}
      <div className="w-full">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 border-b border-zinc-800 px-4 py-2 text-xs font-bold tracking-wider text-zinc-400 uppercase">
          <span>#</span>
          <span>Название</span>
          <span className="hidden md:block">Альбом</span>
          <span className="flex justify-end">
            <Clock className="size-4" />
          </span>
        </div>

        <div className="mt-2 space-y-1">
          {album.tracks.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playAlbum(album.tracks, idx)}
              className="group grid cursor-pointer grid-cols-[16px_4fr_3fr_1fr] items-center gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-zinc-800/40"
            >
              <span className="text-sm text-zinc-500 group-hover:text-emerald-500">
                {idx + 1}
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={track.imageUrl}
                  alt={track.title}
                  className="size-10 rounded shadow-md"
                />
                <div>
                  <div className="max-w-50 truncate font-medium text-white md:max-w-md">
                    {track.title}
                  </div>
                  <div className="text-xs text-zinc-400 underline-offset-2 group-hover:text-zinc-300 hover:underline">
                    {track.artistName}
                  </div>
                </div>
              </div>
              <span className="hidden text-sm text-zinc-400 md:block">
                {album.title}
              </span>
              <span className="flex justify-end text-sm text-zinc-400">
                {formatDuration(track.durationSeconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlbumDetailsPage;
