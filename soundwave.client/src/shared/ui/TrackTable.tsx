import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrackTableColumn<T> {
  key: string;
  header?: React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  hideOnMobile?: boolean;
  render: (row: T, index: number) => React.ReactNode;
}

interface TrackTableProps<T> {
  data: T[];
  columns: TrackTableColumn<T>[];
  onRowClick?: (row: T, index: number) => void;
  showIndex?: boolean;
  showHeader?: boolean;
  getKey: (row: T) => string | number;
  isActive?: (row: T) => boolean;
  className?: string;
}

// Общие классы для лейблов хедера — инлайновые, не блочные
const headerLabelClass =
  "text-xs font-bold uppercase tracking-wider text-text-secondary";

export function TrackTable<T>({
  data,
  columns,
  onRowClick,
  showIndex = true,
  showHeader = true,
  getKey,
  isActive,
  className,
}: Readonly<TrackTableProps<T>>) {
  const gridCols = [
    showIndex ? "16px" : null,
    ...columns.map((col) => col.width ?? "1fr"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("w-full", className)}>
      {/* Хедер — span везде, никаких блочных тегов внутри ячеек */}
      {showHeader && (
        <div
          style={{ gridTemplateColumns: gridCols }}
          className="grid items-center gap-4 border-b border-track-divider px-4 py-2"
        >
          {showIndex && (
            <span className={cn(headerLabelClass, "block w-4 text-center")}>
              #
            </span>
          )}
          {columns.map((col) => (
            <div
              key={col.key}
              className={cn(
                "min-w-0",
                col.hideOnMobile && "hidden md:block",
                col.align === "right" && "flex justify-end",
                col.align === "center" && "flex justify-center",
              )}
            >
              {/* header может быть строкой или ReactNode (иконка Clock) */}
              {col.header != null && (
                <span className={headerLabelClass}>{col.header}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Строки */}
      <div className="mt-2 space-y-0.5">
        {data.map((row, idx) => (
          <div
            key={getKey(row)}
            style={{ gridTemplateColumns: gridCols }}
            onClick={() => onRowClick?.(row, idx)}
            className={cn(
              "group grid items-center gap-4 rounded-lg px-4 py-3 transition-colors",
              "hover:bg-track-row-hover",
              onRowClick && "cursor-pointer",
              isActive?.(row) && "bg-white/[0.07]",
            )}
          >
            {/* Индекс: номер скрывается при ховере, Play появляется */}
            {showIndex && (
              <div className="flex w-4 items-center justify-center">
                {isActive?.(row) ? (
                  <Play className="size-3 fill-current text-primary group-hover:hidden" />
                ) : (
                  <span className="text-sm text-text-secondary group-hover:hidden">
                    {idx + 1}
                  </span>
                )}
                <Play className="hidden size-3 fill-current text-text-primary group-hover:block" />
              </div>
            )}

            {columns.map((col) => (
              <div
                key={col.key}
                className={cn(
                  "min-w-0",
                  col.hideOnMobile && "hidden md:block",
                  col.align === "right" && "flex justify-end",
                  col.align === "center" && "flex justify-center",
                )}
              >
                {col.render(row, idx)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
