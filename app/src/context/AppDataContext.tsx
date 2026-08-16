import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  Appointment,
  MedicalRecord,
  Notification,
  TriageResult,
  CareDraft,
} from "@/lib/types";
import {
  INITIAL_APPOINTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECORDS,
} from "@/lib/mockData";
import { loadFromStorage, saveToStorage, uid } from "@/lib/storage";

interface AppDataContextValue {
  appointments: Appointment[];
  notifications: Notification[];
  medicalRecords: MedicalRecord[];
  triageResults: TriageResult[];
  unreadNotifications: number;
  addAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => Appointment;
  hasScheduleConflict: (doctorId: string, date: string, time: string) => boolean;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  confirmAppointment: (id: string) => void;
  completeAppointment: (id: string, record: Omit<MedicalRecord, "id">) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addTriageResult: (result: Omit<TriageResult, "id" | "createdAt">) => TriageResult;
  startAppointment: (id: string, doctorName: string) => void;
  saveCare: (id: string, draft: CareDraft, doctorName: string) => void;
  concludeCare: (id: string, draft: CareDraft, doctorName: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const KEYS = {
  appointments: "vita:appointments",
  notifications: "vita:notifications",
  records: "vita:records",
  triage: "vita:triage",
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadFromStorage(KEYS.appointments, INITIAL_APPOINTMENTS),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadFromStorage(KEYS.notifications, INITIAL_NOTIFICATIONS),
  );
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() =>
    loadFromStorage(KEYS.records, INITIAL_RECORDS),
  );
  const [triageResults, setTriageResults] = useState<TriageResult[]>(() =>
    loadFromStorage(KEYS.triage, []),
  );

  useEffect(() => saveToStorage(KEYS.appointments, appointments), [appointments]);
  useEffect(() => saveToStorage(KEYS.notifications, notifications), [notifications]);
  useEffect(() => saveToStorage(KEYS.records, medicalRecords), [medicalRecords]);
  useEffect(() => saveToStorage(KEYS.triage, triageResults), [triageResults]);

  const addNotification: AppDataContextValue["addNotification"] = (notification) => {
    setNotifications((current) => [
      { ...notification, id: uid("not"), read: false, createdAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const addAppointment: AppDataContextValue["addAppointment"] = (appointment) => {
    if (appointments.some((apt) => apt.doctorId === appointment.doctorId && apt.date === appointment.date && apt.time === appointment.time && apt.status !== "cancelada")) {
      throw new Error("Horário indisponível para este profissional.");
    }
    const created: Appointment = {
      ...appointment,
      id: uid("apt"),
      createdAt: new Date().toISOString(),
    };
    setAppointments((current) => [created, ...current]);
    addNotification({
      title: "Consulta agendada",
      body: `Sua consulta foi marcada para ${appointment.date} às ${appointment.time}.`,
      type: "consulta",
    });
    return created;
  };

  const hasScheduleConflict = (doctorId: string, date: string, time: string) =>
    appointments.some((apt) => apt.doctorId === doctorId && apt.date === date && apt.time === time && apt.status !== "cancelada");

  const cancelAppointment: AppDataContextValue["cancelAppointment"] = (id) => {
    setAppointments((current) =>
      current.map((apt) => (apt.id === id ? { ...apt, status: "cancelada" } : apt)),
    );
  };

  const rescheduleAppointment: AppDataContextValue["rescheduleAppointment"] = (
    id,
    date,
    time,
  ) => {
    setAppointments((current) =>
      current.map((apt) =>
        apt.id === id ? { ...apt, date, time, status: "agendada" } : apt,
      ),
    );
    addNotification({
      title: "Consulta reagendada",
      body: `Sua consulta foi remarcada para ${date} às ${time}.`,
      type: "consulta",
    });
  };

  const confirmAppointment: AppDataContextValue["confirmAppointment"] = (id) => {
    setAppointments((current) =>
      current.map((apt) => (apt.id === id ? { ...apt, status: "confirmada" } : apt)),
    );
  };

  const completeAppointment: AppDataContextValue["completeAppointment"] = (
    id,
    record,
  ) => {
    setAppointments((current) =>
      current.map((apt) => (apt.id === id ? { ...apt, status: "concluida" } : apt)),
    );
    setMedicalRecords((current) => [{ ...record, id: uid("rec") }, ...current]);
  };

  const markNotificationRead: AppDataContextValue["markNotificationRead"] = (id) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  };

  const addTriageResult: AppDataContextValue["addTriageResult"] = (result) => {
    const created: TriageResult = {
      ...result,
      id: uid("tri"),
      createdAt: new Date().toISOString(),
    };
    setTriageResults((current) => [created, ...current]);
    return created;
  };

  const startAppointment = (id: string, doctorName: string) => {
    setAppointments((current) => current.map((apt) => apt.id === id ? { ...apt, status: "em_andamento" } : apt));
    addNotification({ title: "Relatório visualizado", body: `${doctorName} visualizou seu relatório de pré-triagem.`, type: "triagem" });
  };

  const toRecord = (id: string, draft: CareDraft, doctorName: string): MedicalRecord | null => {
    const apt = appointments.find((item) => item.id === id);
    if (!apt) return null;
    return {
      id: uid("rec"), appointmentId: id, patientId: apt.patientId, patientName: apt.patientName ?? "Carlos Silva",
      date: new Date().toISOString(), doctorName, specialtyId: apt.specialtyId,
      diagnosis: draft.diagnosis, clinicalNotes: draft.clinicalNotes,
      prescriptions: draft.prescriptions, recommendations: draft.recommendations,
      examRequests: draft.examRequests, examResults: draft.examRequests.map((name) => ({ name, status: "pendente" as const })),
      referral: draft.referral, needsReturn: draft.needsReturn, returnDate: draft.returnDate,
      updatedAt: new Date().toISOString(), updatedBy: doctorName,
    };
  };

  const saveCare = (id: string, draft: CareDraft, doctorName: string) => {
    const record = toRecord(id, draft, doctorName);
    if (!record) return;
    setMedicalRecords((current) => [record, ...current.filter((item) => item.appointmentId !== id)]);
  };

  const concludeCare = (id: string, draft: CareDraft, doctorName: string) => {
    const record = toRecord(id, draft, doctorName);
    if (!record) return;
    setAppointments((current) => current.map((apt) => apt.id === id ? { ...apt, status: "concluida" } : apt));
    setMedicalRecords((current) => [record, ...current.filter((item) => item.appointmentId !== id)]);
    addNotification({ title: "Consulta concluída", body: `${doctorName} concluiu sua consulta. As orientações já estão no histórico.`, type: "consulta", link: `/historico/${record.id}` });
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value: AppDataContextValue = {
      appointments,
      notifications,
      medicalRecords,
      triageResults,
      unreadNotifications,
      addAppointment,
      hasScheduleConflict,
      cancelAppointment,
      rescheduleAppointment,
      confirmAppointment,
      completeAppointment,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      addTriageResult,
      startAppointment,
      saveCare,
      concludeCare,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
