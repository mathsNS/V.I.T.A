import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CalendarClock, MapPin, Video, X } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS, SPECIALTIES, TIME_SLOTS } from "@/lib/mockData";
import { PRIORITY_LABELS } from "@/lib/triageEngine";

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, cancelAppointment, rescheduleAppointment, confirmAppointment } =
    useAppData();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState<string | null>(null);

  const appointment = appointments.find((a) => a.id === id);
  const doctor = useMemo(
    () => DOCTORS.find((d) => d.id === appointment?.doctorId),
    [appointment],
  );
  const specialty = useMemo(
    () => SPECIALTIES.find((s) => s.id === appointment?.specialtyId),
    [appointment],
  );

  if (!appointment) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Consulta" />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-muted-foreground">
          Consulta não encontrada.
        </div>
      </div>
    );
  }

  const priority = appointment.priority ? PRIORITY_LABELS[appointment.priority] : undefined;
  const isUpcoming = appointment.status === "agendada" || appointment.status === "confirmada";

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Detalhes da consulta" />

      <div className="flex-1 space-y-5 px-6 pb-8 pt-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold text-white"
            style={{ backgroundColor: doctor?.color }}
          >
            {doctor?.initials}
          </div>
          <div>
            <p className="font-bold text-foreground">{doctor?.name}</p>
            <p className="text-sm text-muted-foreground">{doctor?.crm}</p>
            <p className="text-sm font-medium text-primary">{specialty?.name}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <CalendarClock className="h-4.5 w-4.5 text-primary" />
            <span>
              {new Date(`${appointment.date}T00:00:00`).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}{" "}
              às {appointment.time}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {appointment.modality === "teleconsulta" ? (
              <Video className="h-4.5 w-4.5 text-primary" />
            ) : (
              <MapPin className="h-4.5 w-4.5 text-primary" />
            )}
            <span>{appointment.location}</span>
          </div>
          {priority && (
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline" className={priority.color}>
                {priority.label}
              </Badge>
            </div>
          )}
          {appointment.reason && (
            <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Motivo: </span>
              {appointment.reason}
            </p>
          )}
        </div>

        {isUpcoming && (
          <div className="space-y-3">
            {appointment.modality === "teleconsulta" && (
              <Button
                size="lg"
                className="w-full rounded-2xl"
                onClick={() => navigate(`/consultas/${appointment.id}/teleconsulta`)}
              >
                <Video className="h-4.5 w-4.5" /> Entrar na teleconsulta
              </Button>
            )}
            {appointment.status === "agendada" && (
              <Button
                variant="secondary"
                size="lg"
                className="w-full rounded-2xl"
                onClick={() => {
                  confirmAppointment(appointment.id);
                  toast.success("Presença confirmada!");
                }}
              >
                Confirmar presença
              </Button>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl"
                onClick={() => setRescheduleOpen(true)}
              >
                Reagendar
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-2xl text-destructive hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <X className="h-4 w-4" /> Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar consulta?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            O horário com {doctor?.name} será liberado. Essa ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                cancelAppointment(appointment.id);
                setCancelOpen(false);
                toast.success("Consulta cancelada.");
                navigate("/consultas");
              }}
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar consulta</DialogTitle>
          </DialogHeader>
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            ⚠️ Ao reagendar, o horário atual será liberado e não poderá ser recuperado.
          </p>
          <p className="text-sm font-semibold text-foreground">Escolha a data</p>
          <div className="flex flex-wrap gap-2">
            {(doctor?.nextSlots ?? []).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setNewDate(d); setNewTime(null); }}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                  newDate === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-foreground">Escolha o horário</p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setNewTime(slot)}
                className={`rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
                  newTime === slot
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Voltar
            </Button>
            <Button
              disabled={!newDate || !newTime}
              onClick={() => {
                if (!newDate || !newTime) return;
                rescheduleAppointment(appointment.id, newDate, newTime);
                setRescheduleOpen(false);
                toast.success("Consulta reagendada!");
              }}
            >
              Confirmar novo horário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
