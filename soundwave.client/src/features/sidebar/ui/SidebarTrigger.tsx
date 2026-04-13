import { ChevronLeft } from "lucide-react"; // Используем Left для указания направления открытия

import { useRightSidebar } from "../lib/useRightSidebar";

export function SidebarTrigger() {
  const { isOpen, toggle } = useRightSidebar();

  if (isOpen) return null;

  return (
    <div
      onClick={() => toggle("trackInfo")}
      className="fixed right-0 top-1/2 -translate-y-1/2 h-32 w-5 bg-zinc-900/80 hover:bg-zinc-800 border-l border-y border-white/10 rounded-l-xl cursor-pointer flex items-center justify-center group transition-all z-40 backdrop-blur-md"
    >
      <ChevronLeft className="size-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
    </div>
  );
}
