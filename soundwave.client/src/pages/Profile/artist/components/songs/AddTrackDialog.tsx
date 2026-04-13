import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Music, Plus, Upload } from "lucide-react";

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

interface CreateSongModel {
  name: string;
  audio: File | null;
  image: File | null;
}

const AddTrackDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [newSong, setNewSong] = useState<CreateSongModel>({
    name: "",
    audio: null,
    image: null,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full px-6 shadow-lg shadow-emerald-500/10 transition-all hover:scale-105">
          <Plus className="h-5 w-5 mr-2" />
          Добавить трек
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-125 bg-zinc-950 border-white/10 text-zinc-100 rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Новый трек</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Загрузите аудиофайл и обложку для вашего релиза.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Область загрузки картинки */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              "relative aspect-square w-40 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all overflow-hidden group",
              newSong.image && "border-solid border-emerald-500"
            )}
          >
             {/* ... внутренности загрузки с иконкой Upload ... */}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Название трека</label>
              <Input
                placeholder="Название вашего шедевра..."
                className="bg-zinc-900 border-white/5 focus:border-emerald-500/50 h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Аудиофайл</label>
              <Button 
                onClick={() => audioInputRef.current?.click()}
                variant="outline" 
                className="w-full h-12 border-white/5 bg-zinc-900 hover:bg-zinc-800 rounded-xl justify-start px-4 text-zinc-400"
              >
                <Music className="mr-2 size-4" />
                {newSong.audio ? newSong.audio.name : "Выбрать файл..."}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={() => setIsOpen(false)} variant="ghost" className="rounded-full">Отмена</Button>
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-full px-8">Опубликовать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrackDialog;
