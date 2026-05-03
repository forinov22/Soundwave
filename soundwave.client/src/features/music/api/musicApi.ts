import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";
import type { Release, ReleaseDetails } from "@/shared/types/Release";

import type { ArtistDetails } from "../types";

export const musicApi = {
  getTrending: () => apiClient.get<Track[]>("/api/tracks/trending"),
  getReleaseById: (id: number) =>
    apiClient.get<ReleaseDetails>(`/api/releases/${id}`),
  getReleaseTracks: (id: number) =>
    apiClient.get<Track[]>(`/api/releases/${id}/tracks`),
  getPopularReleases: () => apiClient.get<Release[]>("/api/releases"),
  getArtistInfo: (artistId: number | string) =>
    apiClient.get<ArtistDetails>(`/api/artist/${artistId}`),
};
