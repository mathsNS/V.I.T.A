import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, BookmarkCheck, LogOut, Paperclip, Phone, RefreshCw, SendHorizonal } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import { FOLLOW_UP_QUESTIONS, classifyPriority, detectEmergency, extractIntensity, recommendSpecialty } from "@/lib/triageEngine";
import { SPECIALTIES } from "@/lib/mockData";
import { loadFromStorage, saveToStorage, uid } from "@/lib/storage";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GREETING =
  "Olá! Eu sou o assistente de pré-triagem do V.I.T.A. Pode me contar, com suas palavras, o que você está sentindo?";

const DRAFT_KEY = "vita_triage_draft";
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_FILE_MB = 5;

type TriageStep = "complaint" | "complaint_fix" | "fix" | number | "summary";

interface TriageDraft {
  messages: ChatMessage[];
  step: TriageStep;
  answers: Record<string, string>;
  chiefComplaint: string;
  savedAt: string;
}

function questionLabel(id: string): string {
  const map: Record<string, string> = {
    duration: "Duração dos sintomas",
    intensity: "Intensidade",
    history: "Histórico/medicações",
    attachment: "Exames",
  };
  return map[id] ?? id;
}

export default function TriageChat() {
  const navigate = useNavigate();
  const { addTriageResult } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storedDraft = useRef(loadFromStorage<TriageDraft | null>(DRAFT_KEY, null));

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid("msg"), sender: "bot", text: GREETING, timestamp: new Date().toISOString() },
  ]);
  const [step, setStep] = useState<TriageStep>("complaint");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [isFix, setIsFix] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [saveDraftOpen, setSaveDraftOpen] = useState(false);
  const [resumeBanner, setResumeBanner] = useState(!!storedDraft.current);
  const [attachError, setAttachError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Auto-save draft whenever meaningful state changes
  useEffect(() => {
    if (step === "complaint" && messages.length <= 1) return;
    saveToStorage<TriageDraft>(DRAFT_KEY, { messages, step, answers, chiefComplaint, savedAt: new Date().toISOString() });
  }, [messages, step, answers, chiefComplaint]);

  function resumeDraft() {
    const d = storedDraft.current!;
    setMessages(d.messages);
    setStep(d.step);
    setAnswers(d.answers);
    setChiefComplaint(d.chiefComplaint);
    setResumeBanner(false);
  }

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY);
    storedDraft.current = null;
    setResumeBanner(false);
  }

  function saveDraftAndExit() {
    saveToStorage<TriageDraft>(DRAFT_KEY, { messages, step, answers, chiefComplaint, savedAt: new Date().toISOString() });
    navigate("/home");
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  function getProgressLabel(): string | null {
    if (typeof step === "number") return `Pergunta ${step + 1} de ${FOLLOW_UP_QUESTIONS.length}`;
    if (step === "summary") return "Resumo";
    return null;
  }

  function pushBotMessage(text: string, quickReplies?: string[]) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { id: uid("msg"), sender: "bot", text, timestamp: new Date().toISOString(), quickReplies },
      ]);
    }, 700);
  }

  function askQuestion(index: number) {
    const question = FOLLOW_UP_QUESTIONS[index];
    pushBotMessage(question.text, question.quickReplies);
  }

  function finishSummary(finalAnswers: Record<string, string>) {
    setStep("summary");
    setIsFix(false);
    const lines = [
      `Sintoma principal: ${chiefComplaint}`,
      `Duração: ${finalAnswers.duration ?? "não informado"}`,
      `Intensidade: ${finalAnswers.intensity ?? "não informado"}`,
      `Histórico/medicações: ${finalAnswers.history ?? "não informado"}`,
    ].join("\n");
    pushBotMessage(
      `Perfeito! Aqui está o resumo da sua triagem:\n\n${lines}\n\nPodemos confirmar o envio para o profissional de saúde?`,
      ["Confirmar e enviar", "Quero corrigir algo"],
    );
  }

  function handleSend(rawText?: string) {
    const text = (rawText ?? input).trim();
    if (!text) return;

    setMessages((m) => [
      ...m,
      { id: uid("msg"), sender: "user", text, timestamp: new Date().toISOString() },
    ]);
    setInput("");

    if (step === "complaint" || step === "complaint_fix") {
      if (detectEmergency(text)) {
        setChiefComplaint(text);
        setEmergencyOpen(true);
        return;
      }
      setChiefComplaint(text);
      if (step === "complaint_fix") {
        finishSummary(answers);
      } else {
        askQuestion(0);
        setStep(0);
      }
      return;
    }

    if (step === "fix") {
      if (text === "Sintoma principal") {
        pushBotMessage("Pode me contar novamente qual é o seu sintoma principal.");
        setStep("complaint_fix");
        return;
      }
      const qIndex = FOLLOW_UP_QUESTIONS.findIndex((q) => questionLabel(q.id) === text);
      if (qIndex !== -1) {
        setIsFix(true);
        askQuestion(qIndex);
        setStep(qIndex);
      }
      return;
    }

    if (typeof step === "number") {
      const question = FOLLOW_UP_QUESTIONS[step];
      const next = { ...answers, [question.id]: text };
      setAnswers(next);
      if (isFix) {
        finishSummary(next);
      } else if (step + 1 < FOLLOW_UP_QUESTIONS.length) {
        askQuestion(step + 1);
        setStep(step + 1);
      } else {
        finishSummary(next);
      }
      return;
    }

    if (step === "summary") {
      if (text.toLowerCase().includes("corrigir")) {
        const fixOptions = ["Sintoma principal", ...FOLLOW_UP_QUESTIONS.map((q) => questionLabel(q.id))];
        pushBotMessage("Claro! O que você gostaria de corrigir?", fixOptions);
        setStep("fix");
        return;
      }
      const intensity = extractIntensity(answers.intensity ?? "");
      const specialtyId = recommendSpecialty(chiefComplaint);
      const priority = classifyPriority({ chiefComplaint, intensity, isEmergency: false });
      const specialty = SPECIALTIES.find((s) => s.id === specialtyId);

      const result = addTriageResult({
        chiefComplaint,
        priority,
        specialtyId,
        hypothesis: `Quadro compatível com avaliação em ${specialty?.name ?? "Clínico Geral"}.`,
        summary: answers,
      });

      clearDraft();
      pushBotMessage("Prontinho! Já classifiquei sua triagem e preparei um resumo para o profissional. 🙌");
      setTimeout(() => navigate("/triagem/resultado", { state: { triageId: result.id } }), 900);
    }
  }

  function doAttach(fileName: string, fileSize: string) {
    setAttachError(null);
    setMessages((m) => [
      ...m,
      {
        id: uid("msg"),
        sender: "user",
        text: "Anexei um exame.",
        timestamp: new Date().toISOString(),
        attachments: [{ id: uid("att"), name: fileName, size: fileSize }],
      },
    ]);
    if (typeof step === "number") {
      const question = FOLLOW_UP_QUESTIONS[step];
      const next = { ...answers, [question.id]: "Exame anexado" };
      setAnswers(next);
      if (isFix) {
        finishSummary(next);
      } else if (step + 1 < FOLLOW_UP_QUESTIONS.length) {
        askQuestion(step + 1);
        setStep(step + 1);
      } else {
        finishSummary(next);
      }
    }
  }

  function handleAttachClick() {
    setAttachError(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAttachError("Formato inválido. Aceitos: PDF, JPG, PNG.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setAttachError(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_MB} MB.`);
      return;
    }
    const sizeKB = (file.size / 1024).toFixed(0);
    doAttach(file.name, `${sizeKB} KB`);
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-muted/30">
      <TopBar
        title="Chat"
        onBack={() => setSaveDraftOpen(true)}
        right={
          <button
            type="button"
            onClick={() => setSaveDraftOpen(true)}
            aria-label="Sair do chat"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        }
      />

      {/* TRI03 – progress indicator */}
      {getProgressLabel() && (
        <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-2">
          {FOLLOW_UP_QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                typeof step === "number" && i <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
          <span className="shrink-0 text-xs font-semibold text-primary">{getProgressLabel()}</span>
        </div>
      )}

      {/* TRI01 – resume draft banner */}
      {resumeBanner && storedDraft.current && (
        <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3">
          <BookmarkCheck className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="flex-1 text-xs font-medium text-amber-800">
            Você tem uma triagem salva. Deseja continuar?
          </p>
          <button
            type="button"
            onClick={resumeDraft}
            className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={discardDraft}
            className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700"
          >
            Recomeçar
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.sender === "user" ? "justify-end" : "justify-start")}
          >
            <div className="max-w-[80%]">
              <div
                className={cn(
                  "whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  msg.sender === "user"
                    ? "rounded-br-sm bg-[#98BAD5] text-[#0f2440]"
                    : "rounded-bl-sm bg-white text-foreground",
                )}
              >
                {msg.text}
                {msg.attachments?.map((att) => (
                  <div
                    key={att.id}
                    className="mt-2 flex items-center gap-2 rounded-xl bg-black/5 px-2.5 py-1.5 text-xs font-medium"
                  >
                    <Paperclip className="h-3.5 w-3.5" /> {att.name} · {att.size}
                  </div>
                ))}
              </div>
              {msg.sender === "bot" && msg.quickReplies && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => handleSend(reply)}
                      className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: d * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TRI05 – file validation error */}
      {attachError && (
        <p className="border-t border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive">
          {attachError}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
      >
        {/* Hidden file input for validated attachment */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleAttachClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Anexar arquivo (PDF, JPG, PNG – máx. 5 MB)"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Descreva os seus sintomas"
          className="h-11 flex-1 rounded-full"
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full">
          <SendHorizonal className="h-4.5 w-4.5" />
        </Button>
      </form>

      {/* TRI01 – save draft / exit dialog */}
      <Dialog open={saveDraftOpen} onOpenChange={setSaveDraftOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Sair da triagem?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Você pode salvar o progresso e continuar depois, ou sair sem salvar.
          </p>
          <DialogFooter className="flex-col gap-2">
            <Button
              size="lg"
              className="w-full rounded-2xl"
              onClick={saveDraftAndExit}
            >
              <BookmarkCheck className="h-4 w-4" /> Salvar e continuar depois
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-2xl text-destructive hover:text-destructive"
              onClick={() => {
                clearDraft();
                navigate("/home");
              }}
            >
              Sair sem salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TRI07 – emergency dialog with explicit risk warning */}
      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-red-600">Isso pode ser uma emergência</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Pelos sintomas que você descreveu, é importante buscar atendimento de urgência
            imediatamente. Não espere pela pré-triagem.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-2xl"
              onClick={() => {
                window.location.href = "tel:192";
              }}
            >
              <Phone className="h-4 w-4" /> Ligar para emergência (192)
            </Button>
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              ⚠️ Ignorar este aviso pode colocar sua saúde em risco. Recomendamos fortemente buscar atendimento imediato.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl"
              onClick={() => {
                setEmergencyOpen(false);
                askQuestion(0);
                setStep(0);
              }}
            >
              <RefreshCw className="h-4 w-4" /> Continuar mesmo assim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
