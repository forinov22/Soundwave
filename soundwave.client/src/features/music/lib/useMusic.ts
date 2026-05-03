import { useAsync } from "@/shared/hooks/useAsync";

import { useMusicStore } from "../model/musicStore";
import { musicApi } from "../api/musicApi";
import type { ReleaseDetails } from "@/shared/types/Release";

export function useMusic() {
  const {
    trendingTracks,
    popularReleases,
    setTrendingTracks,
    setPopularReleases,
  } = useMusicStore();

  // Загрузка главной страницы
  const {
    execute: fetchHome,
    isLoading: isHomeLoading,
    error: homeError,
  } = useAsync(async () => {
    const [tracksRes, releasesRes] = await Promise.all([
      musicApi.getTrending(),
      musicApi.getPopularReleases(),
    ]);

    setTrendingTracks(tracksRes.data);
    setPopularReleases(releasesRes.data);
  });

  // Загрузка конкретного альбома
  const {
    execute: fetchReleaseById,
    isLoading: isReleaseLoading,
    error: releaseError,
  } = useAsync(async (id: number) => {
    const metaPromise = musicApi.getReleaseById(id);
    const tracksPromise = musicApi.getReleaseTracks(id);

    const [meta, tracks] = await Promise.all([metaPromise, tracksPromise]);
    return {
      ...meta.data,
      tracks: tracks.data,
    } as ReleaseDetails;
  });

  return {
    // Данные из стора
    trendingTracks,
    popularReleases,

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
