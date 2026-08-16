import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Doctor, User } from "@/lib/types";
import { DOCTORS } from "@/lib/mockData";
import { loadFromStorage, saveToStorage, uid } from "@/lib/storage";

const AVATAR_COLORS = ["#13315A", "#98BAD5", "#4CA989", "#E0A339", "#C77DB0"];

interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  birthDate?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextValue {
  user: User | null;
  professional: Doctor | null;
  isAuthenticated: boolean;
  isProfessionalAuthenticated: boolean;
  failedAttempts: number;
  login: (email: string, password: string) => Promise<AuthResult>;
  professionalLogin: (email: string, password: string) => Promise<AuthResult>;
  signup: (data: SignupData) => Promise<AuthResult>;
  logout: () => void;
  professionalLogout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "vita:user";
const PROFESSIONAL_KEY = "vita:professional";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(USER_KEY, null),
  );
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [professional, setProfessional] = useState<Doctor | null>(() =>
    loadFromStorage<Doctor | null>(PROFESSIONAL_KEY, null),
  );

  useEffect(() => {
    saveToStorage(USER_KEY, user);
  }, [user]);
  useEffect(() => saveToStorage(PROFESSIONAL_KEY, professional), [professional]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    await wait(500);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;

    if (!emailValid || !passwordValid) {
      setFailedAttempts((n) => n + 1);
      if (failedAttempts >= 2) {
        return {
          success: false,
          message: "Muitas tentativas incorretas. Verifique seus dados e tente novamente.",
        };
      }
      return {
        success: false,
        message: !emailValid
          ? "Informe um e-mail válido."
          : "A senha deve ter pelo menos 6 caracteres.",
      };
    }

    setFailedAttempts(0);

    const name = email.split("@")[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    setUser((current) =>
      current && current.email === email
        ? current
        : {
            id: uid("user"),
            name: displayName || "Paciente",
            email,
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            createdAt: new Date().toISOString(),
          },
    );

    return { success: true };
  };

  const signup = async (data: SignupData): Promise<AuthResult> => {
    await wait(600);


    if (!data.name.trim()) {
      return { success: false, message: "Informe seu nome completo." };
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!emailValid) {
      return { success: false, message: "Informe um e-mail válido." };
    }
    if (data.password.length < 6) {
      return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
    }

    setUser({
      id: uid("user"),
      name: data.name.trim(),
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  };

  const professionalLogin = async (email: string, password: string): Promise<AuthResult> => {
    await wait(500);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
      return { success: false, message: "Informe um e-mail válido e uma senha com pelo menos 6 caracteres." };
    }
    setProfessional(DOCTORS[0]);
    return { success: true };
  };

  const logout = () => setUser(null);

  const updateUser = (partial: Partial<User>) => {
    setUser((current) => (current ? { ...current, ...partial } : current));
  };

  const value: AuthContextValue = {
      user,
      professional,
      isAuthenticated: !!user,
      isProfessionalAuthenticated: !!professional,
      failedAttempts,
      login,
      professionalLogin,
      signup,
      logout,
      professionalLogout: () => setProfessional(null),
      updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
