import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";
import type { Release, ReleaseDetails } from "@/shared/types/Release";
import type { PaginatedResult } from "@/shared/types/PaginatedResult";

import type { ArtistPublicProfile, DiscographyFilter } from "../types";

export const artistPublicApi = {
  // GET /api/artist/{id}
  getProfile: (artistId: number) =>
    apiClient.get<ArtistPublicProfile>(`/api/artist/${artistId}`),

  // GET /api/artist/{id}/tracks/popular?limit=5
  getPopularTracks: (artistId: number, limit = 5) =>
    apiClient.get<Track[]>(`/api/artist/${artistId}/tracks/popular`, {
      params: { limit },
    }),

  // Для превью на странице артиста — без треков
  getReleasesPreviews: (
    artistId: number,
    params: { type?: DiscographyFilter; page?: number; pageSize?: number } = {},
  ) =>
    apiClient.get<PaginatedResult<Release>>(
      `/api/artist/${artistId}/releases`,
      { params: { ...params, includeTracks: false } },
    ),

  // Для дискографии — с треками
  getReleasesWithTracks: (
    artistId: number,
    params: { type?: DiscographyFilter; page?: number; pageSize?: number } = {},
  ) =>
    apiClient.get<PaginatedResult<ReleaseDetails>>(
      `/api/artist/${artistId}/releases`,
      { params: { ...params, includeTracks: true } },
    ),
};
