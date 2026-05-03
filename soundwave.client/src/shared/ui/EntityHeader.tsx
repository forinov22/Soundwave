import { cn } from "@/lib/utils";
import { Typography } from "@/shared/ui/Typography";

type EntityHeaderPreset = "album" | "single" | "playlist" | "compact";

interface EntityHeaderProps {
  image: string | React.ReactNode;
  // Тип над заголовком — "Альбом", "Сингл", "Плейлист"
  type?: string;
  title: string;
  // Метаданные — соединяются через •, null/undefined пропускаются
  meta?: (string | null | undefined)[];
  // Слот под мета — кнопки Play, Like, More и т.д.
  actions?: React.ReactNode;
  // Кнопка поверх картинки при ховере
  imageHoverButton?: React.ReactNode;
  preset?: EntityHeaderPreset;
  // Переопределение размера картинки если пресет не подходит
  imageSize?: number;
  className?: string;
}

const presetConfig: Record<
  EntityHeaderPreset,
  {
    imageSize: number;
    titleClass: string;
    rounded: string;
    // compact — горизонтальный лейаут без центрирования на мобильных
    compact: boolean;
  }
> = {
  album: {
    imageSize: 256,
    titleClass: "text-4xl md:text-7xl font-black leading-none",
    rounded: "rounded-xl",
    compact: false,
  },
  single: {
    imageSize: 208,
    titleClass: "text-3xl md:text-5xl font-black leading-none",
    rounded: "rounded-xl",
    compact: false,
  },
  playlist: {
    imageSize: 256,
    titleClass: "text-4xl md:text-7xl font-black leading-none",
    rounded: "rounded-xl",
    compact: false,
  },
  compact: {
    imageSize: 176,
    titleClass: "text-2xl md:text-3xl font-bold leading-snug",
    rounded: "rounded-md",
    compact: true,
  },
};

export function EntityHeader({
  image,
  type,
  title,
  meta,
  actions,
  imageHoverButton,
  preset = "album",
  imageSize,
  className,
}: Readonly<EntityHeaderProps>) {
  const cfg = presetConfig[preset];
  const imgPx = imageSize ?? cfg.imageSize;

  // Фильтруем пустые значения и соединяем через •
  const metaItems = meta?.filter(Boolean);

  return (
    <div
      className={cn(
        "flex gap-6 pt-6",
        cfg.compact
          ? // compact — всегда горизонтально, выровнено по низу
            "flex-row items-end md:gap-8"
          : // остальные — вертикально на мобильных, горизонтально на десктопе
            "flex-col items-center md:flex-row md:items-end md:gap-8",
        className,
      )}
    >
      {/* Картинка */}
      <div
        className="group/img relative shrink-0"
        style={{ width: imgPx, height: imgPx }}
      >
        {typeof image === "string" ? (
          <img
            src={image}
            alt={title}
            className={cn(
              "h-full w-full object-cover",
              cfg.rounded,
              "shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full w-full overflow-hidden",
              cfg.rounded,
              "shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
            )}
          >
            {image}
          </div>
        )}

        {/* Hover-кнопка поверх картинки */}
        {imageHoverButton && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/20 opacity-0 transition-opacity",
              "group-hover/img:opacity-100",
              cfg.rounded,
            )}
          >
            {imageHoverButton}
          </div>
        )}
      </div>

      {/* Текст */}
      <div
        className={cn(
          "flex min-w-0 flex-col",
          cfg.compact ? "justify-end py-2" : "text-center md:text-left",
        )}
      >
        {/* Тип — "Альбом", "Сингл"... */}
        {type && (
          <Typography variant="label" size="xs" className="mb-1 text-primary">
            {type}
          </Typography>
        )}

        {/* Заголовок — не через Typography, т.к. нужен font-black и огромный размер */}
        <h1 className={cn("mt-1 mb-3 text-text-primary", cfg.titleClass)}>
          {title}
        </h1>

        {/* Метаданные через • */}
        {metaItems && metaItems.length > 0 && (
          <div
            className={cn(
              "flex flex-wrap gap-x-2 gap-y-1 text-sm",
              cfg.compact ? "" : "justify-center md:justify-start",
            )}
          >
            {metaItems.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                {idx > 0 && <span className="text-text-muted">•</span>}
                <Typography variant="subtitle" size="sm" as="span">
                  {item}
                </Typography>
              </span>
            ))}
          </div>
        )}

        {/* Слот для кнопок */}
        {actions && (
          <div
            className={cn(
              "mt-6 flex items-center gap-4",
              cfg.compact ? "" : "justify-center md:justify-start",
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
