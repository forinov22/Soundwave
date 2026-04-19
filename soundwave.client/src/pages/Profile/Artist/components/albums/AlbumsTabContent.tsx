import { useState } from "react";
import { Album, Plus, Pencil, Trash2, Music2 } from "lucide-react";

import { albumsData, songsData } from "@/assets/assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";

// ─── Типы ──────────────────────────────────────────────────────────────────

interface AlbumItem {
  id: number;
  name: string;
  image: string | null;
  releaseYear: string;
  trackCount: number;
}

// ─── Хардкод данных ────────────────────────────────────────────────────────

const INITIAL_ALBUMS: AlbumItem[] = albumsData.map((a) => ({
  id: a.id,
  name: a.name,
  image: a.image,
  releaseYear: "2024",
  trackCount: Math.floor(Math.random() * 8) + 3,
}));

// ─── Диалог создания/редактирования альбома ────────────────────────────────

interface AlbumDialogProps {
  album?: AlbumItem;
  onSave: (data: { name: string; releaseYear: string }) => void;
  children: React.ReactNode;
}

const AlbumDialog = ({ album, onSave, children }: AlbumDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(album?.name ?? "");
  const [releaseYear, setReleaseYear] = useState(
    album?.releaseYear ?? new Date().getFullYear().toString(),
  );

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), releaseYear });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl border-white/10 bg-zinc-950 p-8 text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            {album ? "Редактировать альбом" : "Новый альбом"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
              Название альбома
              <Input
                id="albumName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название вашего альбома..."
                className="h-11 rounded-xl border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
              />
            </label>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
              Год выпуска
              <Input
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="2024"
                maxLength={4}
                className="h-11 rounded-xl border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
              />
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="rounded-full text-text-secondary hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/80"
          >
            {album ? "Сохранить" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Карточка альбома ──────────────────────────────────────────────────────

interface AlbumCardProps {
  album: AlbumItem;
  onEdit: (data: { name: string; releaseYear: string }) => void;
  onDelete: () => void;
}

const AlbumCard = ({ album, onEdit, onDelete }: AlbumCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Берём треки из songsData как заглушку
  const tracks = songsData.slice(0, album.trackCount);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface transition-all duration-300 hover:bg-surface-hover">
      {/* Верхняя часть — обложка + инфо */}
      <div
        className="flex cursor-pointer items-center gap-4 p-4"
        onClick={() => setIsExpanded((p) => !p)}
      >
        {/* Обложка */}
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg shadow-lg">
          {album.image ? (
            <img
              src={album.image}
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
            {album.releaseYear} · {album.trackCount} треков
          </Typography>
        </div>

        {/* Действия */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <AlbumDialog album={album} onSave={onEdit}>
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
                    image={track.image}
                    title={track.name}
                    subtitle="Various Artists"
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
                    {track.duration}
                  </Typography>
                ),
              },
              {
                key: "remove",
                width: "auto",
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

// ─── Основной таб ──────────────────────────────────────────────────────────

const AlbumsTabContent = () => {
  const [albums, setAlbums] = useState<AlbumItem[]>(INITIAL_ALBUMS);

  const handleCreate = (data: { name: string; releaseYear: string }) => {
    setAlbums((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: data.name,
        image: null,
        releaseYear: data.releaseYear,
        trackCount: 0,
      },
    ]);
  };

  const handleEdit =
    (id: number) => (data: { name: string; releaseYear: string }) => {
      setAlbums((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a)),
      );
    };

  const handleDelete = (id: number) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-6">
      {/* Шапка */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Album className="size-5 text-violet-400" />
          <div>
            <Typography as="h3" variant="title" size="md" className="font-bold">
              Альбомы
            </Typography>
            <Typography variant="subtitle" size="sm" className="mt-0.5">
              Управляйте своими альбомами
            </Typography>
          </div>
        </div>
        <AlbumDialog onSave={handleCreate}>
          <Button className="rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:scale-105 hover:bg-primary/80">
            <Plus className="mr-2 size-4" />
            Создать альбом
          </Button>
        </AlbumDialog>
      </div>

      {/* Список альбомов */}
      {albums.length === 0 ? (
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
              onEdit={handleEdit(album.id)}
              onDelete={() => handleDelete(album.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsTabContent;
