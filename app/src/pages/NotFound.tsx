import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-bold text-foreground">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        O caminho que você tentou acessar não existe neste protótipo.
      </p>
      <Button onClick={() => navigate("/home")} className="rounded-2xl">
        Voltar para o início
      </Button>
    </div>
  );
}
