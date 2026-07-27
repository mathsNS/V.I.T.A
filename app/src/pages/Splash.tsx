import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-full min-h-svh flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#EAF1F8] via-background to-background">
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[#98BAD5]/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20"
        >
          <HeartHandshake className="h-14 w-14" strokeWidth={1.75} />
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#98BAD5] text-primary shadow-md"
          >
            <Sparkles className="h-5 w-5" />
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-4xl font-extrabold tracking-tight text-primary"
        >
          V.I.T.A.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-2 max-w-[260px] text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Validação Inteligente de Triagem e Atendimento
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 flex items-center gap-6 text-muted-foreground"
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Pré-triagem</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Dados protegidos</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border">
              <HeartHandshake className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium">Cuidado contínuo</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative flex flex-col items-center gap-4 px-8 pb-10"
      >
        <Button
          size="lg"
          className="h-13 w-full rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
        <button
          type="button"
          onClick={() => navigate("/cadastro")}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Criar conta
        </button>
      </motion.div>
    </div>
  );
}
