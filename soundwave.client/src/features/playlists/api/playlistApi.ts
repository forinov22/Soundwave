import { apiClient } from "@/shared/api/apiClient";

import type {
  PlaylistDetails,
  PlaylistSummary,
  CreatePlaylistPayload,
  UpdatePlaylistPayload,
} from "../types";

export const playlistApi = {
  // Мои плейлисты (для сайдбара)
  getMine: () => apiClient.get<PlaylistSummary[]>("/api/playlists/me"),

  getById: (id: number) =>
    apiClient.get<PlaylistDetails>(`/api/playlists/${id}`),

  create: (payload: CreatePlaylistPayload = {}) =>
    apiClient.post<PlaylistSummary>("/api/playlists", payload),

  update: (id: number, payload: UpdatePlaylistPayload) => {
    const form = new FormData();
    if (payload.title !== undefined) form.append("title", payload.title);
    if (payload.description !== undefined)
      form.append("description", payload.description);
    if (payload.isPublic !== undefined)
      form.append("isPublic", String(payload.isPublic));
    if (payload.image) form.append("image", payload.image);
    return apiClient.patch<PlaylistDetails>(`/api/playlists/${id}`, form);
  },

  delete: (id: number) => apiClient.delete<void>(`/api/playlists/${id}`),

  addTrack: (playlistId: number, trackId: number) =>
    apiClient.post<PlaylistDetails>(`/api/playlists/${playlistId}/tracks`, {
      trackId,
    }),

  removeTrack: (playlistId: number, trackId: number) =>
    apiClient.delete<PlaylistDetails>(
      `/api/playlists/${playlistId}/tracks/${trackId}`,
    ),

  reorderTracks: (playlistId: number, trackIds: number[]) =>
    apiClient.put<PlaylistDetails>(`/api/playlists/${playlistId}/tracks/order`, { trackIds }),

  // Лайк / анлайк
  toggleLike: (trackId: number) =>
    apiClient.post<{ liked: boolean }>(`/api/playlists/tracks/${trackId}/like`),

  isLiked: (trackId: number) =>
    apiClient.get<{ liked: boolean }>(`/api/playlists/tracks/${trackId}/like`),
};
