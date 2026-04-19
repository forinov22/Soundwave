import { Music } from "lucide-react";

import { Typography } from "@/shared/ui/Typography";
import TracksTable from "./TracksTable";
import AddTrackDialog from "./AddTrackDialog";

const TracksTabContent = () => (
  <div className="rounded-2xl border border-white/5 bg-surface p-6">
    {/* Шапка */}
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Music className="size-5 text-primary" />
        <div>
          <Typography as="h3" variant="title" size="md" className="font-bold">
            Библиотека треков
          </Typography>
          <Typography variant="subtitle" size="sm" className="mt-0.5">
            Управляйте своими треками
          </Typography>
        </div>
      </div>
      <AddTrackDialog />
    </div>

    <TracksTable />
  </div>
);

export default TracksTabContent;
