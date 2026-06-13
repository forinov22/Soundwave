import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Loader2, Search, X } from "lucide-react";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { MediaCard } from "@/shared/ui/MediaCard";
import { ArtistItem } from "@/shared/ui/ArtistItem";
import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { formatDuration } from "@/shared/lib/formatDuration";
import { useSearch } from "@/features/search/lib/useSearch";
import type { SearchFilterType } from "@/features/search/types";
import { useSearchStore } from "@/features/search/model/searchStore";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { useLike } from "@/features/playlists/lib/useLike";

// ── Фильтры ───────────────────────────────────────────────────────────────

const FILTERS: SearchFilterType[] = [
  "Все",
  "Треки",
  "Альбомы",
  "Исполнители",
  "Плейлисты",
];

// ── TopResultCard ─────────────────────────────────────────────────────────

const TopResultCard = ({
  item,
}: {
  item: {
    title: string;
    imageUrl: string | null;
    artistName: string;
    type: string;
  };
}) => (
  <div className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-300 hover:bg-surface-hover">
    <div className="pointer-events-none absolute -inset-24 bg-primary/10 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />
    <div className="relative z-10 flex h-full flex-col">
      <div className="relative mb-5 size-28 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-zinc-700">
            <Search className="size-8 text-zinc-400" />
          </div>
        )}
        <div className="absolute right-2 bottom-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-xl transition-transform hover:scale-110">
            <Play className="ml-0.5 size-5 fill-current text-primary-foreground" />
          </div>
        </div>
      </div>
      <h2 className="mb-2 text-3xl font-black tracking-tight text-text-primary transition-colors group-hover:text-primary">
        {item.title}
      </h2>
      <div className="mt-auto flex items-center gap-3">
        <span className="rounded-md border border-white/10 bg-black/50 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
          {item.type}
        </span>
        {item.artistName && (
          <Typography variant="subtitle" size="sm" underlineOnHover>
            {item.artistName}
          </Typography>
        )}
      </div>
    </div>
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────

const Section = ({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("mb-10", className)}>
    <h2 className="mb-5 text-2xl font-black tracking-tight text-text-primary">
      {title}
    </h2>
    {children}
  </section>
);

// ── SearchPage ────────────────────────────────────────────────────────────

const SearchPage = () => {
  const navigate = useNavigate();
  const { query, filter, setFilter, result, isLoading, isEmpty } = useSearch();
  const recognizeResult = useSearchStore((s) => s.recognizeResult);
  const setRecognizeResult = useSearchStore((s) => s.setRecognizeResult);
  const { playTrack, playAlbum } = usePlayerPlayback();
  const { isLiked, toggleLike } = useLike();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-7xl pb-32"
    >
      {recognizeResult && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-white/10 bg-surface p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <Typography
              variant="label"
              size="xs"
              className="text-text-secondary"
            >
              Результат распознавания
            </Typography>
            <button
              onClick={() => setRecognizeResult(null)}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="size-4" />
            </button>
          </div>

          {recognizeResult.bestMatch ? (
            // Уверенное совпадение
            <div className="flex items-center gap-4">
              <img
                src={recognizeResult.bestMatch.imageUrl}
                className="size-20 rounded-xl shadow-lg"
                alt=""
              />
              <div className="min-w-0 flex-1">
                <Typography variant="title" size="md" truncate>
                  {recognizeResult.bestMatch.title}
                </Typography>
                <Typography variant="subtitle" size="sm">
                  {recognizeResult.bestMatch.artistName}
                </Typography>
              </div>
              <button
                onClick={() => playTrack(recognizeResult.bestMatch!)}
                className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Play className="size-5 fill-current" />
              </button>
            </div>
          ) : recognizeResult.candidates.length > 0 ? (
            // Неуверенные кандидаты
            <div className="space-y-1">
              <Typography
                variant="subtitle"
                size="sm"
                className="mb-3 text-text-muted"
              >
                Возможно, это один из этих треков:
              </Typography>
              <TrackTable
                data={recognizeResult.candidates}
                getKey={(t) => t.id}
                onRowClick={(track) => playTrack(track)}
                showHeader={false}
                columns={[
                  {
                    key: "track",
                    width: "1fr",
                    render: (track) => (
                      <TrackRow
                        image={track.imageUrl}
                        title={track.title}
                        subtitle={track.artistName}
                        size="sm"
                      />
                    ),
                  },
                  {
                    key: "duration",
                    width: "auto",
                    align: "right",
                    render: (track) => (
                      <Typography
                        variant="subtitle"
                        size="sm"
                        className="font-mono"
                      >
                        {formatDuration(track.durationSeconds)}
                      </Typography>
                    ),
                  },
                ]}
              />
            </div>
          ) : (
            // Ничего не найдено
            <Typography
              variant="subtitle"
              size="sm"
              className="text-text-muted"
            >
              Не удалось распознать трек. Попробуйте записать более длинный
              фрагмент.
            </Typography>
          )}
        </motion.div>
      )}
      {/* Фильтры — только если есть запрос */}
      {!isEmpty && (
        <div className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150",
                filter === f
                  ? "bg-text-primary text-black"
                  : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {/* Пустое состояние — нет запроса */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="mb-4 size-16 text-text-muted opacity-40" />
          <Typography variant="title" size="lg" className="mb-2 font-bold">
            Ищи что угодно
          </Typography>
          <Typography variant="subtitle" size="sm">
            Треки, исполнители, альбомы, плейлисты
          </Typography>
        </div>
      )}
      {/* Загрузка */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}
      {/* Нет результатов */}
      {!isEmpty &&
        !isLoading &&
        result &&
        !result.topResult &&
        result.tracks.length === 0 &&
        result.releases.length === 0 &&
        result.artists.length === 0 &&
        result.playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Typography variant="title" size="lg" className="mb-2 font-bold">
              Ничего не найдено
            </Typography>
            <Typography variant="subtitle" size="sm">
              Попробуй другой запрос — «{query}»
            </Typography>
          </div>
        )}
      {/* Результаты */}
      {result && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${query}:${filter}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Лучший результат + Треки */}
            {(filter === "Все" || filter === "Треки") &&
              (result.topResult || result.tracks.length > 0) && (
                <section className="mb-10">
                  <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                    {filter === "Все" && result.topResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col lg:col-span-5"
                      >
                        <Typography
                          variant="label"
                          size="xs"
                          className="mb-4 text-text-secondary"
                        >
                          Лучший результат
                        </Typography>
                        <div className="flex-1">
                          <TopResultCard item={result.topResult} />
                        </div>
                      </motion.div>
                    )}

                    {result.tracks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className={cn(
                          "flex flex-col",
                          filter === "Все" ? "lg:col-span-7" : "lg:col-span-12",
                        )}
                      >
                        <Typography
                          variant="label"
                          size="xs"
                          className="mb-4 text-text-secondary"
                        >
                          Треки
                        </Typography>
                        <TrackTable
                          data={result.tracks}
                          getKey={(t) => t.id}
                          onRowClick={(_, idx) => playAlbum(result.tracks, idx)}
                          showHeader={false}
                          columns={[
                            {
                              key: "track",
                              width: "1fr",
                              render: (track) => (
                                <TrackRow
                                  image={track.imageUrl}
                                  title={track.title}
                                  subtitle={track.artistName}
                                  size="sm"
                                />
                              ),
                            },
                            {
                              key: "like",
                              width: "auto",
                              align: "right",
                              render: (track) => (
                                <ActionIcon
                                  icon={
                                    <Heart
                                      className={
                                        isLiked(track.id)
                                          ? "size-4 fill-emerald-500 text-emerald-500"
                                          : "size-4"
                                      }
                                    />
                                  }
                                  variant="primary"
                                  size="sm"
                                  label={isLiked(track.id) ? "Убрать из избранного" : "В избранное"}
                                  className="opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(track.id);
                                  }}
                                />
                              ),
                            },
                            {
                              key: "duration",
                              width: "auto",
                              align: "right",
                              render: (track) => (
                                <Typography
                                  variant="subtitle"
                                  size="sm"
                                  className="w-10 text-right font-mono"
                                >
                                  {formatDuration(track.durationSeconds)}
                                </Typography>
                              ),
                            },
                          ]}
                        />
                      </motion.div>
                    )}
                  </div>
                </section>
              )}

            {/* Исполнители */}
            {(filter === "Все" || filter === "Исполнители") &&
              result.artists.length > 0 && (
                <Section title="Исполнители">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {result.artists.map((artist) => (
                      <ArtistItem
                        key={artist.id}
                        name={artist.name}
                        image={artist.avatarUrl ?? ""}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                      />
                    ))}
                  </div>
                </Section>
              )}

            {/* Альбомы / Релизы */}
            {(filter === "Все" || filter === "Альбомы") &&
              result.releases.length > 0 && (
                <Section title="Альбомы">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {result.releases.map((release) => (
                      <MediaCard
                        key={release.id}
                        image={release.imageUrl ?? ""}
                        title={release.title}
                        subtitle={`${release.type} · ${release.artistName}`}
                        hoverButton={
                          <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-xl">
                            <Play className="ml-0.5 size-5 fill-current text-primary-foreground" />
                          </div>
                        }
                        onClick={() => navigate(`/album/${release.id}`)}
                      />
                    ))}
                  </div>
                </Section>
              )}

            {/* Плейлисты */}
            {(filter === "Все" || filter === "Плейлисты") &&
              result.playlists.length > 0 && (
                <Section title="Плейлисты">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {result.playlists.map((playlist) => (
                      <MediaCard
                        key={playlist.id}
                        image={playlist.imageUrl ?? ""}
                        title={playlist.title}
                        subtitle={playlist.ownerName}
                        subtitleClamp={2}
                        titleUnderlineOnHover
                        hoverButton={
                          <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-xl">
                            <Play className="ml-0.5 size-5 fill-current text-primary-foreground" />
                          </div>
                        }
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                      />
                    ))}
                  </div>
                </Section>
              )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default SearchPage;
