export type Modality = "presencial" | "teleconsulta";

export type Priority = "baixa" | "media" | "alta" | "emergencia";

export type AppointmentStatus =
  | "agendada"
  | "confirmada"
  | "em_andamento"
  | "concluida"
  | "cancelada";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  cpf?: string;
  avatarColor: string;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
  crm: string;
  rating: number;
  bio: string;
  initials: string;
  color: string;
  nextSlots: string[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  quickReplies?: string[];
}

export interface TriageResult {
  id: string;
  createdAt: string;
  chiefComplaint: string;
  priority: Priority;
  specialtyId: string;
  hypothesis: string;
  summary: Record<string, string>;
  attachments?: ChatAttachment[];
  patientProfile?: PatientProfile;
}

export interface Appointment {
  id: string;
  specialtyId: string;
  doctorId: string;
  date: string; // ISO date, yyyy-mm-dd
  time: string; // HH:mm
  modality: Modality;
  status: AppointmentStatus;
  priority?: Priority;
  reason?: string;
  triageId?: string;
  patientId?: string;
  patientName?: string;
  location?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "lembrete" | "resultado" | "sistema" | "triagem" | "consulta";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  specialtyId: string;
  diagnosis: string;
  prescriptions: string[];
  recommendations: string;
  examResults?: { name: string; status: "disponivel" | "pendente" }[];
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  clinicalNotes?: string;
  examRequests?: string[];
  referral?: string;
  needsReturn?: boolean;
  returnDate?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PatientProfile {
  medications: string[];
  allergies: string[];
  chronicConditions: string[];
}

export interface CareDraft {
  clinicalNotes: string;
  diagnosis: string;
  recommendations: string;
  prescriptions: string[];
  examRequests: string[];
  referral: string;
  needsReturn: boolean;
  returnDate?: string;
}
