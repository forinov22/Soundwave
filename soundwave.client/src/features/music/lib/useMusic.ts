import { useAsync } from "@/shared/hooks/useAsync";

import { useMusicStore } from "../model/musicStore";
import { musicApi } from "../api/musicApi";

export function useMusic() {
  const { trendingTracks, popularAlbums, setTrendingTracks, setPopularAlbums } =
    useMusicStore();

  // Загрузка главной страницы
  const {
    execute: fetchHome,
    isLoading: isHomeLoading,
    error: homeError,
  } = useAsync(async () => {
    const [tracksRes, albumsRes] = await Promise.all([
      musicApi.getTrending(),
      musicApi.getPopularAlbums(),
    ]);

    setTrendingTracks(tracksRes.data);
    setPopularAlbums(albumsRes.data);
  });

  // Загрузка конкретного альбома
  const {
    execute: fetchAlbumById,
    isLoading: isAlbumLoading,
    error: albumError,
  } = useAsync(async (id: number) => {
    const res = await musicApi.getAlbumById(id);
    return res.data;
  });

  return {
    // Данные из стора
    trendingTracks,
    popularAlbums,

    // Состояния Home
    fetchHome,
    isHomeLoading,
    homeError,

    // Состояния Альбома
    fetchAlbum: fetchAlbumById,
    isAlbumLoading,
    albumError,
  };
}
