import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueueList } from "@/features/player/ui/QueueList";
import { ActionIcon } from "@/shared/ui/ActionIcon";

import { useRightSidebar } from "../lib/useRightSidebar";
import { usePlayerPlayback } from "../../player/lib/usePlayerPlayback";

export function RightSidebar() {
  const { view, isOpen, artistDetails, isLoading, error, close } =
    useRightSidebar();
  const { currentTrack } = usePlayerPlayback();

  if (!isOpen) {
    return null;
  }

  console.log(artistDetails);

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="sticky top-0 flex h-full w-80 flex-col border-l border-white/5 bg-zinc-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-white">
            {view === "trackInfo" ? "О треке" : "Очередь"}
          </h2>
          <ActionIcon
            icon={<X className="size-5" />}
            onClick={close}
            label="Закрыть"
          />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4">
            {view === "trackInfo" && currentTrack && (
              <div className="space-y-6 pb-6">
                {/* Карточка трека */}
                <div className="space-y-4">
                  <img
                    src={currentTrack.imageUrl}
                    className="aspect-square w-full rounded-xl border border-white/5 object-cover shadow-2xl"
                    alt={currentTrack.title}
                  />
                  <div>
                    <h3 className="cursor-pointer text-xl font-bold text-white hover:underline">
                      {currentTrack.title}
                    </h3>
                    <p className="text-zinc-400">{currentTrack.artistName}</p>
                  </div>
                </div>

                {/* Карточка артиста */}
                {isLoading ? (
                  <ArtistCardSkeleton />
                ) : (
                  artistDetails && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50"
                    >
                      <img
                        src={artistDetails.bannerUrl}
                        className="h-48 w-full object-cover"
                        alt=""
                      />
                      <div className="space-y-3 p-4">
                        <h4 className="text-lg font-bold text-white">
                          {artistDetails.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Users className="size-4" />
                          <span>
                            {artistDetails.monthlyListeners.toLocaleString()}{" "}
                            слушателей в месяц
                          </span>
                        </div>
                        <p className="line-clamp-4 text-sm leading-relaxed text-zinc-400">
                          {artistDetails.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full rounded-full border-zinc-700 text-xs hover:bg-zinc-800"
                        >
                          Подробнее об артисте
                        </Button>
                      </div>
                    </motion.div>
                  )
                )}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
                    Не удалось загрузить информацию об артисте: {error}
                  </div>
                )}
              </div>
            )}

            {view === "queue" && (
              <div className="mt-10 text-center text-zinc-500">
                <QueueList />
              </div>
            )}
          </ScrollArea>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function ArtistCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-zinc-900/50 p-4">
      <div className="h-40 w-full animate-pulse rounded-lg bg-zinc-800" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
      <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
    </div>
  );
}
