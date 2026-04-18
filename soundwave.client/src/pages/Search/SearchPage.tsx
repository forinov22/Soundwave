import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { songsData, albumsData } from "@/assets/assets";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { MediaCard } from "@/shared/ui/MediaCard";
import AlbumItem from "@/shared/ui/AlbumItem";
import { ArtistItem } from "@/shared/ui/ArtistItem";
import { Typography } from "@/shared/ui/Typography";
import { ActionIcon } from "@/shared/ui/ActionIcon";

// ─── Мок-данные ────────────────────────────────────────────────────────────

const MOCK_TOP_RESULT = {
  title: "Top 50 Global",
  artist: "Various Artists",
  image: albumsData[0].image,
  type: "Альбом",
};

// Ровно 4 трека — чтобы таблица совпадала по высоте с TopResultCard
const MOCK_TRACKS = songsData.slice(0, 4).map((s) => ({
  id: s.id,
  title: s.name,
  artist: "Various Artists",
  image: s.image,
  duration: s.duration,
}));

const MOCK_ALBUMS = albumsData.map((a) => ({
  id: a.id,
  name: a.name,
  image: a.image,
  description: a.desc,
}));

const MOCK_ARTISTS = songsData.slice(0, 5).map((s, i) => ({
  id: i,
  name: `Artist ${i + 1}`,
  image: s.image,
}));

// ─── Карточка лучшего результата ──────────────────────────────────────────

const TopResultCard = ({ item }: { item: typeof MOCK_TOP_RESULT }) => (
  <div className="group relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-surface p-6 transition-all duration-300 hover:bg-surface-hover">
    {/* Свечение при ховере */}
    <div className="pointer-events-none absolute -inset-24 bg-primary/10 opacity-0 blur-[80px] transition-opacity duration-500 group-hover:opacity-100" />

    <div className="relative z-10 flex h-full flex-col">
      {/* Обложка */}
      <div className="relative mb-5 size-28 overflow-hidden rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        <img
          src={item.image}
          alt={item.title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-2 bottom-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-xl transition-transform hover:scale-110 active:scale-95">
            <Play className="ml-0.5 size-5 fill-current text-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Название */}
      <h2 className="mb-2 text-3xl font-black tracking-tight text-text-primary transition-colors group-hover:text-primary">
        {item.title}
      </h2>

      {/* Тип + артист */}
      <div className="mt-auto flex items-center gap-3">
        <span className="rounded-md border border-white/10 bg-black/50 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
          {item.type}
        </span>
        <Typography variant="subtitle" size="sm" underlineOnHover>
          {item.artist}
        </Typography>
      </div>
    </div>
  </div>
);

// ─── Секция ────────────────────────────────────────────────────────────────

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

// ─── Фильтры ───────────────────────────────────────────────────────────────

const FILTERS = ["Все", "Треки", "Альбомы", "Исполнители", "Плейлисты"];

// ─── Страница ──────────────────────────────────────────────────────────────

const SearchPage = () => {
  const [activeFilter, setActiveFilter] = useState("Все");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-7xl pb-32"
    >
      {/* Фильтры */}
      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150",
              activeFilter === f
                ? "bg-text-primary text-black"
                : "bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Секция 1: Лучший результат + Треки ── */}
          {(activeFilter === "Все" || activeFilter === "Треки") && (
            <section className="mb-10">
              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                {/* Лучший результат */}
                {activeFilter === "Все" && (
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
                    {/* flex-1 растягивает карточку на полную высоту колонки */}
                    <div className="flex-1">
                      <TopResultCard item={MOCK_TOP_RESULT} />
                    </div>
                  </motion.div>
                )}

                {/* Треки */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className={cn(
                    "flex flex-col",
                    activeFilter === "Все" ? "lg:col-span-7" : "lg:col-span-12",
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
                    data={MOCK_TRACKS}
                    getKey={(t) => t.id}
                    onRowClick={() => {}}
                    showHeader={false}
                    columns={[
                      {
                        key: "track",
                        width: "1fr",
                        render: (track) => (
                          <TrackRow
                            image={track.image}
                            title={track.title}
                            subtitle={track.artist}
                            size="sm"
                          />
                        ),
                      },
                      {
                        key: "like",
                        width: "auto",
                        align: "right",
                        render: () => (
                          <ActionIcon
                            icon={<Heart className="size-4" />}
                            variant="primary"
                            size="sm"
                            label="В избранное"
                            className="opacity-0 group-hover:opacity-100"
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
                            {track.duration}
                          </Typography>
                        ),
                      },
                    ]}
                  />
                </motion.div>
              </div>
            </section>
          )}

          {/* ── Исполнители ── */}
          {(activeFilter === "Все" || activeFilter === "Исполнители") && (
            <Section title="Исполнители">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {MOCK_ARTISTS.map((artist) => (
                  <ArtistItem
                    key={artist.id}
                    name={artist.name}
                    image={artist.image}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ── Альбомы ── */}
          {(activeFilter === "Все" || activeFilter === "Альбомы") && (
            <Section title="Альбомы">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {MOCK_ALBUMS.map((album) => (
                  <AlbumItem
                    key={album.id}
                    name={album.name}
                    image={album.image}
                    description={album.description}
                    onClick={() => {}}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* ── Плейлисты ── */}
          {(activeFilter === "Все" || activeFilter === "Плейлисты") && (
            <Section title="Плейлисты">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {MOCK_ALBUMS.slice(0, 4).map((album) => (
                  <MediaCard
                    key={album.id}
                    image={album.image}
                    title={`Плейлист ${album.id + 1}`}
                    subtitle={album.description}
                    subtitleClamp={2}
                    titleUnderlineOnHover
                    hoverButton={
                      <div className="flex size-11 items-center justify-center rounded-full bg-primary shadow-xl">
                        <Play className="ml-0.5 size-5 fill-current text-primary-foreground" />
                      </div>
                    }
                    onClick={() => {}}
                  />
                ))}
              </div>
            </Section>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchPage;
