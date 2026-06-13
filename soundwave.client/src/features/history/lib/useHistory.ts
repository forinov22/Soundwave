import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/model/authStore";
import { historyApi } from "../api/historyApi";
import { useHistoryStore } from "../model/historyStore";

export function useHistory() {
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const {
    listenHistory,
    recommendations,
    setListenHistory,
    setRecommendations,
  } = useHistoryStore();

  useEffect(() => {
    if (!isAuthed) return;

    historyApi.getMyHistory(20).then((res) => setListenHistory(res.data));
    historyApi
      .getRecommendations(10)
      .then((res) => setRecommendations(res.data));
  }, [isAuthed]);

  return { listenHistory, recommendations };
}
