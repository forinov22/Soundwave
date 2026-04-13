import { motion, AnimatePresence } from "framer-motion";
import { Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useRightSidebar } from "../lib/useRightSidebar";
import { usePlayerPlayback } from "../../player/lib/usePlayerPlayback";
import { QueueList } from "@/features/player/ui/QueueList";

export function RightSidebar() {
  const { view, isOpen, artistDetails, isLoading, error, close } =
    useRightSidebar();
  const { currentTrack } = usePlayerPlayback();

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="w-80 h-full sticky top-0 flex flex-col bg-zinc-950 border-l border-white/5"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h2 className="font-bold text-white text-lg">
            {view === "trackInfo" ? "О треке" : "Очередь"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="text-zinc-400 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <ScrollArea className="h-full px-4">
            {view === "trackInfo" && currentTrack && (
              <div className="space-y-6 pb-6">
                {/* Карточка трека */}
                <div className="space-y-4">
                  <img
                    src={currentTrack.imageUrl}
                    className="w-full aspect-square object-cover rounded-xl shadow-2xl border border-white/5"
                    alt={currentTrack.title}
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white hover:underline cursor-pointer">
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
                      className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5"
                    >
                      <img
                        src={artistDetails.imageUrl}
                        className="w-full h-48 object-cover"
                        alt=""
                      />
                      <div className="p-4 space-y-3">
                        <h4 className="font-bold text-white text-lg">
                          {artistDetails.name}
                        </h4>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                          <Users className="size-4" />
                          <span>
                            {artistDetails.monthlyListeners.toLocaleString()}{" "}
                            слушателей в месяц
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-4 leading-relaxed">
                          {artistDetails.description}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full border-zinc-700 hover:bg-zinc-800 rounded-full text-xs"
                        >
                          Подробнее об артисте
                        </Button>
                      </div>
                    </motion.div>
                  )
                )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    Не удалось загрузить информацию об артисте: {error}
                  </div>
                )}
              </div>
            )}

            {view === "queue" && (
              <div className="text-zinc-500 text-center mt-10">
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
    <div className="space-y-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
      <div className="w-full h-40 bg-zinc-800 animate-pulse rounded-lg" />
      <div className="h-4 w-1/2 bg-zinc-800 animate-pulse rounded" />
      <div className="h-3 w-full bg-zinc-800 animate-pulse rounded" />
      <div className="h-3 w-full bg-zinc-800 animate-pulse rounded" />
    </div>
  );
}
