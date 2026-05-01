import { useRef, useState } from "react";
import { ImagePlus, Music, Plus } from "lucide-react";

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
  // createTrack сам пишет в стор — onCreated колбэк больше не нужен
  const { createTrack, isCreatingTrack } = useArtist();
  const [isOpen, setIsOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newTrack, setNewTrack] = useState<CreateTrackModel>({
    name: "",
    audio: null,
    image: null,
  });

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

  const handleSubmit = async () => {
    if (!newTrack.audio || !newTrack.image || !newTrack.name.trim()) return;

    const track = await createTrack({
      title: newTrack.name.trim(),
      audio: newTrack.audio,
      image: newTrack.image,
    });

    if (track) {
      setIsOpen(false);
      setNewTrack({ name: "", audio: null, image: null });
      setImagePreview(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:scale-105 hover:bg-primary/80">
          <Plus className="mr-2 size-4" />
          Добавить трек
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-3xl border-white/10 bg-zinc-950 p-8 text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            Новый трек
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Загрузите аудиофайл и обложку для вашего релиза.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              "group relative mx-auto aspect-square w-40 cursor-pointer overflow-hidden",
              "rounded-2xl border-2 border-dashed border-white/20 transition-all",
              "hover:border-primary/50 hover:bg-primary/5",
              newTrack.image && "border-solid border-primary/60",
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

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
                Название трека
              </label>
              <Input
                value={newTrack.name}
                onChange={(e) =>
                  setNewTrack((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Название вашего шедевра..."
                className="h-11 rounded-xl border-white/10 bg-white/5 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-text-muted uppercase">
                Аудиофайл
              </label>
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant="outline"
                className="h-11 w-full justify-start rounded-xl border-white/10 bg-white/5 px-4 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              >
                <Music className="mr-2 size-4" />
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
            className="rounded-full text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !newTrack.name.trim() ||
              !newTrack.audio ||
              !newTrack.image ||
              isCreatingTrack
            }
            className="rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/80"
          >
            {isCreatingTrack ? "Загрузка..." : "Опубликовать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
