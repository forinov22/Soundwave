import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import AlbumItem from "@/shared/ui/AlbumItem";
import TrackItem from "@/shared/ui/TrackItem";
import { useMusic } from "@/features/music/lib/useMusic.ts";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";

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

const HomePage = () => {
  const { trendingTracks, popularReleases, fetchHome, isHomeLoading } =
    useMusic();
  const { playTrack } = usePlayerPlayback();
  const navigate = useNavigate();

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
        {/* ArtistItem должен иметь rounded-full для картинки */}
        {/* {popularArtists.map(artist => <ArtistItem key={artist.id} artist={artist} />)} */}
      </div>
    </div>
  );
};

export default HomePage;
