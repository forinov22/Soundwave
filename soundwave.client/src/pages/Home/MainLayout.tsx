import { useState } from "react";
import { Outlet } from "react-router";

import Player from "@/features/player/ui/Player";
import { RightSidebar } from "@/features/sidebar/ui/RightSidebar";
import { SidebarTrigger } from "@/features/sidebar/ui/SidebarTrigger";

import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar";
import PageLayout from "./components/PageLayout/PageLayout";

export interface LayoutOutletContext {
  setGradientBgColor: (color?: string) => void;
}

const defaultBgStyle = Object.freeze("#121212");

const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [gradientColor, setGradientColor] = useState(defaultBgStyle);

  const setGradientBgColor = (color?: string) => {
    if (!color) {
      setGradientColor(defaultBgStyle);
      return;
    }

    setGradientColor(`linear-gradient(${color}, #121212)`);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-black">
      <Navbar />

      <div className="relative flex flex-1 gap-2 overflow-hidden p-2">
        {/* Левая панель */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Основная рабочая область с контентом */}
        <div className="relative flex flex-1 gap-2 overflow-hidden">
          <PageLayout gradientColor={gradientColor}>
            <Outlet
              context={
                {
                  setGradientBgColor: setGradientBgColor,
                } satisfies LayoutOutletContext
              }
            />
            {/* Триггер будет прижат к правому краю внутри контента, если сайдбар закрыт */}
            <SidebarTrigger />
          </PageLayout>

          {/* Правая панель (появляется сбоку от контента) */}
          <RightSidebar />
        </div>
      </div>

      <Player />
    </div>
  );
};

export default MainLayout;
