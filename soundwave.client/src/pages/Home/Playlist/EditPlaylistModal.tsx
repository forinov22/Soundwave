import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  initialDescription?: string;
  initialImage?: string;
  onSave: (data: {
    name: string;
    description: string;
    image: string | null;
  }) => void;
}

export function EditPlaylistModal({
  isOpen,
  onClose,
  initialName = "",
  initialDescription = "",
  initialImage,
  onSave,
}: Readonly<EditPlaylistModalProps>) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleImageAreaClick = () => fileInputRef.current?.click();

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      image: imagePreview,
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // Backdrop
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-6 text-xl font-bold text-text-primary">
          Изменить сведения
        </h2>

        <div className="flex gap-4">
          {/* Дроп-зона для изображения */}
          <div
            onClick={handleImageAreaClick}
            className={cn(
              "group relative size-36 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 border-dashed",
              "border-white/20 bg-surface transition-all hover:border-primary/60 hover:bg-surface-hover",
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="обложка"
                  className="size-full object-cover"
                />
                {/* Оверлей при ховере */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImagePlus className="size-6 text-white" />
                  <span className="text-xs font-medium text-white">
                    Изменить
                  </span>
                </div>
              </>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-text-secondary">
                <ImagePlus className="size-8" />
                <span className="px-2 text-center text-xs leading-tight">
                  Выбрать изображение
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Поля */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название плейлиста"
              maxLength={100}
              className="border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание (необязательно)"
              maxLength={300}
              rows={4}
              className="resize-none border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            Сохранить
          </Button>
        </div>

        <p className="mt-3 text-center text-xs text-text-muted">
          Продолжая, вы соглашаетесь предоставить доступ к выбранной фотографии
        </p>
      </div>
    </div>
  );
}
