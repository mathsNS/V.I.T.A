import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";

export default function ProfessionalLogin() {
  const navigate = useNavigate(); const { professionalLogin } = useAuth();
  const [email, setEmail] = useState("mariana@vita.med.br"); const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function submit(e: FormEvent) { e.preventDefault(); setLoading(true); setError(""); const result = await professionalLogin(email, password); setLoading(false); if (result.success) navigate("/profissional/fila"); else setError(result.message ?? "Não foi possível entrar."); }
  return <AppShell><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-full flex-1 flex-col bg-background p-7 pt-10">
    <Logo className="mb-8" /><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck /></div>
    <h1 className="text-2xl font-extrabold text-primary">Acesso profissional</h1><p className="mt-1 text-sm text-muted-foreground">Ambiente restrito a profissionais de saúde autorizados.</p>
    <form onSubmit={submit} className="mt-7 space-y-4"><div className="space-y-1.5"><Label htmlFor="pro-email">E-mail profissional</Label><Input id="pro-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" /></div><div className="space-y-1.5"><Label htmlFor="pro-password">Senha</Label><Input id="pro-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" /></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button type="submit" className="h-12 w-full rounded-xl" disabled={loading}>{loading && <Loader2 className="animate-spin" />}{loading ? "Entrando..." : "Entrar na área profissional"}</Button></form>
    <button className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary" onClick={() => navigate("/login")}><ArrowLeft className="h-4 w-4" />Voltar ao acesso do paciente</button>
  </motion.div></AppShell>;
}
