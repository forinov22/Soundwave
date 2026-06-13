import { apiClient } from "@/shared/api/apiClient";

export interface ArtistAdminItem {
  id: number;
  name: string;
  email: string;
  description: string | null;
  avatarUrl: string | null;
  trackCount: number;
  releaseCount: number;
}

export interface CreateArtistPayload {
  name: string;
  email: string;
  password: string;
  description?: string;
}

export const adminApi = {
  getArtists: () => apiClient.get<ArtistAdminItem[]>("/api/admin/artists"),

  createArtist: (payload: CreateArtistPayload) =>
    apiClient.post<{ id: number; name: string; email: string }>(
      "/api/admin/artists",
      payload,
    ),
};
