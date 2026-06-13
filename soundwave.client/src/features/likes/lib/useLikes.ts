import { useEffect } from "react";
import { useAsync } from "@/shared/hooks/useAsync";
import { useAuthStore } from "@/features/auth/model/authStore";
import { likesApi } from "../api/likesApi";
import { useLikesStore } from "../model/likesStore";

// Загружает все лайкнутые/сохранённые элементы при монтировании.
// Используется сайдбаром для отображения альбомов и артистов.
export function useLikes() {
  const store = useLikesStore();
  const isAuthed = useAuthStore((s) => !!s.accessToken);

  const { execute: fetchReleases, isLoading: isReleasesLoading } = useAsync(
    async () => {
      const res = await likesApi.getLikedReleases();
      store.setLikedReleases(res.data);
    },
  );

  const { execute: fetchArtists, isLoading: isArtistsLoading } = useAsync(
    async () => {
      const res = await likesApi.getFollowedArtists();
      store.setFollowedArtists(res.data);
    },
  );

  const { execute: fetchSavedPlaylists, isLoading: isSavedPlaylistsLoading } =
    useAsync(async () => {
      const res = await likesApi.getSavedPlaylists();
      store.setSavedPlaylists(res.data);
    });

  useEffect(() => {
    if (!isAuthed) return;
    fetchReleases();
    fetchArtists();
    fetchSavedPlaylists();
  }, [isAuthed]);

  return {
    likedReleases: store.likedReleases,
    followedArtists: store.followedArtists,
    savedPlaylists: store.savedPlaylists,
    isLoading: isReleasesLoading || isArtistsLoading || isSavedPlaylistsLoading,
  };
}
