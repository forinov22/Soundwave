import { apiClient } from "@/shared/api/apiClient";
import type { ReleaseDetails } from "@/shared/types/Release";

import type { ArtistTrack } from "../types/ArtistTrack";
import type {
  CreateTrackPayload,
  CreateReleasePayload,
  UpdateReleasePayload,
} from "../types/Payloads";

// Хелпер для multipart-эндпоинтов.
// Все опциональные поля (включая File) пропускаются, если не заданы.
function toFormData(
  record: Record<string, string | Blob | undefined>,
): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;
    fd.append(key, value);
  }
  return fd;
}

export const artistApi = {
  // ── Треки (плейграунд) ──────────────────────────────────────────────────

  getMyTracks: () => apiClient.get<ArtistTrack[]>("/api/tracks/me"),

  createTrack: (payload: CreateTrackPayload) => {
    const form = toFormData({
      title: payload.title,
      audio: payload.audio,
      image: payload.image,
    });
    return apiClient.post<ArtistTrack>("/api/tracks", form);
  },

  // force=true — подтверждение удаления трека вместе со связями в драфтах.
  // Без force бэк вернёт 409 со списком драфтов.
  deleteTrack: (trackId: number, force = false) =>
    apiClient.delete<void>(`/api/tracks/${trackId}`, {
      params: force ? { force: true } : undefined,
    }),

  // ── Релизы ──────────────────────────────────────────────────────────────

  getMyDrafts: () => apiClient.get<ReleaseDetails[]>("/api/releases/me/drafts"),

  getMyPublished: () =>
    apiClient.get<ReleaseDetails[]>("/api/releases/me/published"),

  // Один свой релиз (для редактора) — с треками
  getMyReleaseById: (id: number) =>
    apiClient.get<ReleaseDetails>(`/api/releases/me/${id}`),

  createRelease: (payload: CreateReleasePayload) => {
    const form = toFormData({
      title: payload.title,
      description: payload.description,
      releaseDate: payload.releaseDate,
      image: payload.image,
    });
    return apiClient.post<ReleaseDetails>("/api/releases", form);
  },

  updateRelease: (id: number, payload: UpdateReleasePayload) => {
    const form = toFormData({
      title: payload.title,
      description: payload.description,
      releaseDate: payload.releaseDate,
      image: payload.image,
    });
    return apiClient.patch<ReleaseDetails>(`/api/releases/${id}`, form);
  },

  // ── Состав релиза ───────────────────────────────────────────────────────

  // Все три возвращают свежий ReleaseDetails — фронт сразу заменяет в сторе.
  addTrackToRelease: (releaseId: number, trackId: number) =>
    apiClient.post<ReleaseDetails>(`/api/releases/${releaseId}/tracks`, {
      trackId,
    }),

  removeTrackFromRelease: (releaseId: number, trackId: number) =>
    apiClient.delete<ReleaseDetails>(
      `/api/releases/${releaseId}/tracks/${trackId}`,
    ),

  reorderTracks: (releaseId: number, trackIds: number[]) =>
    apiClient.put<ReleaseDetails>(`/api/releases/${releaseId}/tracks/order`, {
      trackIds,
    }),

  // ── Публикация и удаление ───────────────────────────────────────────────

  publishRelease: (releaseId: number) =>
    apiClient.post<ReleaseDetails>(`/api/releases/${releaseId}/publish`),

  // Draft → hard delete, Published → soft (Archived). Бэк сам разруливает.
  deleteRelease: (releaseId: number) =>
    apiClient.delete<void>(`/api/releases/${releaseId}`),

  getMyStats: () => apiClient.get<ArtistStats>("/api/artist/me/stats"),
};

export interface ArtistStats {
  totalPlays: number;
  totalTracks: number;
  totalReleases: number;
  followers: number;
  topTracks: TopTrackStat[];
}

export interface TopTrackStat {
  id: number;
  title: string;
  imageUrl: string | null;
  playCount: number;
  durationSeconds: number;
}
