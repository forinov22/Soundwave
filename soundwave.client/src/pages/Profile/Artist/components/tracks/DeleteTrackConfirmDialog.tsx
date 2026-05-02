import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Typography } from "@/shared/ui/Typography";
import type { DraftReleaseRef } from "@/features/artist/types/Payloads";

interface DeleteTrackConfirmDialogProps {
  open: boolean;
  trackTitle: string;
  draftReleases: DraftReleaseRef[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteTrackConfirmDialog = ({
  open,
  trackTitle,
  draftReleases,
  onConfirm,
  onCancel,
  isLoading,
}: DeleteTrackConfirmDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(o) => {
      if (!o) onCancel();
    }}
  >
    <DialogContent className="rounded-3xl border-hairline bg-graphite-panel p-8 text-text-primary sm:max-w-md">
      <DialogHeader>
        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-amber-500/10">
          <AlertTriangle className="size-5 text-amber-400" />
        </div>
        <DialogTitle className="text-xl font-semibold text-text-primary">
          Удалить трек?
        </DialogTitle>
        <DialogDescription className="text-text-secondary">
          Трек{" "}
          <span className="font-semibold text-text-primary">
            «{trackTitle}»
          </span>{" "}
          сейчас используется в черновиках релизов. При удалении он также
          пропадёт из них.
        </DialogDescription>
      </DialogHeader>

      <div className="my-2 space-y-2">
        <Typography variant="label" size="xs" className="text-text-muted">
          Затронутые черновики
        </Typography>
        <ul className="space-y-1.5 rounded-xl border border-hairline bg-graphite-inset p-3">
          {draftReleases.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <span className="size-1 rounded-full bg-amber-400" />
              {d.title}
            </li>
          ))}
        </ul>
      </div>

      <DialogFooter className="gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-full text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
        >
          Отмена
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-full bg-red-500 px-6 font-semibold text-white hover:bg-red-500/90"
        >
          {isLoading ? "Удаление..." : "Удалить везде"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteTrackConfirmDialog;
