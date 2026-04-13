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
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 size-10" />
      </div>
    );
  }

  // Обработка ошибки
  if (albumError || !album) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-zinc-500 gap-4 animate-in fade-in zoom-in duration-300">
        <CircleAlert className="size-16 stroke-1 text-red-500/50" />
        <h2 className="text-2xl font-bold text-zinc-100">
          {albumError ? "Ошибка при загрузке альбома" : "Альбом не найден"}
        </h2>
        <p className="text-zinc-400 max-w-xs text-center">
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
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 pt-6">
        <img
          src={album.imageUrl}
          alt={album.title}
          className="w-52 md:w-64 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        />
        <div className="flex flex-col text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
            Альбом
          </span>
          <h1 className="text-4xl md:text-7xl font-black text-white mt-2 mb-4">
            {album.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-zinc-300 font-medium">
            <span className="text-white">MusicApp</span>
            <span className="text-zinc-500">•</span>
            <span>{album.description}</span>
            <span className="text-zinc-500">•</span>
            <span>2024</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-8 mb-8">
        <Button
          size="icon"
          onClick={() => playAlbum(album.tracks, 0)}
          className="size-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg"
        >
          <Play className="fill-current size-6" />
        </Button>
        <Heart className="size-8 text-zinc-400 hover:text-emerald-500 cursor-pointer transition-colors" />
        <MoreHorizontal className="size-8 text-zinc-400 hover:text-white cursor-pointer" />
      </div>

      {/* Tracks Table */}
      <div className="w-full">
        <div className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-2 border-b border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider">
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
              className="grid grid-cols-[16px_4fr_3fr_1fr] gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800/40 group cursor-pointer transition-colors items-center"
            >
              <span className="text-zinc-500 text-sm group-hover:text-emerald-500">
                {idx + 1}
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={track.imageUrl}
                  alt={track.title}
                  className="size-10 rounded shadow-md"
                />
                <div>
                  <div className="text-white font-medium truncate max-w-50 md:max-w-md">
                    {track.title}
                  </div>
                  <div className="text-xs text-zinc-400 group-hover:text-zinc-300 underline-offset-2 hover:underline">
                    {track.artistName}
                  </div>
                </div>
              </div>
              <span className="hidden md:block text-zinc-400 text-sm">
                {album.title}
              </span>
              <span className="flex justify-end text-zinc-400 text-sm">
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
