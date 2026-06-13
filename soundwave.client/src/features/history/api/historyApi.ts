import { apiClient } from "@/shared/api/apiClient";
import type { ListenHistoryItem } from "../types";

export const historyApi = {
  recordListen: (trackId: number) =>
    apiClient.post("/api/history", { trackId }),

  getMyHistory: (limit = 20) =>
    apiClient.get<ListenHistoryItem[]>(`/api/history/me?limit=${limit}`),

  getRecommendations: (limit = 10) =>
    apiClient.get<ListenHistoryItem[]>(`/api/history/recommendations?limit=${limit}`),
};
