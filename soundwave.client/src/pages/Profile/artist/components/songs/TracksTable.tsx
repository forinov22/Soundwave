import { Calendar, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { songsData } from "@/assets/assets";

const TracksTable = () => {
  return (
    <div className="rounded-xl border border-white/5 bg-zinc-900/20 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-900/50">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead className="text-zinc-400 font-bold uppercase text-[11px]">Название</TableHead>
            <TableHead className="text-zinc-400 font-bold uppercase text-[11px]">Дата выпуска</TableHead>
            <TableHead className="text-right text-zinc-400 font-bold uppercase text-[11px] px-6">Действия</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {songsData.map((song, idx) => (
            <TableRow key={song.id} className="border-white/5 hover:bg-white/5 group transition-colors">
              <TableCell className="text-center text-zinc-500">{idx + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img src={song.image} alt="" className="size-10 rounded-md object-cover shadow-lg" />
                  <div>
                    <p className="font-semibold text-white">{song.name}</p>
                    <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">Imagine Dragons</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-zinc-400 text-sm">
                <span className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-zinc-600" />
                  2024-03-15
                </span>
              </TableCell>
              <TableCell className="text-right px-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TracksTable;
