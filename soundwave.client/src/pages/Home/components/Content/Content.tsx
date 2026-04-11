import type { CSSProperties } from "react";

interface ContentProps {
  bgStyle: CSSProperties;
  children: React.ReactNode;
}

const Content = ({ bgStyle, children }: ContentProps) => {
  return (
    <div
      style={bgStyle}
      className="w-full lg:w-[75%] m-2 lg:ml-0 px-6 pt-4 text-white overflow-auto"
    >
      {children}
    </div>
  )
}

export default Content