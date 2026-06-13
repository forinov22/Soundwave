import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";
import type { Release, ReleaseDetails } from "@/shared/types/Release";
import type { ArtistPublicProfile } from "@/features/artist-public/types";
import type { PlaylistSummary } from "@/features/playlists/types";

import type { ArtistDetails } from "../types";

export const musicApi = {
  getTrending: () => apiClient.get<Track[]>("/api/tracks/trending"),
  getReleaseById: (id: number) =>
    apiClient.get<ReleaseDetails>(`/api/releases/${id}`),
  getPopularReleases: () => apiClient.get<Release[]>("/api/releases"),
  getArtistInfo: (artistId: number | string) =>
    apiClient.get<ArtistDetails>(`/api/artist/${artistId}`),
  getPopularArtists: () =>
    apiClient.get<ArtistPublicProfile[]>("/api/artist/popular"),
  getPopularPlaylists: () =>
    apiClient.get<PlaylistSummary[]>("/api/playlists/popular"),
};
