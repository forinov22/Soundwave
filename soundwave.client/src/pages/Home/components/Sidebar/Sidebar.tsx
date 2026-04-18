import { Library, Plus, Search, ListFilter, Heart } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TrackRow } from "@/shared/ui/TrackRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = ({
  isCollapsed,
  toggleCollapse,
}: {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}) => {
  return (
    <div
      className={`flex h-full flex-col gap-2 transition-all duration-300 ${isCollapsed ? "w-20" : "w-[320px]"} hidden lg:flex`}
    >
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md">
        {/* Шапка медиатеки */}
        <div className="flex items-center justify-between p-4 text-zinc-400">
          <button
            onClick={toggleCollapse}
            className="group flex items-center gap-3 px-2 transition-colors hover:text-white"
          >
            <Library className="size-6 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="font-bold">Моя медиатека</span>}
          </button>
          {!isCollapsed && (
            <Plus className="size-5 cursor-pointer hover:text-white" />
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Кнопки фильтрации */}
            <div className="mb-4 flex gap-2 px-4">
              {["Плейлисты", "Исполнители", "Альбомы"].map((tag) => (
                <button
                  key={tag}
                  className="rounded-full bg-zinc-800/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-zinc-800"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Поиск и Сортировка */}
            <div className="mb-2 flex items-center justify-between px-4 text-zinc-400">
              <Search className="size-4 cursor-pointer hover:text-white" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs outline-none hover:text-white">
                  Недавно добавленные <ListFilter className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
                  <DropdownMenuLabel className="text-[10px] text-zinc-500 uppercase">
                    Сортировка
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem>Недавно добавленные</DropdownMenuItem>
                  <DropdownMenuItem>По алфавиту</DropdownMenuItem>
                  <DropdownMenuItem>По автору</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {/* Пример элемента списка */}
            <TrackRow
              image={
                <div className="flex size-full items-center justify-center rounded bg-linear-to-br from-indigo-700 to-emerald-400">
                  <Heart className="size-5 fill-white text-white" />
                </div>
              }
              title={isCollapsed ? "" : "Любимые треки"}
              subtitle={isCollapsed ? undefined : "Плейлист • 128 треков"}
              size="md"
              highlightOnHover
              onClick={() => {}}
            />
            {/* Здесь будет .map() по любимым альбомам и артистам */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
