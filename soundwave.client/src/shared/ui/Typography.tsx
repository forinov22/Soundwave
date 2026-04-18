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

// Варианты — цвета через токены из index.css
const variantStyles: Record<TypographyVariant, string> = {
  // Основной текст — почти белый
  title: "font-semibold text-foreground",
  // Вторичный текст — приглушённый
  subtitle: "font-normal text-icon",
  // Совсем приглушённый — для мета-информации
  caption: "font-normal text-icon",
  // Лейбл — uppercase, широкий трекинг, для типов сущностей
  label: "font-bold uppercase tracking-widest text-icon",
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
  as: Tag = "span",
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
        // subtitle/caption при hover чуть светлее
        isInteractive &&
          (variant === "subtitle" || variant === "caption") &&
          "transition-colors hover:text-icon-hover",
        isInteractive && "cursor-pointer",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
