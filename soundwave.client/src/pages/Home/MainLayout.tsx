import { useState } from "react";
import { Outlet } from "react-router";

import Player from "@/features/player/ui/Player";
import { RightSidebar } from "@/features/sidebar/ui/RightSidebar";
import { SidebarTrigger } from "@/features/sidebar/ui/SidebarTrigger";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Content from "./components/Content/Content";

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
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden p-2 gap-2 relative">
        {/* Левая панель */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Основная рабочая область с контентом */}
        <div className="flex-1 flex relative overflow-hidden gap-2">
          <Content gradientColor={gradientColor}>
            <Outlet
              context={
                {
                  setGradientBgColor: setGradientBgColor,
                } satisfies LayoutOutletContext
              }
            />
            {/* Триггер будет прижат к правому краю внутри контента, если сайдбар закрыт */}
            <SidebarTrigger />
          </Content>

          {/* Правая панель (появляется сбоку от контента) */}
          <RightSidebar />
        </div>
      </div>

      <Player />
    </div>
  );
};

export default MainLayout;
