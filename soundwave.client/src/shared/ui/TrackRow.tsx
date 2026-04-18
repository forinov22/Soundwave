import { cn } from "@/lib/utils";
import { Typography } from "@/shared/ui/Typography";

type TrackRowSize = "sm" | "md" | "lg";

interface TrackRowProps {
  // Картинка — url строкой или кастомный ReactNode (для градиентов, иконок)
  image: string | React.ReactNode;
  imageShape?: "square" | "rounded" | "circle";

  title: string;
  subtitle?: string;

  // Слот перед subtitle — например, бейдж "E"
  subtitlePrefix?: React.ReactNode;

  size?: TrackRowSize;

  // Интерактивность текста
  titleOnClick?: () => void;
  subtitleOnClick?: () => void;

  // Подсветка всей строки при ховере
  highlightOnHover?: boolean;

  onClick?: () => void;
  className?: string;
}

const sizeConfig: Record<
  TrackRowSize,
  {
    image: string;
    gap: string;
  }
> = {
  sm: { image: "size-10", gap: "gap-3" },
  md: { image: "size-12", gap: "gap-3" },
  lg: { image: "size-16", gap: "gap-4" },
};

const shapeStyles = {
  square: "rounded",
  rounded: "rounded-lg",
  circle: "rounded-full",
};

// Размер текста под каждый size
const titleSize: Record<TrackRowSize, "xs" | "sm" | "md"> = {
  sm: "sm",
  md: "sm",
  lg: "md",
};
const subtitleSize: Record<TrackRowSize, "xs" | "sm"> = {
  sm: "xs",
  md: "xs",
  lg: "sm",
};

export function TrackRow({
  image,
  imageShape = "rounded",
  title,
  subtitle,
  subtitlePrefix,
  size = "md",
  titleOnClick,
  subtitleOnClick,
  highlightOnHover = false,
  onClick,
  className,
}: Readonly<TrackRowProps>) {
  const cfg = sizeConfig[size];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center",
        cfg.gap,
        onClick && "cursor-pointer",
        // highlight через токен track-row-hover
        highlightOnHover && [
          "-mx-2 rounded-md px-2 py-1.5",
          "transition-colors hover:bg-track-row-hover",
        ],
        className,
      )}
    >
      {/* Картинка или кастомный слот */}
      {typeof image === "string" ? (
        <img
          src={image}
          alt={title}
          className={cn(
            "shrink-0 object-cover shadow-md",
            cfg.image,
            shapeStyles[imageShape],
          )}
        />
      ) : (
        <div className={cn("shrink-0", cfg.image, shapeStyles[imageShape])}>
          {image}
        </div>
      )}

      {/* Текст */}
      <div className="flex min-w-0 flex-col overflow-hidden">
        <Typography
          variant="title"
          size={titleSize[size]}
          truncate
          underlineOnHover={!!titleOnClick}
          onClick={titleOnClick}
        >
          {title}
        </Typography>

        {(subtitle || subtitlePrefix) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {subtitlePrefix}
            {subtitle && (
              <Typography
                variant="subtitle"
                size={subtitleSize[size]}
                truncate
                underlineOnHover={!!subtitleOnClick}
                onClick={subtitleOnClick}
              >
                {subtitle}
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
