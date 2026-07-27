import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { useAppData } from "@/context/AppDataContext";
import { SPECIALTIES } from "@/lib/mockData";

export default function HistoryList() {
  const navigate = useNavigate();
  const { medicalRecords } = useAppData();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Histórico" showBack={false} />

      <div className="flex-1 px-4 pb-8 pt-2">
        {medicalRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileText className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Seu histórico clínico vai aparecer aqui após a primeira consulta.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {medicalRecords.map((rec) => {
              const specialty = SPECIALTIES.find((s) => s.id === rec.specialtyId);
              return (
                <li key={rec.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/historico/${rec.id}`)}
                    className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary">{specialty?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(`${rec.date}T00:00:00`).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{rec.doctorName}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground">{rec.diagnosis}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
