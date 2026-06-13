import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import AlbumItem from "@/shared/ui/AlbumItem";
import TrackItem from "@/shared/ui/TrackItem";
import { useMusic } from "@/features/music/lib/useMusic.ts";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import { ArtistItem } from "@/shared/ui/ArtistItem";
import { MediaCard } from "@/shared/ui/MediaCard";
import { useHistory } from "@/features/history/lib/useHistory";
import type { ListenHistoryItem } from "@/features/history/types";
import type { Track } from "@/shared/types/Track";

const SectionHeader = ({
  title,
  onShowAll,
}: {
  title: string;
  onShowAll: () => void;
}) => (
  <div className="mt-8 mb-4 flex items-center justify-between px-2">
    <h2 className="cursor-pointer text-2xl font-bold hover:underline">
      {title}
    </h2>
    <button
      onClick={onShowAll}
      className="text-sm font-bold text-zinc-400 transition-colors hover:text-white"
    >
      Показать все
    </button>
  </div>
);

const toPlayerTrack = (item: ListenHistoryItem): Track => ({
  id: item.trackId,
  title: item.title,
  imageUrl: item.imageUrl ?? "",
  audioUrl: item.audioUrl,
  artistId: item.artistId,
  artistName: item.artistName,
  durationSeconds: item.durationSeconds,
  playCount: item.playCount,
});

const HomePage = () => {
  const {
    trendingTracks,
    popularReleases,
    popularArtists,
    popularPlaylists,
    fetchHome,
    isHomeLoading,
  } = useMusic();
  const { playTrack } = usePlayerPlayback();
  const navigate = useNavigate();
  const { listenHistory, recommendations } = useHistory();

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  if (isHomeLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-10 animate-spin text-emerald-500" />
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {listenHistory.length > 0 && (
        <>
          <SectionHeader
            title="Недавно слушали"
            onShowAll={() => navigate("/history")}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {listenHistory.slice(0, 5).map((item) => (
              <TrackItem
                key={item.trackId}
                name={item.title}
                image={item.imageUrl ?? ""}
                artist={item.artistName}
                onClick={() => playTrack(toPlayerTrack(item))}
              />
            ))}
          </div>
        </>
      )}

      {recommendations.length > 0 && (
        <>
          <SectionHeader
            title="Рекомендации для вас"
            onShowAll={() => navigate("/recommendations")}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommendations.slice(0, 5).map((item) => (
              <TrackItem
                key={item.trackId}
                name={item.title}
                image={item.imageUrl ?? ""}
                artist={item.artistName}
                onClick={() => playTrack(toPlayerTrack(item))}
              />
            ))}
          </div>
        </>
      )}

      <SectionHeader
        title="Популярные треки"
        onShowAll={() => navigate("/tracks")}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {trendingTracks.slice(0, 5).map((track) => (
          <TrackItem
            key={track.id}
            name={track.title}
            image={track.imageUrl}
            artist={track.artistName}
            onClick={() => playTrack(track)}
          />
        ))}
      </div>

      <SectionHeader
        title="Популярные альбомы"
        onShowAll={() => navigate("/albums")}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {popularReleases.slice(0, 5).map((release) => (
          <AlbumItem
            key={release.id}
            name={release.title}
            image={release.imageUrl}
            description={release.description}
            onClick={() => navigate(`/album/${release.id}`)}
          />
        ))}
      </div>

      <SectionHeader
        title="Популярные исполнители"
        onShowAll={() => navigate("/artists")}
      />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {popularArtists.slice(0, 5).map((artist) => (
          <ArtistItem
            key={artist.id}
            name={artist.name}
            image={artist.avatarUrl ?? ""}
            onClick={() => navigate(`/artist/${artist.id}`)}
          />
        ))}
      </div>

      {popularPlaylists.length > 0 && (
        <>
          <SectionHeader
            title="Популярные плейлисты"
            onShowAll={() => navigate("/playlists")}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {popularPlaylists.slice(0, 5).map((playlist) => (
              <MediaCard
                key={playlist.id}
                image={playlist.imageUrl ?? ""}
                title={playlist.title}
                subtitle={`${playlist.trackCount} треков`}
                imageZoomOnHover
                titleUnderlineOnHover
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
