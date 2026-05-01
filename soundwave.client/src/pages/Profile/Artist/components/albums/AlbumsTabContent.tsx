import { useEffect } from "react";
import { Album, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useArtist } from "@/features/artist/lib/useArtist";
import { Typography } from "@/shared/ui/Typography";

import AlbumDialog from "./AlbumDialog";
import AlbumCard from "./AlbumCard";

const AlbumsTabContent = () => {
  const { albums, fetchMyAlbums, isAlbumsLoading, deleteAlbum } = useArtist();

  useEffect(() => {
    // Загружаем только если стор пуст
    if (albums.length === 0) {
      fetchMyAlbums();
    }
  }, []);

  return (
    <div className="rounded-2xl border border-white/5 bg-[oklch(0.22_0_0)] p-6">
      {/* Шапка */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Album className="size-5 text-violet-400" />
          <div>
            <Typography as="h3" variant="title" size="md" className="font-bold">
              Альбомы
            </Typography>
            <Typography variant="subtitle" size="sm" className="mt-0.5">
              {isAlbumsLoading ? "Загрузка..." : `${albums.length} альбомов`}
            </Typography>
          </div>
        </div>
        <AlbumDialog>
          <Button className="rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:scale-105 hover:bg-primary/80">
            <Plus className="mr-2 size-4" />
            Создать альбом
          </Button>
        </AlbumDialog>
      </div>

      {/* Контент */}
      {isAlbumsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Album className="mb-4 size-12 text-text-muted opacity-50" />
          <Typography variant="title" size="md" className="mb-1">
            Нет альбомов
          </Typography>
          <Typography variant="subtitle" size="sm">
            Создайте первый альбом, нажав кнопку выше
          </Typography>
        </div>
      ) : (
        <div className="space-y-3">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onDelete={() => deleteAlbum(album.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsTabContent;
