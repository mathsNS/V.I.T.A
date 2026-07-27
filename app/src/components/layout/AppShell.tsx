import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh w-full justify-center bg-slate-200/70">
      <div className="relative flex w-full max-w-md flex-col bg-background sm:my-6 sm:min-h-[calc(100svh-3rem)] sm:overflow-hidden sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-8 sm:ring-slate-900/5">
        {children}
      </div>
    </div>
  );
}
