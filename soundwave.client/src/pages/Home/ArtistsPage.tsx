import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import { ArtistItem } from "@/shared/ui/ArtistItem";
import { useMusic } from "@/features/music/lib/useMusic";

const ArtistsPage = () => {
  const { popularArtists, fetchHome, isHomeLoading } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    if (popularArtists.length === 0) fetchHome();
  }, []);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        Популярные исполнители
      </h1>

      {isHomeLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {popularArtists.map((artist) => (
            <ArtistItem
              key={artist.id}
              name={artist.name}
              image={artist.avatarUrl ?? ""}
              onClick={() => navigate(`/artist/${artist.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
