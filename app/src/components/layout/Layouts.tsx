import { Outlet } from "react-router-dom";
import { AppShell } from "./AppShell";
import { BottomNav } from "./BottomNav";

export function AuthenticatedLayout() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </AppShell>
  );
}

export function PlainLayout() {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
    </AppShell>
  );
}
