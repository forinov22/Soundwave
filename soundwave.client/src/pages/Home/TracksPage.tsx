import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import TrackItem from "@/shared/ui/TrackItem";
import { useMusic } from "@/features/music/lib/useMusic";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";

const TracksPage = () => {
  const { trendingTracks, fetchHome, isHomeLoading } = useMusic();
  const { playTrack } = usePlayerPlayback();

  useEffect(() => {
    if (trendingTracks.length === 0) fetchHome();
  }, []);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        Популярные треки
      </h1>

      {isHomeLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {trendingTracks.map((track) => (
            <TrackItem
              key={track.id}
              trackId={track.id}
              name={track.title}
              image={track.imageUrl}
              artist={track.artistName}
              onClick={() => playTrack(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TracksPage;
