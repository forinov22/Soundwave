import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Album } from "lucide-react";

import Header from "./components/Header";
import DashboardStats from "./components/dashboard/DashboardStats";
import TracksTabContent from "./components/tracks/TracksTabContent";
import AlbumsTabContent from "./components/albums/AlbumsTabContent";

const ArtistProfilePage = () => (
  <div className="min-h-screen bg-[#121212] p-8 text-text-primary">
    <div className="mx-auto max-w-7xl space-y-8">
      <Header />
      <DashboardStats />

      <Tabs defaultValue="tracks" className="space-y-6">
        <TabsList className="w-fit rounded-full border border-white/5 bg-surface p-1">
          <TabsTrigger
            value="tracks"
            className="rounded-full px-6 transition-all data-[state=active]:bg-white/10 data-[state=active]:text-text-primary"
          >
            <Music className="mr-2 size-4" />
            Треки
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="rounded-full px-6 transition-all data-[state=active]:bg-white/10 data-[state=active]:text-text-primary"
          >
            <Album className="mr-2 size-4" />
            Альбомы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracks" className="mt-6 outline-hidden">
          <TracksTabContent />
        </TabsContent>
        <TabsContent value="albums" className="mt-6 outline-hidden">
          <AlbumsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default ArtistProfilePage;
