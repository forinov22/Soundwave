import { useEffect, useState } from "react";
import { Disc3, ListMusic, PlayCircle, Users2 } from "lucide-react";
import { artistApi, type ArtistStats } from "@/features/artist/api/artistApi";
import StatsCard from "./StatsCard";

const DashboardStats = () => {
  const [stats, setStats] = useState<ArtistStats | null>(null);

  useEffect(() => {
    artistApi.getMyStats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const cards = [
    {
      icon: ListMusic,
      label: "Треков",
      value: stats ? fmt(stats.totalTracks) : "—",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: Disc3,
      label: "Релизов",
      value: stats ? fmt(stats.totalReleases) : "—",
      bgColor: "bg-violet-500/10",
      iconColor: "text-violet-400",
    },
    {
      icon: Users2,
      label: "Подписчиков",
      value: stats ? fmt(stats.followers) : "—",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400",
    },
    {
      icon: PlayCircle,
      label: "Прослушиваний",
      value: stats ? fmt(stats.totalPlays) : "—",
      bgColor: "bg-sky-500/10",
      iconColor: "text-sky-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {stats && stats.topTracks.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-graphite-card p-5">
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-text-muted uppercase">
            Топ треков
          </h3>
          <div className="space-y-3">
            {stats.topTracks.map((track, i) => (
              <div key={track.id} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm text-text-muted">
                  {i + 1}
                </span>
                {track.imageUrl && (
                  <img
                    src={track.imageUrl}
                    alt=""
                    className="size-9 rounded-md object-cover"
                  />
                )}
                <span className="flex-1 truncate text-sm text-text-primary">
                  {track.title}
                </span>
                <span className="text-sm text-text-muted">
                  {fmt(track.playCount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
