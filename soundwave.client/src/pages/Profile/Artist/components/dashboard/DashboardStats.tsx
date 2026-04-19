import { Library, ListMusic, PlayCircle, Users2 } from "lucide-react";
import StatsCard from "./StatsCard";

const statsData = [
  {
    icon: ListMusic,
    label: "Треков",
    value: "15",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Library,
    label: "Альбомов",
    value: "3",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: Users2,
    label: "Подписчиков",
    value: "253 500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    icon: PlayCircle,
    label: "Прослушиваний",
    value: "1 503 100",
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-400",
  },
];

const DashboardStats = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {statsData.map((stat) => (
      <StatsCard key={stat.label} {...stat} />
    ))}
  </div>
);

export default DashboardStats;
