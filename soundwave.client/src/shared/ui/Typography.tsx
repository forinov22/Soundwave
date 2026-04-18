import { cn } from "@/lib/utils";

type TypographyVariant = "title" | "subtitle" | "caption" | "label";
type TypographySize = "xs" | "sm" | "md" | "lg";

interface TypographyProps {
  variant?: TypographyVariant;
  size?: TypographySize;
  truncate?: boolean;
  clamp?: number;
  underlineOnHover?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

// Цвета через токены из index.css
const variantStyles: Record<TypographyVariant, string> = {
  // Основной текст — почти белый (--text-primary: oklch(0.985 0 0))
  title: "font-semibold text-text-primary",
  // Вторичный — серый (--text-secondary: oklch(0.65 0 0))
  subtitle: "font-normal text-text-secondary",
  // Мета-информация — приглушённый (--text-muted: oklch(0.5 0 0))
  caption: "font-normal text-text-muted",
  // Лейбл типа «АЛЬБОМ» — uppercase, широкий трекинг
  label: "font-bold uppercase tracking-widest text-text-secondary",
};

const sizeStyles: Record<TypographySize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

// Дефолтные размеры для каждого варианта
const variantDefaultSize: Record<TypographyVariant, TypographySize> = {
  title: "sm",
  subtitle: "sm",
  caption: "xs",
  label: "xs",
};

export function Typography({
  variant = "title",
  size,
  truncate = false,
  clamp,
  underlineOnHover = false,
  onClick,
  className,
  children,
  // p по умолчанию — блочный элемент, title и subtitle идут каждый на своей строке
  as: Tag = "p",
}: Readonly<TypographyProps>) {
  const resolvedSize = size ?? variantDefaultSize[variant];
  const isInteractive = !!onClick || underlineOnHover;

  return (
    <Tag
      onClick={onClick}
      className={cn(
        variantStyles[variant],
        sizeStyles[resolvedSize],
        truncate && "truncate",
        clamp && `line-clamp-${clamp}`,
        underlineOnHover && "underline-offset-2 hover:underline",
        // subtitle/caption при hover становятся светлее
        isInteractive &&
          (variant === "subtitle" || variant === "caption") &&
          "transition-colors hover:text-text-primary",
        isInteractive && "cursor-pointer",
        // убираем дефолтные margin у p
        "m-0",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
