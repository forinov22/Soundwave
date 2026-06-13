import { useState } from "react";
import { ChevronDown, Music2, Pencil, Trash2 } from "lucide-react";

import { ActionIcon } from "@/shared/ui/ActionIcon";
import { Button } from "@/components/ui/button";
import { Typography } from "@/shared/ui/Typography";
import { useArtist } from "@/features/artist/lib/useArtist";
import { usePublishRelease } from "@/features/artist/lib/usePublishRelease";
import { cn } from "@/lib/utils";
import type { ReleaseDetails } from "@/shared/types/Release";

import ReleaseDialog from "./ReleaseDialog";
import ReleaseStatusBadge from "./ReleaseStatusBadge";
import ReleaseTypeBadge from "./ReleaseTypeBadge";
import ReleaseTracksList from "./ReleaseTracksList";
import TrackPickerDialog from "./TrackPickerDialog";
import PublishErrorBanner from "./PublishErrorBanner";

interface ReleaseCardProps {
  release: ReleaseDetails;
}

// Карточка релиза — раскрывающаяся, с треками внутри.
// Драфт → есть кнопки "Опубликовать", "Добавить треки", "Удалить".
// Опубликованный → только "В архив".
// Архивный → ничего, только просмотр.
const ReleaseCard = ({ release }: ReleaseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(release.status === "Draft");
  const [pickerOpen, setPickerOpen] = useState(false);

  const { deleteRelease, isDeletingRelease } = useArtist();
  const pub = usePublishRelease();

  const isDraft = release.status === "Draft";
  const isArchived = release.status === "Archived";
  const editable = isDraft;

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const dateLabel = formatDate(release.releaseDate ?? release.publishedAt);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        isArchived
          ? "border-white/5 bg-[oklch(0.20_0_0)] opacity-70"
          : "border-white/5 bg-[oklch(0.28_0_0)] hover:bg-[oklch(0.31_0_0)]",
      )}
    >
      {/* Шапка карточки */}
      <div className="flex items-center gap-4 p-4">
        {/* Обложка — клик раскрывает */}
        <button
          onClick={() => setIsExpanded((p) => !p)}
          className="relative size-16 shrink-0 overflow-hidden rounded-lg shadow-lg"
          aria-label={isExpanded ? "Свернуть" : "Развернуть"}
        >
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={release.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-white/5">
              <Music2 className="size-6 text-text-muted" />
            </div>
          )}
        </button>

        {/* Инфо */}
        <button
          onClick={() => setIsExpanded((p) => !p)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <Typography
              variant="title"
              size="md"
              truncate
              className="font-bold"
            >
              {release.title}
            </Typography>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-text-muted transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ReleaseStatusBadge status={release.status} />
            <ReleaseTypeBadge type={release.type} />
            <Typography variant="subtitle" size="xs">
              {release.tracks.length} треков
              {dateLabel && ` · ${dateLabel}`}
            </Typography>
          </div>
        </button>

        {/* Действия */}
        <div className="flex items-center gap-1">
          {isDraft && (
            <ReleaseDialog release={release}>
              <div>
                <ActionIcon
                  icon={<Pencil className="size-4" />}
                  size="sm"
                  label="Редактировать"
                />
              </div>
            </ReleaseDialog>
          )}

          {!isArchived && (
            <button
              onClick={() => deleteRelease(release.id)}
              disabled={isDeletingRelease}
              className="flex size-7 items-center justify-center rounded-full text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-90 disabled:opacity-40"
              aria-label={isDraft ? "Удалить черновик" : "Отправить в архив"}
              title={isDraft ? "Удалить черновик" : "Отправить в архив"}
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Раскрывающаяся часть */}
      {isExpanded && (
        <div className="space-y-4 border-t border-white/5 p-4">
          {release.description && (
            <Typography variant="subtitle" size="sm" className="italic">
              {release.description}
            </Typography>
          )}

          <PublishErrorBanner
            validationMessage={pub.validationMessage}
            conflicts={pub.conflicts}
            onDismiss={() => {
              pub.dismissValidation();
              pub.dismissConflicts();
            }}
          />

          <ReleaseTracksList
            releaseId={release.id}
            tracks={release.tracks}
            editable={editable}
          />

          {/* Action bar для драфта */}
          {isDraft && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <Button
                onClick={() => setPickerOpen(true)}
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              >
                Добавить треки
              </Button>

              <Button
                onClick={() => pub.publish(release.id)}
                disabled={pub.isPublishing || release.tracks.length === 0}
                className="rounded-full border-0 bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                {pub.isPublishing ? "Публикация..." : "Опубликовать"}
              </Button>
            </div>
          )}
        </div>
      )}

      {pickerOpen && (
        <TrackPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          release={release}
        />
      )}
    </div>
  );
};

export default ReleaseCard;
