import { CalendarDays, ClipboardList, FileHeart, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { to: "/profissional/fila", label: "Fila", icon: ClipboardList },
  { to: "/profissional/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/profissional/prontuarios", label: "Prontuários", icon: FileHeart },
  { to: "/profissional/perfil", label: "Perfil", icon: UserRound },
];

export function ProfessionalLayout() {
  const { professional } = useAuth();
  return (
    <AppShell><div data-professional-shell className="contents">
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b bg-background/95 px-5 backdrop-blur">
        <Logo />
        <div className="ml-auto text-right">
          <p className="text-xs font-bold text-primary">{professional?.name}</p>
          <p className="text-[10px] text-muted-foreground">Área profissional</p>
        </div>
        <div className="ml-3 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-primary">{professional?.initials}</div>
      </header>
      <main className="flex-1 overflow-y-auto bg-[#f4f7fa] px-5 pb-24 pt-5"><Outlet /></main>
      <nav className="absolute inset-x-0 bottom-0 z-30 grid h-19 grid-cols-4 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn("flex flex-col items-center justify-center gap-1 text-[10px] font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
            {({ isActive }) => <><span className={cn("rounded-xl p-1.5", isActive && "bg-accent")}><Icon className="h-5 w-5" /></span>{label}</>}
          </NavLink>
        ))}
      </nav>
    </div></AppShell>
  );
}
