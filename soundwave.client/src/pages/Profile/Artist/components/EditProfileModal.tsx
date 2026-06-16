import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Typography } from "@/shared/ui/Typography";
import { useUpdateProfile } from "@/features/artist/lib/useUpdateProfile";
import type { ArtistProfile } from "@/features/artist/api/artistApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialDescription: string | null;
  initialAvatarUrl: string | null;
  initialBannerUrl: string | null;
  onSaved: (profile: ArtistProfile) => void;
}

function ImagePicker({
  label,
  currentUrl,
  preview,
  onFile,
  aspectClass,
}: {
  label: string;
  currentUrl: string | null;
  preview: string | null;
  onFile: (file: File) => void;
  aspectClass: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const display = preview ?? currentUrl;

  return (
    <div className="space-y-1.5">
      <Typography variant="subtitle" size="sm">
        {label}
      </Typography>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-800",
          "transition hover:border-white/20",
          aspectClass,
        )}
      >
        {display ? (
          <img src={display} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-zinc-500">
            <Upload className="size-5" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          <Upload className="size-5 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialDescription,
  initialAvatarUrl,
  initialBannerUrl,
  onSaved,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const { updateProfile, isLoading, error } = useUpdateProfile();

  if (!isOpen) return null;

  const handleAvatarFile = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleBannerFile = (file: File) => {
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile({
      name: name.trim() || undefined,
      description,
      avatar: avatarFile ?? undefined,
      banner: bannerFile ?? undefined,
    });
    if (result) {
      onSaved(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <Typography as="h2" variant="title" size="md">
            Редактировать профиль
          </Typography>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <ImagePicker
            label="Баннер"
            currentUrl={initialBannerUrl}
            preview={bannerPreview}
            onFile={handleBannerFile}
            aspectClass="aspect-[3/1]"
          />

          <div className="flex gap-4">
            <div className="w-24 shrink-0">
              <ImagePicker
                label="Аватар"
                currentUrl={initialAvatarUrl}
                preview={avatarPreview}
                onFile={handleAvatarFile}
                aspectClass="aspect-square"
              />
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div className="space-y-1.5">
                <Typography variant="subtitle" size="sm">
                  Имя
                </Typography>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <Typography variant="subtitle" size="sm">
                  Описание
                </Typography>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>

          {error && (
            <Typography variant="subtitle" size="sm" className="text-red-400">
              {error}
            </Typography>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
