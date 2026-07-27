import { motion } from "framer-motion";
import { BellOff, CalendarClock, FileCheck2, MessageSquareText, Settings2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useAppData } from "@/context/AppDataContext";
import type { Notification } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<Notification["type"], typeof CalendarClock> = {
  consulta: CalendarClock,
  triagem: MessageSquareText,
  resultado: FileCheck2,
  lembrete: CalendarClock,
  sistema: Settings2,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  return `${days} d atrás`;
}

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Notificações"
        right={
          notifications.some((n) => !n.read) ? (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="text-[11px] font-semibold text-primary"
            >
              Marcar tudo
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 px-4 pb-8 pt-2">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BellOff className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Você ainda não tem notificações.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n, index) => {
              const Icon = ICONS[n.type];
              return (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border border-border p-4 text-left transition-colors",
                      n.read ? "bg-card" : "bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        n.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
                      <span className="mt-1 block text-[11px] font-medium text-muted-foreground/70">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
