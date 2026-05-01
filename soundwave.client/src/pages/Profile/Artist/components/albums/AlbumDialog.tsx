import { useState, useRef } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useArtist } from "@/features/artist/lib/useArtist";
import type { ArtistAlbum } from "@/features/artist/types/ArtistAlbum";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AlbumDialogProps {
  // Если передан album — режим редактирования, иначе — создание
  album?: ArtistAlbum;
  onSave?: (data: { name: string; releaseYear: string }) => void;
  children: React.ReactNode;
}

const AlbumDialog = ({ album, onSave, children }: AlbumDialogProps) => {
  const { createAlbum, isCreatingAlbum } = useArtist();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(album?.name ?? "");
  const [releaseYear, setReleaseYear] = useState(
    album?.releaseYear ?? new Date().getFullYear().toString(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    album?.imageUrl ?? null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isNew = !album;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    if (!isNew) {
      // Редактирование — только локально пока нет PATCH эндпоинта
      onSave?.({ name: name.trim(), releaseYear });
      setIsOpen(false);
      return;
    }

    // Создание — вызываем API, стор обновится внутри useArtist
    if (!imageFile) return;
    const created = await createAlbum({
      title: name.trim(),
      description: "",
      releaseDate: `${releaseYear}-01-01`,
      image: imageFile,
    });

    if (created) {
      setIsOpen(false);
      setName("");
      setImageFile(null);
      setImagePreview(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl border-white/10 bg-zinc-950 p-8 text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            {isNew ? "Новый альбом" : "Редактировать альбом"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Обложка — только при создании */}
          {isNew && (
            <div
              onClick={() => imageInputRef.current?.click()}
              className={cn(
                "group relative mx-auto aspect-square w-36 cursor-pointer overflow-hidden",
                "rounded-xl border-2 border-dashed border-white/20 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                imageFile && "border-solid border-primary/60",
              )}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt=""
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <ImagePlus className="size-5 text-white" />
                    <span className="text-xs text-white">Изменить</span>
                  </div>
                </>
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-text-secondary">
                  <ImagePlus className="size-7" />
                  <span className="px-2 text-center text-xs">
                    Выбрать обложку
                  </span>
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
              Название альбома
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название вашего альбома..."
              className="h-11 rounded-xl border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
              Год выпуска
            </label>
            <Input
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              placeholder="2024"
              maxLength={4}
              className="h-11 rounded-xl border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="rounded-full text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || (isNew && !imageFile) || isCreatingAlbum}
            className="rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/80"
          >
            {isCreatingAlbum ? "Создание..." : isNew ? "Создать" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlbumDialog;
