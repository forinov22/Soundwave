import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import AlbumItem from "@/shared/ui/AlbumItem";
import { useMusic } from "@/features/music/lib/useMusic";

const AlbumsPage = () => {
  const { popularReleases, fetchHome, isHomeLoading } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    if (popularReleases.length === 0) fetchHome();
  }, []);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <h1 className="mb-8 text-3xl font-bold text-text-primary">
        Популярные альбомы
      </h1>

      {isHomeLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {popularReleases.map((release) => (
            <AlbumItem
              key={release.id}
              name={release.title}
              image={release.imageUrl ?? ""}
              description={release.description ?? ""}
              onClick={() => navigate(`/album/${release.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;
