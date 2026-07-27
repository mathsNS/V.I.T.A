import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/context/AppDataContext";
import { DOCTORS, SPECIALTIES } from "@/lib/mockData";
import { PRIORITY_LABELS } from "@/lib/triageEngine";
import { cn } from "@/lib/utils";
import { CalendarPlus, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppointmentsList() {
  const navigate = useNavigate();
  const { appointments } = useAppData();
  const [tab, setTab] = useState<"proximas" | "anteriores">("proximas");

  const filtered = appointments
    .filter((a) =>
      tab === "proximas"
        ? a.status === "agendada" || a.status === "confirmada"
        : a.status === "concluida" || a.status === "cancelada",
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Minhas Consultas" showBack={false} />

      <div className="px-4 pt-2">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full rounded-2xl">
            <TabsTrigger value="proximas" className="rounded-xl">Próximas</TabsTrigger>
            <TabsTrigger value="anteriores" className="rounded-xl">Anteriores</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 space-y-3 px-4 pb-8 pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="h-7 w-7" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhuma consulta {tab === "proximas" ? "agendada" : "anterior"} por aqui.
            </p>
            {tab === "proximas" && (
              <Button onClick={() => navigate("/agendamento")} className="mt-1 rounded-2xl">
                <CalendarPlus className="h-4 w-4" /> Agendar consulta
              </Button>
            )}
          </div>
        ) : (
          filtered.map((apt) => {
            const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
            const specialty = SPECIALTIES.find((s) => s.id === apt.specialtyId);
            const priority = apt.priority ? PRIORITY_LABELS[apt.priority] : undefined;
            return (
              <button
                key={apt.id}
                type="button"
                onClick={() => navigate(`/consultas/${apt.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ backgroundColor: doctor?.color }}
                >
                  {doctor?.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{doctor?.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{specialty?.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                    {apt.modality === "teleconsulta" ? (
                      <Video className="h-3.5 w-3.5" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5" />
                    )}
                    {new Date(`${apt.date}T00:00:00`).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    às {apt.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="outline" className={cn("border text-[10px]", priority?.color)}>
                    {apt.status === "cancelada"
                      ? "Cancelada"
                      : apt.status === "concluida"
                        ? "Concluída"
                        : priority?.label ?? "Agendada"}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
