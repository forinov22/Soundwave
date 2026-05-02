import { useState, useMemo } from "react";
import { Search, AlertCircle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useArtist } from "@/features/artist/lib/useArtist";
import {
  isPublishedTrack,
  type ArtistTrack,
} from "@/features/artist/types/ArtistTrack";
import type { ReleaseDetails } from "@/shared/types/Release";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";
import { cn } from "@/lib/utils";

interface TrackPickerDialogProps {
  open: boolean;
  onClose: () => void;
  release: ReleaseDetails;
}

// Диалог выбора треков из плейграунда для добавления в черновик.
// Многошаговый: чекбоксы → подтверждение → батч-добавление.
//
// Важные UX-правила:
//  - Скрываем треки, уже входящие в этот релиз (они и так там).
//  - Опубликованные в других релизах подсвечиваются предупреждением:
//    добавить можно, но при попытке опубликовать релиз будет конфликт.
//    Это сознательный мягкий вариант — артист может прикинуть,
//    но фронт явно сообщает о последствии.
const TrackPickerDialog = ({
  open,
  onClose,
  release,
}: TrackPickerDialogProps) => {
  const { tracks, addTrackToRelease, isAddingTrackToRelease } = useArtist();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const trackIdsAlreadyInRelease = useMemo(
    () => new Set(release.tracks.map((t) => t.id)),
    [release.tracks],
  );

  // Кандидаты — все треки артиста, кроме уже включённых в этот релиз.
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tracks
      .filter((t) => !trackIdsAlreadyInRelease.has(t.id))
      .filter((t) => (q === "" ? true : t.title.toLowerCase().includes(q)));
  }, [tracks, trackIdsAlreadyInRelease, search]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleClose = () => {
    setSelected(new Set());
    setSearch("");
    onClose();
  };

  const handleAdd = async () => {
    // Добавляем последовательно — бэк отдаёт обновлённый релиз
    // на каждом запросе, состояние всегда консистентно.
    // Если станет узким местом, можно сделать batch-эндпоинт.
    for (const trackId of selected) {
      try {
        await addTrackToRelease(release.id, trackId);
      } catch {
        // отдельная ошибка не должна валить весь батч —
        // useArtist уже залогировал её в стейт хука.
      }
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col rounded-3xl border-white/10 bg-zinc-950 p-8 text-text-primary sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-text-primary">
            Добавить треки
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Выберите треки из плейграунда. Релиз —{" "}
            <span className="text-text-primary">«{release.title}»</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="h-10 rounded-xl border-white/10 bg-white/5 pl-9 text-text-primary placeholder:text-text-muted focus-visible:ring-primary"
          />
        </div>

        {/* Список */}
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Typography variant="title" size="md" className="mb-1">
                {tracks.length === 0
                  ? "Плейграунд пуст"
                  : "Нет подходящих треков"}
              </Typography>
              <Typography variant="subtitle" size="sm">
                {tracks.length === 0
                  ? "Сначала загрузите трек на вкладке «Плейграунд»"
                  : "Попробуйте другой запрос"}
              </Typography>
            </div>
          ) : (
            <ul className="space-y-1">
              {candidates.map((t) => (
                <PickerRow
                  key={t.id}
                  track={t}
                  selected={selected.has(t.id)}
                  onToggle={() => toggle(t.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="rounded-full text-text-secondary hover:bg-white/5 hover:text-text-primary"
          >
            Отмена
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0 || isAddingTrackToRelease}
            className="rounded-full bg-primary px-8 font-bold text-primary-foreground hover:bg-primary/80"
          >
            {isAddingTrackToRelease
              ? "Добавление..."
              : selected.size === 0
                ? "Добавить"
                : `Добавить (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Строка с чекбоксом ──────────────────────────────────────────────────────

interface PickerRowProps {
  track: ArtistTrack;
  selected: boolean;
  onToggle: () => void;
}

const PickerRow = ({ track, selected, onToggle }: PickerRowProps) => {
  const isPublished = isPublishedTrack(track);

  return (
    <li>
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
          selected
            ? "border-primary/60 bg-primary/10"
            : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5",
        )}
      >
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/20",
          )}
        >
          {selected && <Check className="size-3" />}
        </span>

        <div className="min-w-0 flex-1">
          <TrackRow
            image={track.imageUrl}
            title={track.title}
            subtitle={track.artistName}
            size="sm"
          />
        </div>

        {/* Предупреждение, если трек уже опубликован в другом релизе */}
        {isPublished && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300"
            title="Этот трек уже опубликован в другом релизе. При публикации этого релиза будет конфликт."
          >
            <AlertCircle className="size-3" />
            Опубликован
          </span>
        )}
      </button>
    </li>
  );
};

export default TrackPickerDialog;
