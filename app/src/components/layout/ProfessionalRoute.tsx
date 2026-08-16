import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProfessionalRoute() {
  const { isProfessionalAuthenticated } = useAuth();
  const location = useLocation();
  return isProfessionalAuthenticated ? <Outlet /> : <Navigate to="/profissional/login" replace state={{ from: location.pathname }} />;
}
