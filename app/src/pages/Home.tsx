import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS, SPECIALTIES } from "@/lib/mockData";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, unreadNotifications } = useAppData();

  const nextAppointment = appointments
    .filter((a) => a.status === "confirmada" || a.status === "agendada")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const doctor = nextAppointment ? DOCTORS.find((d) => d.id === nextAppointment.doctorId) : undefined;
  const specialty = nextAppointment
    ? SPECIALTIES.find((s) => s.id === nextAppointment.specialtyId)
    : undefined;

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        showBack={false}
        title=""
        right={
          <button
            type="button"
            onClick={() => navigate("/notificacoes")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </button>
        }
      />

      <div className="flex-1 space-y-6 px-6 pb-10 pt-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-primary">Olá, {user?.name ?? "paciente"}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bem vindo ao V.I.T.A, sua plataforma inteligente de pré-triagem e gestão de
            atendimento em saúde.
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => navigate("/triagem")}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full overflow-hidden rounded-3xl bg-primary p-6 text-left text-primary-foreground shadow-lg shadow-primary/25"
        >
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <MessageCircle className="h-8 w-8" />
          <p className="mt-4 text-lg font-bold">Iniciar pré-triagem</p>
          <p className="mt-1 text-sm text-primary-foreground/80">
            Descreva seus sintomas e receba orientação antes da consulta.
          </p>
          <span className="mt-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Leva cerca de 5 minutos
          </span>
        </motion.button>

        {nextAppointment && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarClock className="h-4 w-4" /> Próxima consulta
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">{doctor?.name}</p>
                <p className="text-sm text-muted-foreground">{specialty?.name}</p>
                <p className="mt-1 text-sm font-medium text-primary">
                  {new Date(`${nextAppointment.date}T00:00:00`).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  às {nextAppointment.time}
                </p>
              </div>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
                style={{ backgroundColor: doctor?.color }}
              >
                {doctor?.initials}
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-4 w-full rounded-2xl"
              onClick={() => navigate(`/consultas/${nextAppointment.id}`)}
            >
              Ver detalhes
            </Button>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            type="button"
            onClick={() => navigate("/agendamento")}
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/60"
          >
            <CalendarClock className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Agendar consulta</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/historico")}
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/60"
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Meu histórico</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
