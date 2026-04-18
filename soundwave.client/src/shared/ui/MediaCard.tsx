import { cn } from "@/lib/utils";
import { Typography } from "@/shared/ui/Typography";

interface MediaCardProps {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  imageShape?: "square" | "circle";
  // Кнопка поверх картинки при ховере (например, Play)
  hoverButton?: React.ReactNode;
  imageZoomOnHover?: boolean;
  textAlign?: "left" | "center";
  // subtitle в несколько строк
  subtitleClamp?: number;
  className?: string;
}

export function MediaCard({
  image,
  title,
  subtitle,
  onClick,
  imageShape = "square",
  hoverButton,
  imageZoomOnHover = false,
  textAlign = "left",
  subtitleClamp = 1,
  className,
}: Readonly<MediaCardProps>) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl p-3",
        // Поверхность и hover — через токены
        "border border-transparent bg-surface",
        "hover:border-white/5 hover:bg-surface-hover",
        "transition-all duration-300",
        textAlign === "center" && "text-center",
        className,
      )}
    >
      {/* Картинка */}
      <div
        className={cn(
          "relative mb-3 aspect-square overflow-hidden shadow-lg",
          imageShape === "circle" ? "rounded-full" : "rounded-lg",
        )}
      >
        <img
          src={image}
          alt={title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            imageZoomOnHover && "group-hover:scale-105",
          )}
        />

        {/* Кнопка при ховере — выезжает снизу */}
        {hoverButton && (
          <div
            className={cn(
              "absolute right-2 bottom-2",
              "translate-y-4 opacity-0",
              "group-hover:translate-y-0 group-hover:opacity-100",
              "transition-all duration-300",
            )}
          >
            {hoverButton}
          </div>
        )}
      </div>

      {/* Текст */}
      <Typography variant="title" truncate>
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant={subtitleClamp > 1 ? "caption" : "subtitle"}
          clamp={subtitleClamp > 1 ? subtitleClamp : undefined}
          truncate={subtitleClamp === 1}
          className="mt-0.5"
        >
          {subtitle}
        </Typography>
      )}
    </div>
  );
}
