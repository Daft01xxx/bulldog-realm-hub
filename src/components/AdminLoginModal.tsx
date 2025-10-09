import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAttempts: number;
}

const ADMIN_LOGIN = "Deff0xq";
const ADMIN_PASSWORD = "Gnomdoma0402012@#$%q";
const MAX_ATTEMPTS = 3;

const AdminLoginModal = ({ isOpen, onClose, userId, currentAttempts }: AdminLoginModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS - currentAttempts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check credentials
      if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
        // Success - reset attempts, assign admin role, and navigate
        await supabase
          .from('profiles')
          .update({ admin_login_attempts: 0 })
          .eq('user_id', userId);

        // Assign admin role to user (ignore if already exists)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        // Ignore unique constraint violation (role already exists)
        if (roleError && !roleError.message.includes('duplicate key')) {
          console.error('Error assigning admin role:', roleError);
        }

        toast({
          title: "✅ Доступ разрешен",
          description: "Добро пожаловать в админ панель",
        });

        onClose();
        navigate("/admin");
      } else {
        // Failed attempt
        const newAttempts = currentAttempts + 1;
        const remaining = MAX_ATTEMPTS - newAttempts;

        if (newAttempts >= MAX_ATTEMPTS) {
          // Block access permanently
          await supabase
            .from('profiles')
            .update({ 
              admin_login_attempts: newAttempts,
              admin_access_blocked: true 
            })
            .eq('user_id', userId);

          toast({
            title: "🚫 Доступ заблокирован",
            description: "Превышено количество попыток входа. Доступ к админ панели заблокирован навсегда.",
            variant: "destructive",
            duration: 5000,
          });

          onClose();
          
          // Reload to hide the button
          window.location.reload();
        } else {
          // Update attempts count
          await supabase
            .from('profiles')
            .update({ admin_login_attempts: newAttempts })
            .eq('user_id', userId);

          setAttemptsLeft(remaining);

          toast({
            title: "❌ Неверные данные",
            description: `Неверный логин или пароль. Осталось попыток: ${remaining}`,
            variant: "destructive",
          });

          setLogin("");
          setPassword("");
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-gold" />
            <DialogTitle className="text-xl">Вход для разработчиков</DialogTitle>
          </div>
          <DialogDescription>
            Введите логин и пароль для доступа к админ панели
          </DialogDescription>
        </DialogHeader>

        {attemptsLeft < MAX_ATTEMPTS && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Осталось попыток: {attemptsLeft}</p>
              <p className="text-muted-foreground mt-1">
                После {attemptsLeft} неудачных попыток доступ будет заблокирован навсегда
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Логин</Label>
            <Input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Введите логин"
              required
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 button-gradient-gold"
              disabled={loading || !login || !password}
            >
              {loading ? "Проверка..." : "Войти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;
