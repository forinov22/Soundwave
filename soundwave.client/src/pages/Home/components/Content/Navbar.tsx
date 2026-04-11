import { useNavigate } from "react-router";

import left_arrow from "@/assets/left_arrow.png";
import right_arrow from "@/assets/right_arrow.png";
import UserInfo from "@/features/auth/ui/UserInfo";


const Navbar = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold">
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate(-1)}
            src={left_arrow}
            alt="left_arrow"
            className="w-8 p-2 bg-black rounded-2xl cursor-pointer"
          />
          <img
            onClick={() => navigate(1)}
            src={right_arrow}
            alt="right_arrow"
            className="w-8 p-2 bg-black rounded-2xl cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden md:block px-4 py-1 bg-white rounded-2xl text-black text-[15px] cursor-pointer">
            Explore Premium
          </p>
          <p className="px-3 py-1 bg-black rounded-2xl text-[15px] cursor-pointer">
            Install App
          </p>
          <UserInfo />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <p className="px-4 py-1 bg-white rounded-2xl text-black cursor-pointer">
          All
        </p>
        <p className="px-4 py-1 bg-black rounded-2xl cursor-pointer">Music</p>
        <p className="px-4 py-1 bg-black rounded-2xl cursor-pointer">
          Podcasts
        </p>
      </div>
    </>
  );
};

export default Navbar;
