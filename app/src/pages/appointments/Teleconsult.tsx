import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS } from "@/lib/mockData";

export default function Teleconsult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { appointments, completeAppointment } = useAppData();
  const appointment = appointments.find((a) => a.id === id);
  const doctor = DOCTORS.find((d) => d.id === appointment?.doctorId);

  const [seconds, setSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [ended]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  function handleEndCall() {
    setEnded(true);
    if (appointment) {
      completeAppointment(appointment.id, {
        date: appointment.date,
        doctorName: doctor?.name ?? "Médico",
        specialtyId: appointment.specialtyId,
        diagnosis: "Registro gerado automaticamente após a teleconsulta neste protótipo.",
        prescriptions: [],
        recommendations: "O médico atualizará as orientações no seu histórico em breve.",
      });
    }
  }

  if (ended) {
    return (
      <div className="flex min-h-svh flex-1 flex-col items-center justify-center gap-4 bg-primary px-8 text-center text-primary-foreground">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle2 className="h-16 w-16" />
        </motion.div>
        <h1 className="text-xl font-bold">Consulta encerrada</h1>
        <p className="max-w-[260px] text-sm text-primary-foreground/80">
          Duração: {mm}:{ss}. O médico atualizará seu prontuário em instantes.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="mt-4 w-full rounded-2xl"
          onClick={() => navigate("/consultas")}
        >
          Voltar para Minhas Consultas
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh flex-1 flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between px-5 pt-6 text-sm font-medium">
        <span>{mm}:{ss}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Conexão estável</span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-4">
        {camOn ? (
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full text-4xl font-bold text-white shadow-2xl"
            style={{ backgroundColor: doctor?.color ?? "#98BAD5" }}
          >
            {doctor?.initials}
          </div>
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10">
            <VideoOff className="h-10 w-10 text-white/60" />
          </div>
        )}
        <p className="text-lg font-semibold">{doctor?.name ?? "Médico"}</p>
        <p className="text-sm text-white/60">Teleconsulta em andamento</p>

        <div className="absolute right-5 top-5 flex h-24 w-16 items-center justify-center rounded-2xl bg-white/10 text-xs font-medium text-white/70 ring-1 ring-white/20">
          Você
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-10">
        <button
          type="button"
          onClick={() => setMicOn((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white"
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={handleEndCall}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => setCamOn((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white"
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
