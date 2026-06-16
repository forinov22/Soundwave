import { useEffect } from "react";
import { Disc3, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useArtist } from "@/features/artist/lib/useArtist";
import { Typography } from "@/shared/ui/Typography";

import ReleaseCard from "./ReleaseCard";
import ReleaseDialog from "./ReleaseDialog";

const ReleasesTabContent = () => {
  const {
    drafts,
    published,
    fetchDrafts,
    fetchPublished,
    fetchTracks,
    isDraftsLoading,
    isPublishedLoading,
  } = useArtist();

  useEffect(() => {
    if (drafts.length === 0) fetchDrafts();
    if (published.length === 0) fetchPublished();
    fetchTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty =
    !isDraftsLoading &&
    !isPublishedLoading &&
    drafts.length === 0 &&
    published.length === 0;

  return (
    <div className="rounded-2xl border border-hairline bg-graphite-panel p-6">
      {/* Шапка */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Typography
            as="h3"
            variant="title"
            size="lg"
            className="font-semibold"
          >
            Релизы
          </Typography>
          <Typography variant="subtitle" size="sm" className="mt-1">
            {isDraftsLoading || isPublishedLoading
              ? "Загрузка..."
              : `${drafts.length} ${pluralizeDrafts(drafts.length)} · ${published.length} опубликовано`}
          </Typography>
        </div>
        <ReleaseDialog>
          <Button className="rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Создать релиз
          </Button>
        </ReleaseDialog>
      </div>

      {/* Загрузка */}
      {isDraftsLoading && isPublishedLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {/* Пусто */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Disc3 className="mb-4 size-12 text-text-muted opacity-40" />
          <Typography variant="title" size="md" className="mb-1 font-semibold">
            Релизов пока нет
          </Typography>
          <Typography variant="subtitle" size="sm">
            Создайте первый — это может быть сингл или альбом.
          </Typography>
        </div>
      )}

      {/* Секции */}
      {drafts.length > 0 && (
        <Section
          title="Черновики"
          subtitle="Редактируемые. Добавляйте треки и публикуйте."
        >
          <div className="space-y-2">
            {drafts.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        </Section>
      )}

      {published.length > 0 && (
        <Section
          title="Опубликованные"
          subtitle="Видны слушателям. Заморожены — можно отправить в архив."
          mt
        >
          <div className="space-y-2">
            {published.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  subtitle: string;
  mt?: boolean;
  children: React.ReactNode;
}

const Section = ({ title, subtitle, mt, children }: SectionProps) => (
  <section className={mt ? "mt-8" : ""}>
    <div className="mb-3 flex items-baseline gap-3">
      <Typography variant="label" size="xs" className="text-text-secondary">
        {title}
      </Typography>
      <span className="text-[11px] text-text-muted">{subtitle}</span>
    </div>
    {children}
  </section>
);

const pluralizeDrafts = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "черновик";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "черновика";
  return "черновиков";
};

export default ReleasesTabContent;
