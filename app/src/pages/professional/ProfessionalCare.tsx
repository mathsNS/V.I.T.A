import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  FlaskConical,
  HeartPulse,
  Paperclip,
  Pill,
  Plus,
  Save,
  Send,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { SPECIALTIES } from "@/lib/mockData";
import type { CareDraft, PatientProfile, Priority, TriageResult } from "@/lib/types";

type CareSection = "relatorio" | "conduta" | "prontuario";

const priorityLabels: Record<Priority, string> = {
  emergencia: "Emergência",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const summaryLabels: Record<string, string> = {
  duration: "Duração dos sintomas",
  intensity: "Intensidade",
  history: "Histórico informado",
  chronicConditions: "Condições de saúde",
  medications: "Medicamentos em uso",
  allergies: "Alergias",
  attachment: "Exames e documentos",
};

const emptyDraft: CareDraft = {
  clinicalNotes: "",
  diagnosis: "",
  recommendations: "",
  prescriptions: [],
  examRequests: [],
  referral: "",
  needsReturn: false,
};

const emptyProfile: PatientProfile = {
  medications: [],
  allergies: [],
  chronicConditions: [],
};

const demoTriageReport: TriageResult = {
  id: "triage-demo-professional",
  createdAt: new Date().toISOString(),
  chiefComplaint: "Dor no peito e falta de ar recorrentes",
  priority: "media",
  specialtyId: "cardiologia",
  hypothesis: "Quadro que requer avaliação cardiológica para investigação da dor torácica e da dispneia.",
  summary: {
    duration: "Há alguns dias",
    intensity: "5",
    chronicConditions: "Hipertensão arterial",
    medications: "Losartana 50 mg",
    allergies: "Dipirona",
    attachment: "Exame anexado",
  },
  patientProfile: {
    chronicConditions: ["Hipertensão arterial"],
    medications: ["Losartana 50 mg"],
    allergies: ["Dipirona"],
  },
  attachments: [{ id: "attachment-demo-ecg", name: "eletrocardiograma.pdf", size: "842 KB" }],
};

function ListEditor({
  values,
  onChange,
  placeholder,
  icon: Icon,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  icon: typeof Pill;
}) {
  const [value, setValue] = useState("");

  function addValue() {
    if (!value.trim()) return;
    onChange([...values, value.trim()]);
    setValue("");
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addValue}>
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>
      <div className="mt-2 space-y-2">
        {values.map((item, index) => (
          <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-sm">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1">{item}</span>
            <button type="button" aria-label={`Remover ${item}`} onClick={() => onChange(values.filter((_, current) => current !== index))}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClinicalItem({ label, values, danger = false }: { label: string; values: string[]; danger?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className={danger && values.length ? "font-semibold text-red-700" : "font-semibold"}>
        {values.length ? values.join(", ") : "Não informado pelo paciente"}
      </p>
    </div>
  );
}

export default function ProfessionalCare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { professional } = useAuth();
  const { appointments, triageResults, medicalRecords, startAppointment, saveCare, concludeCare } = useAppData();
  const appointment = appointments.find((item) => item.id === id);
  const triage = triageResults.find((item) => item.id === appointment?.triageId);
  const careTriage = triage ?? (appointment?.id === "apt-1" ? demoTriageReport : undefined);
  const existingRecord = medicalRecords.find((item) => item.appointmentId === id);
  const [draft, setDraft] = useState<CareDraft>(emptyDraft);
  const [section, setSection] = useState<CareSection>(appointment?.status === "concluida" ? "prontuario" : "relatorio");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (existingRecord) {
      setDraft({
        clinicalNotes: existingRecord.clinicalNotes ?? "",
        diagnosis: existingRecord.diagnosis,
        recommendations: existingRecord.recommendations,
        prescriptions: existingRecord.prescriptions,
        examRequests: existingRecord.examRequests ?? [],
        referral: existingRecord.referral ?? "",
        needsReturn: existingRecord.needsReturn ?? false,
        returnDate: existingRecord.returnDate,
      });
    } else if (careTriage) {
      setDraft((current) => ({ ...current, diagnosis: careTriage.hypothesis }));
    }
  }, [existingRecord, careTriage]);

  const specialty = SPECIALTIES.find((item) => item.id === appointment?.specialtyId);
  const summary = useMemo(() => Object.entries(careTriage?.summary ?? {}), [careTriage]);
  const patientProfile = careTriage?.patientProfile ?? emptyProfile;
  const patientRecords = medicalRecords.filter(
    (record) => record.appointmentId !== id && (!record.patientId || !appointment?.patientId || record.patientId === appointment.patientId),
  );

  if (!appointment) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <p className="font-bold">Atendimento não encontrado.</p>
        <Button className="mt-4" onClick={() => navigate("/profissional/fila")}>Voltar à fila</Button>
      </div>
    );
  }

  if (loading) {
    return <div className="space-y-4"><div className="h-24 animate-pulse rounded-2xl bg-white" /><div className="h-96 animate-pulse rounded-2xl bg-white" /></div>;
  }

  const activeAppointment = appointment;

  const setDraftValue = <K extends keyof CareDraft>(key: K, value: CareDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  function goToSection(next: CareSection) {
    setSection(next);
    requestAnimationFrame(() => document.querySelector("[data-care-flow]")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function beginCare() {
    if (activeAppointment.status !== "em_andamento" && activeAppointment.status !== "concluida") {
      startAppointment(activeAppointment.id, professional!.name);
      toast.success("Atendimento iniciado. O paciente foi notificado.");
    }
    goToSection("conduta");
  }

  function save() {
    saveCare(activeAppointment.id, draft, professional!.name);
    toast.success("Registro clínico salvo com data e responsável.");
  }

  function hasRequiredFields() {
    if (draft.clinicalNotes.trim() && draft.diagnosis.trim() && draft.recommendations.trim()) return true;
    toast.error("Preencha observações, hipótese e orientações antes de continuar.");
    return false;
  }

  function reviewCare() {
    if (!hasRequiredFields()) return;
    saveCare(activeAppointment.id, draft, professional!.name);
    toast.success("Rascunho salvo. Revise os dados antes de concluir.");
    goToSection("prontuario");
  }

  function conclude() {
    concludeCare(activeAppointment.id, draft, professional!.name);
    setConfirmOpen(false);
    toast.success("Atendimento concluído e prontuário atualizado.");
    navigate("/profissional/fila");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <button type="button" onClick={() => navigate("/profissional/fila")} className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar à fila
      </button>

      <div className="rounded-2xl bg-primary p-5 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold">{appointment.patientName ?? "Paciente"}</h1>
          <Badge className="bg-white/15 text-white">Prioridade {priorityLabels[appointment.priority ?? "baixa"]}</Badge>
          <Badge className="bg-white/15 text-white">{appointment.status.replace("_", " ")}</Badge>
        </div>
        <p className="mt-1 text-sm text-white/70">
          {specialty?.name} · {appointment.modality === "teleconsulta" ? "Teleconsulta" : "Presencial"} · {new Date(`${appointment.date}T12:00:00`).toLocaleDateString("pt-BR")} às {appointment.time}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {appointment.status !== "concluida" && (
            <Button variant="secondary" onClick={beginCare}>
              <Stethoscope className="h-4 w-4" /> {appointment.status === "em_andamento" ? "Continuar atendimento" : "Iniciar atendimento"}
            </Button>
          )}
          <Button className="bg-white text-primary hover:bg-white/90" onClick={save}>
            <Save className="h-4 w-4" /> Salvar rascunho
          </Button>
        </div>
      </div>

      <div data-care-flow className="scroll-mt-4">
        <Tabs value={section} onValueChange={(value) => setSection(value as CareSection)} className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Etapa {section === "relatorio" ? "1" : section === "conduta" ? "2" : "3"} de 3
          </p>
          <TabsList className="grid h-auto w-full grid-cols-3 bg-white p-1">
            <TabsTrigger value="relatorio" className="px-2 text-xs">1. Relatório</TabsTrigger>
            <TabsTrigger value="conduta" className="px-2 text-xs">2. Conduta</TabsTrigger>
            <TabsTrigger value="prontuario" className="px-2 text-xs">3. Revisão</TabsTrigger>
          </TabsList>

          <TabsContent value="relatorio" className="mt-5 space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="text-primary" /> Relatório de pré-triagem</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground">Sintoma principal</p>
                  <p className="mt-1 text-lg font-semibold">{careTriage?.chiefComplaint ?? appointment.reason ?? "Não informado"}</p>
                </div>
                <div className="rounded-xl bg-accent p-4">
                  <p className="text-xs font-bold uppercase text-primary">Hipótese gerada pela triagem</p>
                  <p className="mt-1 text-sm">{careTriage?.hypothesis ?? "Sem hipótese automatizada vinculada."}</p>
                </div>
                {summary.length > 0 ? (
                  <div className="grid gap-3">
                    {summary.map(([key, value]) => (
                      <div key={key} className="rounded-xl border p-3">
                        <p className="text-xs font-bold text-muted-foreground">{summaryLabels[key] ?? key}</p>
                        <p className="mt-1 text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Este atendimento não possui respostas de pré-triagem vinculadas.</p>}
                <div className="rounded-xl border border-dashed p-4">
                  <p className="flex items-center gap-2 font-semibold"><Paperclip className="h-4 w-4" /> Anexos do paciente</p>
                  {careTriage?.attachments?.length ? (
                    <div className="mt-3 space-y-2">
                      {careTriage.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm">
                          <Paperclip className="h-4 w-4 text-primary" />
                          <span className="min-w-0 flex-1 truncate font-medium">{attachment.name}</span>
                          <span className="text-xs text-muted-foreground">{attachment.size}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-1 text-sm text-muted-foreground">Nenhum documento anexado nesta triagem.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader><CardTitle className="flex items-center gap-2 text-orange-800"><AlertTriangle /> Informações clínicas relatadas</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <ClinicalItem label="ALERGIAS" values={patientProfile.allergies} danger />
                <ClinicalItem label="CONDIÇÕES DE SAÚDE" values={patientProfile.chronicConditions} />
                <ClinicalItem label="MEDICAMENTOS EM USO" values={patientProfile.medications} />
                <p className="text-xs text-muted-foreground">Dados informados pelo paciente durante a pré-triagem e sujeitos à confirmação profissional.</p>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={beginCare} disabled={appointment.status === "concluida"}>
              Iniciar condução <ChevronRight className="h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="conduta" className="mt-5 space-y-5">
            <Card>
              <CardHeader><CardTitle>Avaliação clínica</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5"><Label>Observações clínicas *</Label><Textarea rows={6} value={draft.clinicalNotes} onChange={(event) => setDraftValue("clinicalNotes", event.target.value)} placeholder="Anamnese, sinais observados e evolução..." /></div>
                <div className="space-y-1.5"><Label>Hipótese diagnóstica *</Label><Input value={draft.diagnosis} onChange={(event) => setDraftValue("diagnosis", event.target.value)} /></div>
                <div className="space-y-1.5"><Label>Orientações ao paciente *</Label><Textarea rows={4} value={draft.recommendations} onChange={(event) => setDraftValue("recommendations", event.target.value)} placeholder="Cuidados, sinais de alerta e próximos passos..." /></div>
              </CardContent>
            </Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Pill className="text-primary" /> Prescrição</CardTitle></CardHeader><CardContent><ListEditor values={draft.prescriptions} onChange={(values) => setDraftValue("prescriptions", values)} placeholder="Medicamento, dose e posologia" icon={Pill} /></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><FlaskConical className="text-primary" /> Exames complementares</CardTitle></CardHeader><CardContent><ListEditor values={draft.examRequests} onChange={(values) => setDraftValue("examRequests", values)} placeholder="Nome do exame solicitado" icon={FlaskConical} /></CardContent></Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Send className="text-primary" /> Encaminhamento e retorno</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Encaminhar para especialidade</Label><Input className="mt-1.5" value={draft.referral} onChange={(event) => setDraftValue("referral", event.target.value)} placeholder="Opcional" /></div>
                <label className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm font-semibold"><input type="checkbox" checked={draft.needsReturn} onChange={(event) => setDraftValue("needsReturn", event.target.checked)} /> Paciente necessita de retorno</label>
                {draft.needsReturn && <Input type="date" value={draft.returnDate ?? ""} onChange={(event) => setDraftValue("returnDate", event.target.value)} />}
              </CardContent>
            </Card>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={save}><Save className="h-4 w-4" /> Salvar rascunho</Button>
              <Button onClick={reviewCare} disabled={appointment.status === "concluida"}>Revisar atendimento <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </TabsContent>

          <TabsContent value="prontuario" className="mt-5 space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="text-primary" /> Revisão deste atendimento</CardTitle></CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div><p className="text-xs font-bold text-muted-foreground">OBSERVAÇÕES CLÍNICAS</p><p className="whitespace-pre-line">{draft.clinicalNotes || "Ainda não preenchido"}</p></div>
                <div><p className="text-xs font-bold text-muted-foreground">HIPÓTESE DIAGNÓSTICA</p><p>{draft.diagnosis || "Ainda não preenchido"}</p></div>
                <div><p className="text-xs font-bold text-muted-foreground">ORIENTAÇÕES</p><p className="whitespace-pre-line">{draft.recommendations || "Ainda não preenchido"}</p></div>
                <div><p className="text-xs font-bold text-muted-foreground">PRESCRIÇÕES</p><p>{draft.prescriptions.length ? draft.prescriptions.join("; ") : "Nenhuma"}</p></div>
                <div><p className="text-xs font-bold text-muted-foreground">EXAMES SOLICITADOS</p><p>{draft.examRequests.length ? draft.examRequests.join("; ") : "Nenhum"}</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary" /> Histórico clínico anterior</CardTitle></CardHeader>
              <CardContent>
                {patientRecords.length === 0 ? <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Paciente sem histórico clínico anterior.</p> : (
                  <div className="space-y-4">
                    {patientRecords.map((record) => (
                      <div key={record.id} className="border-l-2 border-secondary pl-4">
                        <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString("pt-BR")} · {record.doctorName}</p>
                        <p className="mt-1 font-bold">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{record.recommendations}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={() => goToSection("conduta")}><ArrowLeft className="h-4 w-4" /> Voltar e editar</Button>
              <Button onClick={() => hasRequiredFields() && setConfirmOpen(true)} disabled={appointment.status === "concluida"}><CheckCircle2 className="h-4 w-4" /> Concluir atendimento</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Concluir este atendimento?</DialogTitle><DialogDescription>O status será atualizado, o registro ficará disponível no prontuário e o paciente receberá uma notificação.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Revisar</Button><Button onClick={conclude}>Confirmar conclusão</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
