import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

import TrackItem from "@/shared/ui/TrackItem";
import { Typography } from "@/shared/ui/Typography";
import { useHistory } from "@/features/history/lib/useHistory";
import { usePlayerPlayback } from "@/features/player/lib/usePlayerPlayback";
import type { ListenHistoryItem } from "@/features/history/types";
import type { Track } from "@/shared/types/Track";

const toPlayerTrack = (item: ListenHistoryItem): Track => ({
  id: item.trackId,
  title: item.title,
  imageUrl: item.imageUrl ?? "",
  audioUrl: item.audioUrl,
  artistId: item.artistId,
  artistName: item.artistName,
  durationSeconds: item.durationSeconds,
  playCount: item.playCount,
});

const RecommendationsPage = () => {
  const { recommendations } = useHistory();
  const { playTrack } = usePlayerPlayback();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">
        Рекомендации для вас
      </h1>
      <p className="mb-8 text-sm text-zinc-400">
        Подобраны на основе вашей истории прослушиваний
      </p>

      {recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Sparkles className="size-16 text-zinc-600" />
          <Typography variant="subtitle">
            Слушайте музыку, чтобы получить рекомендации
          </Typography>
          <button
            onClick={() => navigate("/")}
            className="text-sm font-bold text-emerald-500 hover:underline"
          >
            Вернуться на главную
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recommendations.map((item) => (
            <TrackItem
              key={item.trackId}
              trackId={item.trackId}
              name={item.title}
              image={item.imageUrl ?? ""}
              artist={item.artistName}
              onClick={() => playTrack(toPlayerTrack(item))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
