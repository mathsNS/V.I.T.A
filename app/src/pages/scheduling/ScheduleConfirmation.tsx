import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS, SPECIALTIES } from "@/lib/mockData";

export default function ScheduleConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointments } = useAppData();

  const appointmentId = (location.state as { appointmentId?: string } | null)?.appointmentId;
  const appointment = appointments.find((a) => a.id === appointmentId) ?? appointments[0];
  const doctor = DOCTORS.find((d) => d.id === appointment?.doctorId);
  const specialty = SPECIALTIES.find((s) => s.id === appointment?.specialtyId);

  return (
    <div className="flex min-h-svh flex-1 flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
      >
        <CalendarCheck2 className="h-12 w-12" />
      </motion.div>

      <h1 className="mt-6 text-2xl font-extrabold text-primary">Consulta agendada!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Você receberá lembretes antes do dia da consulta.
      </p>

      {appointment && (
        <div className="mt-6 w-full space-y-2 rounded-2xl border border-border bg-card p-4 text-left text-sm">
          <p><span className="font-semibold">Profissional: </span>{doctor?.name}</p>
          <p><span className="font-semibold">Especialidade: </span>{specialty?.name}</p>
          <p>
            <span className="font-semibold">Quando: </span>
            {new Date(`${appointment.date}T00:00:00`).toLocaleDateString("pt-BR")} às {appointment.time}
          </p>
        </div>
      )}

      <div className="mt-10 flex w-full flex-col gap-3">
        <Button size="lg" className="w-full rounded-2xl" onClick={() => navigate("/consultas")}>
          Ver minhas consultas
        </Button>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="text-sm font-semibold text-primary"
        >
          Voltar para o início
        </button>
      </div>
    </div>
  );
}
