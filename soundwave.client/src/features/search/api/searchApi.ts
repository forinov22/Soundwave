import { apiClient } from "@/shared/api/apiClient";
import type { SearchResult } from "../types";

export const searchApi = {
  search: (q: string, type?: string) =>
    apiClient.get<SearchResult>("/api/search", { params: { q, type } }),

  recognize: (audio: File) => {
    const form = new FormData();
    form.append("audio", audio);
    return apiClient.post<RecognizeResult>("/api/recognize", form);
  },
};
