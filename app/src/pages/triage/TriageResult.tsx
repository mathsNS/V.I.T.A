import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarClock, ClipboardCheck, Stethoscope } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/context/AppDataContext";
import { SPECIALTIES } from "@/lib/mockData";
import { PRIORITY_LABELS } from "@/lib/triageEngine";

export default function TriageResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { triageResults } = useAppData();

  const triageId = (location.state as { triageId?: string } | null)?.triageId;
  const result = triageResults.find((r) => r.id === triageId) ?? triageResults[0];

  if (!result) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Resultado" />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-muted-foreground">
          Nenhuma triagem encontrada. Inicie uma nova conversa no chat.
        </div>
      </div>
    );
  }

  const specialty = SPECIALTIES.find((s) => s.id === result.specialtyId);
  const priority = PRIORITY_LABELS[result.priority];

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Resultado da pré-triagem" showBack={false} />

      <div className="flex-1 space-y-5 px-6 pb-8 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 text-center shadow-sm"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardCheck className="h-7 w-7" />
          </div>
          <Badge variant="outline" className={`${priority.color} border px-3 py-1 text-sm`}>
            {priority.label}
          </Badge>
          <p className="text-sm font-medium text-foreground">{priority.description}</p>
          <p className="text-sm text-muted-foreground">
            Sua pré-triagem foi concluída e já está disponível para o profissional de saúde.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Stethoscope className="h-4 w-4 text-primary" /> Especialidade recomendada
          </div>
          <p className="text-lg font-bold text-primary">{specialty?.name}</p>
          <p className="text-sm text-muted-foreground">{result.hypothesis}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground"
        >
          <p className="font-semibold text-foreground">Sintoma relatado</p>
          <p className="mt-1">{result.chiefComplaint}</p>
        </motion.div>

        <div className="mt-auto space-y-3 pt-4">
          <Button
            size="lg"
            className="w-full rounded-2xl"
            onClick={() => navigate("/agendamento", { state: { specialtyId: result.specialtyId } })}
          >
            <CalendarClock className="h-4.5 w-4.5" /> Agendar consulta agora
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-2xl"
            onClick={() => navigate("/home")}
          >
            Aguardar contato do profissional
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Entraremos em contato em até 24h úteis para orientações.
          </p>
        </div>
      </div>
    </div>
  );
}
