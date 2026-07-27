import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronRight,
  HeadphonesIcon,
  LogOut,
  Pencil,
  ShieldCheck,
  Bell as BellIcon,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/common/Logo";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [notificationsOn, setNotificationsOn] = useState(true);

  function handleSaveProfile() {
    updateUser({ name, phone });
    setEditOpen(false);
    toast.success("Perfil atualizado com sucesso.");
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const initials = (user?.name ?? "P")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Perfil" showBack={false} />

      <div className="flex flex-1 flex-col px-6 pb-8 pt-2">
        <div className="flex flex-col items-center gap-3 py-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-md"
            style={{ backgroundColor: user?.avatarColor ?? "#13315A" }}
          >
            {initials}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary"
          >
            <Pencil className="h-3.5 w-3.5" /> Editar perfil
          </button>
        </div>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <BellIcon className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm font-medium">Notificações</span>
            </div>
            <Switch checked={notificationsOn} onCheckedChange={setNotificationsOn} />
          </div>
          <button
            type="button"
            onClick={() => toast.info("Seus dados são protegidos conforme a LGPD.")}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm font-medium">Privacidade e segurança</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => toast.info("Canal de suporte: suporte@vita.com.br")}
            className="flex w-full items-center justify-between px-4 py-4 text-left"
          >
            <div className="flex items-center gap-3">
              <HeadphonesIcon className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="text-sm font-medium">Suporte</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleLogout}
          className="mt-6 w-full rounded-2xl text-base font-semibold"
        >
          <LogOut className="h-4.5 w-4.5" /> Logout
        </Button>

        <div className="mt-auto flex flex-col items-center gap-2 pt-10 opacity-70">
          <Logo showWordmark={false} />
          <p className="text-[11px] font-medium text-muted-foreground">
            Validação Inteligente de Triagem e Atendimento
          </p>
        </div>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Editar perfil</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSaveProfile} className="w-full rounded-2xl">
              Salvar alterações
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
