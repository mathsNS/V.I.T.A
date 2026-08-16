import { EMERGENCY_KEYWORDS, SYMPTOM_SPECIALTY_MAP } from "./mockData";
import type { Priority } from "./types";

export function detectEmergency(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGENCY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function recommendSpecialty(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of SYMPTOM_SPECIALTY_MAP) {
    if (entry.keywords.some((keyword) => lower.includes(keyword))) {
      return entry.specialtyId;
    }
  }
  return "clinico-geral";
}

export function classifyPriority(params: {
  chiefComplaint: string;
  intensity?: number;
  isEmergency: boolean;
}): Priority {
  if (params.isEmergency) return "emergencia";
  if (params.intensity !== undefined && params.intensity >= 8) return "alta";
  if (params.intensity !== undefined && params.intensity >= 5) return "media";

  const lower = params.chiefComplaint.toLowerCase();
  const highSignals = ["muito forte", "insuportável", "piorando", "há semanas"];
  if (highSignals.some((s) => lower.includes(s))) return "media";

  return "baixa";
}

export function extractIntensity(text: string): number | undefined {
  const match = text.match(/\b(10|[0-9])\b/);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isNaN(value) ? undefined : value;
}

export interface TriageQuestion {
  id: string;
  text: string;
  quickReplies?: string[];
}

export const FOLLOW_UP_QUESTIONS: TriageQuestion[] = [
  {
    id: "duration",
    text: "Há quanto tempo você sente isso?",
    quickReplies: ["Hoje", "Há alguns dias", "Há semanas", "Não sei"],
  },
  {
    id: "intensity",
    text: "Numa escala de 0 a 10, qual a intensidade do que você sente?",
    quickReplies: ["2", "5", "8", "Não sei"],
  },
  {
    id: "history",
    text: "Você tem alguma condição de saúde, usa algum medicamento ou tem alergias que eu deva saber?",
    quickReplies: ["Não tenho nada disso", "Prefiro não responder agora"],
  },
  {
    id: "attachment",
    text: "Se você tiver algum exame ou documento relacionado, pode anexar aqui. Se não tiver, sem problema, é só seguir em frente.",
    quickReplies: ["Não tenho exames para anexar", "Pular esta etapa"],
  },
];

export const PRIORITY_LABELS: Record<Priority, { label: string; color: string; description: string }> = {
  baixa: { label: "Prioridade baixa", color: "bg-emerald-100 text-emerald-700 border-emerald-200", description: "Seu caso pode aguardar agendamento regular. Procure atendimento em até 7 dias se os sintomas persistirem." },
  media: { label: "Prioridade média", color: "bg-amber-100 text-amber-700 border-amber-200", description: "Recomendamos buscar atendimento em até 48 horas. Evite automedicação e observe a evolução dos sintomas." },
  alta: { label: "Prioridade alta", color: "bg-orange-100 text-orange-700 border-orange-200", description: "Procure atendimento em até 24 horas. Se os sintomas piorarem, dirija-se a uma UPA ou pronto-socorro." },
  emergencia: { label: "Emergência", color: "bg-red-100 text-red-700 border-red-200", description: "Situação de emergência. Ligue 192 (SAMU) ou vá imediatamente ao pronto-socorro mais próximo." },
};
