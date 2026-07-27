import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Appointment,
  MedicalRecord,
  Notification,
  TriageResult,
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
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  confirmAppointment: (id: string) => void;
  completeAppointment: (id: string, record: Omit<MedicalRecord, "id">) => void;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addTriageResult: (result: Omit<TriageResult, "id" | "createdAt">) => TriageResult;
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

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value = useMemo<AppDataContextValue>(
    () => ({
      appointments,
      notifications,
      medicalRecords,
      triageResults,
      unreadNotifications,
      addAppointment,
      cancelAppointment,
      rescheduleAppointment,
      confirmAppointment,
      completeAppointment,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      addTriageResult,
    }),
    [appointments, notifications, medicalRecords, triageResults, unreadNotifications],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
