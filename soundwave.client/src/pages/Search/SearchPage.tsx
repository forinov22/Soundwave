// @/features/search/ui/SearchPageComponents.tsx

import { motion, AnimatePresence } from "framer-motion";
import { Play, MoreHorizontal, Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import AlbumItem from "@/shared/ui/AlbumItem";

const MOCK_DATA = {
  topResult: {
    title: "After Hours",
    artist: "The Weeknd",
    image:
      "https://vibe.com/wp-content/uploads/2020/03/the-weeknd-after-hours-album-cover.jpg",
    type: "Альбом",
  },
  tracks: [
    {
      id: 1,
      title: "Blinding Lights",
      artist: "The Weeknd",
      image: "https://example.com/img1.jpg",
    },
    {
      id: 2,
      title: "Save Your Tears",
      artist: "The Weeknd",
      image: "https://example.com/img2.jpg",
    },
  ],
  albums: [
    {
      id: 1,
      title: "Starboy",
      image: "https://example.com/starboy.jpg",
      description: "2016 • Альбом",
    },
  ],
};

// Лучший результат с динамическим свечением
export const TopResultCard = ({ item }: any) => (
  <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 p-6 transition-all duration-500 hover:bg-zinc-800/40">
    {/* Мягкое свечение на фоне при ховере */}
    <div className="absolute -inset-24 bg-emerald-500/10 opacity-0 blur-[100px] transition-opacity duration-700 group-hover:opacity-100" />

    <div className="relative z-10">
      <div className="relative mb-6 size-28 overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <img
          src={item.image}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt=""
        />

        {/* Кнопка Play, которая "выплывает" */}
        <div className="absolute right-2 bottom-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-black shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play className="ml-1 size-6 fill-current" />
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-3xl font-black tracking-tight text-white transition-colors group-hover:text-emerald-400">
        {item.title}
      </h2>

      <div className="flex items-center gap-3">
        <span className="rounded-md border border-white/10 bg-black/60 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-white uppercase">
          {item.type}
        </span>
        <span className="text-sm font-semibold text-zinc-400 decoration-zinc-500 hover:underline">
          {item.artist}
        </span>
      </div>
    </div>
  </div>
);

// Стилизованная строка трека для поиска
export const SearchTrackRow = ({ track, index }: any) => (
  <div className="group flex cursor-pointer items-center gap-4 rounded-lg p-2 transition-all duration-200 hover:bg-white/10">
    <div className="relative size-10 shrink-0 overflow-hidden rounded">
      <img src={track.image} className="size-full object-cover" alt="" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Play className="size-4 fill-white text-white" />
      </div>
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-white">{track.title}</p>
      <p className="truncate text-xs font-medium text-zinc-400 transition-colors group-hover:text-zinc-300">
        {track.artist}
      </p>
    </div>

    <div className="flex translate-x-2 transform items-center gap-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
      <button className="text-zinc-400 transition-colors hover:text-emerald-500">
        <Heart className="size-4" />
      </button>
      <span className="min-w-[35px] font-mono text-xs text-zinc-500">3:42</span>
      <button className="text-zinc-400 transition-colors hover:text-white">
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  </div>
);

// @/pages/SearchPage.tsx

const SearchPage = () => {
  // ... (логика фильтров и MOCK_DATA та же)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-7xl pb-32"
    >
      {/* <SearchFilterBar activeFilter={filter} setFilter={setFilter} /> */}

      <AnimatePresence mode="wait">
        <div className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Лучший результат */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5"
          >
            <h2 className="mb-5 text-2xl font-black tracking-tight">
              Лучший результат
            </h2>
            <TopResultCard item={MOCK_DATA.topResult} />
          </motion.div>

          {/* Список треков */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <h2 className="mb-5 text-2xl font-black tracking-tight">Песни</h2>
            <div className="grid gap-0.5">
              {MOCK_DATA.tracks.map((track, i) => (
                <SearchTrackRow key={track.id} track={track} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Сетки категорий (Альбомы и т.д.) */}
      <div className="space-y-12">
        <section>
          <h2 className="mb-6 text-2xl font-black tracking-tight">Альбомы</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {MOCK_DATA.albums.map((album) => (
              <AlbumItem key={album.id} {...album} />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default SearchPage;
