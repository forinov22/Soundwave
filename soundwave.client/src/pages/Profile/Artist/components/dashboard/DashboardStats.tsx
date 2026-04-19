import { Library, ListMusic, PlayCircle, Users2 } from "lucide-react";

import StatsCard from "./StatsCard";

const statsData = [
  {
    icon: ListMusic,
    label: "Total Songs",
    value: "15",
    bgColor: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Library,
    label: "Total Albums",
    value: "3",
    bgColor: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    icon: Users2,
    label: "Total Followers",
    value: "253 500",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-500",
  },
  {
    icon: PlayCircle,
    label: "Total Auditions",
    value: "1 503 100",
    bgColor: "bg-sky-500/10",
    iconColor: "text-sky-500",
  },
];

const DashboardStats = () => {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <StatsCard
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          bgColor={stat.bgColor}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
