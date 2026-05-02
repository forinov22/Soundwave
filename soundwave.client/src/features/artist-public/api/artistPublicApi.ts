import { apiClient } from "@/shared/api/apiClient";
import type { Track } from "@/shared/types/Track";
import type { ReleaseDetails } from "@/shared/types/Release";
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

  // GET /api/artist/{id}/releases?type=&page=&pageSize=
  getReleases: (
    artistId: number,
    params: { type?: DiscographyFilter; page?: number; pageSize?: number } = {},
  ) =>
    apiClient.get<PaginatedResult<ReleaseDetails>>(
      `/api/artist/${artistId}/releases`,
      {
        params: {
          type: params.type ?? undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      },
    ),

  // Треки конкретного релиза — уже есть в ReleasesController
  getReleaseTracks: (releaseId: number) =>
    apiClient.get<Track[]>(`/api/releases/${releaseId}/tracks`),
};
