import { Link, useNavigate } from "react-router";
import { Search, Bell } from "lucide-react";

import logo from "@/assets/logo.svg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserInfo from "@/features/auth/ui/UserInfo";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-black border-b border-zinc-900 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="logo" className="size-8" />
          <span className="font-bold text-xl tracking-tight hidden md:block">
            MusicApp
          </span>
        </Link>

        <div className="relative w-96 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            placeholder="Что хочешь послушать?"
            className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-emerald-500 transition-all rounded-full h-10 w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/notifications")}
          className="text-zinc-300 hover:text-white hover:bg-white/5 transition-all active:scale-90"
        >
          <Bell className="size-5" />
        </Button>

        <UserInfo />
      </div>
    </nav>
  );
};

export default Navbar;
