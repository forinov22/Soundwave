import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/model/authStore";
import { usePlayer } from "@/features/player/model/playerStore";
import { historyApi } from "../api/historyApi";
import { useHistoryStore } from "../model/historyStore";

const RECORD_THRESHOLD_SECONDS = 30;

export function useRecordListen() {
  const isAuthed = useAuthStore((s) => !!s.accessToken);
  const recordedForTrack = useRef<number | null>(null);

  const currentTrackIndex = usePlayer((s) => s.currentTrackIndex);
  const trackList = usePlayer((s) => s.trackList);
  const currentTimeSeconds = usePlayer((s) => s.currentTimeSeconds);
  const setListenHistory = useHistoryStore((s) => s.setListenHistory);

  const currentTrack =
    currentTrackIndex !== null ? trackList[currentTrackIndex] : null;

  // Сброс при смене трека
  useEffect(() => {
    recordedForTrack.current = null;
  }, [currentTrack?.id]);

  // Запись после RECORD_THRESHOLD_SECONDS секунд прослушивания
  useEffect(() => {
    if (!isAuthed || !currentTrack) return;
    if (recordedForTrack.current === currentTrack.id) return;
    if (currentTimeSeconds < RECORD_THRESHOLD_SECONDS) return;

    recordedForTrack.current = currentTrack.id;

    historyApi.recordListen(currentTrack.id).catch(() => {});

    // Добавляем в локальную историю (prepend) без ожидания сервера
    historyApi.getMyHistory(20).then((res) =>
      setListenHistory(res.data)
    ).catch(() => {});
  }, [currentTimeSeconds, currentTrack, isAuthed]);
}
