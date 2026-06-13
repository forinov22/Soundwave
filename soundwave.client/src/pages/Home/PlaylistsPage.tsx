import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import { MediaCard } from "@/shared/ui/MediaCard";
import { useMusic } from "@/features/music/lib/useMusic";

const PlaylistsPage = () => {
  const { popularPlaylists, fetchHome, isHomeLoading } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    if (popularPlaylists.length === 0) fetchHome();
  }, []);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        Популярные плейлисты
      </h1>

      {isHomeLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {popularPlaylists.map((playlist) => (
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
      )}
    </div>
  );
};

export default PlaylistsPage;
