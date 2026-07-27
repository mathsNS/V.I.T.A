import { HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
}

export function Logo({ className, iconClassName, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm",
          iconClassName,
        )}
      >
        <HeartHandshake className="h-5 w-5" strokeWidth={2.25} />
      </div>
      {showWordmark && (
        <span className="text-lg font-extrabold tracking-tight text-primary">
          V.I.T.A.
        </span>
      )}
    </div>
  );
}
