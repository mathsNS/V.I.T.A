import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import * as Icons from "lucide-react";
import { MapPin, Star, Video } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS, SPECIALTIES, TIME_SLOTS } from "@/lib/mockData";
import type { Modality } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Scheduling() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addAppointment } = useAppData();

  const preselectedSpecialty = (location.state as { specialtyId?: string } | null)
    ?.specialtyId;

  const [step, setStep] = useState(preselectedSpecialty ? 2 : 1);
  const [specialtyId, setSpecialtyId] = useState(preselectedSpecialty ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [modality, setModality] = useState<Modality>("teleconsulta");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const doctorsForSpecialty = useMemo(
    () => DOCTORS.filter((d) => d.specialtyId === specialtyId),
    [specialtyId],
  );
  const doctor = DOCTORS.find((d) => d.id === doctorId);
  const specialty = SPECIALTIES.find((s) => s.id === specialtyId);

  function handleConfirm() {
    const appointment = addAppointment({
      specialtyId,
      doctorId,
      date,
      time,
      modality,
      status: "agendada",
      reason: "Agendamento realizado pelo aplicativo",
      location:
        modality === "teleconsulta"
          ? "Teleconsulta pelo app V.I.T.A."
          : "Clínica V.I.T.A. - Unidade Centro",
    });
    navigate("/agendamento/confirmacao", { state: { appointmentId: appointment.id } });
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Agendar consulta" />

      <div className="px-6 pt-2">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <span
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="s1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-1 flex-col px-6 pt-6"
          >
            <h2 className="text-lg font-bold text-foreground">Qual especialidade você precisa?</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {SPECIALTIES.map((s) => {
                const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[s.icon] ?? Icons.Stethoscope;
                const selected = specialtyId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSpecialtyId(s.id);
                      setDoctorId("");
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-semibold">{s.name}</span>
                  </button>
                );
              })}
            </div>
            <Button
              size="lg"
              disabled={!specialtyId}
              className="mt-auto w-full rounded-2xl"
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="s2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-1 flex-col px-6 pt-6"
          >
            <h2 className="text-lg font-bold text-foreground">Escolha o profissional</h2>
            <p className="text-sm text-muted-foreground">{specialty?.name}</p>
            <div className="mt-4 space-y-3">
              {doctorsForSpecialty.map((d) => {
                const selected = doctorId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDoctorId(d.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors",
                      selected ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
                      style={{ backgroundColor: d.color }}
                    >
                      {d.initials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.crm}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {d.rating}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-auto flex items-center justify-between pt-8">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button disabled={!doctorId} className="rounded-2xl px-6" onClick={() => setStep(3)}>
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="s3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-1 flex-col px-6 pt-6"
          >
            <h2 className="text-lg font-bold text-foreground">Modalidade e horário</h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModality("teleconsulta")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors",
                  modality === "teleconsulta" ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <Video className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Teleconsulta</span>
              </button>
              <button
                type="button"
                onClick={() => setModality("presencial")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-colors",
                  modality === "presencial" ? "border-primary bg-primary/5" : "border-border bg-card",
                )}
              >
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Presencial</span>
              </button>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-foreground">Escolha a data</h3>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {(doctor?.nextSlots ?? []).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={cn(
                    "shrink-0 rounded-2xl border px-4 py-2 text-sm font-medium transition-colors",
                    date === d ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </button>
              ))}
            </div>

            <h3 className="mt-6 text-sm font-semibold text-foreground">Escolha o horário</h3>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                    time === slot ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between pt-8">
              <button type="button" onClick={() => setStep(2)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button disabled={!date || !time} className="rounded-2xl px-6" onClick={() => setStep(4)}>
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            className="flex flex-1 flex-col px-6 pt-6"
          >
            <h2 className="text-lg font-bold text-foreground">Revise e confirme</h2>
            <div className="mt-4 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
              <p><span className="font-semibold">Especialidade: </span>{specialty?.name}</p>
              <p><span className="font-semibold">Profissional: </span>{doctor?.name}</p>
              <p><span className="font-semibold">Modalidade: </span>{modality === "teleconsulta" ? "Teleconsulta" : "Presencial"}</p>
              <p>
                <span className="font-semibold">Quando: </span>
                {new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")} às {time}
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between pt-8">
              <button type="button" onClick={() => setStep(3)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button className="rounded-2xl px-6" onClick={handleConfirm}>
                Confirmar agendamento
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
