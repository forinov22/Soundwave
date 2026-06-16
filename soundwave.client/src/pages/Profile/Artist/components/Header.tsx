import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Pencil } from "lucide-react";

import logo from "@/assets/logo.svg";
import UserButton from "@/features/auth/ui/UserButton";
import { Typography } from "@/shared/ui/Typography";
import { useAuth } from "@/features/auth/lib/useAuth";
import type { ArtistProfile } from "@/features/artist/api/artistApi";
import { apiClient } from "@/shared/api/apiClient";
import { EditProfileModal } from "./EditProfileModal";

const Header = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    apiClient
      .get<ArtistProfile>(`/api/artist/${user.id}`)
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, [user?.id]);

  return (
    <>
      {/* Навбар */}
      <div className="flex items-center justify-between">
        <Link to="/" className="rounded-lg transition-opacity hover:opacity-80">
          <img src={logo} alt="logo" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            <Pencil className="size-3.5" />
            Изменить профиль
          </button>
          <UserButton />
        </div>
      </div>

      {/* Профиль артиста */}
      <div className="mt-6 flex items-center gap-5">
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="avatar"
            className="size-20 shrink-0 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="size-20 shrink-0 rounded-full bg-zinc-700" />
        )}
        <div className="min-w-0">
          <Typography as="h1" variant="title" size="lg" className="text-3xl font-bold" truncate>
            {profile?.name ?? "Профиль артиста"}
          </Typography>
          {profile?.description && (
            <Typography variant="subtitle" size="sm" className="mt-1 line-clamp-2">
              {profile.description}
            </Typography>
          )}
          {profile?.monthlyListeners != null && (
            <Typography variant="subtitle" size="sm" className="mt-0.5 text-zinc-500">
              {profile.monthlyListeners.toLocaleString("ru-RU")} слушателей в месяц
            </Typography>
          )}
        </div>
      </div>

      {profile && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialName={profile.name}
          initialDescription={profile.description}
          initialAvatarUrl={profile.avatarUrl}
          initialBannerUrl={profile.bannerUrl}
          onSaved={(updated) => setProfile(updated)}
        />
      )}
    </>
  );
};

export default Header;
