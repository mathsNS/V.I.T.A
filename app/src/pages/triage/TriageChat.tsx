import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, LogOut, Paperclip, Phone, SendHorizonal } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import { FOLLOW_UP_QUESTIONS, classifyPriority, detectEmergency, extractIntensity, recommendSpecialty } from "@/lib/triageEngine";
import { SPECIALTIES } from "@/lib/mockData";
import { uid } from "@/lib/storage";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const GREETING =
  "Olá! Eu sou o assistente de pré-triagem do V.I.T.A. Pode me contar, com suas palavras, o que você está sentindo?";

export default function TriageChat() {
  const navigate = useNavigate();
  const { addTriageResult } = useAppData();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: uid("msg"), sender: "bot", text: GREETING, timestamp: new Date().toISOString() },
  ]);
  const [step, setStep] = useState<"complaint" | number | "summary">("complaint");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

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

    if (step === "complaint") {
      if (detectEmergency(text)) {
        setChiefComplaint(text);
        setEmergencyOpen(true);
        return;
      }
      setChiefComplaint(text);
      askQuestion(0);
      setStep(0);
      return;
    }

    if (typeof step === "number") {
      const question = FOLLOW_UP_QUESTIONS[step];
      const next = { ...answers, [question.id]: text };
      setAnswers(next);
      if (step + 1 < FOLLOW_UP_QUESTIONS.length) {
        askQuestion(step + 1);
        setStep(step + 1);
      } else {
        finishSummary(next);
      }
      return;
    }

    if (step === "summary") {
      if (text.toLowerCase().includes("corrigir")) {
        pushBotMessage("Sem problema! Pode me contar novamente o que você está sentindo.");
        setStep("complaint");
        setAnswers({});
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

      pushBotMessage("Prontinho! Já classifiquei sua triagem e preparei um resumo para o profissional. 🙌");
      setTimeout(() => navigate("/triagem/resultado", { state: { triageId: result.id } }), 900);
    }
  }

  function handleAttach() {
    setMessages((m) => [
      ...m,
      {
        id: uid("msg"),
        sender: "user",
        text: "Anexei um exame.",
        timestamp: new Date().toISOString(),
        attachments: [{ id: uid("att"), name: "exame-recente.pdf", size: "1.2 MB" }],
      },
    ]);
    if (typeof step === "number") {
      const question = FOLLOW_UP_QUESTIONS[step];
      const next = { ...answers, [question.id]: "Exame anexado" };
      setAnswers(next);
      if (step + 1 < FOLLOW_UP_QUESTIONS.length) {
        askQuestion(step + 1);
        setStep(step + 1);
      } else {
        finishSummary(next);
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-1 flex-col bg-muted/30">
      <TopBar
        title="Chat"
        onBack={() => navigate("/home")}
        right={
          <button
            type="button"
            onClick={() => navigate("/home")}
            aria-label="Sair do chat"
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        }
      />

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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-border bg-background px-3 py-3"
      >
        <button
          type="button"
          onClick={handleAttach}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Anexar arquivo"
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
              Continuar mesmo assim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
