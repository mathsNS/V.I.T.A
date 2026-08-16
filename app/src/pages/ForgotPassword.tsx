import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    await wait(700);
    setLoading(false);
    setStep(2);
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) {
      setError("Informe o código de 4 dígitos enviado por e-mail.");
      return;
    }
    setLoading(true);
    await wait(500);
    setLoading(false);
    setStep(3);
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }
    setLoading(true);
    await wait(700);
    setLoading(false);
    setStep(4);
  }

  return (
    <div className="flex h-full min-h-svh flex-1 flex-col px-6 pb-10 pt-8">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="s1"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            onSubmit={handleSendEmail}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-primary">Esqueci minha senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Informe o e-mail da sua conta para receber um código de verificação.
            </p>
            <div className="mt-8 space-y-1.5">
              <Label htmlFor="fp-email">Email</Label>
              <Input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="h-12 rounded-2xl"
                required
              />
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-10">
              <button type="button" onClick={() => navigate(-1)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button type="submit" size="lg" disabled={loading} className="rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar código"}
              </Button>
            </div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="s2"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            onSubmit={handleVerifyCode}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-primary">Verifique seu e-mail</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviamos um código de 4 dígitos para <span className="font-semibold">{email}</span>.
            </p>
            <div className="mt-8 space-y-1.5">
              <Label htmlFor="fp-code">Código</Label>
              <Input
                id="fp-code"
                inputMode="numeric"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="0000"
                className="h-12 rounded-2xl text-center text-lg tracking-[0.5em]"
                required
              />
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-10">
              <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button type="submit" size="lg" disabled={loading} className="rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
              </Button>
            </div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="s3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            onSubmit={handleResetPassword}
            className="flex flex-1 flex-col"
          >
            <h1 className="text-2xl font-extrabold text-primary">Nova senha</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha uma nova senha para sua conta.
            </p>
            <div className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fp-password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="fp-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nova senha"
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
              <div className="space-y-1.5">
                <Label htmlFor="fp-confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="fp-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                    className="h-12 rounded-2xl pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                    aria-label={showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-10">
              <button type="button" onClick={() => setStep(2)} className="text-sm font-semibold text-primary">
                ← Voltar
              </button>
              <Button type="submit" size="lg" disabled={loading} className="rounded-2xl px-6 font-semibold shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar senha"}
              </Button>
            </div>
          </motion.form>
        )}

        {step === 4 && (
          <motion.div
            key="s4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary">Senha alterada!</h1>
            <p className="mt-2 max-w-[240px] text-sm text-muted-foreground">
              Sua senha foi atualizada com sucesso. Você já pode entrar com os novos dados.
            </p>
            <Button
              size="lg"
              className="mt-10 w-full rounded-2xl font-semibold shadow-lg shadow-primary/20"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
