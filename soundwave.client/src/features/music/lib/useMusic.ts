import { useAsync } from "@/shared/hooks/useAsync";

import { useMusicStore } from "../model/musicStore";
import { musicApi } from "../api/musicApi";

export function useMusic() {
  const {
    trendingTracks,
    popularReleases,
    popularArtists,
    popularPlaylists,
    setTrendingTracks,
    setPopularReleases,
    setPopularArtists,
    setPopularPlaylists,
  } = useMusicStore();

  // Загрузка главной страницы
  const {
    execute: fetchHome,
    isLoading: isHomeLoading,
    error: homeError,
  } = useAsync(async () => {
    const [tracksRes, releasesRes, artistsRes, playlistsRes] =
      await Promise.all([
        musicApi.getTrending(),
        musicApi.getPopularReleases(),
        musicApi.getPopularArtists(),
        musicApi.getPopularPlaylists(),
      ]);

    setTrendingTracks(tracksRes.data);
    setPopularReleases(releasesRes.data);
    setPopularArtists(artistsRes.data);
    setPopularPlaylists(playlistsRes.data);
  });

  // Загрузка конкретного альбома
  const {
    execute: fetchReleaseById,
    isLoading: isReleaseLoading,
    error: releaseError,
  } = useAsync(async (id: number) => {
    const release = await musicApi.getReleaseById(id);
    return release.data;
  });

  return {
    // Данные из стора
    trendingTracks,
    popularReleases,
    popularArtists,
    popularPlaylists,

    // Состояния Home
    fetchHome,
    isHomeLoading,
    homeError,

    // Состояния Альбома
    fetchRelease: fetchReleaseById,
    isReleaseLoading,
    releaseError,
  };
}
