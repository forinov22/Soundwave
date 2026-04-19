import { Calendar, Trash2 } from "lucide-react";

import { songsData } from "@/assets/assets";
import { TrackTable } from "@/shared/ui/TrackTable";
import { TrackRow } from "@/shared/ui/TrackRow";
import { Typography } from "@/shared/ui/Typography";

const TracksTable = () => (
  <TrackTable
    data={songsData}
    getKey={(s) => s.id}
    onRowClick={() => {}}
    columns={[
      {
        key: "track",
        header: "Название",
        width: "1fr",
        render: (song) => (
          <TrackRow
            image={song.image}
            title={song.name}
            subtitle="Imagine Dragons"
            size="sm"
          />
        ),
      },
      {
        key: "date",
        header: "Дата выпуска",
        width: "160px",
        hideOnMobile: true,
        render: () => (
          <span className="flex items-center gap-2">
            <Calendar className="size-3.5 text-text-muted" />
            <Typography variant="subtitle" size="sm">
              2024-03-15
            </Typography>
          </span>
        ),
      },
      {
        // Пустой header — обязателен чтобы хедер и строки имели одинаковое
        // количество ячеек и grid-template-columns совпадал
        key: "actions",
        header: "",
        width: "40px",
        align: "right",
        render: () => (
          <button
            className="flex size-8 items-center justify-center rounded-full text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 active:scale-90"
            aria-label="Удалить трек"
          >
            <Trash2 className="size-4" />
          </button>
        ),
      },
    ]}
  />
);

export default TracksTable;
