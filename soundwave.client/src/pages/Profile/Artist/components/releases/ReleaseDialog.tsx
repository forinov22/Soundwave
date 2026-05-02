import { useState, useRef, useEffect } from "react";
import { ImagePlus } from "lucide-react";

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
import { useArtist } from "@/features/artist/lib/useArtist";
import type { ReleaseDetails } from "@/shared/types/Release";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ReleaseDialogProps {
  release?: ReleaseDetails;
  children: React.ReactNode;
}

const toDateInputValue = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold tracking-wider text-text-muted uppercase">
      {label}
    </label>
    {children}
  </div>
);

const ReleaseDialog = ({ release, children }: ReleaseDialogProps) => {
  const { createDraft, isCreatingDraft, updateDraft, isUpdatingDraft } =
    useArtist();

  const isNew = !release;
  const isEditingDraft = release?.status === "Draft";
  const readOnly = !isNew && !isEditingDraft;

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(release?.title ?? "");
  const [description, setDescription] = useState(release?.description ?? "");
  const [releaseDate, setReleaseDate] = useState<string>(
    toDateInputValue(release?.releaseDate),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    release?.imageUrl ?? null,
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTitle(release?.title ?? "");
      setDescription(release?.description ?? "");
      setReleaseDate(toDateInputValue(release?.releaseDate));
      setImageFile(null);
      setImagePreview(release?.imageUrl ?? null);
    }
  }, [isOpen, release]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const isoReleaseDate =
      releaseDate.trim() === ""
        ? undefined
        : new Date(releaseDate).toISOString();

    if (isNew) {
      const created = await createDraft({
        title: title.trim(),
        description: description.trim() || undefined,
        releaseDate: isoReleaseDate,
        image: imageFile ?? undefined,
      });
      if (created) setIsOpen(false);
      return;
    }

    if (isEditingDraft && release) {
      const updated = await updateDraft(release.id, {
        title: title.trim() !== release.title ? title.trim() : undefined,
        description:
          (description ?? "") !== (release.description ?? "")
            ? description
            : undefined,
        releaseDate:
          isoReleaseDate !== (release.releaseDate ?? undefined)
            ? isoReleaseDate
            : undefined,
        image: imageFile ?? undefined,
      });
      if (updated) setIsOpen(false);
    }
  };

  const isLoading = isCreatingDraft || isUpdatingDraft;
  const canSubmit = title.trim().length > 0 && !isLoading;

  const dialogTitle = isNew
    ? "Новый релиз"
    : readOnly
      ? "Релиз"
      : "Редактировать релиз";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-3xl border-hairline bg-graphite-panel p-8 text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            {dialogTitle}
          </DialogTitle>
          {isNew && (
            <DialogDescription className="text-text-secondary">
              Создайте черновик. Треки добавите позже из плейграунда. Обложка не
              обязательна — у сингла она унаследуется от трека.
            </DialogDescription>
          )}
          {readOnly && (
            <DialogDescription className="text-text-secondary">
              Опубликованный релиз нельзя редактировать. Если нужно что-то
              изменить — отправьте релиз в архив и создайте новый.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            onClick={() => !readOnly && imageInputRef.current?.click()}
            className={cn(
              "group relative mx-auto aspect-square w-32 overflow-hidden rounded-xl",
              "border-2 border-dashed border-white/10 bg-graphite-inset transition-all",
              !readOnly &&
                "cursor-pointer hover:border-primary/40 hover:bg-primary/5",
              imageFile && "border-solid border-primary/50",
              !imagePreview && readOnly && "opacity-60",
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt=""
                  className="size-full object-cover"
                />
                {!readOnly && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                    <ImagePlus className="size-4 text-white" />
                    <span className="text-xs text-white">Изменить</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-text-secondary">
                <ImagePlus className="size-6" />
                <span className="px-2 text-center text-xs">
                  {readOnly ? "Без обложки" : "Выбрать обложку"}
                </span>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={readOnly}
            />
          </div>

          <Field label="Название">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название релиза..."
              disabled={readOnly}
              className="h-10 rounded-xl border-hairline bg-graphite-inset text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
          </Field>

          <Field label="Описание">
            <Input
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опционально"
              disabled={readOnly}
              className="h-10 rounded-xl border-hairline bg-graphite-inset text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
            />
          </Field>

          <Field label="Дата выхода">
            <Input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              disabled={readOnly}
              className="h-10 rounded-xl border-hairline bg-graphite-inset text-text-primary focus-visible:ring-primary"
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          {readOnly ? (
            <Button
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-white/[0.06] px-6 text-text-primary hover:bg-white/[0.1]"
            >
              Закрыть
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="rounded-full text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSubmit}
                className="rounded-full bg-primary px-6 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {isLoading
                  ? isNew
                    ? "Создание..."
                    : "Сохранение..."
                  : isNew
                    ? "Создать"
                    : "Сохранить"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReleaseDialog;
