import { usePlayer } from "../model/playerStore";

export function usePlayerTime() {
  // Подписываемся ТОЛЬКО на время
  const currentTime = usePlayer((state) => state.currentTimeSeconds);
  const setCurrentTime = usePlayer((state) => state.setCurrentTime);
  const lastSeekTime = usePlayer((state) => state.lastSeekTime);

  return {
    currentTimeSeconds: currentTime ?? 0,
    setCurrentTime,
    lastSeekTime,
  };
}
