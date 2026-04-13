import { Library, Plus, Search, ListFilter, Heart } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
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
      className={`h-full flex flex-col gap-2 transition-all duration-300 ${isCollapsed ? "w-20" : "w-[320px]"} hidden lg:flex`}
    >
      <div className="flex-1 rounded-xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col overflow-hidden backdrop-blur-md">
        {/* Шапка медиатеки */}
        <div className="p-4 flex items-center justify-between text-zinc-400">
          <button
            onClick={toggleCollapse}
            className="flex items-center gap-3 px-2 hover:text-white transition-colors group"
          >
            <Library className="size-6 group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="font-bold">Моя медиатека</span>}
          </button>
          {!isCollapsed && (
            <Plus className="size-5 hover:text-white cursor-pointer" />
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Кнопки фильтрации */}
            <div className="flex gap-2 px-4 mb-4">
              {["Плейлисты", "Исполнители", "Альбомы"].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-full text-xs font-medium transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Поиск и Сортировка */}
            <div className="flex items-center justify-between px-4 mb-2 text-zinc-400">
              <Search className="size-4 cursor-pointer hover:text-white" />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-xs hover:text-white outline-none">
                  Недавно добавленные <ListFilter className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <DropdownMenuLabel className="text-zinc-500 text-[10px] uppercase">
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
          <div className="p-2 space-y-1">
            {/* Пример элемента списка */}
            <div className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 rounded-md cursor-pointer group transition-colors">
              <div className="size-12 rounded bg-linear-to-br from-indigo-700 to-emerald-400 flex items-center justify-center">
                <Heart className="size-5 fill-white text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-100">
                    Любимые треки
                  </span>
                  <span className="text-xs text-zinc-400">
                    Плейлист • 128 треков
                  </span>
                </div>
              )}
            </div>
            {/* Здесь будет .map() по любимым альбомам и артистам */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;
