import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Loader2, Music2, Disc3, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/model/authStore";
import { adminApi, type ArtistAdminItem } from "@/features/admin/api/adminApi";

// ── Форма создания артиста ──────────────────────────────────────────────────

interface CreateArtistFormProps {
  onCreated: (artist: ArtistAdminItem) => void;
}

function CreateArtistForm({ onCreated }: CreateArtistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await adminApi.createArtist({
        name: name.trim(),
        email: email.trim(),
        password,
        description: description.trim() || undefined,
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      setDescription("");

      // Обновляем список артистов
      const res = await adminApi.getArtists();
      const created = res.data.find((a) => a.email === email.trim());
      if (created) onCreated(created);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Не удалось создать артиста",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-zinc-900 p-6"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">
        Создать артиста
      </h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Имя
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Название артиста"
            required
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="artist@example.com"
            required
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Пароль
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Временный пароль"
            required
            minLength={6}
            className="border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Описание{" "}
            <span className="normal-case text-zinc-600">(необязательно)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание артиста"
            rows={3}
            className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && (
          <p className="text-sm text-emerald-400">Артист успешно создан!</p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
        >
          {isLoading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          Создать артиста
        </Button>
      </div>
    </form>
  );
}

// ── Карточка артиста ────────────────────────────────────────────────────────

function ArtistCard({ artist }: { artist: ArtistAdminItem }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/5 bg-zinc-900/60 p-4 transition-colors hover:bg-zinc-800/60"
      onClick={() => navigate(`/artist/${artist.id}`)}
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-zinc-800">
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt=""
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <User className="size-5 text-zinc-500" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{artist.name}</p>
        <p className="truncate text-xs text-zinc-500">{artist.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Music2 className="size-3.5" />
          {artist.trackCount}
        </span>
        <span className="flex items-center gap-1">
          <Disc3 className="size-3.5" />
          {artist.releaseCount}
        </span>
      </div>
    </div>
  );
}

// ── Страница ────────────────────────────────────────────────────────────────

const AdminPage = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [artists, setArtists] = useState<ArtistAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    adminApi
      .getArtists()
      .then((res) => setArtists(res.data))
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Панель администратора</h1>
          <p className="mt-1 text-zinc-500">
            Управление артистами платформы
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Список артистов */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Артисты{" "}
              <span className="text-zinc-500">({artists.length})</span>
            </h2>

            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-zinc-600" />
              </div>
            ) : artists.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Артистов пока нет. Создайте первого!
              </p>
            ) : (
              <div className="space-y-2">
                {artists.map((a) => (
                  <ArtistCard key={a.id} artist={a} />
                ))}
              </div>
            )}
          </section>

          {/* Форма */}
          <aside>
            <CreateArtistForm
              onCreated={(artist) =>
                setArtists((prev) => {
                  if (prev.some((a) => a.id === artist.id)) return prev;
                  return [artist, ...prev];
                })
              }
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
