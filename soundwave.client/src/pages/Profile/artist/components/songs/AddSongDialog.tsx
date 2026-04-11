import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { Plus, Upload } from "lucide-react";

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

interface CreateSongModel {
  name: string;
  audio: File | null;
  image: File | null;
}

const AddSongDialog = () => {
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
        <Button
          onClick={toggleOpen}
          className="bg-emerald-500 hover:bg-emerald-600 text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Song
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-auto bg-zinc-900 border-zinc-700 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Add New Song</DialogTitle>
          <DialogDescription>Add a new song to your profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <input ref={audioInputRef} type="file" accept="audio/*" hidden />

          <input ref={imageInputRef} type="file" accept="image/*" hidden />

          {/* image upload area */}
          <div
            onClick={() => imageInputRef.current?.click()}
            className={clsx(
              "p-6",
              "flex",
              "items-center",
              "justify-center",
              "border-2",
              "border-dashed",
              "border-zinc-700",
              "rounded-lg",
              "cursor-pointer",
            )}
          >
            <div className="text-center">
              {newSong.image ? (
                <div className="space-y-2">
                  <div className="text-sm text-emerald-500">
                    Image selected:
                  </div>
                  <div className="text-xs text-zinc-400">
                    {newSong.image.name.slice(0, 20)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 p-3 inline-block bg-zinc-800 rounded-full">
                    <Upload className="h-6 w-6 text-zinc-400" />
                  </div>
                  <div className="mb-2 text-sm text-zinc-400">
                    Upload artwork
                  </div>
                  <Button>Choose File</Button>
                </>
              )}
            </div>
          </div>

          {/* audio upload area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio File</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant={"outline"}
                className="w-full"
              >
                {newSong.audio
                  ? newSong.audio.name.slice(0, 20)
                  : "Choose Audio File"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={newSong.name}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={toggleOpen} variant={"outline"}>Cancel</Button>
          <Button>Add Song</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongDialog;
