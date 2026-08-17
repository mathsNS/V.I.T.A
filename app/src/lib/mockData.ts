import type {
  Appointment,
  Doctor,
  MedicalRecord,
  Notification,
  Specialty,
} from "./types";

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const SPECIALTIES: Specialty[] = [
  {
    id: "clinico-geral",
    name: "Clínico Geral",
    icon: "Stethoscope",
    description: "Avaliação geral de sintomas e encaminhamentos",
  },
  {
    id: "cardiologia",
    name: "Cardiologia",
    icon: "HeartPulse",
    description: "Coração e sistema circulatório",
  },
  {
    id: "dermatologia",
    name: "Dermatologia",
    icon: "Sparkles",
    description: "Pele, cabelo e unhas",
  },
  {
    id: "neurologia",
    name: "Neurologia",
    icon: "Brain",
    description: "Cabeça, sistema nervoso e equilíbrio",
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    icon: "Bone",
    description: "Ossos, articulações e músculos",
  },
  {
    id: "gastroenterologia",
    name: "Gastroenterologia",
    icon: "Salad",
    description: "Estômago, intestino e digestão",
  },
  {
    id: "pediatria",
    name: "Pediatria",
    icon: "Baby",
    description: "Saúde de crianças e adolescentes",
  },
  {
    id: "psiquiatria",
    name: "Psiquiatria",
    icon: "BrainCircuit",
    description: "Saúde mental e emocional",
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: "dra-mariana",
    name: "Dra. Mariana Alves",
    specialtyId: "cardiologia",
    crm: "CRM 45021-CE",
    rating: 4.9,
    bio: "Cardiologista com 12 anos de experiência em prevenção e reabilitação cardíaca.",
    initials: "MA",
    color: "#98BAD5",
    nextSlots: [daysFromNow(1), daysFromNow(2), daysFromNow(4)],
  },
  {
    id: "dr-eduardo",
    name: "Dr. Eduardo Lima",
    specialtyId: "clinico-geral",
    crm: "CRM 33210-CE",
    rating: 4.7,
    bio: "Clínico geral focado em atenção primária e triagem de sintomas diversos.",
    initials: "EL",
    color: "#13315A",
    nextSlots: [daysFromNow(0), daysFromNow(1), daysFromNow(3)],
  },
  {
    id: "dra-julia",
    name: "Dra. Júlia Nunes",
    specialtyId: "dermatologia",
    crm: "CRM 51022-CE",
    rating: 4.8,
    bio: "Dermatologista clínica com foco em diagnóstico precoce de lesões de pele.",
    initials: "JN",
    color: "#C77DB0",
    nextSlots: [daysFromNow(2), daysFromNow(5)],
  },
  {
    id: "dr-rafael",
    name: "Dr. Rafael Costa",
    specialtyId: "neurologia",
    crm: "CRM 40877-CE",
    rating: 4.6,
    bio: "Neurologista com experiência em cefaleias, tonturas e distúrbios do sono.",
    initials: "RC",
    color: "#7A6FF0",
    nextSlots: [daysFromNow(3), daysFromNow(6)],
  },
  {
    id: "dra-carla",
    name: "Dra. Carla Mendes",
    specialtyId: "ortopedia",
    crm: "CRM 39012-CE",
    rating: 4.8,
    bio: "Ortopedista especializada em lesões esportivas e dores articulares.",
    initials: "CM",
    color: "#4CA989",
    nextSlots: [daysFromNow(1), daysFromNow(3)],
  },
  {
    id: "dr-paulo",
    name: "Dr. Paulo Ramos",
    specialtyId: "gastroenterologia",
    crm: "CRM 28650-CE",
    rating: 4.5,
    bio: "Gastroenterologista com atuação em distúrbios digestivos funcionais.",
    initials: "PR",
    color: "#E0A339",
    nextSlots: [daysFromNow(2), daysFromNow(4)],
  },
  {
    id: "dra-beatriz",
    name: "Dra. Beatriz Farias",
    specialtyId: "pediatria",
    crm: "CRM 44501-CE",
    rating: 4.9,
    bio: "Pediatra dedicada ao acompanhamento do desenvolvimento infantil.",
    initials: "BF",
    color: "#E08F8F",
    nextSlots: [daysFromNow(1), daysFromNow(2)],
  },
  {
    id: "dr-andre",
    name: "Dr. André Souza",
    specialtyId: "psiquiatria",
    crm: "CRM 36789-CE",
    rating: 4.7,
    bio: "Psiquiatra com abordagem humanizada para ansiedade e transtornos do humor.",
    initials: "AS",
    color: "#6C8EBF",
    nextSlots: [daysFromNow(3), daysFromNow(5)],
  },
];

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:30",
  "11:00",
  "14:00",
  "14:30",
  "15:30",
  "16:00",
  "16:30",
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    specialtyId: "cardiologia",
    doctorId: "dra-mariana",
    date: daysFromNow(3),
    time: "10:30",
    modality: "teleconsulta",
    status: "confirmada",
    priority: "media",
    patientId: "patient-demo-marina",
    patientName: "Marina Costa",
    reason: "Dor no peito e falta de ar recorrentes",
    location: "Teleconsulta pelo app V.I.T.A.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "apt-2",
    specialtyId: "clinico-geral",
    doctorId: "dr-eduardo",
    date: daysFromNow(-10),
    time: "09:00",
    modality: "presencial",
    status: "concluida",
    priority: "baixa",
    reason: "Check-up geral",
    location: "Clínica V.I.T.A. - Unidade Centro",
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not-1",
    title: "Consulta confirmada",
    body: "Sua teleconsulta com Dra. Mariana Alves foi confirmada.",
    type: "consulta",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "not-2",
    title: "Relatório visualizado",
    body: "Dra. Mariana Alves acessou seu relatório de pré-triagem.",
    type: "triagem",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "not-3",
    title: "Bem-vindo ao V.I.T.A.",
    body: "Complete seu perfil para agilizar futuras triagens.",
    type: "sistema",
    read: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-1",
    date: daysFromNow(-10),
    doctorName: "Dr. Eduardo Lima",
    specialtyId: "clinico-geral",
    diagnosis: "Paciente saudável, sem alterações significativas.",
    prescriptions: ["Vitamina D 2000UI - 1x ao dia por 60 dias"],
    recommendations:
      "Manter atividade física regular e retornar em 6 meses para check-up.",
    examResults: [
      { name: "Hemograma completo", status: "disponivel" },
      { name: "Glicemia em jejum", status: "disponivel" },
    ],
  },
];

export const SYMPTOM_SPECIALTY_MAP: { keywords: string[]; specialtyId: string }[] = [
  {
    keywords: ["peito", "coração", "palpita", "arritmia", "pressão alta"],
    specialtyId: "cardiologia",
  },
  {
    keywords: ["cabeça", "enxaqueca", "tontura", "convuls", "formigamento", "memória"],
    specialtyId: "neurologia",
  },
  {
    keywords: ["pele", "mancha", "coceira", "alergia na pele", "espinha", "acne"],
    specialtyId: "dermatologia",
  },
  {
    keywords: ["osso", "articulação", "joelho", "costas", "coluna", "torci"],
    specialtyId: "ortopedia",
  },
  {
    keywords: ["barriga", "estômago", "náusea", "vômito", "intestino", "diarreia", "azia"],
    specialtyId: "gastroenterologia",
  },
  {
    keywords: ["ansiedade", "tristeza", "insônia", "pânico", "humor", "estresse"],
    specialtyId: "psiquiatria",
  },
  {
    keywords: ["filho", "filha", "bebê", "criança"],
    specialtyId: "pediatria",
  },
];

export const EMERGENCY_KEYWORDS = [
  "dor no peito",
  "falta de ar",
  "não consigo respirar",
  "desmaiei",
  "desmaio",
  "sangramento intenso",
  "convulsão",
  "convulsao",
  "dormência no braço",
  "fala enrolada",
  "boca torta",
  "pensamento de me machucar",
  "pensei em me machucar",
];
