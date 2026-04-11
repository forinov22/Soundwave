import { useState } from "react";
import { Outlet } from "react-router";

import Player from "@/features/player/ui/Player";

import Sidebar from "./components/Sidebar";
import Content from "./components/Content/Content";

export interface LayoutOutletContext {
  setGradientBgColor: (color?: string) => void;
}

const defaultBgStyle = Object.freeze({
  background: "#121212",
});

const MainLayout = () => {
  const [bgStyle, setBgStyle] = useState<{ background: string }>(
    defaultBgStyle,
  );

  const setGradientBgColor = (color?: string) => {
    if (!color) {
      setBgStyle(defaultBgStyle);
      return;
    }

    setBgStyle({
      background: `linear-gradient(${color}, #121212)`,
    });
  };

  return (
    <div className="h-screen bg-black">
      <div className="h-[90%] flex">
        <Sidebar />
        <Content bgStyle={bgStyle}>
          <Outlet
            context={{ setGradientBgColor } satisfies LayoutOutletContext}
          />
        </Content>
      </div>
      <Player />
    </div>
  );
};

export default MainLayout;
