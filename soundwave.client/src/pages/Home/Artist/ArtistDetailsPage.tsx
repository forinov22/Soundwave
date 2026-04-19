import { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
import {
  Play,
  Shuffle,
  MoreHorizontal,
  Users,
  Check,
  Plus,
  Clock,
} from "lucide-react";

import { songsData, albumsData } from "@/assets/assets"; // Предположим, путь такой
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/shared/ui/MediaCard";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { Typography } from "@/shared/ui/Typography";
import { TrackRow } from "@/shared/ui/TrackRow";
import { TrackTable } from "@/shared/ui/TrackTable";

import type { LayoutOutletContext } from "../MainLayout";

const ArtistDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();

  const [activeFilter, setActiveFilter] = useState("Популярные релизы");
  const [isFollowing, setIsFollowing] = useState(false);

  // Хардкод данных для верстки (потом заменим на fetch)
  const artist = {
    name: "Imagine Dragons",
    monthlyListeners: 102456789,
    imageUrl: songsData[0].image,
    headerImageUrl: songsData[1].image, // Баннер
  };

  useEffect(() => {
    // Устанавливаем градиент на основе "бренд-цвета" артиста
    setGradientBgColor("#424242");
    return () => setGradientBgColor();
  }, [setGradientBgColor]);

  return (
    <div className="relative pb-10">
      {/* 1. Секция Баннера (Artist Card Style) */}
      <div className="relative -mx-6 -mt-6 flex h-[30vh] items-end overflow-hidden p-8 md:h-[40vh]">
        <img
          src={artist.headerImageUrl}
          className="absolute inset-0 h-full w-full object-cover brightness-75"
          alt=""
        />
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-full bg-blue-500 p-1">
              <Check className="size-3 fill-current text-white" />
            </div>
            <span className="text-sm font-medium text-white shadow-sm">
              Подтвержденный исполнитель
            </span>
          </div>
          <h1 className="mb-6 text-5xl font-black text-white drop-shadow-lg md:text-8xl">
            {artist.name}
          </h1>
          <div className="flex items-center gap-2 font-medium text-white">
            <Users className="size-5" />
            <span>
              {artist.monthlyListeners.toLocaleString()} слушателей в месяц
            </span>
          </div>
        </div>
      </div>

      {/* 2. Блок управления */}
      <div className="my-8 flex items-center gap-6">
        <Button
          size="icon"
          className="size-14 rounded-full bg-emerald-500 text-black shadow-lg transition-transform hover:scale-105 hover:bg-emerald-400"
        >
          <Play className="size-6 fill-current" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 rounded-full border-zinc-600 text-zinc-400 hover:border-white hover:text-white"
        >
          <Shuffle className="size-5" />
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "rounded-full border-zinc-600 px-6 text-xs font-bold tracking-widest uppercase transition-all",
            isFollowing
              ? "border-emerald-500 text-emerald-500"
              : "text-white hover:border-white",
          )}
        >
          {isFollowing ? "Вы подписаны" : "Подписаться"}
        </Button>
        <MoreHorizontal className="size-8 cursor-pointer text-zinc-400 hover:text-white" />
      </div>

      {/* 3. Популярные треки */}
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold text-text-primary">
          Популярные треки
        </h2>
        <TrackTable
          data={songsData.slice(0, 5)}
          getKey={(t) => t.id}
          onRowClick={() => {}}
          columns={[
            {
              key: "track",
              header: "Название",
              width: "1fr",
              render: (track) => (
                <TrackRow
                  image={track.image}
                  title={track.name}
                  subtitle="Night Visions"
                  size="sm"
                  subtitlePrefix={
                    <span className="shrink-0 rounded-sm bg-white/10 px-1 text-[10px] text-text-secondary">
                      E
                    </span>
                  }
                />
              ),
            },
            {
              key: "plays",
              // Нет header — над этой колонкой пусто
              width: "auto",
              hideOnMobile: true,
              render: () => (
                <Typography variant="subtitle" size="sm">
                  854 234 102
                </Typography>
              ),
            },
            {
              key: "actions",
              width: "auto",
              align: "right",
              // Нет header — над плюсиком пусто
              render: () => (
                <ActionIcon
                  icon={<Plus className="size-4" />}
                  size="sm"
                  label="Добавить"
                  className="opacity-0 group-hover:opacity-100"
                />
              ),
            },
            {
              key: "duration",
              header: <Clock className="size-4" />,
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
      </section>

      {/* 4. Секция Музыка с фильтрами */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Музыка</h2>
          <button
            onClick={() => navigate(`/artist/${id}/discography`)}
            className="text-sm font-bold text-zinc-400 transition-colors hover:text-white"
          >
            Показать все
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {["Популярные релизы", "Альбомы", "Синглы", "EP"].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                activeFilter === tag
                  ? "bg-white text-black"
                  : "bg-zinc-800/50 text-white hover:bg-zinc-800",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {albumsData.slice(0, 5).map((album) => (
            <MediaCard
              key={album.id}
              image={album.image}
              title={album.name}
              subtitle={`${album.id % 2 === 0 ? "Альбом" : "Сингл"} • 2023`}
              hoverButton={
                <Button
                  size="icon"
                  className="size-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/50"
                >
                  <Play className="fill-current" />
                </Button>
              }
              onClick={() => navigate(`/album/${album.id}`)}
              className="p-4"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArtistDetailsPage;
