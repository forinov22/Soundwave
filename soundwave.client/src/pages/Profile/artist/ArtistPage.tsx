import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Album } from "lucide-react";

import Header from "./components/Header";
import DashboardStats from "./components/dashboard/DashboardStats";
import SongsTabContent from "./components/songs/SongsTabContent";
import AlbumsTabContent from "./components/albums/AlbumsTabContent";

const ArtistPage = () => {
  return (
    <div className="min-h-screen p-8 bg-linear-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100">
      <Header />
      <DashboardStats />

      <Tabs defaultValue="songs" className="space-y-6">
        <TabsList className="p-1 bg-zinc-800/50">
          <TabsTrigger
            value="songs"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Music className="size-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-100"
          >
            <Album className="size-4 mr-2" />
            Albums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          <SongsTabContent />
        </TabsContent>
        <TabsContent value="albums">
          <AlbumsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistPage;
