import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Album } from "lucide-react";

import Header from "./components/Header";
import DashboardStats from "./components/dashboard/DashboardStats";
import TracksTabContent from "./components/songs/TracksTabContent";
import AlbumsTabContent from "./components/albums/AlbumsTabContent";

const ArtistProfilePage = () => {
  return (
    // Используем тот же фон, что и в основном приложении
    <div className="min-h-screen p-8 bg-[#121212] text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-8">
        <Header />
        
        <DashboardStats />

        <Tabs defaultValue="songs" className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-white/5 p-1 rounded-full w-fit">
            <TabsTrigger
              value="songs"
              className="rounded-full px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-white transition-all"
            >
              <Music className="size-4 mr-2" />
              Треки
            </TabsTrigger>
            <TabsTrigger
              value="albums"
              className="rounded-full px-6 data-[state=active]:bg-zinc-700 data-[state=active]:text-white transition-all"
            >
              <Album className="size-4 mr-2" />
              Альбомы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="songs" className="mt-6 outline-hidden">
            <TracksTabContent />
          </TabsContent>
          <TabsContent value="albums" className="mt-6 outline-hidden">
            <AlbumsTabContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistProfilePage;
