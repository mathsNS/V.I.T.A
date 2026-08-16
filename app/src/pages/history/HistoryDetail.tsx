import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Download, FileCheck2, Pill, Stethoscope } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useAppData } from "@/context/AppDataContext";
import { SPECIALTIES } from "@/lib/mockData";

export default function HistoryDetail() {
  const { id } = useParams();
  const { medicalRecords } = useAppData();
  const record = medicalRecords.find((r) => r.id === id);

  if (!record) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Registro" />
        <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-muted-foreground">
          Registro não encontrado.
        </div>
      </div>
    );
  }

  const specialty = SPECIALTIES.find((s) => s.id === record.specialtyId);

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Detalhes do registro" />

      <div className="flex-1 space-y-5 px-6 pb-8 pt-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary">{specialty?.name}</p>
          <p className="text-sm text-muted-foreground">{record.doctorName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(`${record.date}T00:00:00`).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Stethoscope className="h-4 w-4 text-primary" /> Diagnóstico
          </h2>
          <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {record.diagnosis}
          </p>
        </section>

        {record.prescriptions.length > 0 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Pill className="h-4 w-4 text-primary" /> Prescrições
            </h2>
            <ul className="space-y-2">
              {record.prescriptions.map((p) => (
                <li key={p} className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-foreground">Orientações</h2>
          <p className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            {record.recommendations}
          </p>
        </section>

        {record.examResults && record.examResults.length > 0 && (
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <FileCheck2 className="h-4 w-4 text-primary" /> Exames
            </h2>
            <ul className="space-y-2">
              {record.examResults.map((exam) => (
                <li
                  key={exam.name}
                  className="flex items-center justify-between rounded-2xl border border-border p-3 text-sm"
                >
                  <span>{exam.name}</span>
                  {exam.status === "disponivel" ? (
                    <button
                      type="button"
                      onClick={() => toast.success(`Download de "${exam.name}" iniciado.`)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      aria-label={`Baixar ${exam.name}`}
                    >
                      <Download className="h-3.5 w-3.5" /> Baixar
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-amber-600">Pendente</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
