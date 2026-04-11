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

const SongsTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-zinc-800/50">
          <TableHead className="w-12.5"></TableHead>
          <TableHead className="text-zinc-100">Title</TableHead>
          <TableHead className="text-zinc-100">Artist</TableHead>
          <TableHead className="text-zinc-100">Release Date</TableHead>
          <TableHead className="text-right text-zinc-100">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {songsData.map((song) => (
          <TableRow key={song.id} className="hover:bg-zinc-800/50">
            <TableCell>
              <img
                src={song.image}
                alt={song.name}
                className="size-10 rounded object-cover"
              />
            </TableCell>
            <TableCell className="font-medium">{song.name}</TableCell>
            <TableCell>Eminem</TableCell>
            <TableCell>
              <span className="inline-flex items-center gap-1  text-zinc-400">
                <Calendar className="h-4 w-4" />
                2025-05-03
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SongsTable;
