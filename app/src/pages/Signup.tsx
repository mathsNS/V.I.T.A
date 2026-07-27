import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goToStepTwo(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Informe seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Informe um e-mail válido.");
    if (password.length < 6) return setError("A senha deve ter pelo menos 6 caracteres.");
    setStep(2);
  }

  async function handleFinish(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("É preciso concordar com o uso dos seus dados para continuar.");
      return;
    }
    setLoading(true);
    const result = await signup({ name, email, password, phone, birthDate });
    setLoading(false);
    if (!result.success) {
      setError(result.message ?? "Não foi possível criar sua conta.");
      return;
    }
    navigate("/home");
  }

  return (
    <div className="flex h-full min-h-svh flex-1 flex-col px-6 pb-10 pt-8">
      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((s) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={goToStepTwo}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-primary">Olá!</h1>
            <p className="mt-1 text-sm font-semibold text-primary/80">
              Vamos criar uma nova conta
            </p>

            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome completo"
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha"
                    className="h-12 rounded-2xl pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between pt-10">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="text-sm font-semibold text-primary"
              >
                ← Voltar
              </button>
              <Button type="submit" size="lg" className="rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20">
                Próximo →
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleFinish}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-primary">Quase lá!</h1>
            <p className="mt-1 text-sm font-semibold text-primary/80">
              Só mais alguns detalhes
            </p>

            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="h-12 rounded-2xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="birth">Data de nascimento (opcional)</Label>
                <Input
                  id="birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Concordo com o uso dos meus dados pessoais e de saúde para a
                  pré-triagem, em conformidade com a LGPD.
                </span>
              </label>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between pt-10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-primary"
              >
                ← Voltar
              </button>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Criando...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
