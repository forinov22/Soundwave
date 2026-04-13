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
  <div className="flex items-center justify-between mb-4 mt-8 px-2">
    <h2 className="text-2xl font-bold hover:underline cursor-pointer">
      {title}
    </h2>
    <button
      onClick={onShowAll}
      className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
    >
      Показать все
    </button>
  </div>
);

const HomePage = () => {
  const { trendingTracks, popularAlbums, fetchHome, isHomeLoading } = useMusic();
  const { playTrack } = usePlayerPlayback();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  if (isHomeLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 size-10" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <SectionHeader
        title="Популярные треки"
        onShowAll={() => navigate("/tracks")}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {popularAlbums.slice(0, 5).map((album) => (
          <AlbumItem
            key={album.id}
            name={album.title}
            image={album.imageUrl}
            description={album.description}
            onClick={() => navigate(`/album/${album.id}`)}
          />
        ))}
      </div>

      <SectionHeader
        title="Популярные исполнители"
        onShowAll={() => navigate("/artists")}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* ArtistItem должен иметь rounded-full для картинки */}
        {/* {popularArtists.map(artist => <ArtistItem key={artist.id} artist={artist} />)} */}
      </div>
    </div>
  );
};

export default HomePage;
