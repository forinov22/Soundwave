import { apiClient } from "@/shared/api/apiClient";
import type { Release } from "@/shared/types/Release";
import type { ArtistSummary } from "../types";
import type { PlaylistSummary } from "@/features/playlists/types";

export const likesApi = {
  // Релизы
  getLikedReleases: () => apiClient.get<Release[]>("/api/likes/releases/me"),
  toggleLikeRelease: (id: number) =>
    apiClient.post<{ liked: boolean }>(`/api/likes/releases/${id}`),
  isReleaseLiked: (id: number) =>
    apiClient.get<{ liked: boolean }>(`/api/likes/releases/${id}`),

  // Артисты
  getFollowedArtists: () =>
    apiClient.get<ArtistSummary[]>("/api/likes/artists/me"),
  toggleFollowArtist: (id: number) =>
    apiClient.post<{ followed: boolean }>(`/api/likes/artists/${id}`),
  isArtistFollowed: (id: number) =>
    apiClient.get<{ followed: boolean }>(`/api/likes/artists/${id}`),

  // Плейлисты
  getSavedPlaylists: () =>
    apiClient.get<PlaylistSummary[]>("/api/likes/playlists/me"),
  toggleSavePlaylist: (id: number) =>
    apiClient.post<{ saved: boolean }>(`/api/likes/playlists/${id}`),
  isPlaylistSaved: (id: number) =>
    apiClient.get<{ saved: boolean }>(`/api/likes/playlists/${id}`),
};
