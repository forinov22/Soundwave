import { useNavigate, useSearchParams } from "react-router";
import { Search, Bell } from "lucide-react";

import logo from "@/assets/logo.svg";
import { Input } from "@/components/ui/input";
import UserInfo from "@/features/auth/ui/UserInfo";
import { ActionIcon } from "@/shared/ui/ActionIcon";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q)}`, { replace: true });
    } else {
      navigate("/search", { replace: true });
    }
  };

  const handleSearchFocus = () => {
    // Если не на странице поиска — навигируем туда
    if (!globalThis.location.pathname.startsWith("/search")) {
      navigate("/search");
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-zinc-900 bg-black px-6">
      <div className="flex items-center gap-8">
        <a
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <img src={logo} alt="logo" className="size-8" />
          <span className="hidden text-xl font-bold tracking-tight md:block">
            MusicApp
          </span>
        </a>

        <div className="relative hidden w-96 md:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            defaultValue={currentQuery}
            key={currentQuery} // сбрасывает значение при внешней навигации
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            placeholder="Что хочешь послушать?"
            className="h-10 w-full rounded-full border-zinc-800 bg-zinc-900/50 pl-10 transition-all focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ActionIcon
          icon={<Bell className="size-5" />}
          onClick={() => navigate("/notifications")}
          label="Уведомления"
        />
        <UserInfo />
      </div>
    </nav>
  );
};

export default Navbar;
