import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  transparent?: boolean;
  className?: string;
}

export function TopBar({
  title,
  onBack,
  showBack = true,
  right,
  transparent = false,
  className,
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-2",
        transparent ? "bg-transparent" : "border-b border-border/70 bg-background/95 backdrop-blur",
        className,
      )}
    >
      <div className="flex w-10 items-center justify-start">
        {showBack && (
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>
      <h1 className="flex-1 truncate text-center text-[15px] font-semibold text-foreground">
        {title}
      </h1>
      <div className="flex w-10 items-center justify-end">{right}</div>
    </header>
  );
}
