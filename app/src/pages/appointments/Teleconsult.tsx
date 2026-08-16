import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Mic, MicOff, PhoneOff, Video, VideoOff, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS } from "@/lib/mockData";

type ConnectionStatus = "Boa" | "Instável" | "Reconectando";

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
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("Boa");

  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [ended]);

  // Simulate connection fluctuation
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => {
      setConnectionStatus((s) => {
        if (s === "Boa" && Math.random() < 0.15) return "Instável";
        if (s === "Instável") return "Reconectando";
        if (s === "Reconectando") return "Boa";
        return "Boa";
      });
    }, 7000);
    return () => clearInterval(t);
  }, [ended]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  function handleEndCall() {
    setEnded(true);
    setConfirmEndOpen(false);
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

  const connectionColor =
    connectionStatus === "Boa"
      ? "bg-emerald-500/20 text-emerald-300"
      : connectionStatus === "Instável"
        ? "bg-amber-500/20 text-amber-300"
        : "bg-blue-500/20 text-blue-300";

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
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${connectionColor}`}>
          <Wifi className="h-3 w-3" /> Conexão: {connectionStatus}
        </span>
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
          aria-label={micOn ? "Desativar microfone" : "Ativar microfone"}
          onClick={() => setMicOn((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white"
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        <button
          type="button"
          aria-label="Encerrar chamada"
          onClick={() => setConfirmEndOpen(true)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label={camOn ? "Desativar câmera" : "Ativar câmera"}
          onClick={() => setCamOn((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white"
        >
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
      </div>

      {/* TEL01 – confirmation before ending */}
      <Dialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar teleconsulta?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Deseja realmente encerrar a consulta? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmEndOpen(false)}>
              Continuar consulta
            </Button>
            <Button variant="destructive" onClick={handleEndCall}>
              Encerrar chamada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
