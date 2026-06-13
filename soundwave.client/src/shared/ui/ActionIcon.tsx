import { cn } from "@/lib/utils";

type ActionIconVariant = "default" | "primary" | "danger";
type ActionIconSize = "sm" | "md" | "lg";

interface ActionIconProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ActionIconVariant;
  size?: ActionIconSize;
  // Показывать постоянный фоновый круг (не только при ховере)
  withBackground?: boolean;
  disabled?: boolean;
  label?: string; // aria-label
  className?: string;
}

const sizeStyles: Record<ActionIconSize, string> = {
  sm: "size-7",
  md: "size-9",
  lg: "size-11",
};

// Цвета берём из токенов index.css через Tailwind
// default:  text-icon → hover:text-icon-hover,         hover bg: icon-hover-bg
// primary:  text-icon → hover:text-icon-primary-hover, hover bg: icon-primary-hover-bg
// danger:   text-icon → hover:text-destructive,        hover bg: destructive/10
const variantStyles: Record<ActionIconVariant, string> = {
  default: [
    "text-icon",
    "hover:text-icon-hover",
    "hover:bg-icon-hover-bg",
  ].join(" "),
  primary: [
    "text-icon",
    "hover:text-icon-primary-hover",
    "hover:bg-icon-primary-hover-bg",
  ].join(" "),
  danger: [
    "text-icon",
    "hover:text-destructive",
    "hover:bg-destructive/10",
  ].join(" "),
};

export function ActionIcon({
  icon,
  onClick,
  variant = "default",
  size = "md",
  withBackground = false,
  disabled = false,
  label,
  className,
}: Readonly<ActionIconProps>) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        // Layout
        "flex items-center justify-center rounded-full",
        // Переходы
        "transition-all duration-150 active:scale-90",
        // Размер
        sizeStyles[size],
        // Цвета по варианту
        variantStyles[variant],
        // Постоянный фон (например, для кнопки с рамкой или выделенной)
        withBackground && "bg-icon-hover-bg",
        // Disabled
        disabled && "pointer-events-none cursor-not-allowed opacity-40",
        className,
      )}
    >
      {icon}
    </button>
  );
}
