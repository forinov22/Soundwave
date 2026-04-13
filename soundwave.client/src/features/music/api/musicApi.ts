import { apiClient } from "@/shared/api/apiClient";

import type { Track, Album, ArtistDetails } from "../types";

export const musicApi = {
    getTrending: () => apiClient.get<Track[]>("/api/tracks/trending"),
    getAlbumById: (id: number) => apiClient.get<Album>(`/api/albums/${id}`),
    getPopularAlbums: () => apiClient.get<Album[]>("/api/albums"),
    getArtistInfo: (artistId: number | string) => apiClient.get<ArtistDetails>(`/api/artist/${artistId}`)
};
