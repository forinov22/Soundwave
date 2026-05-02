import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Disc3, Music } from "lucide-react";

import Header from "./components/Header";
import DashboardStats from "./components/dashboard/DashboardStats";
import TracksTabContent from "@/pages/Profile/Artist/components/tracks/TracksTabContent";
import ReleasesTabContent from "@/pages/Profile/Artist/components/releases/ReleasesTabContent";

const ArtistProfilePage = () => (
  <div className="min-h-screen bg-graphite-page p-8 text-text-primary">
    <div className="mx-auto max-w-7xl space-y-10">
      <Header />
      <DashboardStats />

      <Tabs defaultValue="releases" className="space-y-8">
        <TabsList className="h-auto w-fit gap-1 rounded-full border border-hairline bg-graphite-card p-1">
          <TabsTrigger
            value="releases"
            className="rounded-full px-5 py-1.5 text-sm text-text-secondary transition-all hover:bg-white/4 hover:text-text-secondary data-[state=active]:bg-white/6 data-[state=active]:text-text-primary data-[state=active]:shadow-none"
          >
            <Disc3 className="mr-2 size-3.5" />
            Релизы
          </TabsTrigger>
          <TabsTrigger
            value="tracks"
            className="rounded-full px-5 py-1.5 text-sm text-text-secondary transition-all hover:bg-white/4 hover:text-text-secondary data-[state=active]:bg-white/6 data-[state=active]:text-text-primary data-[state=active]:shadow-none"
          >
            <Music className="mr-2 size-3.5" />
            Треки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="outline-hidden">
          <ReleasesTabContent />
        </TabsContent>
        <TabsContent value="tracks" className="outline-hidden">
          <TracksTabContent />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default ArtistProfilePage;
