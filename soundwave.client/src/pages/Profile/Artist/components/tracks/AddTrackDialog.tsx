import { useRef, useState } from "react";
import { ImagePlus, Music } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useArtist } from "@/features/artist/lib/useArtist";

interface CreateTrackModel {
  name: string;
  audio: File | null;
  image: File | null;
}

const AddTrackDialog = () => {
  const { createTrack } = useArtist();
  const [isOpen, setIsOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState<CreateTrackModel>({
    name: "",
    audio: null,
    image: null,
  });

  const reset = () => {
    setNewTrack({ name: "", audio: null, image: null });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewTrack((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewTrack((p) => ({ ...p, audio: file }));
  };

  const handleSubmit = () => {
    if (!newTrack.audio || !newTrack.image || !newTrack.name.trim()) return;

    // Захватываем данные формы до сброса
    const payload = {
      title: newTrack.name.trim(),
      audio: newTrack.audio,
      image: newTrack.image,
    };

    // Закрываем диалог сразу — загрузка идёт в фоне
    setIsOpen(false);
    reset();
    createTrack(payload);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        setIsOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          Загрузить трек
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl border-hairline bg-graphite-panel p-8 text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Новый трек
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Загрузите аудиофайл и обложку. Трек попадёт в плейграунд — оттуда вы
            добавите его в релиз.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              "group relative mx-auto aspect-square w-36 cursor-pointer overflow-hidden",
              "rounded-2xl border-2 border-dashed border-white/10 bg-graphite-inset transition-all",
              "hover:border-primary/40 hover:bg-primary/5",
              newTrack.image && "border-solid border-primary/50",
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt=""
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                  <ImagePlus className="size-5 text-white" />
                  <span className="text-xs font-medium text-white">
                    Изменить
                  </span>
                </div>
              </>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-text-secondary">
                <ImagePlus className="size-7" />
                <span className="px-2 text-center text-xs leading-tight">
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

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                Название
              </label>
              <Input
                value={newTrack.name}
                onChange={(e) =>
                  setNewTrack((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Название трека..."
                className="h-10 rounded-xl border-hairline bg-graphite-inset text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
                Аудиофайл
              </label>
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant="outline"
                className="h-10 w-full justify-start rounded-xl border-hairline bg-graphite-inset px-3 text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
              >
                <Music className="mr-2 size-3.5" />
                {newTrack.audio ? newTrack.audio.name : "Выбрать файл..."}
              </Button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleAudioChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="rounded-full text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newTrack.name.trim() || !newTrack.audio || !newTrack.image}
            className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Загрузить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
