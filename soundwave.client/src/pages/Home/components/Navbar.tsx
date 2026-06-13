import { useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, Bell, Mic, Loader2 } from "lucide-react";

import logo from "@/assets/logo.svg";
import { Input } from "@/components/ui/input";
import UserInfo from "@/features/auth/ui/UserInfo";
import { ActionIcon } from "@/shared/ui/ActionIcon";
import { useRecognize } from "@/features/search/lib/useRecognize";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [inputValue, setInputValue] = useState(currentQuery);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { recognize, isRecognizing } = useRecognize();

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue.trim()) {
        navigate(`/search?q=${encodeURIComponent(inputValue)}`, {
          replace: true,
        });
      } else if (globalThis.location.pathname.startsWith("/search")) {
        navigate("/search", { replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, navigate]);

  const handleSearchFocus = () => {
    if (!globalThis.location.pathname.startsWith("/search")) {
      navigate("/search");
    }
  };

  const handleMicClick = () => {
    if (!globalThis.location.pathname.startsWith("/search")) {
      navigate("/search");
    }
    setTimeout(() => fileInputRef.current?.click(), 100);
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
        </a>

        <div className="relative hidden w-96 md:block">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Что хочешь послушать?"
            className="h-10 w-full rounded-full border-zinc-800 bg-zinc-900/50 pr-10 pl-10 text-white transition-all focus-visible:ring-emerald-500"
          />
          <button
            onClick={handleMicClick}
            disabled={isRecognizing}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white disabled:opacity-50"
            aria-label="Распознать трек"
          >
            {isRecognizing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mic className="size-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) recognize(file);
              // сбрасываем чтобы можно было выбрать тот же файл повторно
              e.target.value = "";
            }}
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
