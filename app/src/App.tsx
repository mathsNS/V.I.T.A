import { Route, Routes } from "react-router-dom";
import { PlainLayout, AuthenticatedLayout } from "@/components/layout/Layouts";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import TriageChat from "@/pages/triage/TriageChat";
import TriageResult from "@/pages/triage/TriageResult";
import Scheduling from "@/pages/scheduling/Scheduling";
import ScheduleConfirmation from "@/pages/scheduling/ScheduleConfirmation";
import AppointmentsList from "@/pages/appointments/AppointmentsList";
import AppointmentDetail from "@/pages/appointments/AppointmentDetail";
import Teleconsult from "@/pages/appointments/Teleconsult";
import Profile from "@/pages/Profile";
import HistoryList from "@/pages/history/HistoryList";
import HistoryDetail from "@/pages/history/HistoryDetail";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";
import { ProfessionalRoute } from "@/components/layout/ProfessionalRoute";
import { ProfessionalLayout } from "@/components/layout/ProfessionalLayout";
import ProfessionalLogin from "@/pages/professional/ProfessionalLogin";
import ProfessionalQueue from "@/pages/professional/ProfessionalQueue";
import ProfessionalCare from "@/pages/professional/ProfessionalCare";
import ProfessionalSchedule from "@/pages/professional/ProfessionalSchedule";
import ProfessionalRecords from "@/pages/professional/ProfessionalRecords";
import ProfessionalProfile from "@/pages/professional/ProfessionalProfile";

function App() {
  return (
    <Routes>
      <Route element={<PlainLayout />}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/triagem" element={<TriageChat />} />
          <Route path="/triagem/resultado" element={<TriageResult />} />
          <Route path="/agendamento" element={<Scheduling />} />
          <Route path="/agendamento/confirmacao" element={<ScheduleConfirmation />} />
          <Route path="/consultas/:id/teleconsulta" element={<Teleconsult />} />
        </Route>
      </Route>

      <Route path="/profissional/login" element={<ProfessionalLogin />} />
      <Route element={<ProfessionalRoute />}>
        <Route element={<ProfessionalLayout />}>
          <Route path="/profissional/fila" element={<ProfessionalQueue />} />
          <Route path="/profissional/atendimento/:id" element={<ProfessionalCare />} />
          <Route path="/profissional/agenda" element={<ProfessionalSchedule />} />
          <Route path="/profissional/prontuarios" element={<ProfessionalRecords />} />
          <Route path="/profissional/perfil" element={<ProfessionalProfile />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/consultas" element={<AppointmentsList />} />
          <Route path="/consultas/:id" element={<AppointmentDetail />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/historico" element={<HistoryList />} />
          <Route path="/historico/:id" element={<HistoryDetail />} />
          <Route path="/notificacoes" element={<Notifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App
