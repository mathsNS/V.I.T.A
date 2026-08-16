import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronRight,
  Eye,
  EyeOff,
  HeadphonesIcon,
  KeyRound,
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
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [notificationsOn, setNotificationsOn] = useState(true);

  function handleSaveProfile() {
    updateUser({ name, phone });
    setEditOpen(false);
    toast.success("Perfil atualizado com sucesso.");
  }

  function handleChangePassword() {
    setPasswordError(null);
    if (!currentPassword) return setPasswordError("Informe a senha atual.");
    if (newPassword.length < 6) return setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
    if (newPassword !== confirmNewPassword) return setPasswordError("As senhas não coincidem.");
    // In prototype, accept any current password
    setChangePasswordOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    toast.success("Senha alterada com sucesso.");
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
            onClick={() => { setPasswordError(null); setChangePasswordOpen(true); }}
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

      {/* PER02 – password change sheet */}
      <Sheet open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5" /> Alterar senha
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Senha atual</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha atual"
                  className="rounded-xl pr-11"
                />
                <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground" aria-label={showCurrentPw ? "Ocultar" : "Mostrar"}>
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha (mín. 6 caracteres)"
                  className="rounded-xl pr-11"
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted-foreground" aria-label={showNewPw ? "Ocultar" : "Mostrar"}>
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-new-pw">Confirmar nova senha</Label>
              <Input
                id="confirm-new-pw"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="rounded-xl"
              />
            </div>
            {passwordError && (
              <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
                {passwordError}
              </p>
            )}
          </div>
          <SheetFooter>
            <Button onClick={handleChangePassword} className="w-full rounded-2xl">
              Salvar nova senha
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
