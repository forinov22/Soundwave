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
  Loader2,
  Heart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/shared/ui/MediaCard";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { Typography } from "@/shared/ui/Typography";
import { TrackRow } from "@/shared/ui/TrackRow";
import { TrackTable } from "@/shared/ui/TrackTable";
import { formatDuration } from "@/shared/lib/formatDuration";
import { useArtistPublic } from "@/features/artist-public/lib/useArtistPublic";
import { artistPublicApi } from "@/features/artist-public/api/artistPublicApi";
import { useAsync } from "@/shared/hooks/useAsync";
import { useLikeArtist } from "@/features/likes/lib/useLikeArtist";
import type { Release } from "@/shared/types/Release";

import type { LayoutOutletContext } from "../MainLayout";

const PREVIEW_RELEASES_COUNT = 5;

const ArtistDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setGradientBgColor } = useOutletContext<LayoutOutletContext>();

  const artistId = Number(id);
  const [activeFilter, setActiveFilter] = useState<string>("Все");

  const { profile, popularTracks, isLoading } = useArtistPublic(artistId);
  const { isArtistFollowed, toggleFollowArtist } = useLikeArtist();

  // Превью релизов для секции "Музыка"
  const { execute: fetchReleases, isLoading: isReleasesLoading } = useAsync(
    async () => {
      const typeMap: Record<string, string | undefined> = {
        Все: undefined,
        Альбомы: "Album",
        Синглы: "Single",
        EP: "EP",
      };
      const res = await artistPublicApi.getReleasesPreviews(artistId, {
        type: (typeMap[activeFilter] as any) ?? undefined,
        page: 1,
        pageSize: PREVIEW_RELEASES_COUNT,
      });
      return res.data.items;
    },
  );

  const [previewReleases, setPreviewReleases] = useState<Release[]>([]);

  useEffect(() => {
    fetchReleases().then((items) => {
      if (items) setPreviewReleases(items);
    });
  }, [artistId, activeFilter, fetchReleases]);

  useEffect(() => {
    // Используем bgColor первого релиза, если есть; иначе дефолт
    setGradientBgColor("#424242");
    return () => setGradientBgColor();
  }, [setGradientBgColor]);

  if (isLoading || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative pb-10">
      {/* 1. Баннер */}
      <div className="relative -mx-6 -mt-6 flex h-[30vh] items-end overflow-hidden p-8 md:h-[40vh]">
        {profile.bannerUrl ? (
          <img
            src={profile.bannerUrl}
            className="absolute inset-0 h-full w-full object-cover brightness-75"
            alt=""
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-b from-zinc-700 to-zinc-900" />
        )}
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
            {profile.name}
          </h1>
          <div className="flex items-center gap-2 font-medium text-white">
            <Users className="size-5" />
            <span>
              {profile.monthlyListeners.toLocaleString("ru-RU")} слушателей в
              месяц
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
          onClick={() => toggleFollowArtist(artistId)}
          className={cn(
            "rounded-full border-zinc-600 px-6 text-xs font-bold tracking-widest uppercase transition-all",
            isArtistFollowed(artistId)
              ? "border-emerald-500 text-emerald-500"
              : "text-white hover:border-white",
          )}
        >
          {isArtistFollowed(artistId) ? "Вы подписаны" : "Подписаться"}
        </Button>
        <ActionIcon
          icon={
            <Heart
              className={
                isArtistFollowed(artistId)
                  ? "size-7 fill-emerald-500 text-emerald-500"
                  : "size-7"
              }
            />
          }
          size="lg"
          label={isArtistFollowed(artistId) ? "Убрать из медиатеки" : "Сохранить в медиатеку"}
          onClick={() => toggleFollowArtist(artistId)}
        />
        <MoreHorizontal className="size-8 cursor-pointer text-zinc-400 hover:text-white" />
      </div>

      {/* 3. Популярные треки */}
      {popularTracks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-text-primary">
            Популярные треки
          </h2>
          <TrackTable
            data={popularTracks}
            getKey={(t) => t.id}
            onRowClick={() => {}}
            columns={[
              {
                key: "track",
                header: "Название",
                width: "1fr",
                render: (track) => (
                  <TrackRow
                    image={track.imageUrl}
                    title={track.title}
                    subtitle={profile.name}
                    size="sm"
                  />
                ),
              },
              {
                key: "plays",
                width: "auto",
                hideOnMobile: true,
                render: (track) => (
                  <Typography variant="subtitle" size="sm">
                    {track.playCount?.toLocaleString("ru-RU") ?? "—"}
                  </Typography>
                ),
              },
              {
                key: "actions",
                width: "auto",
                align: "right",
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
                    {formatDuration(track.durationSeconds)}
                  </Typography>
                ),
              },
            ]}
          />
        </section>
      )}

      {/* 4. Секция "Музыка" с фильтрами */}
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
          {["Все", "Альбомы", "Синглы", "EP"].map((tag) => (
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

        {isReleasesLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {previewReleases.map((release) => (
              <MediaCard
                key={release.id}
                image={release.imageUrl ?? ""}
                title={release.title}
                subtitle={`${release.type} · ${release.releaseDate ? new Date(release.releaseDate).getFullYear() : ""}`}
                hoverButton={
                  <Button
                    size="icon"
                    className="size-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-black/50"
                  >
                    <Play className="fill-current" />
                  </Button>
                }
                onClick={() => navigate(`/releases/${release.id}`)}
                className="p-4"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ArtistDetailsPage;
