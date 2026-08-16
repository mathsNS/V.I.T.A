import { CalendarDays, Clock3, MapPin, Video } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { SPECIALTIES } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/lib/types";

export default function ProfessionalSchedule() {
  const { appointments } = useAppData(); const { professional } = useAuth();
  const items = appointments.filter((a) => a.doctorId === professional?.id && a.status !== "cancelada").sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const grouped = items.reduce<Record<string, Appointment[]>>((groups, item) => {
    (groups[item.date] ??= []).push(item);
    return groups;
  }, {});
  return <div className="mx-auto max-w-6xl"><h1 className="text-3xl font-extrabold text-primary">Agenda profissional</h1><p className="mt-1 text-sm text-muted-foreground">Consultas marcadas pelos pacientes, organizadas por dia.</p><div className="mt-7 space-y-7">{Object.entries(grouped).map(([date, list]) => <section key={date}><h2 className="mb-3 flex items-center gap-2 font-bold"><CalendarDays className="h-5 w-5 text-primary"/>{new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}</h2><div className="overflow-hidden rounded-2xl border bg-white">{list?.map((apt) => <div key={apt.id} className="grid gap-3 border-b p-4 last:border-0 md:grid-cols-[100px_1fr_auto] md:items-center"><p className="flex items-center gap-2 font-bold text-primary"><Clock3 className="h-4 w-4"/>{apt.time}</p><div><p className="font-bold">{apt.patientName ?? "Carlos Silva"}</p><p className="text-sm text-muted-foreground">{SPECIALTIES.find((s) => s.id === apt.specialtyId)?.name} · {apt.reason}</p></div><Badge variant="outline" className="justify-self-start">{apt.modality === "teleconsulta" ? <Video className="mr-1 h-3 w-3"/> : <MapPin className="mr-1 h-3 w-3"/>}{apt.modality === "teleconsulta" ? "Teleconsulta" : "Presencial"}</Badge></div>)}</div></section>)}{items.length === 0 && <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-muted-foreground">Nenhuma consulta agendada.</div>}</div></div>;
}
